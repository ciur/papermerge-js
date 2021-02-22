import $ from "jquery";
import _ from "underscore";
import { PageOcredText } from "../models/page_ocred_text";
import { MessageView } from "./message";
import { View } from 'backbone';
import Backbone from 'backbone';

import {
  mg_dispatcher,
  BROWSER_REFRESH
} from "../models/dispatcher";

let TEMPLATE = require('../templates/page_ocred_text.html');

export class PageOcredTextView extends View {
  el() {
      // this element is defined in admin/_forms.js.html
      return $('#message-modal');
  } 

  initialize(doc_id, page_number, version) {
    this.page_text = new PageOcredText({
      'id': doc_id, 
      'page_number': page_number,
      'document_version': version
    });
    this.page_text.fetch();
    this.listenTo(this.page_text, 'change', this.render);
  }

  events() {
    let event_map = {
        'click .ok': 'on_ok'
    };

    return event_map;
  }

  on_ok(event) {
    this.$el.modal('hide');
  }

  render() {
    let compiled, context, text;
    
    context = {};

    text = this.page_text.get('page_text');

    if (text) {
      text = text.replace(/\n/g, "<br />");
    }

    compiled = _.template(TEMPLATE({
        'page_text': text,
        'page_number': this.page_text.get('page_number'),
        'document_version': this.page_text.get('document_version')
    }));

    this.$el.html(compiled);
    this.$el.modal();
  }
}