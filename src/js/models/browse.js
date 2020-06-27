import _ from "underscore";
import { Model, Collection } from 'backbone';
import { Node, NodeCollection } from "./node";

export class Browse extends Model {
    defaults() {
      return {
        nodes: '',
        parent_id: ''
      };
    }

    initialize(parent_id) {
        this.parent_id = parent_id;
        this.nodes = new NodeCollection();
    }

    urlRoot() {
        if (this.parent_id) {
            return f`/browse/${this.parent_id}/`;
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

    parse(response, options) {
        let nodes = response.nodes, that=this;

        _.each(nodes, function(item){
            that.nodes.add(new Node(item))
        });

       this.trigger('change');
    }
}
