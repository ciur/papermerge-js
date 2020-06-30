import _ from "underscore";
import { Model, Collection } from 'backbone';
import { Node, NodeCollection } from "./node";


export class Clipboard extends Model {
    defaults() {
      return {
        nodes: [],
      };
    }

    initialize(parent_id) {
        this.nodes = new NodeCollection();
    }

    urlRoot() {
        return '/clipboard/'
    }

    toJSON() {

        let dict = {
            nodes: this.get('nodes'),
        }

        return dict;
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
