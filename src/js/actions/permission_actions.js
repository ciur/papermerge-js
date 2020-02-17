import $ from "jquery";
import {DgAbstractAction} from "./abstract_action";
import {DgSelection} from "../selection";

export class DgPermissionAction extends DgAbstractAction {
    constructor(config) {
        super(config);
    }

    toggle(selection) {
      if (this._enabled_cond(selection)) {
        this.enable();
      } else {
        this.disable();
      }
    }

    action(node, selection) {
      this._action(node, selection);
    }
}

export class DgPermissionActions {
    constructor(node, access_items) {
      // DgNode corresponding to selected document/folder
      this._node = node;
      this._actions = [];
      this._access_items = access_items;
    }

    add(action) {
        this._attach_events(action);
        this._actions.push(action);
    }

    actions() {
      return this._actions;
    }

    _attach_events(action){
        $(action.id).click(
          {
            action: action,
            node: this._node,
            selection: this._access_items.get_selected()
          },
          this.on_click
        );
    }

    unbind_events() {
      /*
        Unbind all click events.
      */
      for (let action of this._actions) {
          $(action.id).off('click');
      }
    }

    on_change_selection(selection) {
      for (let action of this._actions) {
        action.toggle();
      }
    }

    on_click(event) {
      let action = event.data.action;
      let node = event.data.node;
      let selection = event.data.selection;

      if (!action.is_enabled) {
        return;
      }

      action.action(node, selection);
    }
}