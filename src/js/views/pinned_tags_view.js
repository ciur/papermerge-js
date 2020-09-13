import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';
import Backbone from 'backbone';

export class PinnedTagsView extends View {
  /**
    View on the left side navigation menu. If user
    clicks a tag - it adds to it 'active' class 
    (and removes active class from other pinned tags).
  */
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