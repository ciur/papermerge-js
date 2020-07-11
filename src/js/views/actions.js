import $ from "jquery";
import _ from "underscore";
import { View, Collection } from 'backbone';
import { NodeCollection } from '../models/node';
import Backbone from 'backbone';
import {
  mg_dispatcher,
  PARENT_CHANGED,
  SELECTION_CHANGED,
  BROWSER_REFRESH
} from "../models/dispatcher";

import {NewFolderView} from "../views/new_folder";
import {RenameView} from "../views/rename";
import {UploaderView} from "../views/uploader";

export class ActionsView extends View {
  
  el() {
      return $('#actions');
  } 

  initialize(parent_id) {
    this.parent_id = parent_id;
    this.action_conditions = this._build_action_conditions();
    // collection of nodes
    this.selection = new NodeCollection();
    // collection of nodes
    this.clipboard = new Collection();

    mg_dispatcher.on(PARENT_CHANGED, this.parent_changed, this);
    mg_dispatcher.on(SELECTION_CHANGED, this.selection_changed, this);
  }

  set_parent(parent_id) {
    this.parent_id = parent_id;
  }

  events() {
      let event_map = {
        'click #new-folder':  'new_folder',
        'click #delete': 'delete_node',
        'click #cut': 'cut_node',
        'click #paste': 'paste',
        'click #paste_pages': 'paste_pages',
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

    uploader_view = new UploaderView(
      files,
      lang,
      this.parent_id
    );
  }

  upload_clicked(event) {
    let $hidden_file_input = $("#id_file_name");

    event.preventDefault();

    // send click event to hidden #id_file_name element
    // (input[type=file] element used for uploads)
    $hidden_file_input.click();
  }

  delete_node(event) {
    let options = {}, confirmation, titles_arr, titles_str;

    options['success'] = function() {
      mg_dispatcher.trigger(BROWSER_REFRESH);
    }

    // https://stackoverflow.com/questions/10858935/cleanest-way-to-destroy-every-model-in-a-collection-in-backbone
    //_.each(_.clone(this.selection.models), function(model){
    //  model.destroy(options);
    //});
    titles_arr = _.map(
      this.selection.models,
      function(model) { return model.get('title'); }
    )
    titles_str = titles_arr.join(', ');
    
    confirmation = confirm(
      `DELETE following folders/documents:  ${titles_str}?`
    );

    if (!confirmation) {
      return;
    }
    this.selection.delete(options);
  }

  cut_node(event) {
    let options = {};

    options['success'] = function() {
      mg_dispatcher.trigger(BROWSER_REFRESH);
    }

    this.selection.cut(options);
  }

  paste(event) {
    let options = {};

    options['success'] = function() {
      mg_dispatcher.trigger(BROWSER_REFRESH);
    }

    console.log(`paste: current parent_id=${this.parent_id}`);
    this.selection.paste(
      options,
      this.parent_id
    );
  }

  paste_pages(event) {
    let options = {};

    options['success'] = function() {
      mg_dispatcher.trigger(BROWSER_REFRESH);
    }

    this.selection.paste_pages(
      options,
      this.parent_id
    );
  }

  parent_changed(parent_id) {
    this.parent_id = parent_id;
    console.log(`ActionsView - parent_changed: current parent_id=${this.parent_id}`);
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

  rename_node(event) {
    let node = _.first(this.selection.models), rename_view;

    if (node) {
      rename_view = new RenameView(node);
    }
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
      'id': "#cut",
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