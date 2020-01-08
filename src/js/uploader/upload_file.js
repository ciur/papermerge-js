/***********************************************************************
#                                                                       #
# Copyright (C) 2019 Eugen Ciur <eugen@digilette.com>                   #
# All Rights Reserved                                                   #
#                                                                       #
# This is unpublished proprietary source code of Eugen Ciur.            #
#                                                                       #
# You may not copy, modify, sublicense or distribute the Program except #
# if expressly allowed by Eugen Ciur.                                   #
#                                                                       #
# The copyright notice above does not evidence any intended publication #
# of such source code.                                                  #
#                                                                       #
************************************************************************/


import $ from "jquery";
import {human_size} from "../utils";
import {get_parent_id} from "../utils";

import {DgUploadListItem} from "./upload_list_item";

class DgUploadList {
    constructor() {
        this._items = []
    }

    on_upload_progress(item, percent) {
        item.set_progress(percent);
    }

    get_summary_status() {
        let summary_status = {
           'success': 0,
           'error': 0,
        };

        for(let it of this._items) {
            if ( it.is_success() ) {
                summary_status['success'] += 1;
            }
            if ( it.is_error() ) {
                summary_status['error'] += 1;   
            }
        }

        return summary_status;
    }

    is_summary_success() {
        let summary_status = this.get_summary_status();
        return summary_status['success'] == this._items.length;
    }

    is_summary_error() {
        let summary_status = this.get_summary_status();
        return summary_status['error'] > 0;
    }

    clear_status() {
        $('#uploader_short_status').removeClass('spinner');
        $("#uploader_progress_bar").removeClass("bg-c-success-faded");
        $("#uploader_progress_bar").removeClass("bg-c-fail-faded");
    }

    set_status_success() {
        this.clear_status();        
        $('#uploader_short_status').addClass('success');
        $('#uploader_text_status').text('Done!');
        $("#uploader_progress_bar").addClass("bg-c-success");
    }

    set_status_error() {
        this.clear_status();
        $('#uploader_short_status').addClass('fail');
        $('#uploader_text_status').text('Error');
        $("#uploader_progress_bar").addClass("bg-c-fail")
    }

    on_upload_success(item) {

        item.set_status_success();

        if (this.is_summary_success()) {
            this.set_status_success();
        } else if (this.is_summary_error()) {
            this.set_status_error();
        }
    }

    on_upload_error(item) {
        console.log("Upload failed");
        item.set_status_error();
        this.set_status_error();

    }

    on_upload_start(item) {
        item.set_status_progress();
        $('#uploader_short_status').removeClass('success');
        $('#uploader_short_status').removeClass('fail');
        $('#uploader_short_status').addClass('spinner');
        $('#uploader_text_status').text('Uploading...');
    }

    add(item) {

        this._items.push(item);
        this.get_details().append(
            item.dom_ref
        );

        item.subscribe_event(
            DgUploadListItem.UPLOAD_PROGRESS,
            this.on_upload_progress,
            this
        );
        item.subscribe_event(
            DgUploadListItem.UPLOAD_SUCCESS,
            this.on_upload_success,
            this
        );
        item.subscribe_event(
            DgUploadListItem.UPLOAD_ERROR,
            this.on_upload_error,
            this
        );
        item.subscribe_event(
            DgUploadListItem.UPLOAD_START,
            this.on_upload_start,
            this
        );
        item.send(); //i.e. start file upload via ajax
    }

    get_details() {
        return $('#upload_feedback_details > .details');
    }

    total_files_size() {
        let total;

        for(let i = 0; i < this.items.length; i++) {
            total += this._items[i].size;
        }
        return total;
    }
}

export function UploadFiles(files, lang) {
    let upload_list,
        upload_item;

    upload_list = new DgUploadList();

    for(let file of files) {
        upload_item = new DgUploadListItem(file, lang);
        upload_list.add(upload_item);
    }
};