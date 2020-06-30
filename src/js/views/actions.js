import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';
import Backbone from 'backbone';
import {
  mg_dispatcher,
  PARENT_CHANGED,
} from "../models/dispatcher";
import {NewFolderView} from "../views/new_folder";

export class ActionsView extends View {
  el() {
      return $('#actions');
  } 

  initialize(parent_id) {
    let that = this;

    this.parent_id = parent_id;

    mg_dispatcher.on(PARENT_CHANGED, function(parent_id){
      that.parent_id = parent_id;
    });
  }

  events() {
      let event_map = {
        'click #new-folder':  'new_folder'
      }

      return event_map;
  }

  new_folder(event) {
    let new_folder_view;

    new_folder_view = new NewFolderView(this.parent_id);
  }

}