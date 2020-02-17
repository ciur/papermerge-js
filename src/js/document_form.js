import $ from "jquery";
import _ from "underscore";
import {DgTextOverlay} from "./text_overlay";
import {DgThumbnailList} from "./document_form/thumbnail_list";
import {DgZoom} from "./document_form/zoom";
import {DgPageList} from "./document_form/page_list";
import {csrfSafeMethod, getCookie, is_visible, build_elem} from "./document_form/common";
import {get_win_param} from "./document_form/common";
import {DgMainSpinner} from "./spinner";


function add_switch_logic(switch_selector) {
    // but clicking switch selector, target is toggled.
    // in document view - this applies to page thumbnails left panel
    // and document details right panels which can be visible or hidden.
    $(switch_selector).click(function(e){
        var target_id = $(this).data("target-id"),
            $target;

        e.preventDefault();

        $target = $("#" + target_id);
        if ($target.length == 0) {
            console.log("target " + target_id + " not found");
            return;
        }

        $target.toggle();
    });
} // add_switch_logic

function add_zoom_logic() {

    let actual_pages = Array.from(
        document.querySelectorAll('.actual-pages .actual_page')
    );

    $(".zoom").change(function(){
        let zoom_val = parseInt(
            $(this).val()
        ) || 3;
        
        actual_pages.forEach(function(dom_page_item, index, arr){
        }); 

    });

    $(".zoom").trigger("change");

} // add_zoom_logic

export function add_zoom_2_document_form() {
    add_zoom_logic();
}

export function add_switch_2_document_form() {
    // ok, here we are in document for page.
    add_switch_logic("#sw-left-panel");
    add_switch_logic("#sw-right-panel");
}

class DgDocument {
    constructor(page_num, text_arr) {
        this._thumbnail_list = new DgThumbnailList(); 
        this._zoom = new DgZoom();
        this._page_list = new DgPageList(this._zoom);
        this._page_num;
        this._text_arr = text_arr; 

        this._thumbnail_list.load();
        this._page_list.load(this.zoom.get_value());
        this._spinner = new DgMainSpinner();

        this.configEvents();
        
        if (page_num) {
            this.scroll_to(page_num);
        }

        if (text_arr) {
            this._page_list.highlight_text(text_arr);
        }
    }

    get zoom() {
        return this._zoom;
    }

    get page_list() {
        return this._page_list;
    }

    scroll_to(page_num) {
        this._thumbnail_list.remove_highlights();
        this._thumbnail_list.mark_highlight(page_num);
        this._page_list.scroll_to(page_num);
    }

    on_thumbnail_dblclick(page_num) {
        console.log(`Page ${page_num} dblclick`);
        this.scroll_to(page_num);
    }

    on_thumbnail_click(page_num) {
        console.log(`Page ${page_num} click`);
    }

    on_zoom_change(new_zoom_val) {
        this.page_list.on_zoom(new_zoom_val);
    }

    configEvents() {
        let that = this;

        this._thumbnail_list.ondblclick(
            this.on_thumbnail_dblclick,
            this
        );

        this._thumbnail_list.onclick(
            this.on_thumbnail_click,
            this
        );

        this.zoom.subscribe("zoom", this.on_zoom_change, this);

        $(window).resize(function(){
            let zoom_val = that.zoom.get_value();

            console.log("window resized");
            that.page_list.on_zoom(zoom_val);
        });
    }
}
    

export function add_load_on_scroll() {
    let csrftoken,
        step,
        page_num = get_win_param('page'),
        text_arr = get_win_param('text'),
        dg_document;

    csrftoken = getCookie('csrftoken');

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    if (page_num) {
        page_num = parseInt(page_num);
    }

    if (text_arr) {
        text_arr = text_arr.split('+');
    }

    dg_document = new DgDocument(page_num, text_arr);
}