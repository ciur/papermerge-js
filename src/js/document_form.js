import $ from "jquery";
import _ from "underscore";
import {DgTextOverlay} from "./text_overlay";
import {MgThumbnailList} from "./document_form/thumbnail_list";
import {MgThumbnail} from "./document_form/thumbnail";
import {DgZoom} from "./document_form/zoom";
import {MgPageList} from "./document_form/page_list";
import {csrfSafeMethod, getCookie, is_visible, build_elem} from "./document_form/common";
import {get_win_param} from "./document_form/common";
import {DgMainSpinner} from "./spinner";
import {RenameChangeForm} from "./forms/rename_change_form";
import {MgChangeFormActions, MgChangeFormAction} from "./actions/changeform_actions";


function add_switch_logic(switch_selector) {
    // but clicking switch selector, target is toggled.
    // in document view - this applies to page thumbnails left panel
    // and document details right panels which can be visible or hidden.
    $(switch_selector).click(function(e){
        var target_id = $(this).data("target-id"),
            $target;

        e.preventDefault();

        $target = $("#" + target_id);
        if ($target.length == 0) {
            console.log("target " + target_id + " not found");
            return;
        }

        $target.toggle();
    });
} // add_switch_logic

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

export function add_switch_2_document_form() {
    // ok, here we are in document for page.
    add_switch_logic("#sw-left-panel");
    add_switch_logic("#sw-right-panel");
}

class MgDocument {
    constructor(page_num, text_arr) {
        this._thumbnail_list = new MgThumbnailList(); 
        this._zoom = new DgZoom();
        this._page_list = new MgPageList(this._zoom);
        this._page_num;
        this._text_arr = text_arr; 

        this._thumbnail_list.load();
        this._page_list.load(this.zoom.get_value());
        this._spinner = new DgMainSpinner();
        this._actions = this.build_actions();

        this.configEvents();
        
        if (page_num) {
            this.scroll_to(page_num);
        }

        if (text_arr) {
            this._page_list.highlight_text(text_arr);
        }
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

    scroll_to(page_num) {
        this._thumbnail_list.remove_highlights();
        this._thumbnail_list.mark_highlight(page_num);
        this._page_list.scroll_to(page_num);
    }

    on_thumbnail_dblclick(page_num) {
        this.scroll_to(page_num);
    }

    on_thumbnail_click(page_num) {
        console.log(`Page ${page_num} click`);
    }

    on_zoom_change(new_zoom_val) {
        this.page_list.on_zoom(new_zoom_val);
    }

    on_page_move_up(page_num, doc_id, page_id) {
        console.log(`on_page_move_up ${page_num} ${doc_id} ${page_id}`);
        this.actions.clear_selection();
        this._thumbnail_list.clear_selections();
    }

    on_page_move_down(page_num, doc_id, page_id) {
        console.log(`on_page_move_down ${page_num} ${doc_id} ${page_id}`);
        this.actions.clear_selection();        
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

            console.log("window resized");
            that.page_list.on_zoom(zoom_val);
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
        paste_page_action;

      rename_action = new MgChangeFormAction({
        // Achtung! #rename id is same for rename action
        // in changeform view and changelist view.
        id: "#rename",
        enabled: function(selection, clipboard) {
          return true;
        },
        action: function(selection, clipboard, current_node) {
          let rename_form = new RenameChangeForm(current_node);
          rename_form.show();
        }
      });

      delete_page_action = new MgChangeFormAction({
        // Achtung! #rename id is same for rename action
        // in changeform view and changelist view.
        id: "#delete-page",
        enabled: function(selection, clipboard) {
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
        // Achtung! #rename id is same for rename action
        // in changeform view and changelist view.
        id: "#cut-page",
        enabled: function(selection, clipboard) {
          return selection.length > 0;
        },
        action: function(selection, clipboard, current_node) {
          console.log("log cut-page");
        }
      });

      paste_page_action = new MgChangeFormAction({
        // Achtung! #rename id is same for rename action
        // in changeform view and changelist view.
        id: "#paste-page",
        enabled: function(selection, clipboard) {
          return true;
        },
        action: function(selection, clipboard, current_node) {
          console.log("log paste-page");
        }
      });

      actions.add(rename_action);
      actions.add(delete_page_action);
      actions.add(cut_page_action);
      actions.add(paste_page_action);

      return actions;
    }
}
    

export function add_load_on_scroll() {
    let csrftoken,
        step,
        page_num = get_win_param('page'),
        text_arr = get_win_param('text'),
        mg_document;

    csrftoken = getCookie('csrftoken');

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    // when opening the document land on this page
    if (page_num) {
        page_num = parseInt(page_num);
    }

    // when opening the document highlight this text
    if (text_arr) {
        text_arr = text_arr.split('+');
    }

    mg_document = new MgDocument(page_num, text_arr);
}