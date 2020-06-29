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

    mg_dispatcher.on(PARENT_CHANGED, function(parent_id){
      console.log("BreadcrumbView: parent_changed");

      that.breadcrumb.set({
        'parent_id': parent_id
      });
      that.breadcrumb.fetch();
    });
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

    console.log(`BreadcrumbView open node ${node.get('title')}`);  
    this.breadcrumb.open(node, true);
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