import _ from "underscore";
import { Model, Collection } from 'backbone';
import { KVStore } from "./kvstore";

let CSRF_TOKEN = $("[name=csrfmiddlewaretoken]").val();

Backbone.$.ajaxSetup({
    headers: {'X-CSRFToken': CSRF_TOKEN}
});

export class Metadata extends Model {
    /**
        This model is used to display metadata in widgetsbar
        while browsing documents and folders.
        It will change only Metadata keys.
        Metadata values are not changed.

        Metadata values are chaned in document viewer.
        (using client side js.models.MetadataKV model)
    **/

    defaults() {
      return {
        kvstore: new Collection(),
        kv_types: [],
        date_formats: [],
        currency_formats: [],
        numeric_formats: []
      };
    }

    url() {
        return `/metadata/node/${this.node.id}`;
    }

    initialize(node) {
        this.doc_id = node.id;
        this.node = node;

        this.fetch();
    }

    parse(response, options) {
        let kvstore = response.kvstore,
            kv_types = response.kv_types,
            date_formats = response.date_formats,
            numeric_formats = response.numeric_formats,
            currency_formats = response.currency_formats,
            that = this;

        _.each(kvstore, function(item){
            that.kvstore.add(
                new KVStore(item)
            );
        });

        this.set({'kv_types': kv_types});
        this.set({'numeric_formats': numeric_formats});
        this.set({'date_formats': date_formats});
        this.set({'currency_formats': currency_formats});

        this.trigger('change');
    }

    get kvstore() {
        return this.get('kvstore');
    }

    get all_disabled() {
        let kvstore = this.get('kvstore'),
            inherited_items = [];

        inherited_items = _.filter(
            kvstore.models,
            function(model){ return model.get('kv_inherited') == true; }
        );

        // if all items in kvstore are disabled
        if (inherited_items.length == kvstore.length) {
            return true;
        }

        return false;
    }

    update_simple(cid, attr, value) {
        let model = this.kvstore.get(cid), dict = {};

        if (model && attr) {
            dict[attr] = value;
            model.set(dict);
        }
    }

    add_simple() {
        this.kvstore.add(
            new KVStore({
                'kv_current_formats': this.kv_current_formats,
                'kv_types': this.kv_types
            })
        );
    }

    remove_simple(cid) {
        this.kvstore.remove({'cid': cid});
    }

    remove_comp(cid) {
        this.kvstore_comp.remove({'cid': cid});
    }

    get kvstore_changed() {
        /**
        Returs true if kvstore one of following is true:

            1. has unsaved items.
            2. kv value changed
        **/
        let has_item_without_id,
            changed;

        has_item_without_id = this.kvstore.some(function(item) {
            return !item.get('id');
        });

        changed = this.kvstore.some(function(item) {
            let changed;
            changed = item.changed;
            // if changed contains attribute key ->
            // key attr was changed
            return changed.key;
        });

        return has_item_without_id || changed;
    }

};
