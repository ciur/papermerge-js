import _ from "underscore";
import $ from "jquery";
import { Model, Collection } from 'backbone';

export class Access extends Model {
    urlRoot() {
        return '/access/';
    }

    toJSON() {
        let dict = {
            id: this.get('id'),
            number: this.get('number'),
        }

        return dict;
    }
}

export class AccessCollection extends Collection {
    
    get model() {
        return Page;
    }

    urlRoot() {
        return '/pages/';
    }
}