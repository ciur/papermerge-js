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

    selection_changed(selection) {

        let selected_node, metadata;

        console.log('node selected');

        if (selection.length == 0 || selection.length != 1) {
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

        // new MetadataView(...)
        // calls start() method.
        this.metadata_view = new MetadataView(
            selected_node.get('id')
        );

    }
}
