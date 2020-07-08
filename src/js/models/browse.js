import _ from "underscore";
import { Model, Collection } from 'backbone';
import { Node, NodeCollection } from "./node";
import { KVStore, KVStoreCollection } from "./kvstore";


import {
    mg_dispatcher,
    PARENT_CHANGED,
} from "./dispatcher";

export class Browse extends Model {
    defaults() {
      return {
        nodes: [],
        parent_id: '',
        parent_kv: [] // used in list display mode
      };
    }

    initialize(parent_id) {
        this.parent_id = parent_id;
        this.nodes = new NodeCollection();
        this.parent_kv = new KVStoreCollection();
    }

    urlRoot() {
        let parent_id = this.get('parent_id');

        if (parent_id) {
            return `/browse/${parent_id}/`;
        }

        return '/browse/'
    }

    toJSON() {

        let dict = {
            id: this.get('id'),
            parent_id: this.get('parent_id'),
            nodes: this.get('nodes'),
        }

        return dict;
    }

    open(parent_node, notify_all) {
        let parent_id;

        if (parent_node) {
            parent_id = parent_node.id;
        } else {
            parent_id = undefined;
        }

        this.set({
            'parent_id': parent_id
        });

        if (notify_all) {
            // inform everybody about new parent
            mg_dispatcher.trigger(
                PARENT_CHANGED,
                parent_id
            );
        }
    }

    parse(response, options) {

        let nodes = response.nodes,
            that=this,
            parent_kv = response.parent_kv,
            parent_id = response.parent_id;

        that.nodes.reset();

        _.each(nodes, function(item){
            that.nodes.add(new Node(item))
        });

        _.each(parent_kv, function(item){
            that.parent_kv.add(new KVStore(item))
        });

        this.set({'parent_id': parent_id});

        this.trigger('change');
    }
}
