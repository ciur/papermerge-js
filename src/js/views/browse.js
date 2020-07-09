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

class BrowseListView extends View {
  /**
    List mode displays a table which can be sorted by each individual column.
    Also, some columns might be added or removed.
  **/
  el() {
      return $('#browse');
  }

  events() {
    let event_map = {
      
    }
    return event_map;
  }

  render(nodes, parent_kv) {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE_LIST({
        'nodes': nodes,
        'parent_kv': parent_kv
    }));

    this.$el.html(compiled);
  }
}

class BrowseGridView extends View {

  el() {
      return $('#browse');
  }

  render(nodes) {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE_GRID({
        'nodes': nodes,
    }));

    this.$el.html(compiled);
  }
}

export class BrowseView extends View {

  el() {
      return $('#browse');
  } 

  initialize(parent_id) {
    this.browse = new Browse(parent_id);
    this.browse.fetch();

    // UI used to switch between list and grid display modes
    this.display_mode = new DisplayModeView();

    // there are to view modes - list and grid
    this.browse_list_view = new BrowseListView();
    this.browse_grid_view = new BrowseGridView();

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
    let compiled, context;
    
    context = {};

    if (this.display_mode.is_list()) {
      this.browse_list_view.render(
        this.browse.nodes,
        this.browse.parent_kv
      );
    } else {
      this.browse_grid_view.render(
        this.browse.nodes,
      );
    }
  }
}