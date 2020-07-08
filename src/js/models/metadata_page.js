import { Metadata } from "./metadata";


export class MetadataPage extends Metadata {
    
    initialize(page_id) {
        this.page_id = page_id;

        // fetch data from server side
        this.fetch();
    }

    urlRoot() {
        return `/metadata/page/${this.page_id}`;
    }
};