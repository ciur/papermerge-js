import _ from "underscore";
import $ from "jquery";
import { Model, Collection } from 'backbone';

export class Thumbnail extends Model {
    defaults() {
      return {
        number: '',
      };
    }

    initialize() {
    }

    urlRoot() {
        return '/page/';
    }

    toJSON() {
        let dict = {
            id: this.get('id'),
            number: this.get('number'),
        }

        return dict;
    }
}

export class ThumbnailCollection extends Collection {
    
    get model() {
        return Thumbnail;
    }
}
