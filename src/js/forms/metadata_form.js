import { MetadataView } from "../views/metadata";
import _ from 'underscore';

export class MetadataForm {
    constructor(
        node,
        id="#metadata_form",
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

    unbind_events() {
        // unbind action events
        this._actions.unbind_events();
        // unbind submit event
        $(this._id).off("submit");
    }

    show() {
        let that = this, metadata_view = new MetadataView(this._node.id);

        $("#modals-container").css("display", "flex");

        $(that._id).submit(function(e){
            e.preventDefault();
            $(that._id).css("display", "none");
            $("#modals-container").hide();
            metadata_view.on_submit();
        });

        $(that._id).show();
        $(that._id).find(".cancel").click(function(e){ 
           e.preventDefault();
           $("ul#simple_keys").empty();
           $("ul#comp_keys").empty();
           $("#modals-container").hide();
           $(that._id).hide();
           that.unbind_events();
           // unbind submit event.
           $(that._id).off("submit");
        });
    }
}



