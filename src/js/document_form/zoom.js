import $ from "jquery";
import {DgEvents} from "../events";

let WIDTH = "width";


export class DgZoom extends DgEvents {

    constructor(dom_class=".zoom") {
        // there might be two ".zoom" elements
        // one displayed for mobile view, another one
        // for desktop view.
        super();
        this._dom_ref = $(dom_class);
        this._value = WIDTH; //default value

        this._configEvents();
    }

    set_value(zoom_val) {
        if (zoom_val == WIDTH) {
            this._value = WIDTH;
        } else {
            this._value = parseInt(zoom_val);
        }
    }

    get_value() {
        return this._value;
    }

    _configEvents() {
        let that = this;

        this._dom_ref.change(function(){
            let zoom_val = $(this).val();

            that.set_value(zoom_val);
            that.notify("zoom", that.get_value());
        });
    }
}