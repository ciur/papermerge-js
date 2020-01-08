export class DgRect {
    /**
        A rectangle has a width and a height
        measured in pixels.
        It is more practical to pass
        one single instance of rect instead
        of having width and height separate.
    **/

    constructor(width, height) {
        this._width = parseInt(width);
        this._height = parseInt(height);
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }
}