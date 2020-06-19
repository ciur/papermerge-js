import $ from "jquery";
import _ from "underscore";
import { Metadata, MetadataPage } from "../models/metadata";
import { KVStore, KVStorePage } from "../models/kvstore";
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/metadata_page.html');

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


export class MetadataPageView extends View {
    el() {
        return $('#metadata_form .modal-body');
    } 

    initialize(page_id) {
        this.metadata = new MetadataPage(page_id);

        this.listenTo(this.metadata, 'change', this.render);
        this.render();
    }

    events() {
        let event_map = {
          "click #add_simple_meta": "add_simple_meta",
          "click .close.key": "remove_meta",
          "keyup input.key": "update_key",
          "change input.key": "update_key",
          "keyup input.value": "update_value",
          "change input.value": "update_value",
          "change .kv_type": "kv_type_update",
          "change .kv_format": "kv_format_update"
        }

        return event_map;
    }

    kv_format_update(event) {
        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).parent();
        let data = parent.data();

        this.metadata.update_simple(data['cid'],'kv_format', value);

        this.render();  
    }

    kv_type_update(event) {
        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).parent();
        let data = parent.data();
        let cur_fmt = {};

        cur_fmt['money'] = this.metadata.get('currency_formats');
        cur_fmt['numeric'] = this.metadata.get('numeric_formats');
        cur_fmt['date'] = this.metadata.get('date_formats');
        cur_fmt['text'] = [];

        this.metadata.update_simple(data['cid'],'kv_type', value);
        this.metadata.update_simple(data['cid'],'current_formats', cur_fmt[value]);
        if (cur_fmt[value].length > 0) {
            // kv_format entry is a 2 items array. First one is used as value
            // in HTML <option> and second one is the human text
            // cur_fmt[value][0][0] == use first *value* of first format from the list
            this.metadata.update_simple(data['cid'],'kv_format', cur_fmt[value][0][0]);
        } else {
            // current list of formatting types is empty only for kv_type text
            // no formating - means kv_type = text
            this.metadata.update_simple(data['cid'],'kv_format', "");
        }

        this.render();
    }

    update_key(event) {
        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).parent();
        let data = parent.data();

        this.metadata.update_simple(data['cid'], 'key', value);
    }

    update_value(event) {
        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).parent();
        let data = parent.data();

        this.metadata.update_simple(data['cid'], 'value', value);
    }


    add_simple_meta(event) {
        let value = $(event.currentTarget).val();
        
        this.metadata.add_simple();
        
        this.render();
    }

    remove_meta(event) {
        let parent = $(event.currentTarget).parent();
        let data = parent.data();

        this.metadata.remove_simple(data['cid']);
        
        parent.remove();
    }

    on_submit() {
        this.metadata.save();
    }


    render() {
        let compiled, context;

        context = {
            'kvstore': this.metadata.get('kvstore'),
            'available_types': this.metadata.get('kv_types')
        }

        console.log(`kvstore=${this.metadata.get('kvstore')}`);
        console.log(`available_types=${this.metadata.get('kv_types')}`);
        console.log(context);

        compiled = _.template(TEMPLATE({
            kvstore: this.metadata.kvstore,
            available_types: this.metadata.get('kv_types'),
        }));

        this.$el.html(compiled);
        
        return this;
    }
};
