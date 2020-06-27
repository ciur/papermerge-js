import _ from "underscore";
import { Model, Collection } from 'backbone';
import { NodeCollection } from "./node";

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
        return '/browse/';
    }

    toJSON() {

        let dict = {
            id: this.get('id'),
            parent_id: this.get('parent_id'),
            nodes: this.get('nodes'),
        }

        return dict;
    }
}
