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
    /****
        All access for specific node
    ****/
    get model() {
        return Access;
    }

    initialize(node) {
        this.node = node;
    }

    url() {
        return `/node/${node.id}/access`;
    }

    parse(response, options) {
        let access = response.access,
            that = this;

        this.reset();
        this.add(response.access);

        this.trigger('change');
    }
}