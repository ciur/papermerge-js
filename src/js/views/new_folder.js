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
        "click input[type=submit]": "on_submit",
      }

      return event_map;
  }

  on_submit(event) {
    let folder_name;

    event.preventDefault();
    console.log("default prevented");

    this.folder.set(
      {'name': folder_name}
    );

    this.folder.save();
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