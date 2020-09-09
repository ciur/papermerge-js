import $ from "jquery";
import _ from "underscore";
import { TagsView, MultiTagsView } from "../views/tags";
import { Tag, Tags } from "../models/tags";
import { View } from 'backbone';
import Backbone from 'backbone';

import {
  mg_dispatcher,
  BROWSER_REFRESH
} from "../models/dispatcher";

let TEMPLATE = require('../templates/tags_modal.html');
let MULTI_TEMPLATE = require('../templates/multi_tags_modal.html');


export class BaseModalView extends View {
  /***
  * Modal dialog displayed when user selected a single node
  ***/
  el() {
      // this element is defined in admin/_forms.js.html
      return $('#tags-modal');
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

  _get_shared_tags(nodes) {
    /*
    * Returns a (backbone) collection  of shared tags across given nodes
    */
  }

  _node2tag_collection(node) {
    /*
    * For given node returns a backbone collection of tags 
    * (of model.tags.Tag instances)
    */
    let result, tags, tag_collection;

    tag_collection = new Tags([], {'node': node});

    tags = node.get('tags') || [];

    for (let i=0; i < tags.length; i++) {
      tag_collection.add(
        {'name': tags[i]['name']}
      );
    }
    return tag_collection;
  }

}


export class TagsModalView extends BaseModalView {
  /***
  * Modal dialog displayed when user selected a single node
  ***/
  initialize(node) {
      this.node = node;
      this.render();
      this.tags_container = new TagsView(
        this._node2tag_collection(node)
      );
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

export class MultiTagsModalView extends View {
  /***
  * Modal dialog displayed when user selected multiple nodes
  ***/
  initialize(nodes) {
    // notice plural here
    this.nodes = nodes;
    this.render();
    this.tags_container = new TagsView(
      this._get_shared_tags(nodes)
    );
  }

  render() {
    let compiled, context, node;
    
    context = {};

    compiled = _.template(MULTI_TEMPLATE({
        'tags': this._get_shared_tags(this.nodes),
    }));

    this.$el.html(compiled);
    this.$el.modal();
  }
}