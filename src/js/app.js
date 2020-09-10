import { dglReady } from "./utils";

import { DgPageScroll } from "./document_form/page_scroll";

import { BrowseView } from "./views/browse";
import { BreadcrumbView } from "./views/breadcrumb";
import { ActionsView } from "./views/actions";
import { ControlSidebarView } from "./views/control_sidebar";
import { DocumentView, DocumentActionsView } from "./views/document";
import { TagPreviewView } from "./views/tag_preview";
import { PinnedTagsView } from "./views/pinned_tags_view";

import { BrowseRouter } from "./routers/browse";

import Backbone from 'backbone';

import $ from "jquery";

import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/toast';
import 'bootstrap/js/dist/tab';
import 'bootstrap/js/dist/modal';

let backboneSync = Backbone.sync;

Backbone.sync = function (method, model, options) {
    let csrf_token = $("[name=csrfmiddlewaretoken]").val();
    /*
     * The jQuery `ajax` method includes a 'headers' option
     * which lets you set any headers you like
     */
    options.headers = {
        'X-CSRFToken': csrf_token
    };
    /*
     * Call the stored original Backbone.sync method with
     * extra headers argument added
     */
    backboneSync(method, model, options);
};


let App = function() {

  let browse_view,
    actions_view,
    breadcrumb_view,
    document_view,
    document_actions_view,
    control_sidebar,
    browse_router,
    tag_preview_view,
    pinned_tags_view;

  browse_view = new BrowseView();
  actions_view = new ActionsView();
  breadcrumb_view = new BreadcrumbView();
  control_sidebar = new ControlSidebarView();
  tag_preview_view = new TagPreviewView();
  pinned_tags_view = new PinnedTagsView();

  if ($("#document").length == 1) {
    // we in document view. Document view and browser view
    // are exclusive.
    document_view = new DocumentView();
    document_actions_view = new DocumentActionsView();
  } else {
    
    browse_router = new BrowseRouter(
      browse_view,
      breadcrumb_view,
      actions_view
    );

   
    Backbone.history.start();
    // Small notofication popups on top-right corner of the screen.
    // They serve as widgets for django's messages
    $('.toast').toast({'autohide': false});
    $('.toast').toast('show');
  }

};

dglReady( // i.e. after all DOM is loaded
  function(event) {
      App();
  }
);
