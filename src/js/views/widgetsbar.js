import $ from "jquery";
import _ from "underscore";
import { View, Collection } from 'backbone';
import Backbone from 'backbone';
import { Downloader } from "../models/downloader";
import { Metadata } from "../models/metadata";

import {
  mg_dispatcher,
  SELECTION_CHANGED,
} from "../models/dispatcher";

let PART_WIDGET_TPL = require('../templates/widgetsbar/part.html');
let METADATA_WIDGET_TPL = require('../templates/widgetsbar/metadata.html');

class SingleNodeInfoWidget extends View {
    /**
    Info widget for single node.

    Displayed when user selects one node (folder or document).
    Will display:

        * icon -> folder/document
        * title
        * created_at
        * modified_at
        * download button
    **/
    template(kwargs) {
        let compiled_tpl,
            file_tpl = require('../templates/widgetsbar/single_node_info.html');

        compiled_tpl = _.template(file_tpl(kwargs));

        return compiled_tpl();
    }

    initialize(node) {
        this.node = node;
    }

    render_to_string() {
        let context = {},
            ctype,
            _id,
            title,
            created_at,
            updated_at,
            download_url;

        ctype = this.node.get('ctype');
        _id = this.node.get('id');
        title = this.node.get('title');
        created_at = this.node.get('created_at');
        updated_at = this.node.get('updated_at');
        download_url = `/node/${_id}/download/`;

        context['id'] = _id;
        context['title'] = title;
        context['ctype'] = ctype;
        context['created_at'] = created_at;
        context['updated_at'] = updated_at;
        context['download_url'] = download_url;

        return this.template(context);
    }

    render() {
        this.$el.html(this.render_to_string());
    }
}

class MultiNodeInfoWidget extends View {
    /**
    Info widget for multiple nodes.

    Displayed when user selects multiple nodes.
    Will display:

        * <X> items selected
        * download button
    **/
    el() {
        return $("#widgetsbar");
    }

    template(kwargs) {
        let compiled_tpl,
            file_tpl = require('../templates/widgetsbar/multi_node_info.html');

        compiled_tpl = _.template(file_tpl(kwargs));

        return compiled_tpl();
    }

    initialize(nodes) {
        this.nodes = nodes;
    }

    events() {
        let event_map = {
            "click li.collection-item a.download": "download_selection"
        }

        return event_map;
    }

    download_selection(event) {
        let node_ids = [], downloader;

        event.preventDefault();

        node_ids = this.nodes.map(
            function(node) {
                return node.get('id');
            }
        );
        downloader = new Downloader('/nodes/download/', node_ids);
        downloader.download();
    }

    render_to_string() {
        let context = {},
            message,
            count,
            formats;

        count = this.nodes.length;
        // ngettext comes from GET /jsi18n/
        // thank you, Django!
        formats = ngettext(
            "%s item selected",
            "%s items selected",
            count
        );

        // similarely interpolate functions comes
        // from GET /jsi18n/
        // https://docs.djangoproject.com/en/3.1/topics/i18n/translation/#interpolate
        context['message'] = interpolate(formats, [count]);

        return this.template(context);
    }

    render() {
        this.$el.html(this.render_to_string());
    }
}

class MetadataWidget extends View {

    /**
        This must be set to widgetsbar element.

        For sake of events delegation this element must exist 
        BEFORE metadata widget is rendered.
    **/
    el() {
        // sidebar container of all widgets
        return $("#widgetsbar");
    }

    widget_el() {
        // DOM element containing all metadata
        return $(".metadata-widget");
    }

    initialize(node) {
        this.node = node;
        this.metadata = new Metadata(node);
    }

    events() {
        let event_map = {
          "click .add-metadata-key": "_add_metadata_key",
          "click .close.key": "_remove_metadata_key",
          "keyup input": "_update_value",
          "change input": "_update_value",
          "change .kv_type": "_kv_type_update",
          "change .kv_format": "_kv_format_update",
          "click button.save": "_on_save"
        }

        return event_map;
    }


    _kv_format_update(event) {

        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).closest("li");
        let data = parent.data();

        this.metadata.update_simple(data['cid'],'kv_format', value);

