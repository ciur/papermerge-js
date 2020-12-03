import _ from "underscore";
import { Model, Collection } from 'backbone';
import { Page, PageCollection } from "./page";
import { Thumbnail, ThumbnailCollection } from "./thumbnail";

import {
    mg_dispatcher,
    PARENT_CHANGED,
} from "./dispatcher";

export class Document extends Model {
    defaults() {
      return {
        pages: [],
        doc_id: '',
        parent_id: this.get('parent_id'),
        title: this.get('title'),
        created_at: this.get('created_at'),
        tags: this.get('tags'),
        parts: this.get('parts'),
        metadata: this.get('metadata')
      };
    }

    initialize(id) {
        this.set({'id': id});
        this.pages = new PageCollection();
        this.thumbnails = new ThumbnailCollection();
    }

    urlRoot() {
        return `/document/`;
    }

    url() {
        // for sake of slash at the end of string.
        return `/document/${this.get('id')}/`;
    }

    toJSON() {
        let dict = {
            id: this.get('id'),
            nodes: this.get('pages'),
            notes: this.get('notes'),
        }

        return dict;
    }
}
