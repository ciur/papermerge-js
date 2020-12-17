import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';


export class PaginationView extends View {
    el() {
        return $('#pagination-view');
    }

    template(kwargs) {
        let compiled_tpl,
            file_tpl = require('../templates/pagination.html');

        compiled_tpl = _.template(file_tpl(kwargs));

        return compiled_tpl();
    }

    render(context) {
        let str = this.template(context);

        this.$el.html(str);
    }
}