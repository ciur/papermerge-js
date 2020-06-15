import _ from "underscore";
import { Model } from 'backbone';
import { KVStore, KVStoreComp } from "./kvstore";
import { KVStoreCollection, KVStoreCompCollection } from './kvstore';

let CSRF_TOKEN = $("[name=csrfmiddlewaretoken]").val();

Backbone.$.ajaxSetup({
    headers: {'X-CSRFToken': CSRF_TOKEN}
});

export class Metadata extends Model {
    defaults() {
      return {
        kvstore: new KVStoreCollection(),
        kvstore_comp: new KVStoreCompCollection()
      };
    }

    initialize(doc_id) {
        this.doc_id = doc_id;

        // Following 4 fields are used to populate UI
        // with 2 dropdowns - type and format.
        this.kv_types = [];
        this.currency_formats = [];
        this.numeric_formats = [];
        this.date_formats = [];

        // fetch data from server side
        this.fetch();
    }

    get kvstore() {
        return this.get('kvstore');
    }

    get kvstore_comp() {
        return this.get('kvstore_comp');
    }

    urlRoot() {
        return `/metadata/${this.doc_id}`;
    }

    toJSON() {
        let dict = {};
        
        dict['kvstore'] = this.kvstore.toJSON();
        dict['kvstore_comp'] = this.kvstore_comp.toJSON();

        return dict;
    }

    parse(response, options) {
        let kvstore = response.kvstore,
            kvstore_comp = response.kvstore_comp,
            that = this;

        _.each(kvstore, function(item){
            that.kvstore.add(
                new KVStore(item)
            );
        });

        _.each(kvstore_comp, function(item){
            that.kvstore_comp.add(
                new KVStoreComp(item)
            );
        });

        this.kv_types = response.kv_types;
        this.currency_formats = response.currency_formats;
        this.numeric_formats = response.numeric_formats;
        this.date_formats = response.date_formats;


        this.trigger('change');

        return {
            'kvstore': this.kvstore,
            'kvstore_comp': this.kvstore_comp,
            'kv_types': this.kv_types,
            'currency_formats': this.currency_formats,
            'numeric_formats': this.numeric_formats,
            'date_formats': this.date_formats
        }
    }

    update_simple(cid, value) {
        let model = this.kvstore.get(cid);
        model.set({'key': value});
    }

    update_comp(cid, value) {
        let model = this.kvstore_comp.get(cid);
        model.set({'key': value});
    }

    add_simple() {
        this.kvstore.add(new KVStore());
    }

    remove_simple(cid) {
        this.kvstore.remove({'cid': cid});
    }

    add_comp() {
        this.kvstore_comp.add(new KVStoreComp());
    }

    remove_comp(cid) {
        this.kvstore_comp.remove({'cid': cid});
    }

};
