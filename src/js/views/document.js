import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';
import Backbone from 'backbone';

import { Node } from "../models/node";
import { Tags } from "../models/tags";
import { TagsModalView } from "../views/tags_modal";
import {DgPageScroll} from "../document_form/page_scroll";
import {DgTextOverlay} from "../text_overlay";
import {MgThumbnailList} from "../document_form/thumbnail_list";
import {MgThumbnail} from "../document_form/thumbnail";
import {DgZoom} from "../document_form/zoom";
import {MgPageList} from "../document_form/page_list";
import {csrfSafeMethod, getCookie, is_visible, build_elem} from "../document_form/common";
import {get_win_param} from "../document_form/common";
import {DgMainSpinner} from "../spinner";
import {MgChangeFormActions, MgChangeFormAction} from "../actions/changeform_actions";
import {BreadcrumbView} from "../views/breadcrumb";
import {WidgetsBarDocumentView, InfoWidgetDocumentView} from "../views/widgetsbar";
import {RenameView} from "../views/rename";
import {Document} from "../models/document";
import { MessageView } from '../views/message';
import { PageOcredTextView } from "../views/page_ocred_text_view";


import { 
  mg_dispatcher,
  DOCUMENT_IMAGE_LOADED
} from "../models/dispatcher";

export class DocumentActionsView extends View {
  
  el() {
    return $('#document-actions');
  }

  initialize() {
    let storage = window.localStorage;

    if (storage.getItem('page-thumbnails') == 'visible') {
      $("#page-thumbnails").show();
    } else {
      $("#page-thumbnails").hide();
    }
  }

  events() {
    let event_map = {
      "click #sw-left-panel": "toggle_thumbnails",
    }

    return event_map;
  }

  toggle_thumbnails(event) {
    let target_id = $(event.currentTarget).data("target-id"),
        $target,
        storage = window.localStorage;

    event.preventDefault();

    $target = $("#" + target_id);
    if ($target.length == 0) {
        console.log("target " + target_id + " not found");
        return;
    }

    $target.toggle();
    if ($target.is(':visible')) {
      storage.setItem('page-thumbnails', 'visible');
    } else {
      storage.setItem('page-thumbnails', 'hidden');
    }
  }
}

function add_zoom_logic() {

    let actual_pages = Array.from(
        document.querySelectorAll('.actual-pages .actual_page')
    );

    $(".zoom").change(function(){
        let zoom_val = parseInt(
            $(this).val()
        ) || 3;
        
        actual_pages.forEach(function(dom_page_item, index, arr){
        }); 

    });

    $(".zoom").trigger("change");

} // add_zoom_logic

export function add_zoom_2_document_form() {
    add_zoom_logic();
}

export class DocumentView extends View {

    el() {
      return $('#document');
    } 

    initialize() {
      let dom_actual_pages = document.querySelector('.actual_pages'),
        document_id = $("input[name=document_id]").val();

      // Widgets bar must be created before MgThumbnailList
      // because latter sends an event of page selection.
      // Page selection event triggers loading of metadata for correct
      // page.
      this._widgetsbar = new WidgetsBarDocumentView(document_id);
      this._info_widget = new InfoWidgetDocumentView(document_id);
      this._thumbnail_list = new MgThumbnailList(); 
      this._zoom = new DgZoom();
      this._page_list = new MgPageList(this._zoom);

      this._thumbnail_list.load();
      this._page_list.load(this.zoom.get_value());
      this._spinner = new DgMainSpinner();
      this._actions = this.build_actions();
      this._breadcrumb_view = new BreadcrumbView(document_id);
      this._loaded_page_imgs = 0;

      if (dom_actual_pages) {
          new DgPageScroll(dom_actual_pages);
      }

      this.configEvents();
      this._adjust_viewer_height()

      mg_dispatcher.on(
          DOCUMENT_IMAGE_LOADED,
          this.on_document_image_loaded,
          this
      );
    }

    get actions() {
        return this._actions;
    }

