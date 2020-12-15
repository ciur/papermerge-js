import $ from "jquery";
// imagesloaded will trigger "load" event after img element
// has loaded image. Without this plugin, event WILL NOT
// BE TRIGGERED IF IMG WAS loaded FROM CACHE
import imagesloaded from "imagesloaded";
import {is_visible, build_elem, delete_elem_children} from "./common"; 
import {DgTextOverlay} from "../text_overlay";
import {DgRect} from "./rect";
import { get_url_param } from "../utils";
import { 
  mg_dispatcher,
  DOCUMENT_IMAGE_LOADED
} from "../models/dispatcher";


// https://github.com/desandro/imagesloaded#webpack
// make imagesloaded as jquery plugin - this
// enables us to pass dom element reference to imagesloaded function
// (otherwise it accepts only a string query selector)
imagesloaded.makeJQueryPlugin($);

function build_text_overlay(
    dom_page,
    dom_img,
    arr_dom_hocr,
    orig_img_rect,
    highlight_text_arr
) {
    /**
    Creates a semi transparent svg element with text over the image.
    **/
    let overlay;

    overlay = new DgTextOverlay(
        dom_img,   // image over which will build overlay
        dom_page,  // dom page item, direct parent of dom_img
        orig_img_rect,
    );

    return overlay.build_for(
        arr_dom_hocr,
        highlight_text_arr
    );        
}

export class MgPage {
    /**
    Class deals with selection of pages in thumbnail list.

    doc id - server side database id of the associated doc
    page id - server side database id of the page
    page_num - page number when document is displayed in
        the view. It never changes.
    page_order - which is initially = page_num will change
    as user changes the order of the document.
    **/
    constructor(doc_id, page_id, page_num, page_order) {
        this._doc_id = doc_id;
        this._page_id = page_id;
        // page number is fixed, it does not change.
        // when loading document initially, page_num == page_order
        // if user moves up/down documents => page order changes
        // but page_num no!
        this._page_num = page_num;
        // page order in the document
        // as opposite to page number (which is fixed),
        // page order changes as user moves page up/down
        this._page_order = page_order;
    }

    get doc_id() {
        return this._doc_id;
    }

    get page_id() {
        return this._page_id;
    }

    get page_order() {
        return this._page_order;
    }

    get page_num() {
        return this._page_num;
    }

    static create_from_dom(dom_elem) {
      let page_order = $(dom_elem).find(".document.page").data("page_order");
      let doc_id = $(dom_elem).find(".document.page").data("doc_id");
      let page_id = $(dom_elem).find(".document.page").data("page_id");
      let page_num = $(dom_elem).find(".document.page").data("page_num");

      return new MgPage(doc_id, page_id, page_num, page_order);
    }
}


export class DgPage {
    /***
        Class deals with OCR layer, scrolling, image loading,
        resizing of the page.
    ***/
    constructor(
        dom_ref,
        dom_data_ref,
        doc_id,
        page_id,
        page_num,
        zoom_val
    ) {
        // .actual_page
        this._dom_ref = dom_ref;
        this._dom_data_ref = dom_data_ref;
        this._dom_img = undefined;
        this._dom_hocr = undefined;
        this._zoom_val = zoom_val;
        this._page_id = page_id;
        this._page_num = page_num;
        this._doc_id = doc_id;
        // will be known/updated after HOCR for Step(1) is downloaded.
        this._orig_page_size = undefined;
    }

    get dom_ref() {
        return this._dom_ref;
    }

    get page_id() {
        return this._page_id;
    }

    get page_num() {
        return this._page_num;
    }

    replace_with(dom_ref, page_num) {
        this._dom_ref.replaceWith(dom_ref);
        this._dom_ref = dom_ref;
        this._dom_img = $(this._dom_ref).find("img").get(0);
        this._dom_data_ref = $(this._dom_ref).find(".document.page").get(0);
        this._dom_hocr = $(this._dom_ref).find(".page_hocr").get(0);
        this._page_num = page_num;
    }

    highlight_text(text_arr) {
        this._highlight_text_arr = text_arr;
    }

    scroll_to() {
        this._dom_ref.scrollIntoView();
        
    }

