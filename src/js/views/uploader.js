import $ from "jquery";
import _ from "underscore";
import { Uploader, UploaderItem } from "../models/uploader";
import { View } from 'backbone';
import Backbone from 'backbone';

import {
  mg_dispatcher,
  BROWSER_REFRESH
} from "../models/dispatcher";

let TEMPLATE = require('../templates/uploader.html');

export class UploaderView extends View {
  el() {
      // this element is defined in admin/_forms.js.html
      return $('#uploader-view');
  } 

  initialize(files, lang, parent_id) {
      this.uploader = new Uploader();

      for(let file of files) {
          this.uploader.add(
            new UploaderItem(file, lang, parent_id)
          );
      }

      this.listenTo(this.uploader, 'change', this.render);
      this.listenTo(this.uploader, 'change', this.refresh_node_list);
      this.render();
  }

  refresh_node_list() {
    mg_dispatcher.trigger(BROWSER_REFRESH);
  }

  events() {
    let event_map = {
      'click .close': 'close',
      'click button.toggle-details': 'toggle_details'
    }

    return event_map;
  }

  toggle_details(event) {
    this.$el.find('.uploader-details').toggleClass('hidden');
  }

  close(event) {
    this.$el.html('');
  }

  render() {
    let compiled, context;
    
    context = {};

    if (!this.uploader.length) {
      return;
    }

    compiled = _.template(TEMPLATE({
        'files': this.uploader,
    }));

    this.$el.html(compiled);
  }
}