import {DgEvents} from "../events";

export class MgLister extends DgEvents {
    /**
        Lister is a common class for MgPageList and MgThumbList.

        Both page lists and thumb lists are updated based on current selection.
        If user triggers delete pages action, boths lists needs to be updated
        accordingly. Same of cut & paste actions.
    */

    constructor() {
        super();
    }

    delete_selected(selection) {
        // selection is instance of 
        // document_form.selection.MgSelection
        let thumbs_to_delete;

        // extract thumbs using selection object
        thumbs_to_delete = this._list.filter(
            thumb => selection.contains(thumb)
        )
        // remove extracted thumb elements from DOM
        for(let thumb of thumbs_to_delete) {
            $(thumb.dom_ref).remove();
        }
        // remove elements from list itself
        this.purge_list(selection);
    }

    purge_list(selection) {
        let item, pos;

        for(let sel in selection) {
            pos = this._list.findIndex(
                x => x.page_id == sel.page_id
            )
            if (pos >= 0) {
                this._list.splice(pos, 1);
            }
        }
    }
}