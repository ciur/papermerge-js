import $ from "jquery";

import { View } from 'backbone';
import { Document } from "../models/document";
import { MetadataView } from "./metadata";
import { MetadataPageView } from "./metadata_page";

import {
  mg_dispatcher,
  SELECTION_CHANGED,
  PAGE_SELECTION_CHANGED
} from "../models/dispatcher";


export class ControlSidebarView extends View {
    // Obsolete - will be removed soon
    // now Widgetsbar.js is used instead
    el() {
        return $('.control-sidebar');
    }

    events() {
        let events_map = {
            "click button#save": "on_save",
            "click button#delete": "on_delete"
        }

        return events_map;
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

    page_selection_changed(page_id, doc_id) {
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

    _save_notes() {
        let doc_id = $("input[name=document_id]").val(),
            notes = $("textarea[name=notes]").val(),
            doc;

        doc = new Document(doc_id);
        // update notes attribute on the server
        doc.save({'notes': notes}, {patch: true});
    }

    on_delete(event) {
        let doc_id = $("input[name=document_id]").val(),
            confirmation,
            doc;

        confirmation = confirm(
            "Are you sure you want to delete this document?"
        );

        if (!confirmation) {
          return;
        }

        doc = new Document(doc_id);
        doc.destroy({success: function(model, response) {
            window.location = response.url;
        }});
    }

    on_save(event) {
        this.$el.find("#save-metadata").trigger('click');
        this._save_notes();
    }
}
