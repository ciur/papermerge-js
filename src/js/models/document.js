import _ from "underscore";
import { Model, Collection } from 'backbone';
import { Page, PageCollection } from "./page";

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
        this.id = id;
        this.pages = new PageCollection();
    }

    urlRoot() {
        let doc_id = this.get('id');

        return `/document/${doc_id}/`;
    }

    toJSON() {
        let dict = {
            id: this.get('id'),
            nodes: this.get('pages'),
        }

        return dict;
    }

    parse(response, options) {

        let pages = response.pages,
            that=this;

        that.pages.reset();

        _.each(pages, function(item){
            that.pages.add(new Page(item))
        });

        this.trigger('change');
    }
}
