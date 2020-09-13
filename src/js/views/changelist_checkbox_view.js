import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';
import Backbone from 'backbone';

export class ChangelistCheckboxView extends View {
  /**
    'Check all' - view in changelists
  */
  el() {
      return $('#checkbox_view');
  }

  events() {
    let event_map = {
      "click #action_toggle": "on_click",
    }
    return event_map;
  }

  on_click(event) {
    $("[name=_selected_action]").each(function(){
      this.checked = !this.checked;
    });
  }
}