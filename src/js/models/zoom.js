
let WIDTH = "width";


export class Zoom {

    constructor(value) {
        this._value = value || WIDTH; //default value
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
}