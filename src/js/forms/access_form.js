import {DgPermissionActions} from "../actions/permission_actions";
import {DgPermissionAction} from "../actions/permission_actions";
import {DgPermissionEditorForm} from "./permission_editor_form";
import {DgPermissionReadonlyViewForm} from "./permission_readonly_view_form";
import {DgAccessItem} from "../access/access_item";
import {DgNormAccessItem} from "../access/access_item";
import {DgAccessItems} from "../access/access_items";


export class AccessForm {
    constructor(
        node,
        id="#access_form",
    ) {
        this._node = node; // only one item!
        this._id = id;
        
        this._create_hidden_input(node);
        // will create hidden input for parent id
        // to know to which folder to redirect back
        // if this parameter is missing - will redirect back
        // to root folder.
        this._create_hidden_parent(parent_id);
        this._access_items = new DgAccessItems();
        this._actions = new DgPermissionActions(
            node,
            this._access_items
        );

        this._set_title(node);
        this.build_perm_actions();
        this.configEvents();
    }

    configEvents() {
        this._access_items.subscribe_event(
            DgAccessItems.SELECT,
            this.on_change_selection,
            this // context
        );
    }

    clear() {
        this._access_items.clear();
        $("#access_items").html('');
    }

    insert_norm_ai(norm_ai) {
        this._access_items.insert_norm_ai(norm_ai);
    }

    get_selected() {
        return this._access_items.get_selected();
    }

    on_change_selection() {
        for (let i = 0; i < this._actions._actions.length; i++) {
            let action = this._actions._actions[i];
            action.toggle(this.get_selected());
        }
    }

    selected_count() {
        return this._access_items.selected_count();
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

    build_perm_actions() {
        let create_action,
            edit_action,
            delete_action,
            readonly_view_action,
            that = this;


        create_action = new DgPermissionAction({
            id: "#create_perm",
            initial_state: true,
            enabled: function(selection) { 
                return true; 
            },
            action: function(node) {
                let perm_editor_form;

                perm_editor_form = new DgPermissionEditorForm(
                    node,
                    // initial data is empty, so dialog will
                    // be clear of any previous data
                    undefined
                );

                perm_editor_form.show();
                perm_editor_form.add_submit(
                    that.on_perm_editor_close,
                    that
                );
            }
        });

        edit_action = new DgPermissionAction({
            id: "#edit_perm",
            initial_state: false,
            enabled: function(selection) {
                return selection.count() == 1;
            },
            action: function(node, selection) {
                // node refers to the associated folder/document
                // selection is a list of selected access_items
                let selected_access = selection.first();
                let perm_editor_form;

                perm_editor_form = new DgPermissionEditorForm(
                    node,
                    // initial data is empty, so dialog will
                    // be clear of any previous data
                    selected_access
                );

                perm_editor_form.show();
                perm_editor_form.add_submit(
                    that.on_perm_editor_close,
                    that
                );
            }
        });

        readonly_view_action = new DgPermissionAction({
            id: "#readonly_view_perm",
            initial_state: false,
            enabled: function(selection) {
                let selected_access;

                if (selection.count() != 1) {
                    return false;
                }

                selected_access = selection.first();

                return selected_access.inherited;
            },
            action: function(node, selection) {
                let selected_access = selection.first();
                let readonly_view_form;

                readonly_view_form = new DgPermissionReadonlyViewForm(
                    node,
                    // initial data is empty, so dialog will
                    // be clear of any previous data
                    selected_access
                );

                readonly_view_form.show();
            }
        });

        delete_action = new DgPermissionAction({
            id: "#delete_perm",
            initial_state: false,
            enabled: function(selection) {
                return selection.count() > 0;
            },
            action: function(node, selection) {
                // node refers to the associated folder/document
                // selection is a list of selected access_items
                selection.delete_all();
            }
        })

        this._actions.add(create_action);
        this._actions.add(edit_action);
        this._actions.add(delete_action);
        this._actions.add(readonly_view_action);
    }

    on_perm_editor_close(access_item) {
        this._access_items.update(access_item);
    }

    on_access_close() {
        // send all access info to the server.
    }

    on_submit() {
        let token = $("[name=csrfmiddlewaretoken]").val();
        let access_data = this._access_items.as_hash();

        $.ajaxSetup({
            headers:
            { 'X-CSRFToken': token}
        });

        $.post(
            `/access/${this._node.id}`,
            JSON.stringify(access_data),
        );
        this.unbind_events();
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
        $.ajax({
            url: `/access/${this._node.id}`
        }).done(function(data){
            // load server side data
            let norm_ai;
            
            that.clear();

            for(let access_hash of data) {
                norm_ai = DgNormAccessItem.build_from(
                    access_hash
                );
                that.insert_norm_ai(norm_ai)
                console.log(access);
            }
            $(that._id).show();

            $(that._id).find(".cancel").click(function(e){ 
               e.preventDefault();
               $("#modals-container").hide();
               $(that._id).hide();
               that.unbind_events();

               // unbind submit event.
               $(that._id).off("submit");
            });

            // on submit send data to server side
            $(that._id).submit(function(e){
                e.preventDefault();
                $(that._id).css("display", "none");
                $("#modals-container").hide();
                that.on_submit();
            });

        }).fail(function(){
            console.log('failed');
        });


    }
}



