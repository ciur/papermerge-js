import $ from "jquery";
import _ from "underscore";
import { TagsView } from "../views/tags";
import { View } from 'backbone';
import Backbone from 'backbone';

import {
  mg_dispatcher,
  BROWSER_REFRESH
} from "../models/dispatcher";

let TEMPLATE = require('../templates/tags_modal.html');

export class TagsModalView extends View {
  el() {
      // this element is defined in admin/_forms.js.html
      return $('#tags-modal');
  } 

  initialize(node) {
      this.node = node;
      this.render();
      this.tags_container = new TagsView(node);
  }

  events() {
    let event_map = {
      "click button.submit_tags": "on_click_submit",
      "submit": "on_form_submit"
    }

    return event_map;
  }

  on_form_submit(event) {
    event.preventDefault();
    //this.on_rename(event);
    // otherwise it will continue renaming
    // renaming same folder/file over and over!
    //this.undelegateEvents();
  }

  on_click_submit(event) {
    let tags, parent_id, options = {};

    options['success'] = function() {
      mg_dispatcher.trigger(BROWSER_REFRESH);
    }

    tags = this.tags_container.tags;


    this.$el.modal('hide');
    tags.save({}, options);
  }

  render() {
    let compiled, context, node;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'tags': this.node.get('tags'),
    }));

    this.$el.html(compiled);
    this.$el.modal();
  }
}