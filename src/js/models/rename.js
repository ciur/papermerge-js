import _ from "underscore";
import { Model, Collection } from 'backbone';

export class Rename extends Model {
    /**
        Used to rename folder/document.
    */
    urlRoot() {
        return '/rename-node/';
    }

    toJSON() {
        let dict = {
            id: this.get('id'),
            title: this.get('title'),
        }

        return dict;
    }
}
