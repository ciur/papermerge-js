
export class PastePagesForm {
    // same ID as defined in papermerge/boss/templates/boss/_forms.js.html
    constructor(id="#paste_pages_form") {
        this._id = id;
    }

    submit() {
        $(this._id).submit();
    }
}