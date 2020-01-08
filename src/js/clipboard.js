import $ from "jquery";
import {DgEvents} from "./events";


export class DgClipboard {
  /* 
    A list of documents/folders or pages user cutted into clipboard.
  */
  constructor(id="#clipboard_form"){
    this._id = id;
    this._list = [];
    this._events = new DgEvents();
    this._get_clipboard_form_server()
  }

  // event name
  static get CHANGE() {
    return "change";
  }

  subscribe_event(name, handler, context) {
    this._events.subscribe(name, handler, context);
  }

  notify_subscribers(event_name, list) {
    this._events.notify(event_name, list);
  }

  get length() {
    return this._list.length;
  }

  _get_clipboard_form_server() {
    let url = $(this._id).attr('action');
    let that = this;

    $.get(
      url,
      function(data) {
        that._list = data.clipboard;
        that.notify_subscribers(
          DgClipboard.CHANGE,
          that._list
        )
      });
  }

  add(items) {
    
  }

  count(cond_fn=x=>x) {
    // same as length, but with an optional filter.
    return this._list.filter(cond_fn).length;
  }
}
