import $ from "jquery";
import _ from "underscore";
import { View, Collection } from 'backbone';
import { NodeCollection } from '../models/node';
import { AllTags } from "../models/tags";
import Backbone from 'backbone';
import {
  mg_dispatcher,
  PARENT_CHANGED,
  SELECTION_CHANGED,
  BROWSER_REFRESH,
  SELECT_ALL,
  SELECT_FOLDERS,
  SELECT_DOCUMENTS,
  DESELECT,
  INVERT_SELECTION,
} from "../models/dispatcher";

import {NewFolderView} from "../views/new_folder";
import {RenameView} from "../views/rename";
import {TagsModalView, MultiTagsModalView} from "../views/tags_modal";
import {AccessView} from "../views/access";
import {UploaderView} from "../views/uploader";

export class ActionsView extends View {
  
  el() {
      return $(document);
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
        'click .new-folder':  'new_folder',
        'click #download-nodes': 'download_nodes',
        'click #delete': 'delete_node',
        'click #cut': 'cut_node',
        'click #paste': 'paste',
        'click #access': 'click_access',
        'click #paste_pages': 'paste_pages',
        'click #rename': 'rename_node',
        'click #run-ocr': 'run_ocr',
        'click #tags-menu-item': 'tag_node',
        // will proxy event to #id_file_name
        'click #id_btn_upload': 'upload_clicked',
        'change #id_file_name': 'upload',
        // selection related
        'click #select_all_menu_item': 'on_select_all',
        'click #select_folders_menu_item': 'on_select_folders',
        'click #select_documents_menu_item': 'on_select_documents',
        'click #deselect_menu_item': 'on_deselect',
        'click #invert_selection_menu_item': 'on_invert_selection'
      }

      return event_map;
  }

  on_select_all(event) {
    mg_dispatcher.trigger(SELECT_ALL);
  }

  on_select_folders(event) {
    mg_dispatcher.trigger(SELECT_FOLDERS);
  }

  on_select_documents(event) {
    mg_dispatcher.trigger(SELECT_DOCUMENTS);
  }

  on_deselect(event) {
    mg_dispatcher.trigger(DESELECT);
  }

  on_invert_selection(event) {
    mg_dispatcher.trigger(INVERT_SELECTION);
  }

  click_access(event) {
    
    let node = _.first(this.selection.models), access_view;

    if (node) {
      access_view = new AccessView(node);
    }
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

  download_nodes(event) {
    let options = {};

    options['success'] = function() {
      // pass
    }

    this.selection.download(options);
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

  run_ocr(event) {
    let options = {};

    this.selection.run_ocr(options);
  }

  tag_node(event) {
    let models = this.selection.models,
      tags_view,
      all_tags,
      that,
      success;

    // first get all tags available for current user
    // and pass them to TagsModalView (or MultiTagsModalView)
    // to enable autocompletion.

    that = this;

    all_tags = new AllTags();
    all_tags.url = '/alltags/';

    success = function(collection, response, options) {
      if (models.length == 1) {
        tags_view = new TagsModalView(
          _.first(models),
          collection
        );
      } else if (models.length > 1) {
        tags_view = new MultiTagsModalView(
          models,
          collection
        );
      }
    }

    all_tags.fetch({'success': success});
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
      'id': "#delete",
      'cond': function(selection, clipboard, parent_id) {
          if (selection.length > 0) {
            return true;
          }

          return false;
      }
    });

    result.add({
      'id': "#download-nodes",
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

    result.add({
      'id': "#tags-menu-item",
      'cond': function(selection, clipboard, parent_id) {
          if (selection.length > 0) {
            return true;
          }
          return false;
      }
    });

    result.add({
      'id': "#run-ocr",
      'cond': function(selection, clipboard, parent_id) {
          if (selection.length > 0) {
            return true;
          }
          return false;
      }
    });    

    result.add({
      'id': "#access",
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