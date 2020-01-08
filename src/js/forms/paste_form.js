
export class PasteForm {
    constructor(id="#paste_form") {
        this._id = id;
    }

    submit() {
        $(this._id).submit();
    }
}