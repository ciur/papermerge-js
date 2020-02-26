import {DgEvents} from "../events";
import {MgPage} from "./page";


export class MgSelection {
    // digilette (dg) was renamed to papermerge (mg)
    /**
    A list of selected pages from current document
    **/
    static get DELETE() {
        return "mg_delete_selected_page";
    }

    // event name
    static get CHANGE() {
      return "mg_selection_changed";
    }

    constructor() {
      this._list = [];
      this._events = new DgEvents();
      this._configEvents();
    }

    subscribe_event(name, handler, context) {
      this._events.subscribe(name, handler, context);
    }

    notify_subscribers(event_name) {
      this._events.notify(event_name);
    }

    clear() {
      this._list = [];
      this._configEvents();
      this.notify_subscribers(
        MgSelection.CHANGE,
        this._list
      );
    }

    contains(item) {
      let pos;

      pos = this._list.findIndex(
        x => x.page_id == item.page_id
      )

      return pos >= 0;
    }

    add(mg_page) {
      let pos;

      pos = this._list.findIndex(
         item => item.page_id == mg_page.page_id
      );
      // add mg_page only if it is not already in the list.
      if (pos < 0) {
        this._list.push(mg_page);
      }
    }

    all() {
      return this._list;
    }

    first() {
      return this._list[0];
    }

    remove(mg_page) {
      let pos;

      pos = this._list.findIndex(
        item => item.page_num == mg_page.page_num
      );

      if (pos >= 0) {
        this._list.splice(pos, 1);  
      }
    }

    get length() {
      return this._list.length;
    }
    
    _on_page_click(event) {
        let $this = $(this);
        let mg_page;
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

        mg_page = MgPage.create_from_dom($this);  

        if (new_state) { // is checked
          event.data.selection.add(mg_page);    
        } else {
          event.data.selection.remove(mg_page);
        }

        event.data.selection.notify_subscribers(
          MgSelection.CHANGE,
          this._list
        );
    }

    _configEvents() {
      // listens on clicks on file and folders
      // and adds/removes them from list
      // when selection count changed - sends an event
      $(".page_thumbnail").unbind('click');
      $(".page_thumbnail").click(
        {
            selection: this,
        },
        this._on_page_click
      );
    }
}