    is_img_loaded() {
        if (this._dom_ref.querySelectorAll('img').length > 0) {
            return true;
        }

        return false;
    }

    is_visible() {
        return is_visible(this._dom_ref);
    }

    set_zoom_val(zoom_val) {
        //console.log(`new zoom val=${zoom_val}`);
        this._zoom_val = zoom_val;
    }

    get_zoom_val() {
        return this._zoom_val;
    }

    load_img(zoom_val) {
        let src, dynamic_width,
            arr = [50, 75, 100, 125, 150],
            that = this,
            version;

        /*
            Dynamic width is the width of viewer. In will very depending on the
            screen size of user agent.
        */
        dynamic_width = this._dom_ref.getBoundingClientRect().width;

        /*
            value 1 from following url is equivalent of briolette.step.Step(1) on server side.
            Step(1) corresponds to the image of width 1240px.
            By server side convention that is considered 100% width of the image.
            Step(0) will correspond to 125% of Step(1)
            Step(1) ...
            Step(2) will correspond to 75% of Step(1)
            Step(3) will correspond to 50% of Step(1) => image with width=620px.
        */
        version = parseInt(get_url_param('version'));
        if (version >= 0) {
            src = `/document/${this._doc_id}/preview/1/page/${this._page_num}?version=${version}`;
        } else {
            src = `/document/${this._doc_id}/preview/1/page/${this._page_num}`;
        }

        
        
        if (arr.includes(zoom_val)) {
            dynamic_width = zoom_val / 100 * 1240;
        }

        this._dom_img = build_elem(
            'img',
            {'src': src, 'width': `${dynamic_width}px`}
        );


        this._dom_ref.insertBefore(
            this._dom_img,
            this._dom_data_ref // insert before this direct child
        );

        /***
            Tricky one:
            load_hocr(zoom_val) needs to be called, only after
            img element is fully loaded. This is because there is no other
            way in advance to know the height of img element.
            Before img is loaded, img DOM element has height = 0, which
            sets svg proprty to 0 as well.
        ***/
        $(this._dom_img).imagesLoaded().done(
            function(instance){
                that.load_hocr(zoom_val);
                mg_dispatcher.trigger(DOCUMENT_IMAGE_LOADED, that.page_num);
            }
        );

    }

    resize_img(zoom_val) {
        let arr = [50, 75, 100, 125, 150],
            new_width;

        if (!this._orig_page_size) {
            // image might not yet be loaded, e.g.
            // used opened document and have seen only 
            // first page
            console.log("this.orig_page_size is undefined");
            return;
        }

        if (arr.includes(zoom_val)) {
            new_width = parseInt(zoom_val) / 100 * this._orig_page_size.width;

            this._dom_img.setAttribute(
                'width',
                `${new_width}px`
            );
            $(this._dom_img).removeAttr('height');
        }

        if (zoom_val == 'width') {
            new_width = this._dom_ref.getBoundingClientRect().width;
            if (this._dom_img) {
                // image might not yet be loaded, e.g.
                // used opened document and have seen only 
                // first page
                this._dom_img.setAttribute(
                    'width',
                    `${new_width}px`
                );
            }

            $(this._dom_img).removeAttr('height');
        }
    }

    load_hocr() {
        // load hocr NEEDs to be called only after IMG element
        // was loaded.
        let hocr_url,
            that = this,
            orig_img_width,
            orig_img_height,
            version
            ;

        this._dom_hocr = build_elem('div', {'class': "page_hocr"});
        /**
            value 1 from below url corresponds to briolette.step.Step(1)
        **/

        version = parseInt(get_url_param('version'));
        if (version >= 0) {
            hocr_url = `/document/${this._doc_id}/hocr/1/page/${this._page_num}?version=${version}`;
        } else {
            hocr_url = `/document/${this._doc_id}/hocr/1/page/${this._page_num}`;
        }

        $.ajax({
            url: hocr_url
        }).done(function(data, text_status, jxhr){
            let dom_span, arr_dom_span = [];

            if (jxhr.status != 200) {
                // might return 404 if HOCR data is
                // not ready yet.
                return;
            }

            if (data && data['hocr']) {
                data['hocr'].forEach(function(item, index, arr){
                    dom_span = build_elem(
                        'span',
                        {
                            'class': item['class'],
                            'id': item['id'],
                            'title': item['title'],
                            'x1': item['x1'],
                            'y1': item['y1'],
                            'x2': item['x2'],
                            'y2': item['y2'],
                            'wconf': item['wconf']
                        },
                        item['text']
                    );
                    that._dom_hocr.appendChild(dom_span);
                    arr_dom_span.push(dom_span);
                });

                that._dom_ref.insertBefore(
                    that._dom_hocr,
                    that._dom_data_ref
                );
                that._orig_page_size =  new DgRect(
                    data['hocr_meta']['width'],
                    data['hocr_meta']['height']
                );
            }
            that._dom_svg = build_text_overlay(
                that._dom_ref,
                that._dom_img,
                arr_dom_span,
                that._orig_page_size,
                that._highlight_text_arr
            );
        });
    }

