import $ from "jquery";
import _ from "underscore";
import { Tag, Tags } from "../models/tags";
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/tags.html');
let ENTER_KEY = 13;


export class TagsView extends View {
  el() {
      return $('.tags-container');
  } 

  initialize(tags) {
    /*
    * Backbone collection of tags
    */
    this.tags = tags
    this.render();
  }

  events() {
    let event_map = {
      "keyup .tag-input": 'on_keyup',
      "click .tag-remove": "on_remove",
    }

    return event_map;
  }

  on_remove(event) {
    let value, model;

    value = $(event.target).data('name');
    model = new Tag({'name': value});
    this.tags.remove(model);
    this.render();
  }

  on_keyup(event) {
    let value, model;

    event.preventDefault();

    if (event.which == ENTER_KEY || event.key == ',') {
      value = $(event.target).val();

      if (!_.isEmpty(value)) { // whitespace is not a tag!
        value = value.replace(',','');

        // maybe user just pressed enter key after
        // whitespace. Make sure there is some non-white space
        // after comma removal.
        if (!_.isEmpty(value)) {
          model = new Tag({'name': value});

          this.tags.add(model);
          this.render();
          this.$el.find("input").focus();
        } // is not empty IF
      } // is not empty IF
    } // enter or comma IF
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'tags': this.tags,
    }));

    this.$el.html(compiled);
  }
}

