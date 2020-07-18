import _ from "underscore";
import $ from "jquery";
import { Model, Collection } from 'backbone';

export class UserGroup extends Model {

}

export class UserGroupCollection extends Collection {
    url() {
        return '/usergroups';
    }
    get model() {
        return UserGroup;
    }

    parse(response, options) {
        let usergroups = response.usergroups, that=this;


        // do not trigger reset event
        that.reset([], {'silent': true});

        _.each(usergroups, function(item){
            that.add(new UserGroup(item))
        });

        this.trigger('change');
    }
}