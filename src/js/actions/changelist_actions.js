import {find_by_id} from "../utils";
import $ from "jquery";
import {DgAbstractAction} from "./abstract_action";
import {DgSelection} from "../selection";
import {DgClipboard} from "../clipboard";
import {get_current_parent_id} from "../node";
import {CutForm} from "../forms/cut_form";
import {PasteForm} from "../forms/paste_form";
import {DeleteForm} from "../forms/delete_form";
import {RenameForm} from "../forms/rename_form";
import {AccessForm} from "../forms/access_form";


export class DgChangeListAction extends DgAbstractAction {
  /*
    An abstraction of action item in (actions) dropdown menu from
    changelist view.
  */
  constructor(config) {
    super(config);
  }

  action(selection, clipboard, current_node) {
    this._action(selection, clipboard, current_node);
  }
}

export class DgChangeListActions {
  /*
    An abstraction of actions dropdown menu in changelist view.
    Actions dropdown menu operates on a selection of one or many
    items (document or folder).
  */
  constructor(config) {
    this._actions = [];
    this._selection = new DgSelection();
    // user can cut some items in one folder and
    // paste them in another folder. Cut/Pasted items are placed (taken)
    // to/from DgClipboard
    this._clipboard = new DgClipboard();
    this._current_node = get_current_parent_id();
    this.configEvents();
  }

  add(action) {
    this._attach_events(action);
    this._actions.push(action);
  }

  _attach_events(action){
      $(action.id).click(
        {
          action: action,
          selection: this._selection,
          clipboard: this._clipboard,
          current_node: this._current_node
        },
        this.on_click
      );
  }

  on_change_selection(selection) {
    /*
      Invoked every time when selection changes i.e. elemnts are either 
      added or removed from the list.

      Theorethically this._selection and selection should be same.
    */
    for (let action of this._actions) {
      action.toggle(this._selection, this._clipboard);
    }
  }

  on_change_clipboard(clipboard) {
    for (let action of this._actions) {
      action.toggle(this._selection, clipboard);
    }
  }

  on_click(event) {
    let action = event.data.action;
    let selection = event.data.selection;
    let clipboard = event.data.clipboard;
    let current_node = event.data.current_node;

    if (!action.is_enabled) {
      return;
    }

    action.action(
      selection,
      clipboard,
      current_node
    );
  }

  configEvents() {

    this._selection.subscribe_event(
      DgSelection.CHANGE,
      this.on_change_selection,
      this // context
    );

    this._clipboard.subscribe_event(
      DgClipboard.CHANGE,
      this.on_change_clipboard,
      this //context
    );

    for(let action of this._actions) {
        this._attach_events(action);
    }
  }
}

export function build_changelist_actions() {
  /**
  Actions dropdown menu of changelist view.
  */

  if ( !find_by_id("changelist_actions") ) {
    // there is no point to do anything if actions
    // dropdown is not in the view.
    return;
  }

  let actions = new DgChangeListActions(),
      cut_action,
      delete_action,
      paste_action,
      paste_pages_action,
      rename_action,
      download_action,
      access_action;

  cut_action = new DgChangeListAction({
    id: "#cut",
    enabled: function(selection, clipboard) {
      return selection.length > 0;
    },
    action: function(selection, clipboard, current_node) {
        let cut_form; 

        clipboard.add(
          selection.all()
        );
        selection.all().forEach(
          item => item.addClass('cut')
        );

        cut_form = new CutForm(
          selection.all(),
          current_node
        );

        cut_form.submit();
    }
  });

  delete_action = new DgChangeListAction({
    id: "#delete",
    enabled: function(selection, clipboard) {
      return selection.length > 0;
    },
    action: function(selection, clipboard, current_node) {
        let delete_form, confirmation = true;

        if (this.confirm) {
            confirmation = confirm("Are you sure?");
        }

        if (!confirmation) {
          return;
        }

        delete_form = new DeleteForm(
            selection.all(),
            current_node
        );

        delete_form.submit();
    },
    confirm: true,
  });

  paste_action = new DgChangeListAction({
    id: "#paste",
    initial_state: true, // enabled by default
    enabled: function(selection, clipboard) {
      if (clipboard) {
        return clipboard.length > 0;
      }

      return false;
    },
    action: function(selection, clipboard, current_node) {
      let paste_form;

      paste_form = new PasteForm();

      paste_form.submit();
    }
  });

  paste_pages_action = new DgChangeListAction({
    id: "#paste_pages",
    initial_state: true, // enabled by default
    enabled: function(selection, clipboard) {
      return true;
    },
    action: function(selection, clipboard, current_node) {
      console.log(`Pasting pages...current_node_id=${current_node}`);
    }
  });

  rename_action = new DgChangeListAction({
    // Achtung! #rename id is same for rename action
    // in changeform view and changelist view.
    id: "#rename",
    enabled: function(selection, clipboard) {
      return selection.length == 1;
    },
    action: function(selection, clipboard, current_node) {
      let rename_form, node; 

      node = selection.first();
      rename_form = new RenameForm(node, current_node);
      rename_form.show();
    }
  });

  download_action = new DgChangeListAction({
    id: "#download",
    enabled: function(selection, clipboard) {
      return selection.length == 1;
    },
    action: function(selection, clipboard, current_node) {
    }
  });

  access_action = new DgChangeListAction({
    id: "#access",
    enabled: function(selection, clipboard) {
      return selection.length == 1;
    },
    action: function(selection, clipboard, current_node) {
      let access_form, node;

      node = selection.first();
      // current_node = referes to the parent node, which is used
      // some actions (in paste for example)
      // in case of access_action, only node is used - and it
      // refers to the selected node.
      access_form = new AccessForm(node, current_node);
      access_form.show();
    }
  });

  actions.add(cut_action);
  actions.add(delete_action);
  actions.add(paste_action);
  actions.add(paste_pages_action);
  actions.add(rename_action);
  actions.add(download_action);
  actions.add(access_action);
}
