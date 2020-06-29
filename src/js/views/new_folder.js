import $ from "jquery";
import _ from "underscore";
import { NewFolder } from "../models/new_folder";
import { View } from 'backbone';
import Backbone from 'backbone';


let TEMPLATE = require('../templates/new_folder.html');

export class NewFolderView extends View {
  el() {
      // this element is defined in admin/_forms.js.html
      return $('#new-folder-form');
  } 

  initialize(parent_id) {
      this.folder = new NewFolder(parent_id);
      this.render();
  }

  events() {
      let event_map = {
        "click .create": "on_create",
      }

      return event_map;
  }

  on_create(event) {
    let folder_title, parent_id;

    folder_title = this.$el.find("[name=title]").val();

    this.folder.set(
      {
        'title': folder_title,
        'parent_id': this.folder.get('parent_id')
      }
    );

    this.folder.save();
    this.$el.modal('hide');
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