    resize_hocr(zoom_val) {
        let hocr_url,
            version,
            that = this;

        if (!this._dom_hocr) {
            return;
        }

        //delete_elem_children(this._dom_hocr);
        $(this._dom_svg).remove();

        version = parseInt(get_url_param('version'));
        if (version >=0) {
            hocr_url = `/document/${this._doc_id}/hocr/1/page/${this._page_num}?version=${version}`;
        } else {
            hocr_url = `/document/${this._doc_id}/hocr/1/page/${this._page_num}`;
        }
    
        $.ajax({
            url: hocr_url
        }).done(function(data){
            let dom_span,
                arr_dom_span = [],
                highlight_text_arr = []
                ;

            if (data && data['hocr']) {
                data['hocr'].forEach(function(item, index, arr){
                    dom_span = build_elem(
                        'span',
                        {
                            'class': item['class'],
                            'id': item['id'],
                            'title': item['title'],
                            'x1': item['x1'],
                            'y1': item['y1'],
                            'x2': item['x2'],
                            'y2': item['y2'],
                            'wconf': item['wconf']
                        },
                        item['text']
                    );
                    that._dom_hocr.appendChild(dom_span);
                    arr_dom_span.push(dom_span);
                });
            }
            // this works, but code logic is brittle.
            // The point is to remap hocr text over image,
            // however, it relies on the fact that image is resized already
            // and when img.getBoundingClientRect() it will take correct target
            // image size.
            // This code wont work is this function is executed BEFORE image is
            // resized.
            that._dom_svg = build_text_overlay(
                that._dom_ref,
                that._dom_img, // used to get real image size.
                arr_dom_span,
                that._orig_page_size, // original image size, as provided by server
                highlight_text_arr
            );
        });
    }

    on_scroll(zoom_val) {
        if (!this.is_img_loaded()) {
            this.load_img(zoom_val);
            // when load_img completes asyncroniously to load
            // image - it triggers load_hocr function.
        } else if (this.zoom_changed(zoom_val)) {
            this.resize_img(zoom_val);
            // resize happens syncroniously.
            // It means that is ok to call resize_hocr syncr as well.                
            this.resize_hocr(zoom_val);
            this.set_zoom_val(zoom_val);
        }
        this.set_zoom_val(zoom_val);
    }

    viewer_resized() {
        let old_width = this._dom_ref.getBoundingClientRect().width,
            width = this._dom_img.getAttribute('width'),
            ret;
        
        if (width) {
            width = parseInt(width);
        }

        if (old_width) {
            old_width = parseInt(old_width);
        }

        ret = width != old_width;
        //console.log(`width=${width} old_width=${old_width} ret=${ret}`);
        return ret;
    }

    zoom_changed(new_zoom_val) {
        let ret;
        
        ret = new_zoom_val != this.get_zoom_val();
        //console.log(`new zoom val = ${new_zoom_val} this.zoom_val = ${this.get_zoom_val()} ret=${ret}`);
        return ret;
    }

    on_zoom(zoom_val) {
        if (this.zoom_changed(zoom_val) || this.viewer_resized()) {
            this.resize_img(zoom_val);
            this.resize_hocr(zoom_val);
        }
        this.set_zoom_val(zoom_val); 
    }
}