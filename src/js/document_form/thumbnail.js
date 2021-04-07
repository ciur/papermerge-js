import $ from "jquery";
import {DgEvents} from "../events";
import {is_visible, build_elem} from "./common";
import { get_url_param } from "../utils";

export class MgThumbnail extends DgEvents {
    /**
    On single clicks - thumbnails are included/removed to selection.
    On double clicks - view will scroll to tumbnail's page.

    Thus, single clicks are about managing selection of thumbnails/pages, while
    double clicks are about scrolling pages.
    **/
    // event name
    static get CLICK() {
      return "click";
    }

    // event name
    static get DBLCLICK() {
      return "dblclick";
    }

    static get MOVE_UP() {
      return "move_up";
    }

    static get MOVE_DOWN() {
      return "move_down";
    }
    // if two consecutive clicks occur in less than CLICK_TIMEOUT miliseconds
    // they will be classified as "double click".
    static get CLICK_TIMEOUT() {
        return 250; // miliseconds
    }

    static get_data_ref_from_dom(dom_ref) {
        let dom_data_ref = dom_ref.querySelector(
            '.document.page'
        );

        if (!dom_data_ref) {
            console.log("thumb dom data not found");
            return;
        }

        return dom_data_ref;
    }

    static get_data_from_dom(dom_ref) {
        let dom_data = dom_ref.querySelector(
            '.document.page'
        ), data = {};

        if (!dom_data) {
            console.log("thumb dom data not found");
            return;
        }

        data['doc_id'] = dom_data.getAttribute('data-doc_id');
        data['page_num'] = dom_data.getAttribute('data-page_num');
        data['page_id'] = dom_data.getAttribute('data-page_id');
        data['page_order'] = dom_data.getAttribute('data-page_order');
        data['ocr_status'] = dom_data.getAttribute('data-ocr-status');

        return data;
    }

    constructor(dom_ref, dom_data_ref, doc_id, page_id, page_num) {
        super();
        this._dom_ref = dom_ref;
        this._dom_data_ref = dom_data_ref;
        this._step = 4;
        this._page_num = page_num;
        this._page_id = page_id;
        this._doc_id = doc_id;
        this._config_events();
    }

    replace_with(dom_ref) {
        let dom_data = MgThumbnail.get_data_from_dom(dom_ref),
            dom_data_ref = MgThumbnail.get_data_ref_from_dom(dom_ref);

        this._dom_ref.replaceWith(dom_ref);
        this._dom_ref = dom_ref;

        if (!dom_data) {
            console.log("dom_data empty");
            return;
        }
        // Do not carry on page_num attribute
        // it is a bug to do so.
        // When page order changes - page number attributes
        // changes as well.
        //this._page_num = dom_data['page_num'];
        this._page_id = dom_data['page_id'];
        this._dom_data_ref = dom_data_ref;
        // reconfigure events for this thumbnail
        dom_data_ref.setAttribute(
            'data-page_order', this._page_num
        )
        this._config_events();
    }

    get dom_ref() {
        return this._dom_ref;
    }

    get doc_id() {
        return this._doc_id;
    }

    get page_id() {
        return this._page_id;
    }

    get page_num() {
        return this._page_num;
    }

    add_class(css_class) {
        $(this.dom_ref).addClass(css_class);
    }

    remove_class(css_class) {
        $(this.dom_ref).removeClass(css_class);
    }

    mark_highlight() {
        $(this._dom_ref).addClass('current');
    }

    remove_highlight() {
        $(this._dom_ref).removeClass('current');   
    }

    clear_selection() {
        let checkbox;
        checkbox = $(this._dom_ref).find("[type=checkbox]").first();
        checkbox.prop("checked", false);
        $(this._dom_ref).removeClass('checked');
    }

    _config_events() {
        let that = this;

        $(this._dom_ref).find(".arrow-up-control").click(function(e){
            e.preventDefault();
            that.notify(
                MgThumbnail.MOVE_UP,
                that._page_num,
                that.doc_id,
                that.page_id
            );
        });

        $(this._dom_ref).find(".arrow-down-control").click(function(e){
            e.preventDefault();
            that.notify(
                MgThumbnail.MOVE_DOWN,
                that._page_num,
                that.doc_id,
                that.page_id
            );
        });

        this._dom_ref.onclick = function() {
            // single click or dblclick?
            if (that.timer) {
                // This way, if click is already set to fire,
                // it will clear itself to avoid duplicate 'Single' alerts.
                clearTimeout(that.timer);
            }
            that.timer = setTimeout(
                function() { 
                    that.notify(
                        MgThumbnail.CLICK,
                        that._page_num,
                        that.doc_id,
                        that.page_id
                    );
                },
                MgThumbnail.CLICK_TIMEOUT
            );
  
        }
        this._dom_ref.ondblclick = function() {
            if (that.timer) {
                clearTimeout(that.timer);    
            }
            that.notify(
                MgThumbnail.DBLCLICK,
                that._page_num
            );
        }
    }

    onclick(handler, context) {
        this.subscribe(
            MgThumbnail.CLICK,
            handler,
            context
        );
    }

    ondblclick(handler, context) {
        this.subscribe(
            MgThumbnail.DBLCLICK,
            handler,
            context
        );
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

    load() {
        if (this.is_img_loaded()) {
            return;
        }

        this.load_img();
    }

    load_img() {
        let dom_img, src, version;

        version = parseInt(get_url_param('version'));
        if ( version >=0 ) {
            src = `/document/${this._doc_id}/preview/${this._step}/page/${this._page_num}?version=${version}`;
        } else {
            src = `/document/${this._doc_id}/preview/${this._step}/page/${this._page_num}`;
        }
        
        dom_img = build_elem('img', {'src': src})
        this._dom_ref.insertBefore(
            dom_img,
            this._dom_data_ref // insert before this direct child
        )
    }

    on_scroll() {
        if (this.is_visible()) {
            this.load();
        }
    }
}