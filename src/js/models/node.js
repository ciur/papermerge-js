import _ from "underscore";
import { Model, Collection } from 'backbone';

export class Node extends Model {
    defaults() {
      return {
        title: '',
        parent_id: '',
        ctype: '',
        kvstore: '',
        selected: false
      };
    }

    initialize(parent_id) {
    }

    urlRoot() {
        return '/node/';
    }

    toJSON() {
        let dict = {
            id: this.get('id'),
            parent_id: this.get('parent_id'),
            title: this.get('title'),
        }

        return dict;
    }
}

export class NodeCollection extends Collection {
    get model() {
        return Node;
    }
}
