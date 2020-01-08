

export class RenameForm {
    constructor(
        item,
        parent_id,
        id="#rename_form",
    ) {
        this._item = item; // only one item!
        this._id = id;
        this._parent_id = parent_id;
        this._create_hidden_input(item);
        // will create hidden input for parent id
        // to know to which folder to redirect back
        // if this parameter is missing - will redirect back
        // to root folder.
        this._create_hidden_parent(parent_id);
        this._set_title(item);
    }

    _set_title(item) {
        $(this._id).find("[name=title]").val(item.title);
    }

    _create_hidden_parent(parent_id="") {
        let hidden_parent =  `<input \
            type="hidden" \
            name="parent_id" \
            value="${parent_id}" \
            />`;

        $(this._id).append(
            hidden_parent
        );
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
