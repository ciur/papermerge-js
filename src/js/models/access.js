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

    initialize(model, options) {
        this.node = options['node'];
    }

    url() {
        return `/node/${node.id}/access`;
    }

    parse(response, options) {
        let access = response.access, that=this;


        // do not trigger reset event
        that.reset([], {'silent': true});

        _.each(access, function(item){
            that.add(new Access(item))
        });

        this.trigger('change');

        return access;
    }
}