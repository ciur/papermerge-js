import $ from "jquery";
import _ from "underscore";
import { Metadata } from "../models/metadata";
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
        return $('#metadata_form_content');
    } 

    initialize(doc_id) {
        this.metadata = new Metadata(doc_id);

        this.metadata.fetch();

        this.render();
    }

    events() {
        let event_map = {
          "click #add_simple_meta": "add_simple_meta",
          "click #add_comp_meta"  : "add_comp_meta",
          "click .close.key": "remove_meta"
        }

        return event_map;
    }

    add_simple_meta() {
        this.metadata.add_simple();
        this.render();
    }

    add_comp_meta() {
        this.metadata.add_comp();
        this.render();
    }

    remove_meta(event) {
        let parent = $(event.currentTarget).parent();
        let data = parent.data();

        if (data['model'] == 'simple-key') {
            this.metadata.remove_simple(data['id'], data['value']);
        } else if (data['model'] == 'comp-key') {
            this.metadata.remove_comp(data['id'], data['value']);
        }
        parent.remove();
    }

    on_submit() {
        this.metadata.save();
    }


    render() {

        let compiled = _.template(TEMPLATE({
            kvstore: this.metadata.kvstore
        }));

        this.$el.html(compiled);
        
        return this;
    }
};
