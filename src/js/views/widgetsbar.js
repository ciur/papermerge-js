import $ from "jquery";
import _ from "underscore";
import { View, Collection } from 'backbone';
import Backbone from 'backbone';

import {
  mg_dispatcher,
  SELECTION_CHANGED,
} from "../models/dispatcher";

let TEMPLATE_PART = require('../templates/sidebar/part.html');
let TEMPLATE_METADATA = require('../templates/sidebar/metadata.html');

export class WidgetsBarView extends View {

    el() {
        return $("#widgetsbar");
    }

    initialize() {
        mg_dispatcher.on(SELECTION_CHANGED, this.selection_changed, this);
    }

    selection_changed(selection) {
        if (selection.length == 1) {
            this.render(selection[0]);
        } else {
            this.render(undefined);
        }
    }

    render(node) {
        let compiled = "",
            compiled_part,
            compiled_metadata,
            context,
            i,
            parts,
            metadata;
        
        context = {};

        if (!node) {
            this.$el.html("");
            return;
        }

        parts = node.get('parts');
        metadata = node.get('metadata');

        compiled_metadata = _.template(TEMPLATE_METADATA({
            'kvstore': new Collection(metadata),
        }));

        compiled += compiled_metadata();

        if (parts) {
            for (i=0; i < parts.length; i++) {
                compiled_part = _.template(TEMPLATE_PART({
                    'part': parts[i],
                }));
                compiled += compiled_part();
            }
        }

        this.$el.html(compiled);
    }
}