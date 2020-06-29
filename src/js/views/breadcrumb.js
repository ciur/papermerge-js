import $ from "jquery";
import _ from "underscore";
import { Breadcrumb } from "../models/breadcrumb";
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/browse.html');

export class BreadcrumbView extends View {
  el() {
      return $('#breadcrumb');
  } 

  initialize(parent_id) {
      this.breadcrumb = new Breadcrumb(parent_id);
      this.breadcrumb.fetch();
      this.listenTo(this.breadcrumb, 'change', this.render);
  }

  events() {
      let event_map = {
        'click .node':  'open_node'
      }

      return event_map;
  }


  open_node(event) {
    let data = $(event.currentTarget).data(), node;

    node = this.breadcrumb.nodes.get(data['cid']);

    if (node) {
      console.log(`Open node ${node.get('title')}`);  
      this.breadcrumb.open(node);
    }
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