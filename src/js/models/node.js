import _ from "underscore";
import $ from "jquery";
import { Model, Collection } from 'backbone';

export class Node extends Model {
    defaults() {
      return {
        title: '',
        parent_id: '',
        ctype: '',
        kvstore: '',
        selected: false,
        img_src: ''
      };
    }

    initialize(parent_id) {
    }

    urlRoot() {
        return '/node/';
    }

    toJSON() {
        let dict = {
            id: this.get('id'),
            parent_id: this.get('parent_id'),
            title: this.get('title'),
        }

        return dict;
    }

    get url() {
        if (this.is_document()) {
            // this url corresponds to backend's 
            // reverse('core:document', args=(doc_id))
            // and is used to open admin/documet.html template.
            return this.get('document_url');
        }

        // this form of url is used for folder browsing via json requests.
        return `/${this.get('id')}`;
    }

    is_document() {
        if (this.get('ctype') == 'document') {
            return true;
        }

        return false;
    }

    is_folder() {
        if (this.get('ctype') == 'folder') {
            return true;
        }

        return false;
    }
}

export class NodeCollection extends Collection {
    
    get model() {
        return Node;
    }

    urlRoot() {
        return '/nodes/';
    }

    delete(options) {
        let token, post_data, request;

        token = $("[name=csrfmiddlewaretoken]").val();
        
        post_data = this.models.map(
            function(models) { 
                return models.attributes;
            }
        );

        $.ajaxSetup({
            headers: { 'X-CSRFToken': token}
        });

        request = $.ajax({
            method: "POST",
            url: this.urlRoot(),
            data: JSON.stringify(post_data),
            contentType: "application/json",
            dataType: 'json'
        });

        request.done(options['success']);
    }
}
