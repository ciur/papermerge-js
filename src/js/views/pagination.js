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
            file_tpl = require('../templates/pagination.html'),
            parent_node = '';

        if (context['parent_id']) {
            parent_node = `#${context['parent_id']}`;
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
            'parent_node': parent_node
        }
        compiled_tpl = _.template(file_tpl(ctx));

        return compiled_tpl();
    }

    render(context) {
        let str = this.template(context);

        this.$el.html(str);
    }
}