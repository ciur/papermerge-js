import $ from "jquery";
import _ from "underscore";
import { Metadata } from "../models/metadata";
import { View } from 'backbone';

let TEMPLATE = require('../templates/metadata.html');


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
