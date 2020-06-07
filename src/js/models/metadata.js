import _ from "underscore";
import { Model } from 'backbone';
import { KVStore, KVStoreComp } from "./kvstore";
import { KVStoreCollection, KVStoreCompCollection } from './kvstore';

let CSRF_TOKEN = $("[name=csrfmiddlewaretoken]").val();

Backbone.$.ajaxSetup({
    headers: {'X-CSRFToken': CSRF_TOKEN}
});

export class Metadata extends Model {
    initialize(doc_id) {
        this.doc_id = doc_id;
        this._kvstore = new KVStoreCollection();
        this._kvstore_comp = new KVStoreCompCollection();
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
