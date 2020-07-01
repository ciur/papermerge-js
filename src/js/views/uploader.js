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
    }

    return event_map;
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'files': this.uploader.models,
    }));

    this.$el.html(compiled);
  }
}