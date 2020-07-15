import _ from "underscore";
import $ from "jquery";
import { Router } from 'backbone';

import {
    mg_dispatcher,
    PARENT_CHANGED,
} from "../models/dispatcher";

export class BrowseRouter extends Router {

    constructor(browse_view, breadcrumb_view, actions_view) {
        super();
        this.browse_view = browse_view;
        this.breadcrumb_view = breadcrumb_view;
        this.actions_view = actions_view;
    }

    preinitialize() {
        let that = this;

        mg_dispatcher.on(PARENT_CHANGED, function(parent_id){
            if (parent_id) {
                that.navigate(`/${parent_id}`, {trigger: true});
            } 
        });
    }
    
    routes() {
        return {
            ":node_id": "browse",
            "*path": "browse"
        }
    }

    browse(node_id) {

        if (!node_id) {
            if ($("#root_node_id").length > 0) {
                node_id = $("#root_node_id").val();
            };
        }
        this.browse_view.open(node_id);
        this.breadcrumb_view.open(node_id);
        this.actions_view.set_parent(node_id);
    }
}
