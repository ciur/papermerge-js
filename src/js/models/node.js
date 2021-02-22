import _ from "underscore";
import $ from "jquery";
import { Model, Collection } from 'backbone';
import { MessageView } from '../views/message';
import { Downloader } from "./downloader";


export class Node extends Model {
    defaults() {
      return {
        title: '',
        parent_id: '',
        ctype: '',
        kvstore: '',
        selected: false,
        img_src: '',
        created_at: '',
        user_perms: {},
        tags: [],
        parts: [],
        metadata: []
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
            created_at: this.get('created_at'),
            tags: this.get('tags'),
            parts: this.get('parts'),
            metadata: this.get('metadata')
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
        return `/#${this.get('id')}`;
    }

    full_title() {
        return this.get('title');
    }

    full_title_list_mode() {
        let tags = this.get('tags'), tag,
            title_and_tags;

        title_and_tags = `<ul class="d-flex flex-row align-items-center">`;
        title_and_tags += `<li class="mx-2">${this.get('title')}</li>`;

        for (let t=0; t < tags.length; t++) {
            tag = tags[t];
            if (tag) {
                title_and_tags += `<li class="tag"  style="background:  ${tag['bg_color']}`;
                title_and_tags += `;color: ${tag['fg_color']}" >`;
                title_and_tags += tag['name'];
                title_and_tags +=`</li>`;
            }
        }
        title_and_tags += `</ul>`;

        return title_and_tags;
    }

    short_title(len) {
        let result,
            text = this.get('title');

        if (text && text.length > len) {
            result = `${text.substring(0, len)}...`;
        } else {
            result = text;
        }

        return result;
    }

    select() {
        let $node;

        this.set({'selected': true});
        // mark checked actual DOM element.
        $node = $(`.node[data-cid=${this.cid}]`);
        $node.addClass('checked');
        $node.find('input[type=checkbox]').prop('checked', true);
    }

    deselect() {
        let $node;

        this.set({'selected': false});
        // mark checked actual DOM element.
        $node = $(`.node[data-cid=${this.cid}]`);
        $node.removeClass('checked');
        $node.find('input[type=checkbox]').prop('checked', false);
    }

    toggle_selection() {
        let state;

        state = this.get('selected');

        this.set({'selected': !state});

        // toggle check state of actual DOM element.
        if (state) {
            // i.e. if selected
            $(`.node[data-cid=${this.cid}]`).removeClass('checked');
        } else {
            $(`.node[data-cid=${this.cid}]`).addClass('checked');
        }
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

    find_page_kvstore_for(key) {
        /**
        * Returns kvstore of the provided key in first page
        of corresponding document.
        In browser list mode (and in document viewer if no page is selected)
        it is metadata of the first page displayed.
        **/
        let pages, kvstore, first_page, index;

        // pages are relevant only of nodes which are Documents.
        if (this.is_folder()) {
            return undefined;
        }
        pages = this.get('pages');

        if (pages) {
            first_page = pages[0];
            kvstore = first_page.kvstore;
            if (kvstore) {
                index = _.findIndex(kvstore, function(kv) { 
                    return kv.key == key;
                });

                if (index >= 0) {
                    return kvstore[index];
                }
            }
        }

        return undefined;
    }

    get_page_value_for(key) {
        let page_kvstore;

        page_kvstore = this.find_page_kvstore_for(key);
        
        if (page_kvstore) {
            return page_kvstore.value;
        }

        return ''
    }

    get_page_virtual_value_for(key) {
        let page_kvstore;

        page_kvstore = this.find_page_kvstore_for(key);
        
        if (page_kvstore) {
            return page_kvstore.virtual_value;
        }

        return ''
    }

    is_readonly() {
        let user_perms = this.get('user_perms'), result;

        result = user_perms['read'];
        result = result && !user_perms['write'];
        result = result && !user_perms['delete'];
        result = result && !user_perms['change_perm'];
        result = result && !user_perms['take_ownership'];

        return result;
    }
}

function dynamic_comparator(sort_field, sort_order) {
    let comp, ord = 1, v1, v2;

    if (sort_order == 'desc') {
        ord = -1;
    }

    comp = function(m1, m2) {

        if (sort_field == 'type') {
            sort_field = 'ctype'
        } else if (sort_field == 'date') {
            sort_field = 'timestamp';
        }

        v1 = m1.get(sort_field);
        v2 = m2.get(sort_field);

        if (typeof(v1) == 'string') {
            // i.e comparing by string will ignore character case
            v1 = v1.toUpperCase();
        }

        if (typeof(v2) == 'string') {
            // i.e comparing by string will ignore character case
            v2 = v2.toUpperCase();
        }
        // the heart of this function
        if (v1 < v2) {
            return -1 * ord;
        } else if (v1 > v2) {
            return 1 * ord;
        }
        
        return 0;
    }

    return comp;
}

export class NodeCollection extends Collection {
    
    get model() {
        return Node;
    }

    urlRoot() {
        return '/nodes/';
    }

    collection_post_action(url, options, extra_data) {
        let token, post_data, request;

        token = $("[name=csrfmiddlewaretoken]").val();
        
        post_data = this.models.map(
            function(models) { 
                return models.attributes;
            }
        );

        if (extra_data) {
          post_data = {...post_data, ...extra_data}
        }

        $.ajaxSetup({
            headers: { 'X-CSRFToken': token}
        });

        request = $.ajax({
            method: "POST",
            url: url,
            data: JSON.stringify(post_data),
            contentType: "application/json",
            dataType: 'json',
            error: function(xhr, text, error) {
                new MessageView(
                    "Error",
                    xhr.responseJSON['msg'], 
                );
            }
        });

        request.done(options['success']);
    }

    delete(options) {
        this.collection_post_action(
            this.urlRoot(),
            options
        )
    }

    download(options) {
        let node_ids = [], downloader;

        node_ids = this.models.map(
            function(model) {
                return model.get('id');
            }
        );
        downloader = new Downloader('/nodes/download/', node_ids);
        downloader.download();
    }

    cut(options) {
        this.collection_post_action(
            '/cut-node/',
            options
        );
    }

    run_ocr(options) {
        let token,
            post_data = {},
            request,
            document_ids,
            lang;

        token = $("[name=csrfmiddlewaretoken]").val();
        
        document_ids =  this.models.map(
            function(model) {
                return model.get('id');
            }
        );

        lang = $('#lang').val()

        post_data['document_ids'] = document_ids;
        post_data['lang'] = lang;

        $.ajaxSetup({
            headers: { 'X-CSRFToken': token}
        });

        request = $.ajax({
            method: "POST",
            url: '/run-ocr/',
            data: JSON.stringify(post_data),
            contentType: "application/json",
            dataType: 'json',
        });

        request.done(function(xhr, text, error) {
            new MessageView(
                "success",
                xhr['msg'],
            );
        });
        request.fail(function(xhr, text, error) {
            new MessageView(
                "error",
                xhr['msg'] || gettext("Error while starting OCR process."),
            );
        });
    }

    _paste(url, options, parent_id) {
        let token, request;

        token = $("[name=csrfmiddlewaretoken]").val();
        
        $.ajaxSetup({
            headers: { 'X-CSRFToken': token}
        });

        request = $.ajax({
            method: "POST",
            url: url,
            data: JSON.stringify({'parent_id': parent_id}),
            contentType: "application/json",
            dataType: 'json'
        });

        request.done(options['success']);  
    }

    paste(options, parent_id) {
        // pastes folder or document
        this._paste('/paste-node/', options, parent_id);
    }

    paste_pages(options, parent_id) {
        // pastes pages
        this._paste('/paste-pages/', options, parent_id);
    }

    dynamic_sort_by(sort_field, sort_order) {
        // In order to sort a collection with backbone,
        // a collection.comparator function must be defined.
        // Unfortunately default implementation allows you to
        // sort only by one field (model attributes).
        // dynamic_comparator is a workaround for this backbone.js issue.
        // It creates a comparator - dynamically i.e. a comparator
        // tailored for specific field/sort order.
        this.comparator = dynamic_comparator(sort_field, sort_order);
        this.sort();
    }
}
