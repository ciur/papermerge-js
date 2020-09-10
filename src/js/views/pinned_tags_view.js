import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';
import Backbone from 'backbone';

export class PinnedTagsView extends View {
  el() {
      return $('#pinned_tags_view');
  }

  events() {
    let event_map = {
      "click .tag": "on_click",
    }
    return event_map;
  }

  on_click(event) {
    let $el = $(event.currentTarget),
        parent = $el.parent();
    
    parent.siblings().removeClass('active');
    parent.addClass('active');
  }
}