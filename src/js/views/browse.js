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

let ASC = 'asc';
let DESC = 'desc';


class Column {

    constructor(name, key, sort) {
      this._name = name;
      this._key = key;
      this._sort = this.get_local(name) || sort;
    }

    get key() {
      return this._key;
    }

    get name() {
      return this._name;
    }

    get sort() {
      return this._sort;
    }

    set sort(sort_state) {
      this._sort = sort_state;
    }

    get_local(name) {
      return localStorage.getItem(`browse_list.${name}`);
    }

    set_local(name, value) {
      localStorage.setItem(`browse_list.${name}`, value); 
    }

    toggle() {
      // changes sorting state of the column
      // if sort is undefined - initial sort is ASC
      if (this.sort == undefined) {
        this.sort = ASC;
      } else if (this.sort == ASC) {
        this.sort = DESC;
      } else if (this.sort == DESC) {
        this.sort = ASC;
      }
      this.set_local(this.name, this.sort);
    }

    get sort_icon_name() {
      let fa_name = 'fa-sort';

      if (this.sort == ASC) {
        fa_name = 'fa-sort-amount-down-alt';
      } else if (this.sort == DESC) {
        fa_name = 'fa-sort-amount-down';
      } 

      return fa_name;
    }
}


class Table {

  constructor(nodes, parent_kv) {
    let cols;

    this._cols = this._build_header_cols(parent_kv)
    cols = this._cols;
    this._rows = this._build_rows(cols, nodes);
  }

  get cols() {
    return this._cols;
  }

  get rows() {
    return this._rows;
  }

  get key_cols() {
    let result = [];

    result = _.filter(
      this.cols,
      function(item){ return item.key != undefined; }
    );

    return result;
  }

  toggle_col_sort(index) {
    this._cols[index].toggle();
  }

  _build_rows(cols, nodes) {

  }

  _build_header_cols(parent_kv) {
    let result = [], kvstore, key, i;

    // there are always at least 3 cols: type, title and
    // created_at.
    // type is always first one
    // title is always second column
    // created_at column is always last one.
    result.push(
      // name, key, sort
      new Column('type', undefined, undefined)
    );

    result.push(
      // name, key, sort
      new Column('title', undefined, undefined)
    );

    for (i=0; i < parent_kv.length; i++) {
      kvstore = parent_kv.at(i);
      key = kvstore.get('key');
      result.push(new Column(key, key, undefined));
    }

    result.push(
      // name, key, sort
      new Column('created_at', undefined, undefined)
    );


    return result;
  }

}

class BrowseListView extends View {
  /**
    List mode displays a table which can be sorted by each individual column.
    Also, some columns might be added or removed.
  **/
  el() {
      return $('#browse');
  }

  initialize() {
    this._table = undefined;
  }

  get table() {
    return this._table;
  }

  get cols() {
    return this._table.cols;
  }

  get rows() {
    return this._table.rows;
  }

  events() {
    let event_map = {
      "click .header.sort": "col_sort"
    }
    return event_map;
  }

  col_sort(event) {
    let data = $(event.currentTarget).data(), key_name;

    if (data.col == 'key') {
      // kvstore column was clicked, find out
      // exact key name
      key_name = data.key;
      this.toggle_key_column(key_name);
    } else {
      // one of 3 column was clicked - type, name or created_at
      this.toggle_standard_column(data.col);
    }
    
    event.preventDefault();
    this.trigger("change");
  }

  toggle_key_column(key_name) {
    let index;

    index = _.findIndex(this.cols, function(item) {
        return item.key == key_name;
    });

    if (index >= 0) {
      this.toggle_col_sort(index);
    }
  }

  toggle_col_sort(index) {
    this._table.toggle_col_sort(index);
  }

  toggle_standard_column(name) {
    let index;

    index = _.findIndex(this.cols, function(item) {
        return item.name == name;
    });

    if (index >= 0) {
      this.toggle_col_sort(index);
    }
  }

  render(nodes, parent_kv) {
    let compiled, context;
    
    context = {};

    this._table = new Table(nodes, parent_kv);

    compiled = _.template(TEMPLATE_LIST({
        'nodes': nodes,
        'parent_kv': parent_kv,
        'table': this.table
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
    this.listenTo(this.browse_list_view, 'change', this.render);

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