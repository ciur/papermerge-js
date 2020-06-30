import $ from "jquery";
import _ from "underscore";
import { Browse } from "../models/browse";
import { View } from 'backbone';
import Backbone from 'backbone';
import {
    mg_dispatcher,
    PARENT_CHANGED,
    SELECTION_CHANGED
} from "../models/dispatcher";
import { mg_browse_router } from "../routers/browse";


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
        'dblclick .node': 'open_node',
        'click .node': 'select_node'
      }
      return event_map;
  }

  select_node(event) {
    let data = $(event.currentTarget).data(),
      node,
      selected,
      new_state,
      $target,
      checkbox;

    $target = $(event.currentTarget);
    node = this.browse.nodes.get(data['cid']);

    if (node) {
      selected = node.get('selected');
      node.set({'selected': !selected});
      new_state = !selected;
      
      if (new_state) {
        $target.addClass('checked');
      } else {
        $target.removeClass('checked');
      }

      mg_dispatcher.trigger(
        SELECTION_CHANGED,
        this.get_selection()
      );
    }
  }

  get_selection() {
    return _.filter(
      this.browse.nodes.models, function(item) {
        return item.get('selected') == true;
      }
    );
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