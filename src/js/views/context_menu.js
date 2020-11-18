import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';
import Backbone from 'backbone';

export class ContextMenuView extends View {

    el() {
        // context menu is bound to the whole document
        return $(document);
    }

    get el_menu() {
        return $("#context-menu");
    }

    events() {
        let event_map = {
            "contextmenu": "context_menu_trigger",
            "click": "hide_context_menu"
        }

        return event_map;
    }

    hide_context_menu(event) {
        this.el_menu.hide();
    }

    context_menu_trigger(event) {
        event.preventDefault();

        this.el_menu.toggle().css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        });
    }
}