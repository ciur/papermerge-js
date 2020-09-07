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
      this.tags_container = new TagsView();
  }

  events() {
    let event_map = {
      "click .rename": "on_rename",
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

  on_rename(event) {
    let node_title, parent_id, options = {};

    options['success'] = function() {
      mg_dispatcher.trigger(BROWSER_REFRESH);
    }

    node_title = this.$el.find("[name=title]").val();

    if (node_title == null || node_title.trim().length === 0) {
      this.$el.modal('hide');
      return ;
    }

    this.rename.set({
      'title': node_title,
    });

    this.$el.modal('hide');
    this.rename.save({}, options);
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