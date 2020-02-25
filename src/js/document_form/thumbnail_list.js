import $ from "jquery";
import {MgThumbnail} from "./thumbnail";
import {MgLister} from "./lister";


export class MgThumbnailList extends MgLister {

    constructor() {
        super();
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

    on_thumb_move_up(page_num, doc_id, page_id) {
        console.log(`thumb ${page_num} moved up`);
        this.notify(
            MgThumbnail.MOVE_UP,
            page_num,
            doc_id,
            page_id
        );
    }

    on_thumb_move_down(page_num, doc_id, page_id) {
        console.log(`thumb ${page_num} moved down`);
        this.notify(
            MgThumbnail.MOVE_DOWN,
            page_num,
            doc_id,
            page_id
        );
    }

    _add_thumbnails() {
        let dom_arr = Array.from(
            document.querySelectorAll(this._selector)
        );
        let that = this, thumb;
        
        dom_arr.forEach(function(dom_page_item, index, arr){
            let dom_data = dom_page_item.querySelector(
                '.document.page'
            ), doc_id, page_num, page_id;

            if (!dom_data) {
                console.log("thumb dom data not found");
                return;
            }

            doc_id = dom_data.getAttribute('data-doc_id');
            page_num = dom_data.getAttribute('data-page_num');
            page_id = dom_data.getAttribute('data-page_id');
            thumb = new DgThumbnail(
                dom_page_item,
                dom_data,
                doc_id,
                page_id,
                page_num
            );
            thumb.subscribe(
                DgThumbnail.MOVE_UP,
                that.on_thumb_move_up,
                that
            );
            thumb.subscribe(
                DgThumbnail.MOVE_DOWN,
                that.on_thumb_move_down,
                that
            );
            that._list.push(thumb); 
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