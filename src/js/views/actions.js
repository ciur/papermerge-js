import $ from "jquery";
import _ from "underscore";
import { View, Collection } from 'backbone';
import Backbone from 'backbone';
import {
  mg_dispatcher,
  PARENT_CHANGED,
  SELECTION_CHANGED,
  BROWSER_REFRESH
} from "../models/dispatcher";

import {NewFolderView} from "../views/new_folder";
import {UploaderView} from "../views/uploader";

export class ActionsView extends View {
  
  el() {
      return $('#actions');
  } 

  initialize(parent_id) {
    this.parent_id = parent_id;
    this.action_conditions = this._build_action_conditions();
    // collection of nodes
    this.selection = new Collection();
    // collection of nodes
    this.clipboard = new Collection();

    mg_dispatcher.on(PARENT_CHANGED, this.parent_changed, this);
    mg_dispatcher.on(SELECTION_CHANGED, this.selection_changed, this);
  }

  events() {
      let event_map = {
        'click #new-folder':  'new_folder',
        'click #delete': 'delete_node',
        'click #rename': 'rename_node',
        // will proxy event to #id_file_name
        'click #id_btn_upload': 'upload_clicked',
        'change #id_file_name': 'upload'
      }

      return event_map;
  }

  upload(event) {
    let $target = $(event.currentTarget), files,
      lang = $("#lang").val(),
      uploader_view;

    files = $target[0].files;

    uploader_view = new UploaderView(files, lang);
  }

  upload_clicked(event) {
    let $hidden_file_input = $("#id_file_name");

    event.preventDefault();

    // send click event to hidden #id_file_name element
    // (input[type=file] element used for uploads)
    $hidden_file_input.click();
  }

  delete_node(event) {
    let options = {};

    options['success'] = function() {
      mg_dispatcher.trigger(BROWSER_REFRESH);
    }

    // https://stackoverflow.com/questions/10858935/cleanest-way-to-destroy-every-model-in-a-collection-in-backbone
    _.each(_.clone(this.selection.models), function(model){
      model.destroy(options);
    });
  }

  rename_node(event) {

  }

  parent_changed(parent_id) {
    this.parent_id = parent_id;
  }

  selection_changed(selection) {
    let that = this;

    this.selection.reset(
      selection
    );

    _.each(this.action_conditions.models, function(item){
        if (
          item.get('cond')(
            that.selection,
            that.clipboard,
            that.parent_id
          )
        ) {
            that.enable_action(item);
        } else {
            that.disable_action(item);
        }
    });
  }

  new_folder(event) {
    let new_folder_view, parent_id;

    parent_id = this.parent_id;
    
    new_folder_view = new NewFolderView(parent_id);
  }

  enable_action(item) {
    $(item.get('id')).removeClass("disabled");
  }

  disable_action(item) {
    $(item.get('id')).addClass("disabled");
  }

  _build_action_conditions() {
    let that = this, result = new Collection();

    result.add({
      'id': "#delete",
      'cond': function(selection, clipboard, parent_id) {
          if (selection.length > 0) {
            return true;
          }

          return false;
      }
    });

    result.add({
      'id': "#rename",
      'cond': function(selection, clipboard, parent_id) {
          if (selection.length == 1) {
            return true;
          }

          return false;
      }
    });


    return result;
  }

}