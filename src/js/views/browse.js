import $ from "jquery";
import _ from "underscore";
import { Browse } from "../models/browse";
import { DisplayModeView } from "./display_mode";
import { View } from 'backbone';
import Backbone from 'backbone';
import {
    mg_dispatcher,
    PARENT_CHANGED,
    SELECTION_CHANGED,
    BROWSER_REFRESH
} from "../models/dispatcher";
import { mg_browse_router } from "../routers/browse";


let TEMPLATE_GRID = require('../templates/browse_grid.html');
let TEMPLATE_LIST = require('../templates/browse_list.html');

export class BrowseView extends View {
  el() {
      return $('#browse');
  } 

  initialize(parent_id) {
    this.browse = new Browse(parent_id);
    this.browse.fetch();
    this.display_mode = new DisplayModeView();
    this.listenTo(this.browse, 'change', this.render);
    this.listenTo(this.display_mode, 'change', this.render);

    mg_dispatcher.on(BROWSER_REFRESH, this.refresh, this);
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

    // folder is 'browsed' by triggering PARENT_CHANGED event
    if (node.is_folder()) { 
      // routers.browse handles PARENT_CHANGED event.
      if (node) {
        mg_dispatcher.trigger(PARENT_CHANGED, node.id);
      } else {
        mg_dispatcher.trigger(PARENT_CHANGED, undefined);
      }

      return;
    }
    // will reach this place only if node is a document.
    window.location = node.get('document_url');
  }

  open(node_id) {
    let parent_id = node_id;
    
    this.browse.set({'parent_id': node_id});
    this.browse.fetch();
  }

  refresh() {
    let parent_id = this.browse.get('parent_id');

    this.open(parent_id);
  }

  render() {
    let compiled, context, list_or_grid_template;
    
    context = {};

    if (this.display_mode.is_list()) {
      list_or_grid_template = TEMPLATE_LIST;
    } else {
      list_or_grid_template = TEMPLATE_GRID;
    }

    compiled = _.template(list_or_grid_template({
        'nodes': this.browse.nodes,
        'parent_kv': this.browse.parent_kv
    }));

    this.$el.html(compiled);
  }
}