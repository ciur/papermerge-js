import _ from "underscore";
import { Model, Collection } from 'backbone';
import { Node, NodeCollection } from "./node";
import {
    mg_dispatcher,
    PARENT_CHANGED,
} from "../models/dispatcher";

export class Breadcrumb extends Model {
    defaults() {
      return {
        nodes: [],
        parent_id: '',
      };
    }

    initialize(parent_id) {
        this.parent_id = parent_id;
        this.nodes = new NodeCollection();
    }

    urlRoot() {
        let parent_id = this.get('parent_id');

        if (parent_id) {
            return `/breadcrumb/${parent_id}/`;
        }

        return '/breadcrumb/'
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
        let breadcrumb = new Breadcrumb(parent_node.id),
            that = this;

        breadcrumb.fetch();
        breadcrumb.on('change', function(event){
            that.nodes = breadcrumb.nodes;
            that.parent_id = breadcrumb.parent_id;
            that.trigger('change');

            if (notify_all) {
                // inform everybody about new parent
                mg_dispatcher.trigger(
                    PARENT_CHANGED,
                    breadcrumb.parent_id
                );
            }
        });
    }

    parse(response, options) {

        let nodes = response.nodes,
            that=this;

        that.nodes.reset();

        _.each(nodes, function(item){
            that.nodes.add(new Node(item))
        });

       this.trigger('change');
    }
}
