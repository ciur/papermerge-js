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

    toJSON() {
        let dict = {
            id: this.get('id'),
            nodes: this.get('pages'),
        }

        return dict;
    }

    parse(response, options) {

        let pages = response.document.pages,
            that=this;

        that.pages.reset();

        _.each(pages, function(item){
            that.pages.add(new Page(item))
        });

        _.each(pages, function(item){
            that.thumbnails.add(new Thumbnail(item))
        });

        this.set({'title': response.document.title});
        this.set({'notes': response.document.notes});

        this.trigger('change');
    }
}
