import _ from "underscore";
import { Model, Collection } from 'backbone';

export class NewFolder extends Model {
    /**
        Used for new folder/rename node operations.
    */
    defaults() {
      return {
        title: '',
        parent_id: '',
      };
    }

    initialize(parent_id) {
        this.set({'parent_id': parent_id});
    }

    urlRoot() {
        return '/create-folder/';
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
