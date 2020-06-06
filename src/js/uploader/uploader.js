import {ToastMessage} from "../toast_message";
import {UploadFiles} from "./upload_file";
import $ from "jquery";
import * as utils from "../utils";

export class DgUploader {

    constructor() {
        let that = this;

        this._dom_ref = $(this.get_template());

        // insert element into live dom (if element did not exist)
        utils.id_or_invoke('id_file_name', function() {
            utils.insert(
                'input',
                {
                    type:'file',
                    name: 'file_name',
                    id: 'id_file_name',
                    multiple: true, // allow user to select multiple files
                    hidden: true
                }
            );
        });

        utils.proxy_click(
            /*from*/"#id_btn_upload1",
            /*to*/"#id_file_name"
        );

        utils.proxy_click(
            /*from*/"#id_btn_upload2",
            /*to*/"#id_file_name"
        );

        $("#centralbar").append(this._dom_ref);

        $("#uploader_details_sw").click(function(){
            that.toggle_details();
        });

        $(
            "#uploader_close"
        ).click(function(e) {
            e.preventDefault();
            $("#upload_feedback").hide();
        });

        $(
            '#id_file_name'
        ).change(function(e) {
            let files = this.files,
                lang = $("#lang").val();

            that.show()
            UploadFiles(files, lang);
        });
    }

    toggle_details() {
        $("#upload_feedback_details").toggle();
    }

    show() {
        this._dom_ref.show();
    }

    get_template() {
        let templ = UPLOADER_TEMPLATE;

        return templ;
    }
}


// In ideal case this will be in separate file...
// But this code is meant to run in web browser.

let UPLOADER_TEMPLATE = `
    <div id="upload_feedback" class="border-thin card hidden">
        <section class="header">
            <ul>
                <li>
                    <button type="button" id="uploader_close" class="close" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>                    
                </li>
            </ul>

        </section>
        <section id="upload_feedback_details" class="hidden">
            <ul class="details">
            </ul>
        </section>
        <section id="upload_feedback_summary">
            <ul class="short horizontal fl-j-space-between fl-i-center">
                <li id="uploader_short_status" class="cell status">
                </li>
                <li id="uploader_text_status" class="cell filename padding-left-md">
                    Uploading...
                </li>
                <li>
                    <button class="btn btn-neuter"  id="uploader_details_sw">
                        Details
                    </button>
                </li>
            </ul>
        </section>
        <div id="uploader_progress_bar" class="progress bar-thin bg-c-success"></div>
    </div>
`