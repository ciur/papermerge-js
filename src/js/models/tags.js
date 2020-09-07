import _ from "underscore";
import { Model } from 'backbone';

export class Tags extends Model {
    /**
        Used to tag folder/document.
    */
    urlRoot() {
        return '/tag-node/';
    }

    toJSON() {
        let dict = {
            id: this.get('id'),
            tag: this.get('tags'),
        }

        return dict;
    }
}
