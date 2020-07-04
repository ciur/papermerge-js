import $ from "jquery";
import _ from "underscore";
import { Document } from "../models/document";
import { View } from 'backbone';
import Backbone from 'backbone';
import {
    mg_dispatcher,
    PARENT_CHANGED,
} from "../models/dispatcher";

let PAGES_TEMPLATE = require('../templates/pages.html');
let PAGE_THUMBNAILS_TEMPLATE = require('../templates/page_thumbnails.html');

export class DocumentView extends View {
  el() {
      return $('#document');
  } 

  initialize() {
    let document_id = $("input[name='document_id']").val();
    this.document = new Document(document_id);
    this.document.fetch();
    this.listenTo(this.document, 'change', this.render);
  }

  events() {
      let event_map = {
      }
      return event_map;
  }

  render() {
    let compiled_pages,
        compiles_page_thumbnails,
        context;
    
    context = {};

    compiled_pages = _.template(PAGES_TEMPLATE({
        'pages': this.document.pages,
    }));

    compiled_page_thumbnails = _.template(PAGE_THUMBNAILS_TEMPLATE({
        'pages': this.document.pages,
    }));

    this.$el.find("#page-thumbnails").html(
      compiled_page_thumbnails
    );

    this.$el.find("#actual-pages").html(
      compiled_pages
    );
  }
}