import _ from "underscore";
import { Model, Collection } from 'backbone';
import { Node, NodeCollection } from "./node";
import { KVStore } from "./kvstore";
import { get_url_param, get_hash_param } from "../utils";
import { LEDDocumentStatus } from "led_status/src/js/led_status";


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
        this.parent_kv = new Collection();
    }

    urlRoot() {
        let parent_id = this.get('parent_id'),
            base_url,
            tag,
            page,
            params,
            order_by;

        if (parent_id) {
            base_url = `/browse/${parent_id}/`;
        } else {
            base_url = '/browse/';    
        }

        page = get_url_param('page') || get_hash_param('page');

        tag = this.get('tag');
        order_by = this.get('order_by')
        params = $.param({'tag': tag, 'page': page, 'order-by': order_by})
        
        base_url = `${base_url}?${params}`;

        return base_url;
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
            node,
            led_status,
            parent_kv = response.parent_kv,
            parent_id = response.parent_id;

        that.nodes.reset();
        that.parent_kv.reset();

        _.each(nodes, function(item){
            node = new Node(item);
            that.nodes.add(node);
        });

        _.each(parent_kv, function(item){
            that.parent_kv.add(new KVStore(item))
        });

        this.set({'pagination': response.pagination});

        this.set({'parent_id': parent_id});

        this.trigger('change');
    }
}
