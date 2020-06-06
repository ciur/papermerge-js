import {MgSimpleKeyItem} from "./simple_key_item";
import {MgSelection} from "./selection";
import {DgEvents} from "../events";

export class MgSimpleKeyItems {

    // events definitions
    static get SELECT() {
        return "SIMPLE_KEY_ITEMS_SELECT";
    }

    constructor(id="#access_items") {
        this._id = id;
        // items in this list will be either created
        // or updated
        this._list = []; 
        // items in this list will be deleted.
        this._delete_list = [];
        this._selection = new MgSelection();
        this._events = new DgEvents();
        this.configEvents();
    }

    configEvents() {
        let that = this;

        $(this._id).click(function(e){
            let data_name, data_model, arr, dom_el;

            dom_el = $(e.target.parentElement);
            data_model = dom_el.data('model');
            data_name = dom_el.data('name');

            arr = that._list.filter(
                norm_ai => (norm_ai.model == data_model) && (norm_ai.name == data_name)
            );
            if (arr.length > 0) {
                that.on_click(arr[0], dom_el);
            }
        });

        this._selection.subscribe_event(
            MgSelection.DELETE,
            this.on_selection_delete_item,
            this
        );
    }

    as_hash(){
        let result = {
            'add': [],
            'delete': []
        };
        // format data as expected
        // by HTTP POST /access/<node_id>
        for (let item of this._list) {
            result['add'].push(item.as_hash());
        }

        for (let item of this._delete_list) {
            result['delete'].push(item.as_hash());
        }

        return result;
    }

    subscribe_event(name, handler, context) {
      this._events.subscribe(name, handler, context);
    }

    notify_subscribers(event_name, list) {
      this._events.notify(event_name, list);
    }

    selected_count() {
        return this._selection.count();
    }

    get_selected() {
        return this._selection;
    }

    clear() {
        for(let item in this._list) {
            item.jq_dom_ref.delete();
        }

        this._list = [];
    } 

    on_selection_delete_item(model, name) {
        // just before deleting an item from selection,
        // it sends an event to the access_items class.
        // 
        // DgAccessItems in its turn, deletes item from its list.
        // model = user | group
        let index = -1, tmp_one_element_array = [];

        for(let i = 0; i < this._list.length; i++) {
            let item = this._list[i];
            if (item.model == model && item.name == name) {
                index = i;
            }
        }
        if (index > -1 && index < this._list.length) {
            tmp_one_element_array = this._list.splice(index, 1);
            this._delete_list.push(tmp_one_element_array[0]);
        }
    }

    on_click(norm_ai, dom_el) {
        if (this._selection.exists(norm_ai)) {
            this._selection.del(norm_ai);
            dom_el.removeClass('selected');
        }  else {
            this._selection.add(norm_ai);
            dom_el.addClass('selected');
        }
        // notify access form that selection changed,
        // this will adjust action buttons (edit, delete)
        this.notify_subscribers(DgAccessItems.SELECT)
    }

    dom_add(dom_template) {
        $(this._id).append(dom_template);
    }

    insert_norm_ai(norm_ai) {
        let jq_dom_ref = $(norm_ai.get_template());
            
        norm_ai.jq_dom_ref = jq_dom_ref;
        this._list.push(norm_ai);
        this.dom_add(jq_dom_ref);
    }

    update_norm_ai(norm_ai, access_item) {
        let jq_dom_ref;

        norm_ai.type = access_item.type;
        norm_ai.perms = access_item.perms;

        jq_dom_ref = $(norm_ai.get_template());
            
        norm_ai.jq_dom_ref.replaceWith(jq_dom_ref);
        norm_ai.jq_dom_ref = jq_dom_ref;
    }

    user_exists(user_name) {
        let norm_ai;

        for(let i = 0; i < this._list.length; i++ ) {
            norm_ai = this._list[i];

            if (norm_ai.model =='user' && norm_ai.name == user_name) {
                return this._list[i];
            }
        }
        return false;
    }

    group_exists(group_name) {
        let norm_ai;

        for(let i = 0; i < this._list.length; i++ ) {
            norm_ai = this._list[i];

            if (norm_ai.model == 'group' && norm_ai.name == group_name) {
                return this._list[i];
            }
        }
        return false;
    }

    update(access_item) {
        for(let i = 0; i < access_item.users.length; i++ ) {
            let user = access_item.users[i];
            let existing_norm_ai = this.user_exists(user);
            let new_norm_ai;

            if (!existing_norm_ai) {
                new_norm_ai = new DgNormAccessItem(
                    DgNormAccessItem.USER, // model type
                    user, // model name
                    access_item
                );
                
                this.insert_norm_ai(new_norm_ai);
            } else {
                this.update_norm_ai(existing_norm_ai, access_item)
            }
        }

        for(let i = 0; i < access_item.groups.length; i++ ) {
            let group = access_item.groups[i];
            let existing_norm_ai = this.group_exists(group);
            let new_norm_ai;

            if (!existing_norm_ai) {
                new_norm_ai = new DgNormAccessItem(
                    DgNormAccessItem.GROUP, // model type
                    group, // model name
                    access_item
                );
                this.insert_norm_ai(new_norm_ai);
            } else {
                this.update_norm_ai(existing_norm_ai, access_item);
            }

         }
    }
}