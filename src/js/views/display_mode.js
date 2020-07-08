import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';

let TEMPLATE = require('../templates/display_mode.html');

export let GRID = 1;
export let LIST = 2;

export class DisplayModeView extends View {

    el() {
        return $('#display-mode');
    }

    initialize() {
        this.display = GRID;
        this.listenTo(this, "change", this.render);
        this.render();
    }

    events() {
        let events_map = {
            "click .display-list": "display_list",
            "click .display-grid": "display_grid",
        }

        return events_map;
    }

    is_list() {
        return this.display == LIST;
    }

    is_grid() {
        return this.display == GRID;
    }

    display_list(event) {
        this.display = LIST;
        this.trigger('change');
    }

    display_grid(event) {
        this.display = GRID;
        this.trigger('change');
    }

    render() {
      let compiled, context;
      
      context = {};

      compiled = _.template(TEMPLATE({
          'is_list': this.is_list(),
          'is_grid': this.is_grid(),
      }));

      this.$el.html(compiled);
    }
}
