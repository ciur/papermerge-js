import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';
import Backbone from 'backbone';

export class LogsView extends View {
  el() {
      return $('#logs_view');
  } 

  events() {
    let event_map = {
      'click #action_toggle': 'action_toggle'
    }

    return event_map
  }

    action_toggle() {
      if ($('#action_toggle').prop('checked')) {
          $("[name='_selected_action']").prop('checked', true);
      } else {
        $("[name='_selected_action']").prop('checked', false);
      }
    }

}