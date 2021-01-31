import $ from "jquery";
import _ from "underscore";
import { Version } from "../models/version";
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/about.html');


class AboutView extends View {

  el() {
      // this element is defined in admin/_forms.js.html
      return $('#message-modal');
  }

  initialize() {
    this.version = new Version();
    this.version.fetch();
    this.listenTo(this.version, 'change', this.render);
  }

  events() {
    let event_map = {
        'click .ok': 'on_ok'
    };

    return event_map;
  }

  on_ok(event) {
    this.$el.modal('hide');
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'version': this.version.get('msg'),
    }));

    this.$el.html(compiled);
    this.$el.modal();
  }
}

export class UserMenuView extends View {
  el() {
      return $('#user-menu');
  } 

  events() {
    let event_map = {
      "click #about": "on_about",
    }
    return event_map;
  }

  on_about(event) {
    let about_view = new AboutView();
  }
}