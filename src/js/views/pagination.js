import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';


export class PaginationView extends View {
    el() {
        return $('#pagination-view');
    }

    template(context={}) {
        let compiled_tpl,
            ctx,
            prefix = '',
            file_tpl = require('../templates/pagination.html');

        if (context['parent_id']) {
            prefix = `#${context['parent_id']}`;
        } else {
            // Preserve correct pagination during pinned
            // tags.
            // In case there is no hash window.location.hash will be
            // an empty string '' in which case ''.split('?')[0]
            // is OK as well.
            prefix = window.location.hash.split('?')[0];
        }

        ctx = {
            'page_number': context['page_number'] || 1,
            'pages': context['pages'] || [],
            'num_pages': context['num_pages'] || 0,
            'page': {
                'has_previous': false,
                'has_next': false,
                'previous_page_number': 1,
                'next_page_number': 1,
            },
            'prefix': prefix
        }
        compiled_tpl = _.template(file_tpl(ctx));

        return compiled_tpl();
    }

    render(context) {
        let str = this.template(context);

        this.$el.html(str);
    }
}