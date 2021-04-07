import $ from "jquery";
import _ from "underscore";
import { Browse } from "../models/browse";
import { MgRect } from "../utils";
import { DisplayModeView } from "./display_mode";
import { DropzoneView } from "./dropzone";
import { PaginationView } from "./pagination";
import { View } from 'backbone';
import Backbone from 'backbone';
import 'webpack-jquery-ui/selectable';
import {
    mg_dispatcher,
    PARENT_CHANGED,
    SELECTION_CHANGED,
    BROWSER_REFRESH,
    SELECT_ALL,
    SELECT_FOLDERS,
    SELECT_DOCUMENTS,
    DESELECT,
    INVERT_SELECTION,
} from "../models/dispatcher";

import { mg_browse_router } from "../routers/browse";
import led_unknown_svg from 'led_status/src/assets/led-unknown.svg';
import led_success_svg from 'led_status/src/assets/led-success.svg';
import { LEDDocumentStatus } from 'led_status/src/js/led_status';
import { LEDPageStatus } from 'led_status/src/js/led_status';

let TEMPLATE_GRID = require('../templates/browse_grid.html');
let TEMPLATE_LIST = require('../templates/browse_list.html');

let SORT_ASC = 'asc';
let SORT_DESC = 'desc';
let SORT_UNDEFINED = 0;
let UI_SELECTION_MOUSE_MOVE = 'ui-selection-mouse-move';
let UI_SELECTION_MOUSE_UP = 'ui-selection-mouse-up'
let ui_selection_dispatcher = _.clone(Backbone.Events);

class UISelect {
  /**
  Desktop like select.
  **/

  css_id() {
    return 'desktop-like-selection';
  }

  constructor(parent_selector, x, y) {
    /***
      x, y coordinates where selection started.
      parent - dom parent element. Selection DOM element
      will be attached to parent and it's coordinates
      will be relative to the parent DOM.
    **/
    // x,y where selection started
    this.start_x = x;
    this.start_y = y;
    this.current_x = y;
    this.current_y = y;
    this.height = 0;
    this.width = 0;
    this.$parent = $(parent_selector);
    this.$select = undefined;
  }

  create_div() {
    if (!this.$select) {
      this.$select = this._create_selection_div(
        this.$parent,
        this.start_x,
        this.start_y
      );
    }
  }

  remove_div() {
    this.$select.remove();
    this.$select = undefined;
  }

  update(x, y) {
    let height, width, top, left, selected_nodes;

    this.current_x = x;
    this.current_y = y;
    
    width = Math.abs(this.current_x - this.start_x);
    height = Math.abs(this.current_y - this.start_y);
    
    if (this.$select) {
      
      if (this.current_y <  this.start_y) {
        this.$select.css('top', `${this.current_y + 7}px`);
        top = this.current_y + 7;
      } else {
        this.$select.css('top', `${this.start_y}px`);  
        top = this.start_y;
      }
      if (this.current_x <  this.start_x) {
        this.$select.css('left', `${this.current_x + 7}px`);  
        left = this.current_x + 7;
      } else {
        this.$select.css('left', `${this.start_x}px`);  
        left = this.start_x;
      }
      this.$select.css('width', `${width}px`);
      this.$select.css('height', `${height}px`);

      selected_nodes = this._find_selected_nodes(new MgRect(left, top, width, height));
      ui_selection_dispatcher.trigger(
        UI_SELECTION_MOUSE_MOVE,
        selected_nodes
      );  
    }
  }

  _find_selected_nodes(selection_rect) {
    /**
      selection_rect is instance of utils.MgRect
    **/
    let selected_nodes = [];

    $(".node").each(function(index) {
        let $node = $(this), _r, rect, cid;

        cid = $node.data("cid");

        _r = this.getBoundingClientRect();
        rect = new MgRect(_r.x, _r.y, _r.width, _r.height);

        if (selection_rect.intersect(rect)) {
          //console.log(`Intersect! ${$node.data("cid")}`);
          selected_nodes.push($node);
        }
    });

    return selected_nodes;
  }

  _create_selection_div($parent, x, y) {

    let $select = $("<div></div>");

    $select.attr('id', this.css_id());
    $select.css('position', 'absolute');
    $select.css('top', `${y}px`);
    $select.css('left', `${x}px`);
    $select.css('width', '0px');
    $select.css('height', '0px');

    $parent.append($select);

    return $select;
  }
}

class UISelectView extends View {
  /***
  Backbone view specifically for UISelect.
  Attached to parent element of #browse
  **/
  el() {
    return $(".document-browser");
  }

  initialize() {
    this.ui_select = undefined;
  }

