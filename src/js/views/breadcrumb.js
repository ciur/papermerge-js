import $ from "jquery";
import _ from "underscore";
import { Breadcrumb } from "../models/breadcrumb";
import { View } from 'backbone';
import Backbone from 'backbone';
import {
    mg_dispatcher,
    PARENT_CHANGED,
} from "../models/dispatcher";


let TEMPLATE = require('../templates/breadcrumb.html');

export class BreadcrumbView extends View {
  el() {
      return $('#breadcrumb');
  } 

  initialize(parent_id) {
    let that = this;

    this.breadcrumb = new Breadcrumb(parent_id);
    this.breadcrumb.fetch();
    this.listenTo(this.breadcrumb, 'change', this.render);
  }

  events() {
    let event_map = {
      'click .breadcrumb-node':  'open_node'
    }

    return event_map;
  }

  open_node(event) {
    let data = $(event.currentTarget).data(), node;

    node = this.breadcrumb.nodes.get(data['id']);

    if (node) {
      mg_dispatcher.trigger(PARENT_CHANGED, node.id);
    } else {
      mg_dispatcher.trigger(PARENT_CHANGED, undefined);
    }
  }

  open(node_id) {
    this.breadcrumb.set({'parent_id': node_id});
    this.breadcrumb.fetch();
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'nodes': this.breadcrumb.nodes,
    }));

    this.$el.html(compiled);
  }
}