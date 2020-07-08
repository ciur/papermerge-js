import { View } from 'backbone';
import { MetadataView } from "./metadata";
import { MetadataPageView } from "./metadata_page";

import {
  mg_dispatcher,
  SELECTION_CHANGED,
  PAGE_SELECTION_CHANGED
} from "../models/dispatcher";


export class ControlSidebarView extends View {

    el() {
        return $('.control-sidebar');
    } 

    initialize() {
        this.metadata_view = undefined;
        
        mg_dispatcher.on(
            SELECTION_CHANGED,
            this.selection_changed,
            this
        );

        mg_dispatcher.on(
            PAGE_SELECTION_CHANGED,
            this.page_selection_changed,
            this
        )
    }

    page_selection_changed(page_id) {
        /**
        Triggered by thumbnails_list: 
            * after thumbnail list is loaded, in this case
              page_id of first thumb is passed).
            * when user clicks on any thumb.
        */
        if (!page_id) {
            return;
        }

        if (this.metadata_view) {
            this.metadata_view.stop();
            this.metadata_view = undefined;
            return;
        }

        // calls start() method.
        this.metadata_view = new MetadataPageView(page_id);
    }


    selection_changed(selection) {
        /*
            Triggered by browser view when user selects/deselects
            nodes - documents/folders
        */
        let selected_node, metadata;

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
