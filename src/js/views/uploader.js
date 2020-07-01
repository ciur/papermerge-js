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

  initialize(files, lang) {
      this.uploader = new Uploader();

      for(let file of files) {
          this.uploader.add(
            new UploaderItem(file, lang)
          );
      }

      this.listenTo(this.uploader, 'change', this.render);
      this.render();
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

    compiled = _.template(TEMPLATE({
        'files': this.uploader,
    }));

    this.$el.html(compiled);
  }
}