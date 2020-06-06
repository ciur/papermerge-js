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

    add_comp() {
        this.kvstore_comp.push(
            {
                'key': '',
                'id': '',
                'kv_inherited': false
            }
        );
    }
};
