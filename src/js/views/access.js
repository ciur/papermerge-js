import $ from "jquery";
import _ from "underscore";
import { PermissionEditorView } from "./permission_editor";
import { Access, AccessCollection } from "../models/access";
import { View } from 'backbone';

let TEMPLATE = require('../templates/access.html');

export class AccessView extends View {
    el() {
        return $('#access-modal');
    } 

    initialize(node) {
        this.acc_collection = new AccessCollection(
            [], {'node': node}
        );
        this.acc_collection.fetch();
        this.listenTo(
            this.acc_collection, 'change', this.render
        )
    }

    events() {
        let event_map = {
            'click #create_perm': 'create_perm',
            'click #edit_perm': 'edit_perm',
            'click #delete_perm': 'delete_perm',
            'click #readonly_view_perm': 'readonly_view_perm'
        }

        return event_map;
    }

    create_perm(event) {
        let perm_editor_view;

        perm_editor_view = new PermissionEditorView();
    }

    edit_perm(event) {

    }

    delete_perm(event) {

    }

    readonly_view_perm(event) {
        
    }

    render() {
        let compiled, context;

        context = {
        }

        compiled = _.template(TEMPLATE({
            acc_collection: this.acc_collection,
        }));

        this.$el.html(compiled);
        this.$el.modal();

        return this;
    }
};
