import $ from "jquery";
import {DgPage} from "./page";


export class DgPageList {
    constructor(zoom) {
        this._container_selector = ".actual-pages";
        this._selector = ".actual-pages .actual_page";
        this._list = [];
        this._zoom = zoom;
        this._config_events();
    }

    get zoom() {
        return this._zoom;
    }

    get pages() {
        return this._list;
    }

    get visible_pages() {
        return this._list.filter(
            page => page.is_visible()
        )
    }

    highlight_text(text_arr) {

        for (let page of this._list) {
            page.highlight_text(text_arr);
        }
    }

    scroll_to(page_num) {
        let arr = [];

        arr = this._list.filter(
            page => page.page_num == page_num
        );

        if (arr.length > 0) {
            arr[0].scroll_to();
        }
    }

    delete_selected(selection) {
        // selection is instance of
        // document_form.selection.MgSelection
    }

    load(step) {
        for (let page of this._list) {
            page.on_scroll(step);
        }
    }

    _add_pages() {
        let dom_arr = Array.from(
            document.querySelectorAll(this._selector)
        );
        let that = this;
        
        dom_arr.forEach(function(dom_page_item, index, arr){
            let dom_data = dom_page_item.querySelector(
                '.document.page'
            ), doc_id, page_num;

            if (!dom_data) {
                console.log("page dom data not found");
                return;
            }

            doc_id = dom_data.getAttribute('data-doc_id');
            page_num = dom_data.getAttribute('data-page_num');

            that._list.push(new DgPage(
                dom_page_item,
                dom_data,
                doc_id,
                page_num
            )); 
        });
    }

    on_zoom(new_zoom_val) {
        console.log("page_list.on_zoom");
        for (let page of this.pages) {
            // will apply zoom only if page
            // is visible (within view area)
            page.on_zoom(new_zoom_val);
        }
    }

    _config_events() {
        let that = this;
        this._add_pages();

        $(this._container_selector).scroll(function(){
            for (let page of that._list) {
                page.on_scroll(that.zoom.get_value());
            }
        });
    }
}