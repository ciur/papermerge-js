//  https://developer.snapappointments.com/bootstrap-select/
import 'bootstrap-select';
import {MgSimpleKeyItem} from "../metadata/simple_key_item";

export class MgSimpleKeyEditorForm {
    constructor(
        node, // refers to the selected folder/document
        simple_key_item=undefined, // if present,
                                    // fill in inial values from it
        id="#simple_key_editor_form",
    ) {
        this._item = node; // only one item!
        this._id = id;
        this._parent_id = parent_id;
        this._create_hidden_input(node);
        // will create hidden input for parent id
        // to know to which folder to redirect back
        // if this parameter is missing - will redirect back
        // to root folder.
        this._create_hidden_parent(parent_id);
        this._set_title(node);
        this._simple_key_item = new MgSimpleKeyItem(simple_key_item);
        this._on_submit = undefined;
        this.configEvents();
        this.fill_initial_data(simple_key_item);
    }

    // event name
    static get SUBMIT() {
      return "SUBMIT";
    }

    fill_initial_data(norm_ai) {

    }

    get access_line(){
        return this._access_item;
    }

    configEvents() {
        let that = this;
        // https://developer.snapappointments.com/bootstrap-select/
 

        $(this._id).find('[name=access_type]').change(function(e){
            let value = $(e.target).val();

            that.on_type_changed(value);
        });
    }

    add_submit(handler, context) {
      this._on_submit = {handler, context};
    }

    on_submit(access_line) {
      // for permission editor form, submit handler
      // can be called only once - thus: fire & remove it!
      if (this._on_submit) {
        let handler = this._on_submit.handler;
        let context = this._on_submit.context;
        handler.apply(context, [access_line]);
        this._on_submit = undefined;
      }
    }

    on_user_or_group_changed(data_model, data_id, is_selected) {
        if (data_model == 'user') {
            if (is_selected) {
                this._access_item.add_user(data_id);
            } else {
                this._access_item.del_user(data_id);
            }
        }
        if (data_model == 'group') {
            if (is_selected) {
                this._access_item.add_group(data_id);
            } else {
                this._access_item.del_group(data_id);
            }
        }
    }

    on_perm_changed(name, is_checked) {
        if (is_checked) {
            this._access_item.add_perm(name);    
        } else {
            this._access_item.del_perm(name);
        }
    }

    on_type_changed(value) {
        this._access_item.type = value;
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

    on_close(submit_line) {
        // it preserves context of this class
    }

    on_cancel() {
        // it preserves context of this class
    }

    show() {
        let that = this;
        $("#modals-container").css("display", "flex");

        console.log(`showing ${that._id}`);
        $(that._id).show();
        $(that._id).find(".cancel").click(function(e){
            e.preventDefault();
            $(that._id).css("display", "none");
        });

        $(that._id).submit(function(e){
            e.preventDefault();
            $(that._id).css("display", "none");
            that.on_submit(that.access_line);
        });
    }
}
