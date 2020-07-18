import $ from "jquery";
import _ from "underscore";
import { Permission } from "../models/permission";
import { UserGroupCollection } from "../models/user_group";
import { View } from 'backbone';

let TEMPLATE = require('../templates/permission_editor.html');

export class PermissionEditorView extends View {
    el() {
        return $('#permission-editor-modal');
    } 

    initialize(permission) {
        if (permission) {
            this._permission = permission;
        } else {
            this._permission = new Permission();
        }
        this._usergroups = new UserGroupCollection();
        this._usergroups.fetch();
        this.listenTo(this._usergroups, 'change', this.render);
    }

    events() {
        let event_map = {
            'click .apply': 'on_apply',
            'change .perm_user_or_group': 'on_perm_user_or_group',
            'change .access_type': 'on_access_type',
            'click .checkbox': 'on_checkbox'
        }

        return event_map;
    }

    on_perm_user_or_group(event) {
        let $target = $(event.currentTarget), user_or_groups;

        user_or_groups = $target.val().split(',')
    }

    on_access_type(event) {
        let $target = $(event.currentTarget), access_type;

        access_type = $target.val();
        this.set_type(access_type);
    }

    on_checkbox(event) {
        let $target = $(event.currentTarget), name, checked;

        name = $target.attr('name');
        checked = $target.is(':checked');

        this.set_perm(name, checked);
    }

    set_perm(name, checked) {
        this._permission.set_perm(name, checked);
    }

    set_type(access_type) {
        this._permission.set_type(access_type);
    }


    on_apply(event) {

    }

    render() {
        let compiled, context;

        context = {
        }

        compiled = _.template(TEMPLATE({
            'usergroups': this._usergroups
        }));

        this.$el.html(compiled);
        this.$el.modal();

        return this;
    }
};
