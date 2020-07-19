import $ from "jquery";
import _ from "underscore";
import { PermissionEditorView } from "./permission_editor";
import { Access, AccessCollection } from "../models/access";
import { Permission } from "../models/permission";
import { View } from 'backbone';
import { mg_dispatcher, PERMISSION_CHANGED } from "../models/dispatcher";

let TEMPLATE = require('../templates/access.html');

export class AccessView extends View {
    el() {
        return $('#access-modal');
    } 

    initialize(node) {
        this.acc_collection = new AccessCollection([], {'node': node});

        this.acc_collection.fetch();

        this.listenTo(
            this.acc_collection, 'change', this.render
        )
        this.listenTo(
            mg_dispatcher, PERMISSION_CHANGED, this.on_perm_changed,
        );

    }

    events() {
        let event_map = {
            'click #create_perm': 'create_perm',
            'click #edit_perm': 'edit_perm',
            'click #delete_perm': 'delete_perm',
            'click #readonly_view_perm': 'readonly_view_perm',
            'click #access_items tr': 'on_item_click',
            'click .close': 'on_close',
            'click .cancel': 'on_close',
            'click .apply': 'on_apply'
        }

        return event_map;
    }

    on_close(event) {
        // removes attached events via event map
        this.undelegateEvents();
    }

    on_item_click(event) {
        let $target = $(event.currentTarget);

        $target.toggleClass('checked');
    }

    on_perm_changed(permission, users, groups) {
        /*****
        Permissions set and user + group to which they apply.
        ****/
        let that = this, perm;

        _.each(users, function(item){
            perm = new Permission();
            perm.set({'permissions': permission.get('permissions')});
            perm.set({'name': item});
            perm.set({'model': 'user'});
            perm.set({'access_type': permission.get('access_type')});
            perm.set({'access_inherited': permission.get('access_inherited')});
            that.acc_collection.add(perm);
        });

        _.each(groups, function(item){
            perm = new Permission();
            perm.set({'permissions': permission.get('permissions')});
            perm.set({'name': item});
            perm.set({'model': 'group'});
            perm.set({'access_type': permission.get('access_type')});
            perm.set({'access_inherited': permission.get('access_inherited')});
            that.acc_collection.add(perm);
        });

        that.render();
    }

    create_perm(event) {
        let perm_editor_view;

        perm_editor_view = new PermissionEditorView();
    }

    edit_perm(event) {

    }

    delete_perm(event) {
        let attrs = [], models, that = this;

        attrs = _.map(
            this.$el.find('tr.checked'),
            function(item) {
                let name, model;

                name = $(item).data('name');
                model = $(item).data('model');

                return {'name': name, 'model': model};
            }
        );
        _.each(attrs, function(attr){
            let found = _.find(
                that.acc_collection.models, function(item) {
                    return item.get('name') == attr['name'] && item.get('model') == attr['model']
                }   
            );
            that.acc_collection.remove(found);
        });

        this.render();
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
