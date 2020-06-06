import { Model } from 'backbone';


export class Metadata extends Model {
    constructor(doc_id) {
        super();
        this.doc_id = doc_id;
    }

    urlRoot() {
        return `/metadata/${this.doc_id}`;
    }

    defaults() {
      return {
        title: '',
        completed: false
      };
    }
};
