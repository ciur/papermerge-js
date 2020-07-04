import $ from "jquery";
import _ from "underscore";
import { Document } from "../models/document";
import { View } from 'backbone';
import Backbone from 'backbone';
import {
    mg_dispatcher,
    PARENT_CHANGED,
} from "../models/dispatcher";

let TEMPLATE = require('../templates/document.html');

export class DocumentView extends View {
  el() {
      return $('#document');
  } 

  initialize(parent_id) {
    this.document = new Document(parent_id);
    this.document.fetch();
    this.listenTo(this.document, 'change', this.render);
  }

  events() {
      let event_map = {
      }
      return event_map;
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'pages': this.document.pages,
    }));

    this.$el.html(compiled);
  }
}