  events() {

      let events_map = {
          "mousedown .xmain": "on_mouse_down",
          "mouseup .xmain": "on_mouse_up",
          "mousemove .xmain": "on_mouse_move",
      }

      return events_map;
  }

  on_mouse_down(event) {
    /*
    URL: https://api.jquery.com/event.which/

    event.which also normalizes button presses (mousedown and mouseup events),
    reporting 1 for left button, 2 for middle, and 3 for right.
    */
    if (event.which > 1) {
      // not our concern
      // remove selection and quit
      if (this.ui_select) {
        this.ui_select.remove_div();
        this.ui_select = undefined;
      }
      return;
    }
    
    if (this.ui_select) {
      this.ui_select.remove_div();
      this.ui_select = undefined;
    }

    this.ui_select = new UISelect(
      this.$el,
      event.clientX,
      event.clientY
    );

    this.ui_select.create_div();
  }

  on_mouse_up(event) {
    if (this.ui_select) {
      this.ui_select.remove_div();
      this.ui_select = undefined;
    };
    ui_selection_dispatcher.trigger(
      UI_SELECTION_MOUSE_UP
    )
  }

  on_mouse_move(e) {
    // draw a selection only if
    // primary mouse button was pressed before and is pressed now
    if (this.ui_select && e.which == 1 && e.buttons == 1) {
      this.ui_select.update(e.clientX, e.clientY);
    }
  }
}

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
      this.set_local(this.name, sort_state);
    }

    get_local(name) {
      let local = localStorage.getItem(`browse_list.${name}`);
      
      if (local == "0" || local == undefined) {
        return SORT_UNDEFINED;
      };

      return local;
    }

    set_local(name, value) {
      localStorage.setItem(`browse_list.${name}`, value); 
    }

    toggle() {
      // changes sorting state of the column
      // if sort is undefined - initial sort is ASC
      if (this.sort == SORT_UNDEFINED || this.sort == undefined) {
        this.sort = SORT_ASC;
      } else if (this.sort == SORT_ASC) {
        this.sort = SORT_DESC;
      } else if (this.sort == SORT_DESC) {
        this.sort = SORT_ASC;
      }
    }

    get sort_icon_name() {
      let fa_name = 'fa-sort';

      if (this.sort == SORT_ASC) {
        fa_name = 'fa-sort-amount-down-alt';
      } else if (this.sort == SORT_DESC) {
        fa_name = 'fa-sort-amount-down';
      } 

      return fa_name;
    }
}


class Table {

  constructor(nodes, parent_kv) {
    let cols, sort_column;

    this._cols = this._build_header_cols(parent_kv)
    cols = this._cols;
    this._rows = this._build_rows(parent_kv, nodes);

    sort_column = this.get_sort_column();
    
    if (sort_column) {
      if (sort_column.key) {
    
        this.sort_key_column(
          sort_column.key,
          (sort_column.sort == SORT_ASC) ? -1 : 1
        );
    
      } else {
        this.sort_standard_column(
          sort_column.name,
          (sort_column.sort == SORT_ASC) ? -1 : 1
        );
      }
    }
  }

  get_sort_column() {
    let index = _.findIndex(this._cols, function(col) { 
      return col.sort == SORT_ASC || col.sort == SORT_DESC ;
    });

    if (index >= 0) {
      return this._cols[index];
    }

    return undefined;
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
    // Set as sort = undefined for all other columns
    // Only one column at the time is supported.
    for(let i=0; i < this._cols.length; i++ ) {
      if (i != index ) {
        this._cols[i].sort = SORT_UNDEFINED;
      }
    }

    return this._cols[index];
  }

  sort_key_column(key_name, sort_type) {
    
    function compare_keys( row1, row2 ) {
      let found_1 , found_2;

      found_1 = _.find(row1, function(item) {return item['key'] == key_name});
      found_2 = _.find(row2, function(item) {return item['key'] == key_name});

      if ( found_1['virtual_value'] < found_2['virtual_value'] ){
        return sort_type;
      }
      if ( found_1['virtual_value'] > found_2['virtual_value'] ){
          return -sort_type;
      }
      return 0;
    }

    this._rows = this._rows.sort(compare_keys);

  }

  sort_standard_column(name, sort_type) {

    function compare_cols( row1, row2 ) {
      let found_1 , found_2;

      found_1 = _.find(row1, function(item) {return item['col'] == name});
      found_2 = _.find(row2, function(item) {return item['col'] == name});

      if ( found_1['virtual_value'] < found_2['virtual_value'] ){
        return sort_type;
      }
      if ( found_1['virtual_value'] > found_2['virtual_value'] ){
          return -sort_type;
      }
      return 0;
    }
    
    this._rows = this._rows.sort(compare_cols);
  }

