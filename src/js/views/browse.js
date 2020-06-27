import $ from "jquery";
import _ from "underscore";
import { Browse } from "../models/browse";
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/browse.html');

export class BrowseView extends View {
  el() {
      return $('#browse');
  } 

  initialize(parent_id) {
      this.browse = new Browse(parent_id);
      this.render();
  }

  events() {
      let event_map = {
      }

      return event_map;
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'nodes': this.browse.get('nodes'),
    }));

    this.$el.html(compiled);
  }
}