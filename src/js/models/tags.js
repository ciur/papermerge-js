import _ from "underscore";
import { Model, Collection } from 'backbone';

export class Tag extends Model {
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

export class Tags extends Collection {
    get model() {
        return Tag;
    }

    urlRoot() {
        return '/tags/';
    }
}
