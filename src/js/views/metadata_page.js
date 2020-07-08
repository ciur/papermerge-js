import $ from "jquery";
import _ from "underscore";
import { MetadataPage } from "../models/metadata_page";
import { MetadataView } from "./metadata";
import { KVStore, KVStoreComp } from "../models/kvstore";

let TEMPLATE = require('../templates/metadata_page.html');

export class MetadataPageView extends MetadataView {
    /***
        Manages the sidebar control (the one on the left side)
        view for metadata (of specific page within document).
        Sidebar control contains other views besides this one.
    **/

    initialize(page_id) {
        // metadata per page
        this.metadata = new MetadataPage(page_id);
        this.start();
        this.render();
    }

    events() {
        let event_map = {
          "click #add_simple_meta": "add_simple_meta",
          "click .close.key": "remove_meta",
          "keyup input[name='key']": "update_key",
          // event triggered when user - instead of typing
          // chooses a value from dropdown - native agent autocomplete feature
          "change input[name='key']": "update_key",
          "keyup input[name='value']": "update_value",
          // event triggered when user - instead of typing
          // chooses a value from dropdown - native agent autocomplete feature
          "change input[name='value']": "update_value",
          "change .kv_type": "kv_type_update",
          "change .kv_format": "kv_format_update",
          "click button.save": "on_save",
          "click .chevron.toggle": "toggle_details"
        }

        return event_map;
    }

    toggle_details(event) {
      let $current = $(event.currentTarget);
      let parent = $current.closest("li"), icon_tags;

      parent.find(".details").toggleClass("d-none");
      icon_tags = $current.find("i.fa");

      icon_tags.toggleClass("fa-chevron-left");
      icon_tags.toggleClass("fa-chevron-down");

    }

    update_value(event) {
        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).closest("li");
        let data = parent.data();

        this.metadata.update_simple(data['cid'], 'value', value);
    }

    update_key(event) {
        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).closest("li");
        let data = parent.data();

        this.metadata.update_simple(data['cid'], 'key', value);
    }


    render() {
        let compiled, context;

        context = {
            'kvstore': this.metadata.get('kvstore'),
            'available_types': this.metadata.get('kv_types')
        }

        compiled = _.template(TEMPLATE({
            kvstore: this.metadata.kvstore,
            available_types: this.metadata.get('kv_types'),
            all_disabled: this.all_disabled
        }));

        this.$el.html(compiled);
        
        return this;
    }
}