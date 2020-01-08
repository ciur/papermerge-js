import $ from "jquery";


export class SideMenu {
    constructor(
        side_menu_id,
        // all elemnts that trigger display of menu
        side_menu_trigger_class
    ) {
        let that = this;
        this._side_menu_id = $(side_menu_id);
        this._side_menu_trigger_class = $(side_menu_trigger_class);

        this._side_menu_trigger_class.click(function(){
            if ($("#left-sidebar.desktop").css("display") != "block") {
                that.toggle_menu();    
            }
        });
    }

    get menu() {
        return this._side_menu_id;
    }

    get menu_trigger() {
        return this._side_menu_trigger_class;
    }

    get main_container_height() {
        let main_container = $("body > main");
        return main_container.height();
    }

    show_menu() {
        this.menu.css("height", this.main_container_height);
        this.menu.css("display", "block");
        this.menu_trigger.addClass("close_menu");

    }

    hide_menu() {
        this.menu.css("display", "none");
        this.menu_trigger.removeClass("close_menu");
    }

    toggle_menu() {
        if (this.menu.css("display") == "block") {
            this.hide_menu();
        } else {
            this.show_menu();
        }
    }
}