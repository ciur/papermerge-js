import _ from "underscore";
import { Model } from 'backbone';

let CSRF_TOKEN = $("[name=csrfmiddlewaretoken]").val();

Backbone.$.ajaxSetup({
    headers: {'X-CSRFToken': CSRF_TOKEN}
});

export class Metadata extends Model {
    initialize(doc_id) {
        this.doc_id = doc_id;
        this._kvstore = [];
        this._kvstore_comp = [];
    }

    get kvstore() {
        return this._kvstore;
    }

    get kvstore_comp() {
        return this._kvstore_comp;
    }

    urlRoot() {
        return `/metadata/${this.doc_id}`;
    }

    defaults() {
      return {
        title: '',
        completed: false
      };
    }

    add_simple() {
        this.kvstore.push(
            {
                'key': '',
                'id': '',
                'kv_inherited': false
            }
        );
    }

    remove_simple(id, value) {
        this.remove(this.kvstore, id, value);
    }

    add_comp() {
        this.kvstore_comp.push(
            {
                'key': '',
                'id': '',
                'kv_inherited': false
            }
        );
    }

    remove_comp(id, value) {
        this.remove(this.kvstore_comp, id, value);
    }

    remove(arr, id, value) {
        // remove an element matched either by id or by value
        // if both id and value are undefined - just remove an
        // element from array with both id and values empty
        let pos, do_match;

        do_match = function(item) {
            if (item.id == id || item.value == value) {
                return true;
            }
        }

        pos = _.findIndex(arr, do_match);
        if (pos > -1) {
            arr.splice(pos, 1);
        }
    }
};