    get zoom() {
        return this._zoom;
    }

    get page_list() {
        return this._page_list;
    }
    on_document_image_loaded(page_num) {
      if (this.page_list.length > this._loaded_page_imgs) {
          this._loaded_page_imgs += 1;
      } else {
        // beautiful refresh feature BEGIN
        /**
        See detailed comment in beatuful refresh comment found in src/js/views/browse.js
        **/
        $('aside.main-sidebar.animated-opacity').animate({opacity: 1.0}, 200, function(){
            $('.main-header.animated-opacity').animate({opacity: 1.0}, 200, function(){
                $("#pre-loader").hide();
                $('.content-wrapper.animated-opacity').animate({opacity: 1.0}, 200, function() {
                    $('#document').animate({opacity: 1.0}, 200);
                });
            });
        });
        // beatiful refresh feature END
      }
    }

    scroll_to(page_num) {
        this._thumbnail_list.remove_highlights();
        this._thumbnail_list.mark_highlight(page_num);
        this._page_list.scroll_to(page_num);
    }

    on_thumbnail_dblclick(page_num) {
        this.scroll_to(page_num);
    }

    on_thumbnail_click(page_num, doc_id, page_id) {
        console.log(
          `Page ${page_num} ${doc_id} ${page_id} click`
        );
    }

    on_zoom_change(new_zoom_val) {
        this.page_list.on_zoom(new_zoom_val);
    }

    on_page_move_up(page_num, doc_id, page_id) {
        this.actions.clear_selection();
        this._thumbnail_list.clear_selections();
        this._page_list.on_page_move_up(page_num, doc_id, page_id);
    }

    on_page_move_down(page_num, doc_id, page_id) {
        this.actions.clear_selection();
        this._thumbnail_list.clear_selections();
        this._page_list.on_page_move_down(page_num, doc_id, page_id);
    }

    configEvents() {
        let that = this;

        this._thumbnail_list.ondblclick(
            this.on_thumbnail_dblclick,
            this
        );

        this._thumbnail_list.onclick(
            this.on_thumbnail_click,
            this
        );

        this._thumbnail_list.subscribe(
            MgThumbnail.MOVE_UP,
            that.on_page_move_up,
            that
        );

        this._thumbnail_list.subscribe(
            MgThumbnail.MOVE_DOWN,
            that.on_page_move_down,
            that
        );

        this.zoom.subscribe("zoom", this.on_zoom_change, this);

        $(window).resize(function(){
            let zoom_val = that.zoom.get_value();

            that.page_list.on_zoom(zoom_val);
            console.log("window resized");
            that._adjust_viewer_height();
        });
    }

