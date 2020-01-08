import {DgEvents} from "../events";


export class DgSelection {
    static get DELETE() {
        return "dg_selection_access_item_delete";
    }

    constructor() {
        this._list = [];
        this._events = new DgEvents();
    }

    subscribe_event(name, handler, context) {
      this._events.subscribe(name, handler, context);
    }

    notify_subscribers(event_name, model, name) {
      this._events.notify(event_name, model, name);
    }

    exists(norm_ai) {
        for(let i = 0; i < this._list.length; i++) {
            let item = this._list[i];
            if (item.name == norm_ai.name && item.model == norm_ai.model) {
                return true;
            }
        }

        return false;
    }

    count() {
        return this._list.length;
    }

    first() {
        if (this.count() > 0) {
            return this._list[0];    
        }
    }

    delete_all() {
        for(let i = 0; i < this._list.length; i++) {
            let item = this._list[i];
            // remove all associated dom elements;
            item.jq_dom_ref.remove();
            this.notify_subscribers(
                DgSelection.DELETE,
                item.model,
                item.name
            );
        }

        this._list = [];
        this._list.length = 0;
    }

    del(norm_ai) {
        let index = -1;

        for(let i = 0; i < this._list.length; i++) {
            let item = this._list[i];
            if (item.name == norm_ai.name && item.model == norm_ai.model) {
                index = i;
            }
        }
        if (index > -1 && index < this._list.length) {
            this._list.splice(index, 1);
        }
    }

    add(norm_ai) {
        this._list.push(norm_ai);
    }
}