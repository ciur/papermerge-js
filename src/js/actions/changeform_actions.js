import {find_by_id} from "../utils";
import $ from "jquery";
import {MgSelection} from "../document_form/selection";
import {MgClipboard} from "../document_form/clipboard";
import {DgNode} from "../node";

/*
  Dropdown menu for document form.
  Menu includes following items:
    * rename - renames the document title
    * page:
        # delete - deletes one or multiple (selected) pages
        # cut - cuts one or multiple selected pages
        # paste - paste pages (which were cut from different document)
*/


export class MgChangeFormAction {
  /*
    An abstraction of action item in (actions) dropdown menu from
    changelist and changeform view.
  */
  constructor(config) {
    this._enabled_cond = config['enabled'];
    // id is a DOM selector (i.e a string)
    this._id = config['id'];
    this._is_enabled = config['initial_state'] || false;
    this._confirm = config['confirm'];
    this._action = config['action'];

    if(this._is_enabled) {
      this.enable();
    }
  }

  get id() {
    return this._id;
  }

  get confirm() {
    return this._confirm;
  }

  get is_enabled() {
    return this._is_enabled;
  }

  enable() {
    this._is_enabled = true;
    $(this._id).removeClass("disabled");
  }

  disable() {
    console.log(`${this._id} disabled`);
    this._is_enabled = false;
    $(this._id).addClass("disabled");
  }

  toggle(
    selection,
    clipboard,
    current_node,
    thumbnail_list,
    page_list
    ) {
    if (
      this._enabled_cond(
        selection,
        clipboard,
        current_node,
        thumbnail_list,
        page_list
      )
    ) {
      this.enable();
    } else {
      this.disable();
    }
  }

  action(
    selection,
    clipboard,
    current_node,
    thumbnail_list,
    page_list

    ) {
    this._action(
      selection,
      clipboard,
      current_node,
      thumbnail_list,
      page_list
    );
  }
}

export class MgChangeFormActions {
  /*
    An abstraction of actions dropdown menu in changelist view.
    Actions dropdown menu operates on a selection of one or many
    items (document or folder).
  */
  constructor(thumbnail_list, page_list) {
    let title, id;

    title = $("input[name=document_title]").val();
    id = $("input[name=document_id]").val();

    this._actions = []
    this._selection = new MgSelection();
    // user can cut some items in one folder and
    // paste them in another folder. Cut/Pasted items are placed (taken)
    // to/from DgClipboard
    this._clipboard = new MgClipboard();
    this._current_node = new DgNode(id, title);
    this._thumbnail_list = thumbnail_list;
    this._page_list = page_list;
    this.configEvents();
  }

  get selection() {
    return this._selection;
  }

  clear_selection() {
    this.selection.clear();
  }

  add(action) {
    this._attach_events(action);
    this._actions.push(action)
  }

  _attach_events(action){
      $(action.id).click(
        {
          action: action,
          selection: this._selection,
          clipboard: this._clipboard,
          current_node: this._current_node,
          thumbnail_list: this._thumbnail_list,
          page_list: this._page_list
        },
        this.on_click
      );
  }

  on_change_selection(selection) {
    /*
      Invoked every time when selection changes i.e. elemnts are either 
      added or removed from the list.

      Theoretically this._selection and selection should be same.
    */
    for (let action of this._actions) {
      action.toggle(
        this._selection,
        this._clipboard,
        this._current_node,
        this._thumbnail_list,
        this._page_list
      );
    }
  }

  on_change_clipboard(clipboard) {
    console.log(`on_change_clipboard received ${this._selection}`);

    for (let action of this._actions) {
      action.toggle(this._selection, clipboard);
    }
  }

  on_click(event) {
    let action = event.data.action;
    let selection = event.data.selection;
    let clipboard = event.data.clipboard;
    let current_node = event.data.current_node;
    let thumbnail_list = event.data.thumbnail_list;
    let page_list = event.data.page_list;

    if (!action.is_enabled) {
      return;
    }

    action.action(
      selection,
      clipboard,
      current_node,
      thumbnail_list,
      page_list
    );
  }

  configEvents() {

    this._selection.subscribe_event(
      MgSelection.CHANGE,
      this.on_change_selection,
      this // context
    );

    this._clipboard.subscribe_event(
      MgClipboard.CHANGE,
      this.on_change_clipboard,
      this //context
    );

    for(let action of this._actions) {
        this._attach_events(action);
    }
  }
}


