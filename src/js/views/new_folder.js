import $ from "jquery";
import _ from "underscore";
import { NewFolder } from "../models/new_folder";
import { MessageView } from "./message";
import { View } from 'backbone';
import Backbone from 'backbone';

import {
  mg_dispatcher,
  BROWSER_REFRESH
} from "../models/dispatcher";

let TEMPLATE = require('../templates/new_folder.html');

export class NewFolderView extends View {
  el() {
      // this element is defined in admin/_forms.js.html
      return $('#new-folder-modal');
  } 

  initialize(parent_id) {
      this.folder = new NewFolder(parent_id);
      this.render();
  }

  events() {
    let event_map = {
      "click .create": "on_create",
      "submit": "on_form_submit"
    }

    return event_map;
  }

  on_form_submit(event) {
    event.preventDefault();
    this.on_create(event);
  }

  on_create(event) {
    let folder_title, parent_id, options = {};

    options['success'] = function() {
      mg_dispatcher.trigger(BROWSER_REFRESH);
    }

    options['error'] = function(model, response, options) {
      let title, message, error_view;

      message = response.responseJSON['msg'];

      // danger => style error message in red color
      error_view = new MessageView("danger", message);

    }

    folder_title = this.$el.find("[name=title]").val();

    if (folder_title == null || folder_title.trim().length === 0) {
      this.$el.modal('hide');
      return ;
    }

    this.folder.set({
      'title': folder_title,
    });
    this.folder.save({}, options);
    this.$el.modal('hide');
    this.undelegateEvents();
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'name': this.folder.get('name'),
    }));

    this.$el.html(compiled);
    this.$el.modal();
  }
}