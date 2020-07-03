import { View } from 'backbone';
import { MetadataView } from "./metadata";

import {
  mg_dispatcher,
  SELECTION_CHANGED,
} from "../models/dispatcher";


export class ControlSidebarView extends View {

    el() {
        return $('.control-sidebar');
    } 

    initialize() {
        console.log("ControlSidebarView");
        this.metadata_view = undefined;
        mg_dispatcher.on(SELECTION_CHANGED, this.selection_changed, this);
    }

    is_control_sidebar_visible() {
        let $body = $('body'), sidebar_open, sidebar_slide;
        
        sidebar_open = $body.hasClass('control-sidebar-open');

        return sidebar_open;
    }

    show_sidebar_control() {
        $('body').addClass('control-sidebar-open');
    }

    hide_sidebar_control() {
        $('body').removeClass('control-sidebar-open');
    }

    selection_changed(selection) {

        let selected_node, metadata;

        if (selection.length == 0 || selection.length != 1) {
            // if control sidebar is visible - hide it
            if (this.is_control_sidebar_visible()) {
                this.hide_sidebar_control();
            }
            // nothing is selected, remove the view.
            if (this.metadata_view) {
                this.metadata_view.stop();
                this.metadata_view = undefined;
                return;
            }
        }

        selected_node = selection[0];
        
        if (!selected_node) {
            return ;
        }

        // always display control sidebar if exactly one element
        // is selected
        if (!this.is_control_sidebar_visible()) {
            this.show_sidebar_control();
        }

        // new MetadataView(...)
        // calls start() method.
        this.metadata_view = new MetadataView(
            selected_node.get('id')
        );
    }
}
