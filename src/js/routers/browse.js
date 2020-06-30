import _ from "underscore";
import { Router } from 'backbone';

import {
    mg_dispatcher,
    PARENT_CHANGED,
} from "../models/dispatcher";

export class BrowseRouter extends Router {

    constructor(browse_view, breadcrumb_view) {
        super();
        this.browse_view = browse_view;
        this.breadcrumb_view = breadcrumb_view;
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
        }
    }

    browse(node_id) {
        this.browse_view.open(node_id);
        this.breadcrumb_view.open(node_id);
    }
}
