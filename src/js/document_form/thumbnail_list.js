import $ from "jquery";
import {DgThumbnail} from "./thumbnail";


export class DgThumbnailList {

    constructor() {
        this._container_selector = ".page-thumbnails";
        this._selector = ".page-thumbnails .page_thumbnail";
        this._list = [];
        this._config_events();
    }

    load() {
        for (let thumb of this._list) {
            thumb.on_scroll();
        }
    }

    ondblclick(handler, context) {
        for (let thumb of this._list) {
            thumb.ondblclick(handler, context);
        }
    }

    onclick(handler, context) {
        for (let thumb of this._list) {
            thumb.onclick(handler, context);
        }
    }

    remove_highlights() {
       for (let thumb of this._list) {
           thumb.remove_highlight();
       } 
    }

    mark_highlight(page_num) {
        let arr = [];

        arr = this._list.filter(thumb => thumb.page_num == page_num);
        if (arr.length > 0) {
            arr[0].mark_highlight();
        }
    }

    _add_thumbnails() {
        let dom_arr = Array.from(
            document.querySelectorAll(this._selector)
        );
        let that = this;
        
        dom_arr.forEach(function(dom_page_item, index, arr){
            let dom_data = dom_page_item.querySelector(
                '.document.page'
            ), doc_id, page_num;

            if (!dom_data) {
                console.log("thumb dom data not found");
                return;
            }

            doc_id = dom_data.getAttribute('data-doc_id');
            page_num = dom_data.getAttribute('data-page_num');
            that._list.push(
                new DgThumbnail(
                    dom_page_item,
                    dom_data,
                    doc_id,
                    page_num
                )
            ); 
        });
    }

    _config_events() {
        let that = this;
        this._add_thumbnails();

        $(this._container_selector).scroll(function(){
            for (let thumb of that._list) {
                thumb.on_scroll();
            }
        });
    }
}