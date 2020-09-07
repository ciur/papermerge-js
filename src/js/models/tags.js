import _ from "underscore";
import { Model, Collection } from 'backbone';

export class Tag extends Model {
    /**
        Used to tag folder/document.
    */
    urlRoot() {
        return '/tag-node/';
    }

    modelId() {
        return this.get('name')
    }

    toJSON() {
        let dict = {
            name: this.get('name'),
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

    remove(model) {
        for (var i = 0; i < this.models.length; i++) {
            if (this.models[i].get('title') == model.get('title')) {
                this.models.splice(i, 1);
                this.length--;
                break;
            }
        }
    }
}
