
export class RenameChangeForm {
    /*
    Rename form of the changeform view.
    Triggered by rename action in dropdown menu.
    */
    constructor(item, id="#rename_changeform"){
        this._item = item;
        this._id = id;
        this._set_title(item);
        this._create_hidden_input(item);
    }

    _set_title(item) {
        $(this._id).find("[name=title]").val(item.title);
    }

    _create_hidden_input(item) {
        let hidden_input = `<input \
         type="hidden" \
         name="node_id" \
         value="${item.id}" \
         />`

        $(this._id).append(hidden_input);
    }

    show() {
        $("#modals-container").css("display", "flex");
        $(this._id).show();
        $(this._id).find(".cancel").click(function(e){ 
           e.preventDefault();
           $("#modals-container").hide();
           $(this._id).hide();
        });
    }
}