    build_actions() {
      /**
      Actions dropdown menu of changeform view.
      */
      let actions = new MgChangeFormActions(
            this._thumbnail_list,
            this._page_list
        ),
        rename_action,
        delete_page_action,
        cut_page_action,
        paste_page_action,
        paste_page_before_action,
        paste_page_after_action,
        tags_action,
        view_ocr_action,
        apply_reorder_changes,
        that = this;

      rename_action = new MgChangeFormAction({
        // Achtung! #rename id is same for rename action
        // in changeform view and changelist view.
        id: "#rename",
        enabled: function(selection, clipboard) {
          return true;
        },
        action: function(selection, clipboard, current_node) {
          let rename_view, node, options = {};

          node = new Document(current_node.id);

          function update_breadcrumb() {
            that._breadcrumb_view.breadcrumb.fetch();
          }

          options['success'] = function(model, response, options) {
            rename_view = new RenameView(model);
            rename_view.rename.on("change", update_breadcrumb);
          };

          node.fetch(options);
        }
      });

      delete_page_action = new MgChangeFormAction({
        id: "#delete-page",
        enabled: function(selection, clipboard) {
            let order_changed = false;

            // User cannot delete pages if he changed their
            // order and changes are pending. He/She must 
            // apply reorder changes!
            for(let page of selection.all()) {
                if (page.page_num != page.page_order) {
                    return false;
                }
            }

            return selection.length > 0;
        },
        action: function(
            selection,
            clipboard,
            current_node,
            thumbnail_list,
            page_list
        ) {
          let delete_page_form,
          confirmation = confirm("Are you sure?"),
          url, params, pages = [], doc_id;

          if (!confirmation) {
            return;
          }

          for (let page of selection.all()) {
            doc_id = page.doc_id;
            pages.push(page.page_num);
          }

          url = `/api/document/${doc_id}/pages?`;

          params = $.param({'pages': pages});

          $.ajax({
            url:  url + params,
            method: 'DELETE'
          });

          thumbnail_list.delete_selected(selection);
          page_list.delete_selected(selection);
        }
      });

      cut_page_action = new MgChangeFormAction({
        id: "#cut-page",
        enabled: function(selection, clipboard) {
          return selection.length > 0;
        },
        action: function(selection, clipboard, current_node) {
          let url, pages = [], doc_id;

          for (let page of selection.all()) {
            doc_id = page.doc_id;
            pages.push(page.page_num);
          }

          url = `/api/document/${doc_id}/pages/cut`;

          $.post({
              url: url,
              type: 'POST',
              data: JSON.stringify(pages),
              dataType: "json",
              contentType: "application/json; charset=utf-8",
              error: function(response) {
                if (response.status == 403) {
                  new MessageView(
                      "Error",
                      response.responseJSON['msg'],
                  );
                }
              }
          });
        }
      });

      paste_page_action = new MgChangeFormAction({
        id: "#paste-page",
        enabled: function(selection, clipboard) {
          return true;
        },
        action: function(selection, clipboard, current_node) {
            let url;

            url = `/api/document/${current_node.id}/pages/paste`;

            $.post({
              url: url,
              type: 'POST',
              dataType: "json",
              contentType: "application/json; charset=utf-8",
              error: function(response) {
                if (response.status == 403) {
                  new MessageView(
                      "Error",
                      response.responseJSON['msg'],
                  );
                }
              }
            });
        }
      });

      paste_page_before_action = new MgChangeFormAction({
        id: "#paste-page-before",
        enabled: function(selection, clipboard) {
          return selection.length == 1;
        },
        action: function(selection, clipboard, current_node) {
            let url, page_num = -1;

            for (let page of selection.all()) {
                if (page.page_num) {
                    page_num = page.page_num;
                }
            }

            url = `/api/document/${current_node.id}/pages/paste`;

            $.post({
              url: url,
              type: 'POST',
              data: JSON.stringify({'before': page_num}),
              dataType: "json",
              contentType: "application/json; charset=utf-8",
            });
        }
      });

      paste_page_after_action = new MgChangeFormAction({
        id: "#paste-page-after",
        enabled: function(selection, clipboard) {
          return selection.length == 1;
        },
        action: function(selection, clipboard, current_node) {
            let url, page_num = -1;

            for (let page of selection.all()) {
                if (page.page_num) {
                    page_num = page.page_num;
                }
            }

            url = `/api/document/${current_node.id}/pages/paste`;

            $.post({
              url: url,
              type: 'POST',
              data: JSON.stringify({'after': page_num}),
              dataType: "json",
              contentType: "application/json; charset=utf-8",
            });
        }
      });

      tags_action = new MgChangeFormAction({
        id: "#tags-menu-item",
        enabled: function(selection, clipboard) {
          return true;
        },
        action: function(selection, clipboard, current_node) {
          let tags_view,
            node,
            that = this,
            success;

          node = new Node({
              'id': current_node.id,
              'ctype': 'document',
              'document_url': `/node/${current_node.id}`
          });

          success = function(model, response, options) {
            let correct_node, n = model.get('node'), tags_collection;

            tags_collection = new Tags([]);

            for (let i=0; i < n['alltags'].length; i++) {
              tags_collection.add(
                {
                  'name': n['alltags'][i]['name'],
                  'fg_color': n['alltags'][i]['fg_color'],
                  'bg_color': n['alltags'][i]['bg_color']
                }
              );
            }

            // small hack
            correct_node = new Node({
              'id': n['id'],
              'title': n['title'],
              'tags': n['tags'],
              'alltags': n['alltags']
            });

            tags_view = new TagsModalView(
              correct_node,
              tags_collection
            );
          }

          node.fetch({'success': success});
        }
      });

      view_ocr_action = new MgChangeFormAction({
        id: "#view-ocr",
        enabled: function(selection, clipboard) {
          return true;
        },
        action: function(selection, clipboard, current_node) {
          let tags_view,
            page,
            that = this,
            success;

            if (selection.length <= 0) {
              new MessageView(
                "warning",
                gettext("Select one page (from the thumbnails) to view its OCRed text")
              );
            } else if (selection.length > 1) {
              new MessageView(
                "warning",
                gettext("Select <strong>exactly one</strong> page to view its OCRed text")
              );
            } else { // i.e. selection.length == 1
              page = selection.first();
              new PageOcredTextView(
                page._doc_id,
                page._page_num,
                $("#document-versions").val()
              );
            }
        }
      });

      apply_reorder_changes = new MgChangeFormAction({
        id: "#apply-reorder-changes",
        enabled: function(
            selection,
            clipboard,
            current_node,
            thumbnail_list,
            page_list
        ) {
            // if any page has page_num != page_order
            // it means page was reordered => there pending
            // changes.
            if (!thumbnail_list) {
                return false;
            }
            for(let thumb of thumbnail_list.all()) {
                let data = MgThumbnail.get_data_from_dom(thumb.dom_ref);

                if (data['page_num'] != data['page_order']) {
                    return true;
                }
            }

            return false;
        },
        action: function(
            selection, 
            clipboard,
            current_node,
            thumbnail_list,
            page_list
        ) {
            let confirmation = confirm("Are you sure?"),
            url, params, pages = [], doc_id, data;

            if (!confirmation) {
              return;
            }

            for (let thumb of thumbnail_list.all()) {
                data = MgThumbnail.get_data_from_dom(thumb.dom_ref);
                doc_id = thumb.doc_id;
                pages.push({
                    'page_num': data['page_num'],
                    'page_order': data['page_order'],
                });
            }

            url = `/api/document/${doc_id}/pages`;

            $.post({
                url: url,
                type: 'POST',
                data: JSON.stringify(pages),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
            });
        }
      });

      actions.add(rename_action);
      actions.add(delete_page_action);
      actions.add(cut_page_action);
      actions.add(paste_page_action);
      actions.add(paste_page_before_action);
      actions.add(paste_page_after_action);
      actions.add(apply_reorder_changes);
      actions.add(tags_action);
      actions.add(view_ocr_action);

      return actions;
    }

    _adjust_viewer_height() {
      /**
       * Change viewer height (in order to remove redundent scrollbars).
       * 
       * By default ul.actual_pages, #actual-pages and ul.page_thumbnails
       * elements have css height set to 100vh. This adds vertical scroll
       * bars (because viewer is 100vh + header height + footer height).
       * This function will make viewer little bit small by decreasing 
       * height of ul.actual_pages, #actual-pages and ul.page_thumbnails 
       * elements, thus removing (yet another) scrollbar.
      */

      let vh_height,
        doc_actions,
        nav_height,
        breadcrumb_height,
        viewer_height;

      vh_height = Math.max(
        document.documentElement.clientHeight, window.innerHeight || 0
      );

      breadcrumb_height = $('#breadcrumb').outerHeight(true);
      doc_actions = $('#document-actions').outerHeight(true);
      nav_height = $('nav.main-header.navbar').outerHeight(true);

      viewer_height = vh_height - 1.4 * nav_height - 2 * doc_actions;

      $("#document").css('height', `${viewer_height}px`);
    }
}
