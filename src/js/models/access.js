import _ from "underscore";
import $ from "jquery";
import { Model, Collection } from 'backbone';
import { Permission } from "../models/permission";

export class AccessCollection extends Collection {
    /****
        All access for specific node
    ****/
    get model() {
        return Permission;
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
            that.add(new Permission(item))
        });

        this.trigger('change');

        return access;
    }
}