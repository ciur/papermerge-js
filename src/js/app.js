import {dglReady} from "./utils";

import {DgPageScroll} from "./document_form/page_scroll";

import {sort_cookie} from "./sort_cookie";
import {BrowseView} from "./views/browse";
import {BreadcrumbView} from "./views/breadcrumb";
import {ActionsView} from "./views/actions";
import {ControlSidebarView} from "./views/control_sidebar";
import {DocumentView} from "./views/document";

import {BrowseRouter} from "./routers/browse";

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
    control_sidebar,
    browse_router;

  browse_view = new BrowseView();
  actions_view = new ActionsView();
  breadcrumb_view = new BreadcrumbView();
  document_view = new DocumentView();
  control_sidebar = new ControlSidebarView();
  browse_router = new BrowseRouter(
    browse_view,
    breadcrumb_view
  );
  Backbone.history.start();
  
  sort_cookie();
};

dglReady( // i.e. after all DOM is loaded
  function(event) {
      App();
  }
);
