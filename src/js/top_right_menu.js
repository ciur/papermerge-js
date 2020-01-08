import $ from "jquery";


export class TopRightMenu {
    constructor(
        top_right_menu_wrapper_id,
        top_right_menu_id,
        // all elemnts that trigger display of menu
        top_right_menu_trigger_class
    ) {
        let that = this;
        this._top_right_menu_wrapper_id = $(top_right_menu_wrapper_id);
        this._top_right_menu_id = $(top_right_menu_id);
        this._top_right_menu_trigger_class = $(top_right_menu_trigger_class);

        this._top_right_menu_trigger_class.click(function(){
            that.toggle_menu();
        });
    }

    get menu() {
        return this._top_right_menu_id;
    }

    get menu_wrapper() {
        return this._top_right_menu_wrapper_id;
    }

    show_menu() {
        this.menu_wrapper.addClass("shown");
        this.menu.show();
    }

    hide_menu() {
        this.menu_wrapper.removeClass("shown");
        this.menu.hide();
    }

    toggle_menu() {
        if (this.menu_wrapper.hasClass("shown")) {
            this.hide_menu();
        } else {
            this.show_menu();
        }
    }
}