import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/message.html');

export class MessageView extends View {
  el() {
      return $('#messages');
  } 

  initialize(title, message) {
      // title is one of following lowercase strings:
      // success, error, warning
      this.title = title;
      // any free form string
      this.message = message;
      this.render();
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'title': this.title,
        'message': this.message,
    }));

    this.$el.html(compiled);
  }
}