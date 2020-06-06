import {MgSimpleKeyItems} from "../metadata/simple_key_items";
import {MgSimpleKeyAction} from "../actions/simple_key_actions";
import {MgSimpleKeyActions} from "../actions/simple_key_actions";
import {MgSimpleKeyEditorForm} from "../forms/simple_key_editor_form";

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
        this._key_simple_items = new MgSimpleKeyItems();
        this._actions = new MgSimpleKeyActions(
            node,
            this._key_simple_items
        );
        this._set_title(node);
        this.build_simple_key_actions();
    }

    build_simple_key_actions() {
        let create_action,
            edit_action,
            delete_action,
            that = this;

        create_action = new MgSimpleKeyAction({
            id: "#add_simple_meta",
            initial_state: true,
            enabled: function(selection) { 
                return true; 
            },
            action: function(node) {
                let simple_key_editor_form;

                simple_key_editor_form = new MgSimpleKeyEditorForm(
                    node,
                    // initial data is empty, so dialog will
                    // be clear of any previous data
                    undefined
                );

                simple_key_editor_form.show();
                simple_key_editor_form.add_submit(
                    that.on_simple_key_editor_close,
                    that
                );
            }
        });
        this._actions.add(create_action);
    }

    on_simple_key_editor_close(simple_key_item) {
        this._simple_key_items.update(simple_key_item);
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



