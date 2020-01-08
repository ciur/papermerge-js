import $ from "jquery";
import {DgFolder, DgDocument} from "./node";
import {DgEvents} from "./events";


export class DgSelection {
  /*
  A list of selected DgDocuments and DgFolder objects.
  */
    constructor() {
      this._list = [];
      this._events = new DgEvents();
      this._configEvents();
    }

    // event name
    static get CHANGE() {
      return "change";
    }

    subscribe_event(name, handler, context) {
      this._events.subscribe(name, handler, context);
    }

    notify_subscribers(event_name) {
      this._events.notify(event_name);
    }

    add(dg_node) {
      let pos;

      pos = this._list.findIndex(
         item => item.id == dg_node.id
      );
      // add dg_node only if it is not already in the list.
      if (pos < 0) {
        this._list.push(dg_node);
      }
    }

    all() {
      return this._list;
    }

    first() {
      return this._list[0];
    }

    remove(dg_node) {
      let pos;

      pos = this._list.findIndex(
        item => item.id == dg_node.id
      );

      if (pos >= 0) {
        this._list.splice(pos, 1);  
      }
    }

    get length() {
      return this._list.length;
    }

    count(cond_fn=x=>x) {
      // count is same as length, but with an optional filter
      return this._list.filter(cond_fn).length;
    }

    _on_node_click(event) {
        let $this = $(this);
        let dg_node;
        let checkbox = $this.find("[type=checkbox]").first();
        let checked, new_state;

        checked = checkbox.prop("checked");
        new_state = !checked;
        checkbox.prop("checked", new_state);
        
        if (new_state) {
          $this.addClass("checked");
        } else {
          $this.removeClass("checked");
        }

        if (event.data.node_type == 'document') {
          dg_node = DgDocument.create_from_dom($this);  
        } else if (event.data.node_type == 'folder') {
          dg_node = DgFolder.create_from_dom($this);  
        }

        if (new_state) { // is checked
          event.data.selection.add(dg_node);    
        } else {
          event.data.selection.remove(dg_node);
        }

        event.data.selection.notify_subscribers(
          DgSelection.CHANGE,
          this._list
        );
    }

    find(dg_node) {
      for(let item of this._list) {
        if (dg_node.id == item.id) {
            return item;
        }
      }
      return false;
    }

    _configEvents() {
      // listens on clicks on file and folders
      // and adds/removes them from list
      // when selection count changed - sends an event
      $(DgDocument.selector).click(
        {
            selection: this,
            node_type: 'document'
        },
        this._on_node_click
      );
      $(DgFolder.selector).click(
        {
            selection: this,
            node_type: 'folder'
        },
        this._on_node_click
      );
    }
}