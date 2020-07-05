import $ from "jquery";

export class PagesView {
    /*
        note that this is NOT a backbone view!
    */
    constructor(pages, zoom) {
        this._container_selector = ".actual-pages";
        this._selector = ".actual-pages .actual_page";
        this._list = pages;
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

    render(step) {
        for (let page of this._list) {
            page.load_img(step);
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
            ), doc_id, page_num, page_id;

            if (!dom_data) {
                console.log("page dom data not found");
                return;
            }

            doc_id = dom_data.getAttribute('data-doc_id');
            page_num = dom_data.getAttribute('data-page_num');
            page_id = dom_data.getAttribute('data-page_id')

            that._list.push(new DgPage(
                dom_page_item,
                dom_data,
                doc_id,
                page_id,
                page_num
            )); 
        });
    }

    on_zoom(new_zoom_val) {
        for (let page of this.pages) {
            // will apply zoom only if page
            // is visible (within view area)
            page.on_zoom(new_zoom_val);
        }
    }

    get_page(page_num) {
        let arr = [];

        arr = this._list.filter(page => page.page_num == page_num);
        
        if (arr.length > 0) {
            return arr[0];
        }

        return false;
    }

    swap_pages(page_1, page_2) {
        let clone_1,
            clone_2,
            dom_data_1,
            dom_data_2;

        clone_1 = $(page_1.dom_ref).clone();
        clone_2 = $(page_2.dom_ref).clone();
        page_1.replace_with(clone_2[0], page_2.page_num);
        page_2.replace_with(clone_1[0], page_1.page_num);
    }

    on_page_move_down(page_num, doc_id, page_id) {
        let page_1, page_2;

        page_1 = this.get_page(page_num);
        page_2 = this.get_page(page_num + 1);

        this.swap_pages(page_1, page_2);
    }

    on_page_move_up(page_num, doc_id, page_id) {
        let page_1, page_2;

        page_1 = this.get_page(page_num);
        page_2 = this.get_page(page_num - 1);

        this.swap_pages(page_1, page_2);
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