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
            "tagged/:name": "tagged",
            "*path": "browse"
        }
    }

    tagged(name) {
        this.browse_view.open(
            undefined, // node_id
            name // tagname
        );
    }

    browse(node_id) {
        /**
            There are multiple server side 'index.html' views. Each one with
            different root folder.
            E.g. browse => browse top level documents & folders.
                 Inbox => browse documents in special Inbox folder.

            Both are served with same index.html file but with different
            django view function.
            In case of special folder - inbox - while index.html template is served
            an html div#root_node_id is initialized to signal router that root folder
            in this case is the one specified with $("#root_node_id").val();

            This solutions ensures clean implementation of another feature: highlight
            of active link on the right panel (when user clicks inbox -> highlight inbox,
            when user clicks documents -> highlight documents. Same for user and groups links).
        ***/
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
