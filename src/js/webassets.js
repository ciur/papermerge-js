import {dglReady, dglUtils} from "./utils";
import {DgUploader} from "./uploader/uploader";
import {build_changelist_actions} from "./actions/changelist_actions";
import {build_changeform_actions} from "./actions/changeform_actions";

import 'bootstrap/js/dist/dropdown';

var webassetsApp = function() {
  var spinner_sw = $('#spinner-switch'), 
      upload_feedback_sw = $('#upload-feedback-switch'),
      uploader = new DgUploader()
    ;

  if (!uploader) {
    console.log("Uploader is undefined");
    return;
  }

  if (spinner_sw) {
      spinner_sw.xclick(
          function() {
              var spinner = $('#preload-spinner');
              if (spinner) {
                spinner.toggle('hidden');
              }
          }
      )
  }

  if (upload_feedback_sw) {
      upload_feedback_sw.xclick(
          function() {
             uploader.toggle_visibility();
          }
      );
  }
  build_changform_actions();
};

dglReady(
  function(event) {
      webassetsApp();
  }
);
