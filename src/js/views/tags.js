import $ from "jquery";
import _ from "underscore";
import { Tags } from "../models/tags";
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/tags.html');

export class TagsModalView extends View {
  el() {
      // this element is defined in admin/_forms.js.html
      return $('#tags-modal');
  } 

  initialize(tags) {
      this.tags = tags;
      this.render();
  }

  events() {
    let event_map = {
      "keyup .tag-input": 'on_keyup',
      "click .tag-remove": "on_remove",
    }

    return event_map;
  }

  on_keyup(event) {
    if (event.key == 'Enter' || event.key == ',') {

    }
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'tags': this.node.get('tags'),
    }));

    this.$el.html(compiled);
    this.$el.modal();
  }
}