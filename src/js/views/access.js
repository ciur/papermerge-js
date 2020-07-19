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
        this.node = node;
        // deleted items will be moved to this collection
        // and then passed to server side
        this.deleted_acc = new AccessCollection([], {});

        this.listenTo(
            this.acc_collection, 'change', this.render
        )
        this.listenTo(
            mg_dispatcher, PERMISSION_CHANGED, this.on_perm_changed,
        );
        this.render();

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

    on_apply(event) {
        this.$el.html('')
        this.$el.modal('hide');
        // removes attached events via event map
        this.undelegateEvents();
        this.acc_collection.save_access(this.deleted_acc);
    }

    on_close(event) {
        // removes attached events via event map
        this.undelegateEvents();
    }

    on_item_click(event) {
        let $target = $(event.currentTarget);

        if ($target.hasClass('disabled')) {
            return;
        }

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
        let perm_editor_view, found;
        
        found = this._first_selected();

        perm_editor_view = new PermissionEditorView(found);
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
            that.deleted_acc.add(found);
            that.acc_collection.remove(found);
        });

        this.render();
    }

    readonly_view_perm(event) {
        let perm_editor_view, found;
        
        found = this._first_selected();

        perm_editor_view = new PermissionEditorView(
            found,
            false  // edit = false, i.e. open readonly view
        );
    }

    render() {
        let compiled, context;

        context = {
        }

        compiled = _.template(TEMPLATE({
            acc_collection: this.acc_collection,
            node: this.node
        }));

        this.$el.html(compiled);
        this.$el.modal();

        return this;
    }
    _first_selected() {
        /*
         * Returns first selected Permission object
        */
        let checked_el, cid, id, found;

        checked_el = this.$el.find('tr.checked');

        cid = checked_el.data('cid');
        id = checked_el.data('id');

        found = _.find(this.acc_collection.models, function(item) {
            return item.cid == cid || item.get('id') == id;
        });

        return found;
    }
};