  _build_dict_for_type_col(node) {
    let value, virtual_value;

    if (node.is_document()) {
      value = `<i class="fa fa-file"></i>`;
      virtual_value = 0;
    } else {
      value = `<i class="fa fa-folder text-warning"></i>`;
      virtual_value = 1;
    }

    return {
      'id': node.get('id'),
      'cid': node.cid,
      'url': node.url,
      'is_readonly': node.is_readonly(),
      'col': 'type',
      'value': value,
      'virtual_value': virtual_value,
      'virtual_type': 'int'
    }
  }

  _build_dict_for_title_col(node) {
    let value, virtual_value;

    return {
      'id': node.get('id'),
      'cid': node.cid,
      'url': node.url,
      'col': 'title',
      'value': node.full_title_list_mode(),
      'virtual_value': node.full_title(),
      'virtual_type': 'str'
    }
  }

  _build_dict_for_created_at_col(node) {
    let value, virtual_value;

    return {
      'id': node.get('id'),
      'cid': node.cid,
      'url': node.url,
      'col': 'created_at',
      'value': node.get('created_at'),
      'virtual_value': node.get('created_at'),
      'virtual_type': 'str'
    }
  }

  _build_rows(parent_kv, nodes) {
    let node, result = [],
      value,
      virtual_value,
      kvstore,
      key,
      row = [];

    for (let i=0; i < nodes.length; i++) {

        node = nodes.at(i);
        row = [];
        row.push(
          this._build_dict_for_type_col(node)
        );

        row.push(
          this._build_dict_for_title_col(node)
        );

        for (let j=0; j < parent_kv.length; j++) {
          kvstore = parent_kv.at(j)
          if (kvstore) {
            key = kvstore.get('key');
            value = node.get_page_value_for(key);
            virtual_value = node.get_page_virtual_value_for(kvstore.get('key'));
            row.push(
              {
                'id': node.get('id'),
                'cid': node.cid,
                'url': node.url,
                'key': key,
                'value': value,
                'virtual_value': parseInt(virtual_value),
                'virtual_type': 'str'
              }
            )
          } 
        }

        row.push(
          this._build_dict_for_created_at_col(node)
        );
        result.push(row);
    } // for

    return result;
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
      if (kvstore) {
        key = kvstore.get('key');
        result.push(new Column(key, key, undefined));  
      }
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
      "click .header.sort": "col_sort",
    }
    return event_map;
  }

  col_sort(event) {
    let data = $(event.currentTarget).data(), key_name, column;

    if (data.col == 'key') {
      // kvstore column was clicked, find out
      // exact key name
      key_name = data.key;
      this.toggle_key_column(key_name);
    } else {
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
    return this._table.toggle_col_sort(index);
  }

  toggle_standard_column(name) {
    let index;

    index = _.findIndex(this.cols, function(item) {
        return item.name == name;
    });

    if (index >= 0) {
      return this.toggle_col_sort(index);
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

  constructor(led_doc_status) {
    super();
    this.led_doc_status = led_doc_status;
  }

  render(nodes, sort_field, sort_order) {
    let compiled, context, node, led_status;
    
    context = {};

    compiled = _.template(TEMPLATE_GRID({
        'nodes': nodes,
        'led_succeeded_svg': led_success_svg,
        'led_unknown_svg': led_unknown_svg 
    }));

    this.$el.html(compiled);

    for(let i=0; i < nodes.models.length; i++) {
      node = nodes.models[i];
      if (node && node.is_document()) {
        this.led_doc_status.pull(node['id']);
      }
    }
  }
}

export class BrowseView extends View {

  el() {
      return $('#browse');
  } 

  initialize(parent_id) {
    let that = this;

    this.browse = new Browse(parent_id);
    // UI used to switch between list and grid display modes
    this.display_mode = new DisplayModeView();
    this.pagination_view = new PaginationView();
    this.led_doc_status = new LEDDocumentStatus();
    // this creates ws connection which is necessary
    // for joining the channel
    this.led_page_status = new LEDPageStatus();

    // there are to view modes - list and grid
    this.browse_list_view = new BrowseListView(this.led_doc_status);
    this.browse_grid_view = new BrowseGridView(this.led_doc_status);
    this.dropzone = new DropzoneView(this.browse);

    this.listenTo(this.browse, 'change', this.render);
    this.listenTo(this.display_mode, 'change', this.refresh);
    this.listenTo(this.browse_list_view, 'change', this.render);

    mg_dispatcher.on(BROWSER_REFRESH, this.refresh, this);
    mg_dispatcher.on(SELECT_ALL, this.select_all, this);
    mg_dispatcher.on(SELECT_FOLDERS, this.select_folders, this);
    mg_dispatcher.on(SELECT_DOCUMENTS, this.select_documents, this);
    mg_dispatcher.on(DESELECT, this.deselect, this);
    mg_dispatcher.on(INVERT_SELECTION, this.invert_selection, this);
    ui_selection_dispatcher.on(
      UI_SELECTION_MOUSE_MOVE,
      this.on_ui_selection_mouse_move,
      this
    );
    ui_selection_dispatcher.on(
      UI_SELECTION_MOUSE_UP,
      this.on_ui_selection_mouse_up,
      this
    )

    if (this.display_mode.is_grid()) {
      // desktop like selection is enabled only in grid view mode
      this.ui_select_view = new UISelectView();
    }
    // adjusts height of document browsers
    this._let_browse_fill_in_parent();
  }

  events() {
      let events_map = {
          "click input[type=checkbox]": "on_checkbox_clicked",
          "click .node": "on_node_clicked",
      }

      return events_map;
  }

  _let_browse_fill_in_parent() {
    /**
    Hacky hack.
    
    'Forces' #browse div element to fill its parent.
    It is needed for better UX for drag' select feature
    (select like in desktop environment)
    **/
    let parent = this.$el.parent(), height_px;

    height_px = parent.height();
    // set's height of #browse element (in pixels)
    this.$el.height(`${height_px}px`);
  }


  on_checkbox_clicked(event) {
    let $target,
      cid,
      new_state;

    event.stopPropagation();
    // checkbox was clicked, thus, node (what we target)
    // is parent of what was clicked

    $target = $(event.currentTarget).parent();
    cid = $target.data('cid');
    // data may be attached differently
    // depending on list/grid view:
    if (!cid) {
      cid = $target.parent().data('cid');
      if (!cid) {
        console.log("node data still not available");
      }
    }

    new_state = this.select_node_by_cid(cid);
    
    if (new_state) {
      $target.addClass('checked');
      // again, depending on list mode (grid/view)
      // DOM structure differs little bit
      if ($target.parent().hasClass("node")) {
        $target.parent().addClass('checked');
      }
    } else {
      $target.removeClass('checked');
      // again, depending on list mode (grid/view)
      // DOM structure differs little bit
      if ($target.parent().hasClass("node")) {
        $target.parent().removeClass('checked');
      }
    }

    mg_dispatcher.trigger(
      SELECTION_CHANGED,
      this.get_selection()
    );
  }

  on_node_clicked(event) {
    let $target,
      cid,
      new_state;

    // node was clicked, thus, node is actually
    // what we target
    console.log('Browse list: on node clicked');
    $target = $(event.currentTarget);
    cid = $target.data('cid');

    new_state = this.select_node_by_cid(cid);
    
    if (new_state) {
      $target.addClass('checked');
    } else {
      $target.removeClass('checked');
    }
    this.open_node(cid);
  }

  on_ui_selection_mouse_move(dom_nodes) {
    /**
    As mouse selection drags (moves), this events
    receives selected nodes dom elements.
    */
    let that = this, node, cids;

    cids = _.map(dom_nodes, function($node){
      return $node.data('cid');
    })
    // select all nodes in dom_nodes 
    _.each(dom_nodes, function($node){
         node = that.browse.nodes.get(
          $node.data('cid')
        );
         node.select();
    });

    // deselect all nodes which are not in dom_nodes
    //console.log(`cids=${cids}`);
    this.browse.nodes.each(function(node){

      if (!_.contains(cids, node.cid)) {
          node.deselect();
      }
    });
  }

  on_ui_selection_mouse_up() {
    // inform other elements about current selection
    mg_dispatcher.trigger(
      SELECTION_CHANGED,
      this.get_selection()
    );
  }

  select_all() {
    this.browse.nodes.each(function(node){
        node.select();
    });

    mg_dispatcher.trigger(
      SELECTION_CHANGED,
      this.get_selection()
    );
  }

  select_folders() {
    this.browse.nodes.each(function(node){
      if (node.is_folder()) {
        node.select();
      }
    });

    mg_dispatcher.trigger(
      SELECTION_CHANGED,
      this.get_selection()
    );
  }

  select_documents() {
    this.browse.nodes.each(function(node){
      if (node.is_document()) {
        node.select();
      }
    });

    mg_dispatcher.trigger(
      SELECTION_CHANGED,
      this.get_selection()
    );
  }

  deselect() {
    this.browse.nodes.each(function(node){
        node.deselect();
    });

    mg_dispatcher.trigger(
      SELECTION_CHANGED,
      this.get_selection()
    );
  }

  invert_selection() {
    this.browse.nodes.each(function(node){
      node.toggle_selection();
    });

    mg_dispatcher.trigger(
      SELECTION_CHANGED,
      this.get_selection()
    );
  }

  select_node_by_cid(cid) {
    let node,
      selected,
      new_state;


    node = this.browse.nodes.get(cid);

    if (node) {
      selected = node.get('selected');
      node.set({'selected': !selected});
      new_state = !selected;
      
      return new_state;
    } // if (node)
  }

  get_selection() {
    let result;
    
    result = _.filter(
      this.browse.nodes.models, function(item) {
        return item.get('selected') == true;
      }
    );

    return result;
  }

  open_node(cid) {
    let node;

    node = this.browse.nodes.get(cid);

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

  open(node_id, tagname) {
    let parent_id = node_id;
    
    this.browse.set({
      'parent_id': node_id,
      'tag': tagname,
    });
    
    this.browse.fetch();
  }

  _get_tagname_from_location() {
    /**
    * Checks window.location if there is a "tag" filter:
    * /browse#tagged/employer
    * In case there is a tag filter, returns tagname.
    *
    * Relevant in case when user clicks on pinned tag, and then
    * performs add/remove tags action on currently filted 
    * nodes -> will refresh nodes considernig current tag
    */
    let regexp = /tagged\/(\w+)$/, url = location.href, match;

    match = url.match(regexp);
    if (match) {
      return match[1];
    }

    return undefined;
  }

  refresh() {
    let parent_id = this.browse.get('parent_id'),tagname;

    tagname = this._get_tagname_from_location();
    this.browse.set({
      'order_by': this.display_mode.get_order_by()
    });
    this.open(parent_id, tagname);
  }

  render() {
    let compiled,
      context,
      sort_order,
      sort_field,
      pagination_ctx = {};
    
    context = {};
    pagination_ctx = this.browse.get('pagination') || {};
    // Pagination needs to know parent id i.e. id of the node
    // which is parent of all currently displayed.
    // That parent node id is rendered in urls.
    pagination_ctx['parent_id'] = this.browse.get('parent_id');

    this.pagination_view.render(pagination_ctx);

    if (this.display_mode.is_list()) {
      // desktop like selection was enabled.
      // disable it as it makes sense only in grid view
      if ( this.ui_select_view ) {
        this.ui_select_view.undelegateEvents();
        this.ui_select_view = undefined;
      }

      this.browse_list_view.render(
        this.browse.nodes,
        this.browse.parent_kv
      );
    } else {
      sort_field = this.display_mode.sort_field;
      sort_order = this.display_mode.sort_order;

      if (!this.ui_select_view) {
        // desktop like selection is enabled only in grid view mode
        this.ui_select_view = new UISelectView();
      }

      this.browse.nodes.dynamic_sort_by(
        sort_field,
        sort_order
      );
      
      this.browse_grid_view.render(
        this.browse.nodes
      );
    }
    // beautiful refresh feature BEGIN
    /**
      Context
      ========

      Document browser loads part of its elements via ajax calls. When ajax
      responses are available, backbone views are triggered to render those
      elements. Overall this mix of ajax + backbone views + part of document
      displayed as standard html page results in a flickery (annoying) rendering
      experience.

      Solution
      ========

      Main page parts aside.main-sidebar, .main-header, .content-wrapper have
      their initial css opacity set to 0 i.e those elements are not visible.

      When page load complets (which is signaled by change event in browser view)
      those 3 page parts (aside.main-sidebar, .main-header, content-wrapper)
      are progresively made visible via animated css opactity transition to 1.

      Because aside.main-sidebar, .main-header, content-wrapper elements are
      part of main layout (i.e. rendered in all application views) it is necessary
      to avoid the progressive animated load for the rest of pages. The thing
      is that the problem of annoying rendering experience is ONLY (and I repeat ONLY)
      for document browser and document viewer. To restrict solution only for
      document viewer and documents browser the .animated-opacity css class is used.
      The ``.animated-opacity`` css class is rendered only for index.html view and document.html
      view.
    */
    $('aside.main-sidebar.animated-opacity').animate({opacity: 1.0}, 500, function(){
        $('.main-header.animated-opacity').animate({opacity: 1.0}, 300, function(){
            $("#pre-loader").hide();
            $('.content-wrapper.animated-opacity').animate({opacity: 1.0}, 200);
        });
    });
    // beautiful refresh feature END
  }
}