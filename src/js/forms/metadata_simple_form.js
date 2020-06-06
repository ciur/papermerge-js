
export class MetadataSimpleForm {
    constructor(
        node,
        id="#metadata-simple-form",
    ) {
        this._node = node; // only one item!
        this._id = id;
        
        this._create_hidden_input(node);
        // will create hidden input for parent id
        // to know to which folder to redirect back
        // if this parameter is missing - will redirect back
        // to root folder.
        this._create_hidden_parent(parent_id);
        this._set_title(node);
    }

    configEvents() {
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

    on_access_close() {
        // send all access info to the server.
    }

    on_submit() {

    }

    unbind_events() {
        // unbind action events
        this._actions.unbind_events();
        // unbind submit event
        $(this._id).off("submit");
    }

    show() {
        let that = this;

        $("#modals-container").css("display", "flex");
        $(that._id).find(".cancel").click(function(e){ 
           e.preventDefault();
           $("#modals-container").hide();
           $(that._id).hide();
           // unbind submit event.
           $(that._id).off("submit");
        });
        $(that._id).show();
    }
}



