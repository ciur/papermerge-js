import $ from "jquery";
import _ from "underscore";
import { Browse } from "../models/browse";
import { View } from 'backbone';
import Backbone from 'backbone';
import {
    mg_dispatcher,
    PARENT_CHANGED,
} from "../models/dispatcher";
import { mg_browse_router } from "../routers/browse";


let TEMPLATE = require('../templates/browse.html');

export class BrowseView extends View {
  el() {
      return $('#browse');
  } 

  initialize(parent_id) {
    let that = this;
    this.browse = new Browse(parent_id);
    this.browse.fetch();
    this.listenTo(this.browse, 'change', this.render);
  }

  events() {
      let event_map = {
        'dblclick .node': 'open_node'
      }
      return event_map;
  }

  open_node(event) {
    let data = $(event.currentTarget).data(),
      node;

    node = this.browse.nodes.get(data['cid']);

    if (node) {
      mg_dispatcher.trigger(PARENT_CHANGED, node.id);
    } else {
      mg_dispatcher.trigger(PARENT_CHANGED, undefined);
    }
  }

  open(node_id) {
    this.browse.set({'parent_id': node_id});
    this.browse.fetch();
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'nodes': this.browse.nodes,
    }));

    this.$el.html(compiled);
  }
}