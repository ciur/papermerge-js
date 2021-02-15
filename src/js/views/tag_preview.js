import $ from "jquery";
import _ from "underscore";
import { Tag, Tags } from "../models/tags";
import { sanitize } from '../utils';
import { View } from 'backbone';
import Backbone from 'backbone';

let TEMPLATE = require('../templates/tag_preview.html');
let ENTER_KEY = 13;


export class TagPreviewView extends View {
  el() {
      return $('#tag_editor');
  } 

  initialize() {
      this.name = undefined;
      this.fg_color = undefined;
      this.bg_color = undefined;

      this.setup();
      this.render();
  }

  events() {
    let event_map = {
      "change #id_fg_color": "on_fg_change",
      "change #id_bg_color": "on_bg_change",
      "keyup #id_name": "on_name_change"
    }

    return event_map;
  }

  setup() {
    this._set_fg_color();
    this._set_bg_color();
    this._set_name_change();
  }

  _set_fg_color() {
    let el = document.getElementById("id_fg_color");
    if (el) {
      this.fg_color = el.value;  
    }
  }

  _set_bg_color() {
    let el = document.getElementById("id_bg_color");
    if (el) {
      this.bg_color = el.value;  
    }
  }

  _set_name_change() {
     let el = document.getElementById("id_name");
     if (el) {
       this.name = sanitize(el.value);  
     } 
  }

  on_fg_change(event) {
    this._set_fg_color();
    this.render();
  }

  on_bg_change(event) {
    this._set_bg_color();
    this.render();
  }

  on_name_change(event) {
    this._set_name_change();
    this.render();
  }

  render() {
    let compiled, context;
    
    context = {};

    compiled = _.template(TEMPLATE({
        'name': this.name,
        'fg_color': this.fg_color,
        'bg_color': this.bg_color
    }));

    this.$el.find("#tag_editor_preview").html(compiled);
  }
}