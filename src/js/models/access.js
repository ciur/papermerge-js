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
        if (options) {
            this.node = options.node;    
        }
    }

    url() {
        if (this.node) {
            return `/node/${this.node.id}/access`;
        }
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

    save_access(deleted_collection) {
        let token, post_data, request;

        token = $("[name=csrfmiddlewaretoken]").val();
        
        post_data = {
            'add': [],
            'delete': []
        }
        post_data['add'] = this.models.map(
            function(models) { 
                return models.attributes;
            }
        );
        post_data['delete'] = deleted_collection.models.map(
            function(models) { 
                return models.attributes;
            }
        );

        $.ajaxSetup({
            headers: { 'X-CSRFToken': token}
        });

        request = $.ajax({
            method: "POST",
            url: this.url(),
            data: JSON.stringify(post_data),
            contentType: "application/json",
            dataType: 'json'
        });
    }
}