import _ from "underscore";
import $ from "jquery";
import { Model, Collection } from 'backbone';

export class Page extends Model {
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

export class PageCollection extends Collection {
    
    get model() {
        return Page;
    }

    urlRoot() {
        return '/pages/';
    }
}
