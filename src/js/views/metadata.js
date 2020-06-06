import $ from "jquery";
import { Metadata } from "../models/metadata";
import { View } from 'backbone';

let TEMPLATE = require('../templates/metadata.html');


export class MetadataView extends View {
    constructor(doc_id){
        super();
        let metadata = new Metadata(doc_id).fetch();
    }

    el() {
        return $('#metadata_form_content');
    } 

    initialize() {
        this.render();
    }

    render() {
       this.$el.html(TEMPLATE({}));
       return this;
    }
};
