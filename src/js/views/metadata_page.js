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
	    this.metadata = new MetadataPage(doc_id);
	    this.start();
	    this.render();
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