        this.render();  
    }

    _kv_type_update(event) {

        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).closest("li");
        let data = parent.data();
        let cur_fmt = {};

        cur_fmt['money'] = this.metadata.get('currency_formats');
        cur_fmt['numeric'] = this.metadata.get('numeric_formats');
        cur_fmt['date'] = this.metadata.get('date_formats');
        cur_fmt['text'] = [];

        this.metadata.update_simple(data['cid'],'kv_type', value);
        this.metadata.update_simple(data['cid'],'current_formats', cur_fmt[value]);
        if (cur_fmt[value].length > 0) {
            // kv_format entry is a 2 items array. First one is used as value
            // in HTML <option> and second one is the human text
            // cur_fmt[value][0][0] == use first *value* of first format from the list
            this.metadata.update_simple(data['cid'],'kv_format', cur_fmt[value][0][0]);
        } else {
            // current list of formatting types is empty only for kv_type text
            // no formating - means kv_type = text
            this.metadata.update_simple(data['cid'],'kv_format', "");
        }

        this.render();
    }

    _update_value(event) {
        let value = $(event.currentTarget).val();
        let parent = $(event.currentTarget).closest("li");
        let data = parent.data();

        this.metadata.update_simple(data['cid'], 'key', value);
    }

    _add_metadata_key(event) {
        let value = $(event.currentTarget).val();
        
        this.metadata.add_simple();
        
        this.render();
    }

    _remove_metadata_key(event) {
        let parent = $(event.currentTarget).parent();
        let $li_container = $(event.currentTarget).closest("li");
        let data = parent.data();

        this.metadata.remove_simple(data['cid']);
        
        $li_container.remove();
        this.render();
    }

    _on_save() {
        this.metadata.save();
    }

    template(kwargs) {
        let compiled_tpl,
            file_tpl = require('../templates/widgetsbar/metadata.html');

        compiled_tpl = _.template(file_tpl(kwargs));

        return compiled_tpl();
    }

    get _all_disabled() {
        return this.metadata.all_disabled;
    }

    render_to_string() {
        let context,
            show_save_button = false,
            kvstore;

        if (this.metadata.kvstore_changed && !this._all_disabled) {
            show_save_button = true;
        } 
          
        context = {
            'kvstore': this.metadata.get('kvstore'),
            'available_types': this.metadata.get('kv_types'),
            'show_save_button': show_save_button
        }

        return this.template(context);
    }

    render() {
        // notice that widget will be rendered in
        // this.widget_el()
        this.widget_el().html(
            this.render_to_string()
        );
    }
}


export class WidgetsBarView extends View {

    el() {
        return $("#widgetsbar");
    }

    initialize() {
        this.info_widget = undefined;

        mg_dispatcher.on(SELECTION_CHANGED, this.selection_changed, this);

    }

    selection_changed(selection) {
        this.render(selection);
    }

    render(selection) {
        let compiled = "",
            compiled_part,
            node,
            compiled_metadata,
            context,
            i,
            parts,
            metadata;
        
        context = {};

        if (!selection) {
            this.$el.html("");
            return;
        }

        if (!selection.length) {
            this.$el.html("");
            return;
        }

        if (selection.length == 1) {

            node = selection[0];
            if (this.info_widget) {
                this.info_widget.undelegateEvents();
                this.info_widget = undefined;

                this.metadata_widget.undelegateEvents();
                this.metadata_widget = undefined;
            }

            parts = node.get('parts');

            this.info_widget = new SingleNodeInfoWidget(node);
            this.metadata_widget = new MetadataWidget(node);

            compiled += this.info_widget.render_to_string();
            compiled += this.metadata_widget.render_to_string();

            if (parts) {
                for (i=0; i < parts.length; i++) {
                    compiled_part = _.template(PART_WIDGET_TPL({
                        'part': parts[i],
                    }));
                    compiled += compiled_part();
                }
            }

        } else if (selection.length > 1) { // selection.length > 1

            if (this.info_widget) {
                this.info_widget.undelegateEvents();
                this.info_widget = undefined;

                this.metadata_widget.undelegateEvents();
                this.metadata_widget = undefined;
            }
            this.info_widget = new MultiNodeInfoWidget(selection);
            compiled += this.info_widget.render_to_string();
        }


        this.$el.html(compiled);
    }
}