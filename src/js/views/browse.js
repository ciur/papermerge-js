import $ from "jquery";
import _ from "underscore";
import { Browse } from "../models/browse";
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/browse.html');

export class BrowseView extends View {
  el() {
      return $('#browse');
  } 

  initialize(parent_id) {
      this.browse = new Browse(parent_id);
      this.browse.fetch();
      this.listenTo(this.browse, 'change', this.render);
  }

  events() {
      let event_map = {
        'dblclick .node':  'open_node'
      }

      return event_map;
  }


  open_node(event) {
    let data = $(event.currentTarget).data(), node, new_co;

    node = this.browse.nodes.get(data['cid']);

    if (node) {
      console.log(`Open node ${node.get('title')}`);  
      this.browse.open(node);
    }
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'nodes': this.browse.nodes,
        'breadcrumb_nodes': this.browse.breadcumb_nodes,
    }));

    this.$el.html(compiled);
  }
}