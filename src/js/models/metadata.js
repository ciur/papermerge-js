import _ from "underscore";
import { Model } from 'backbone';
import { KVStore } from "./kvstore";
import { KVStoreCollection, KVStoreCompCollection } from './kvstore';

let CSRF_TOKEN = $("[name=csrfmiddlewaretoken]").val();

Backbone.$.ajaxSetup({
    headers: {'X-CSRFToken': CSRF_TOKEN}
});

export class Metadata extends Model {
    defaults() {
      return {
        kvstore: new KVStoreCollection(),
        kv_types: [],
        date_formats: [],
        currency_formats: [],
        numeric_formats: []
      };
    }

    initialize(doc_id) {
        this.doc_id = doc_id;

        // fetch data from server side
        this.fetch();
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

    urlRoot() {
        return `/node/${this.doc_id}`;
    }

    toJSON() {
        let dict = {};
        
        dict['kvstore'] = this.kvstore.toJSON();

        return dict;
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

};
