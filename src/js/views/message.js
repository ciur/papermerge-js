import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/message.html');

export class MessageView extends View {
  el() {
      // this element is defined in admin/_forms.js.html
      return $('#message-modal');
  } 

  initialize(title, message) {
      this.title = title;
      this.message = message;
      this.render();
  }


  events() {
    let event_map = {
      'click .btn.ok': 'close',
    }

    return event_map;
  }

  close() {
    this.$el.modal("hide");
  }


  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'title': this.title,
        'message': this.message,
    }));

    this.$el.html(compiled);
    this.$el.modal("show");
  }
}