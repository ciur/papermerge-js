import $ from "jquery";
import { View } from 'backbone';

export let GRID = 1;
export let LIST = 2;

export class DisplayModeView extends View {

    el() {
        return $('#display-mode');
    }

    initialize() {
        this.display = GRID;
    }

    events() {
        let events_map = {
            "click .display-list": "display_list",
            "click .display-grid": "display_grid",
        }

        return events_map;
    }

    is_list() {
        console.log(`display = ${this.display}`);
        return this.display == LIST;
    }

    is_grid() {
        return this.display == GRID;
    }

    display_list(event) {
        console.log("Display list clicked");
        this.display = LIST;
        this.trigger('change');
    }

    display_grid(event) {
        console.log("Display grid clicked");
        this.display = GRID;
        this.trigger('change');
    }
}
