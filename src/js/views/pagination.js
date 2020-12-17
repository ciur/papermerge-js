import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';


export class PaginationView extends View {
    el() {
        return $('#pagination-view');
    }

    template(context={}) {
        let compiled_tpl,
            default_context,
            file_tpl = require('../templates/pagination.html');

        default_context = {
            'page_number': 1,
            'pages': [],
            'num_pages': 0,
            'page': {
                'has_previous': false,
                'has_next': false,
                'previous_page_number': 1,
                'next_page_number': 1,
            }
        }
        Object.assign(default_context, context)
        compiled_tpl = _.template(file_tpl(context));

        return compiled_tpl();
    }

    render(context) {
        let str = this.template(context);

        this.$el.html(str);
    }
}