import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';

let TEMPLATE = require('../templates/display_mode.html');

export let GRID = 'grid';
export let LIST = 'list';



export class DisplayModeView extends View {

    el() {
        return $('#display-mode');
    }

    initialize() {
        this.display = this.get_local('display_mode') || GRID;
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

    get_local() {
        return localStorage.getItem('display_mode');
    }

    set_local(mode) {
        return localStorage.setItem('display_mode', mode);
    }

    is_list() {
        return this.display == LIST;
    }

    is_grid() {
        return this.display == GRID;
    }

    display_list(event) {
        
        event.preventDefault();

        this.display = LIST;
        this.set_local(LIST);

        this.trigger('change');
    }

    display_grid(event) {
        
        event.preventDefault();

        this.display = GRID;
        this.set_local(GRID);
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
