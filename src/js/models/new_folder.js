import _ from "underscore";
import { Model, Collection } from 'backbone';

export class NewFolder extends Model {
    /**
        Used for new folder/rename node operations.
    */
    defaults() {
      return {
        name: '',
        parent_id: '',
      };
    }

    initialize(parent_id) {
    }

    toJSON() {
        let dict = {
            id: this.get('id'),
            parent_id: this.get('parent_id'),
            name: this.get('name'),
        }

        return dict;
    }
}
