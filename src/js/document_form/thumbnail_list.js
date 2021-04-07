import $ from "jquery";
import { MgThumbnail } from "./thumbnail";
import { MgLister } from "./lister";
import { LEDPageStatus } from "led_status/src/js/led_status";

import {
    mg_dispatcher,
    PAGE_SELECTION_CHANGED,
} from "../models/dispatcher";


export class MgThumbnailList extends MgLister {

    constructor() {
        super();
        this._container_selector = ".page_thumbnails";
        this._selector = ".page_thumbnails .page_thumbnail";
        this._list = [];
        this.led_page_status = new LEDPageStatus(
          {},
          {
            'node_selector': '.page_number',
            'led_selector': '.led',
            'use_sockets': true
          }
        );
        this._config_events();
    }

    load() {
        for (let thumb of this._list) {
            thumb.on_scroll();
        }
    }

    all() {
        return this._list;
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

    clear_selections() {
        for (let thumb of this._list) {
            thumb.clear_selection();
        }    
    }

    get_thumb(page_num) {
        let arr = [];

        arr = this._list.filter(thumb => thumb.page_num == page_num);
      
        if (arr.length > 0) {
            return arr[0];
        }

        return false;
    }

    swap_thumbs(thumb_1, thumb_2) {
        let clone_1,
            clone_2,
            dom_data_1,
            dom_data_2;

        clone_1 = $(thumb_1.dom_ref).clone();
        clone_2 = $(thumb_2.dom_ref).clone();
        thumb_1.replace_with(clone_2[0]);
        thumb_2.replace_with(clone_1[0]);

        this.update_css_class(thumb_1);
        this.update_css_class(thumb_2);
    }

    update_css_class(thumb) {

       if (this.is_first(thumb)) {
           thumb.add_class('first');
       } else {
           thumb.remove_class('first');
       }

       if (this.is_last(thumb)) {
           thumb.add_class('last');
       } else {
           thumb.remove_class('last');
       } 
    }

    is_first(thumb) {
        return thumb.page_num == 1;
    }

    is_last(thumb) {
        return thumb.page_num == this._list.length;
    }

    mark_highlight(page_num) {
        /**
            Mark thumbnail as current page in the view.
        **/
        let thumb;

        thumb = this.get_thumb(page_num);
        if (thumb) {
            thumb.mark_highlight();
        }
    }

    on_thumb_move_up(page_num, doc_id, page_id) {
        let thumb_1, thumb_2;

        if (page_num) {
            page_num = parseInt(page_num, 10);
        }

        if (!page_num) {
            console.warning("page_num not a number");
            return;
        }
        
        if (page_num < 2) {
            // one page document, discard, do nothing.
            // or maybe first page
            return false;
        }
        thumb_1 = this.get_thumb(page_num);
        thumb_2 = this.get_thumb(page_num - 1); // because page_num >=2

        this.swap_thumbs(thumb_1, thumb_2);
        this.notify(
            MgThumbnail.MOVE_UP,
            page_num,
            doc_id,
            page_id
        );
    }

    on_thumb_move_down(page_num, doc_id, page_id) {
        let thumb_1, thumb_2;

        if (page_num) {
            page_num = parseInt(page_num, 10);
        }

        if (!page_num) {
            console.warning("page_num not a number");
            return;
        }

        if (page_num > this._list.length - 1) {
            return false;
        }

        thumb_1 = this.get_thumb(page_num);
        thumb_2 = this.get_thumb(page_num + 1); // because page_num >=2

        this.swap_thumbs(thumb_1, thumb_2);

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
        let that = this, thumb, page_ocr_unknown_statuses = [];
        
        dom_arr.forEach(function(dom_page_item, index, arr){
            let dom_data, dom_data_ref;

            dom_data = MgThumbnail.get_data_from_dom(dom_page_item);
            dom_data_ref = MgThumbnail.get_data_ref_from_dom(
                dom_page_item
            );

            if (!dom_data) {
                console.log("thumb dom data not found");
                return;
            }

            if (dom_data['ocr_status'] == 'unknown') {
                page_ocr_unknown_statuses.push(
                    dom_data['page_id']
                );
            }

            thumb = new MgThumbnail(
                dom_page_item,
                dom_data_ref,
                dom_data['doc_id'],
                dom_data['page_id'],
                dom_data['page_num']
            );
            thumb.subscribe(
                MgThumbnail.MOVE_UP,
                that.on_thumb_move_up,
                that
            );
            thumb.subscribe(
                MgThumbnail.MOVE_DOWN,
                that.on_thumb_move_down,
                that
            );
            that._list.push(thumb); 
        });

        this.led_page_status.pull(page_ocr_unknown_statuses);
    }

    _config_events() {
        let that = this, first_thumb;
        this._add_thumbnails();

        $(this._container_selector).scroll(function(){
            for (let thumb of that._list) {
                thumb.on_scroll();
            }
        });

        // after document load, user did not select
        // any page yet. In this case, metadata view will
        // display first page' metadata.
        if (this._list.length > 0) {
            // if there is at least one thumbnail
            first_thumb = this._list[0];
            console.log("page selection triggered");
            mg_dispatcher.trigger(
                PAGE_SELECTION_CHANGED,
                first_thumb.page_id,
                first_thumb.doc_id
            );
        }
    }
}