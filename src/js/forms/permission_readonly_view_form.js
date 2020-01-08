//  https://developer.snapappointments.com/bootstrap-select/
import 'bootstrap-select';
import {DgAccessItem} from "../access/access_item";

export class DgPermissionReadonlyViewForm {
    constructor(
        node, // refers to the selected folder/document
        norm_access_item=undefined, // if present,
                                    // fill in inial values from it
        id="#permission_readonly_view_form",
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
        this._access_item = new DgAccessItem(norm_access_item);
        this._norm_ai = norm_access_item;
        this.fill_initial_data(norm_access_item);
    }

    fill_initial_data(norm_ai) {
        $(this._id).find('input[name=take_ownership]').prop(
            'checked',
            norm_ai ? norm_ai.perms[DgAccessItem.OWN] : false
        );
        $(this._id).find('input[name=change_perm]').prop(
            'checked',
            norm_ai ? norm_ai.perms[DgAccessItem.CHPERM] : false
        );
        $(this._id).find('input[name=write]').prop(
            'checked',
            norm_ai ? norm_ai.perms[DgAccessItem.WRITE] : false
        );
        $(this._id).find('input[name=read]').prop(
            'checked',
            norm_ai ? norm_ai.perms[DgAccessItem.READ] : false
        );
        $(this._id).find('input[name=delete]').prop(
            'checked',
            norm_ai ? norm_ai.perms[DgAccessItem.DEL] : false
        );
        if (norm_ai) {
            $(this._id).find('select[name=access_type]').val(
                norm_ai.type
            );
        }
    }

    get access_line(){
        return this._access_item;
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

    select_option_template(usergroup_hash, selected=false) {
        // hash with two keys: model and name
        // e.g.
        // usergroup_hash = {'model': 'user', 'name': 'margaret'}
        let template, icon_css_class, selected_html = '';

        if (selected) {
            selected_html = 'selected';
        } 

        if (usergroup_hash['model'] == 'user') {
            icon_css_class = "user-black";
        } else if (usergroup_hash['model'] == 'group') {
            icon_css_class = "group-black";
        }

        template = `
            <option ${selected_html}
                data-id="${usergroup_hash['name']}"
                data-model=${usergroup_hash['model']}
                data-content="<div class='icon ${icon_css_class} margin-right-xs'></div>${usergroup_hash['name']}"
            >
            </option>
        `;
        return template;
    }

    show() {
        let that = this;
        $("#modals-container").css("display", "flex");

        $.ajax({
            url: `/usergroups`
        }).done(function(data){
            let select_picker = $(that._id).find("#perm_user_or_group");

            if (!select_picker) {
                console.log('selectpicker not found');
                return;
            }

            select_picker.empty();
            
            for(let usergroup of data) {
                let selected = false,
                    name,
                    model;

                if (that._norm_ai) {
                    model = that._norm_ai.model;
                }
                if (that._norm_ai) {
                    name = that._norm_ai.name;
                }
                if (usergroup['model'] == model && usergroup['name'] == name) {
                    selected = true;
                }
                select_picker.append(
                    $(that.select_option_template(usergroup, selected))
                );
            }

            $(that._id).find("#perm_user_or_group").selectpicker({
                deselectAll: false,
                selectAll: false,
                showSelected: false,
                textNoneSelected: "",
                textMultipleSelected: "",
            });

            // without refresh, changes won't be picked in select
            $(that._id).find("#perm_user_or_group").selectpicker('refresh');

            $(that._id).show();
            $(that._id).find(".cancel").click(function(e){
                e.preventDefault();
                $(that._id).css("display", "none");
            });

            $(that._id).submit(function(e){
                e.preventDefault();
                $(that._id).css("display", "none");
            });
        });
    }
}
