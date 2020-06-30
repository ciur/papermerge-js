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
        'click #rename': 'rename_node'
      }

      return event_map;
  }

  delete_node(event) {
    let options = {};

    options['success'] = function() {
      mg_dispatcher.trigger(BROWSER_REFRESH);
    }

    this.selection.each(function(model){
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
    let new_folder_view;

    new_folder_view = new NewFolderView(this.parent_id);
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