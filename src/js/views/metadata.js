import $ from "jquery";
import _ from "underscore";
import { Metadata } from "../models/metadata";
import { KVStore, KVStoreComp } from "../models/kvstore";
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/metadata.html');

let backboneSync = Backbone.sync;

Backbone.sync = function (method, model, options) {
    let csrf_token = $("[name=csrfmiddlewaretoken]").val();
    /*
     * The jQuery `ajax` method includes a 'headers' option
     * which lets you set any headers you like
     */
    options.headers = {
        'X-CSRFToken': csrf_token
    };
    /*
     * Call the stored original Backbone.sync method with
     * extra headers argument added
     */
    backboneSync(method, model, options);
};


export class MetadataView extends View {
    el() {
        return $('#metadata_form .modal-body');
    } 

    initialize(doc_id) {
        this.metadata = new Metadata(doc_id);

        this.listenTo(this.metadata, 'change', this.render);
        this.render();
    }

    events() {
        let event_map = {
          "click #add_simple_meta": "add_simple_meta",
          "click #add_comp_meta"  : "add_comp_meta",
          "click .close.key": "remove_meta",
          "keyup input": "update_value",
          "change .kv_type": "kv_type_update",
          "change .kv_format": "kv_format_update"
        }

        return event_map;
    }

    kv_type_update(event) {
        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).parent();
        let data = parent.data();
        let cur_fmt = {};

        cur_fmt['money'] = this.metadata.currency_formats;
        cur_fmt['numeric'] = this.metadata.numeric_formats;
        cur_fmt['date'] = this.metadata.date_formats;
        cur_fmt['text'] = [];

        if (data['model'] == 'simple-key') {
            this.metadata.update_simple(data['cid'],'kv_type', value);
            this.metadata.update_simple(data['cid'],'current_formats', cur_fmt[value]);
        } else if (data['model'] == 'comp-key') {
            this.metadata.update_comp(data['cid'],'kv_type', value);
            this.metadata.update_comp(data['cid'],'current_formats', cur_fmt[value]);
        }

        this.render();
    }

    update_value(event) {
        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).parent();
        let data = parent.data();

        if (data['model'] == 'simple-key') {
            this.metadata.update_simple(data['cid'], 'key', value);
        } else if (data['model'] == 'comp-key') {
            this.metadata.update_comp(data['cid'], 'key', value);
        }
    }

    add_simple_meta(event) {
        let value = $(event.currentTarget).val();
        
        this.metadata.add_simple(
            new KVStore({'value': value})
        );
        
        this.render();
    }

    add_comp_meta(event) {
        let value = $(event.currentTarget).val();

        this.metadata.add_comp(
            new KVStoreComp({'value': value})
        );

        this.render();
    }

    remove_meta(event) {
        let parent = $(event.currentTarget).parent();
        let data = parent.data();

        if (data['model'] == 'simple-key') {
            this.metadata.remove_simple(data['cid']);
        } else if (data['model'] == 'comp-key') {
            this.metadata.remove_comp(data['cid']);
        }
        parent.remove();
    }

    on_submit() {
        this.metadata.save();
    }


    render() {
        let compiled = _.template(TEMPLATE({
            kvstore: this.metadata.kvstore,
            kvstore_comp: this.metadata.kvstore_comp,
            kv_types: this.metadata.kv_types,
        }));

        this.$el.html(compiled);
        
        return this;
    }
};
