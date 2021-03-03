import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';

let TEMPLATE = require('../templates/display_mode.html');

export let GRID = 'grid';
export let LIST = 'list';
export let ASC = 'asc';
export let DESC = 'desc';
export let TITLE = 'title';
export let DATE = 'date';
export let TYPE = 'type';

let DEFAULT_SORT_FIELD = 'title';
let DEFAULT_SORT_ORDER = 'asc';
let DISPLAY_MODE = 'display_mode';
let SORT_FIELD = 'sort_field';
let SORT_ORDER = 'sort_order';


export class DisplayModeView extends View {

    el() {
        return $('#display-mode');
    }

    initialize() {
        this.display = this.get_local(DISPLAY_MODE) || GRID;
        this.sort_field = this.get_local(SORT_FIELD) || DEFAULT_SORT_FIELD;
        this.sort_order = this.get_local(SORT_ORDER) || DEFAULT_SORT_ORDER;
        
        this.listenTo(this, "change", this.render);
        this.render();

    }

    events() {
        let events_map = {
            "click .display-list": "display_list",
            "click .display-grid": "display_grid",
            "click .sort.title.asc": "sort_by_title_asc",
            "click .sort.title.desc": "sort_by_title_desc",
            "click .sort.date.asc": "sort_by_date_asc",
            "click .sort.date.desc": "sort_by_date_desc",
            "click .sort.type.asc": "sort_by_type_asc",
            "click .sort.type.desc": "sort_by_type_desc",
        }

        return events_map;
    }

    sort_by_title_desc(event) {
       event.preventDefault();

       this.sort_field = TITLE;
       this.sort_order = DESC;
       this.set_local(SORT_FIELD, TITLE);
       this.set_local(SORT_ORDER, DESC);

       this.trigger('change');
    }

    sort_by_title_asc(event) {
        event.preventDefault();

       this.sort_field = TITLE;
       this.sort_order = ASC;
       this.set_local(SORT_FIELD, TITLE);
       this.set_local(SORT_ORDER, ASC);

       this.trigger('change');
    }

    sort_by_date_asc(event) {
       event.preventDefault();

       this.sort_field = DATE;
       this.sort_order = ASC;
       this.set_local(SORT_FIELD, DATE);
       this.set_local(SORT_ORDER, ASC);

       this.trigger('change');
    }

    sort_by_date_desc(event) {
        event.preventDefault();

       this.sort_field = DATE;
       this.sort_order = DESC;
       this.set_local(SORT_FIELD, DATE);
       this.set_local(SORT_ORDER, DESC);

       this.trigger('change');
    }

    sort_by_type_asc(event) {
       event.preventDefault();

       this.sort_field = TYPE;
       this.sort_order = ASC;
       this.set_local(SORT_FIELD, TYPE);
       this.set_local(SORT_ORDER, ASC);

       this.trigger('change');
    }

    sort_by_type_desc(event) {
        event.preventDefault();

       this.sort_field = TYPE;
       this.sort_order = DESC;
       this.set_local(SORT_FIELD, TYPE);
       this.set_local(SORT_ORDER, DESC);

       this.trigger('change');
    }

    get_local(key) {
        return localStorage.getItem(key);
    }

    set_local(key, value) {
        return localStorage.setItem(key, value);
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
        this.set_local(DISPLAY_MODE, LIST);

        this.trigger('change');
    }

    display_grid(event) {
        
        event.preventDefault();

        this.display = GRID;
        this.set_local(DISPLAY_MODE, GRID);
        this.trigger('change');
    }

    get_order_by() {
      /*
      * Returens field name with or without dash
      * character in front (dash character = minus character).
      * Dash in front indicates 'descending order'.
      */
      if (this.sort_order == ASC) {
        return this.sort_field;
      }

      return `-${this.sort_field}`;
    }

    render() {
      let compiled, context;
      
      context = {};

      compiled = _.template(TEMPLATE({
          'is_list': this.is_list(),
          'is_grid': this.is_grid(),
          'sort_field': this.sort_field,
          'sort_order': this.sort_order,
      }));

      this.$el.html(compiled);
    }
}
