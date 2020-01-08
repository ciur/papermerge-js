import $ from "jquery";
import {DgEvents} from "../events";
import {is_visible, build_elem} from "./common";

export class DgThumbnail {
    // event name
    static get CLICK() {
      return "click";
    }

    constructor(dom_ref, dom_data_ref, doc_id, page_num) {
        this._dom_ref = dom_ref;
        this._dom_data_ref = dom_data_ref;
        this._step = 4;
        this._page_num = page_num;
        this._doc_id = doc_id;
        this._events = new DgEvents();
        this._config_events();
    }

    get page_num() {
        return this._page_num;
    }

    mark_highlight() {
        $(this._dom_ref).addClass('current');
    }

    remove_highlight() {
        $(this._dom_ref).removeClass('current');   
    }

    _config_events() {
        let that = this;

        this._dom_ref.onclick = function() {
            that._events.notify(
                DgThumbnail.CLICK,
                that._page_num
            );
        }
    }

    onclick(handler, context) {
        this._events.subscribe(
            DgThumbnail.CLICK,
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
        let dom_img, src;

        src = `/document/${this._doc_id}/preview/${this._step}/page/${this._page_num}`;
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