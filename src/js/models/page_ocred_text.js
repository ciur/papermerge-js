import _ from "underscore";
import { Model } from 'backbone';

export class PageOcredText extends Model {

    url() {
        let doc_id,
            page_number,
            version;

        doc_id = this.get('id');
        version = this.get('document_version');
        page_number = this.get('page_number');

        return `/document/${doc_id}/${version}/text/page/${page_number}`;
    }

}