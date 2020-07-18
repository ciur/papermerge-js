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
        }

        return event_map;
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
