import $ from "jquery";
import _ from "underscore";
import { Browse } from "../models/browse";
import { View } from 'backbone';
import Backbone from 'backbone';
import {
    mg_dispatcher,
    PARENT_CHANGED,
} from "../models/dispatcher";


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

    mg_dispatcher.on(PARENT_CHANGED, function(parent_id){
      console.log("BrowseView: parent_changed");
      that.browse.set({'parent_id':parent_id});
      that.browse.fetch();
    });
  }

  events() {
      let event_map = {
        'dblclick .node': 'open_node'
      }
      return event_map;
  }

  open_node(event) {
    let data = $(event.currentTarget).data(), node, new_co;

    node = this.browse.nodes.get(data['cid']);

    if (node) {
      console.log(`BrowseView open node ${node.get('title')}`);  
      this.browse.open(node, true);
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