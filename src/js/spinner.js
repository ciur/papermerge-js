import $ from "jquery";


export class DgMainSpinner {
    constructor(spinner_id="#preload-spinner", container_id="#viewer") {
      let that = this;

      this._spinner_id = spinner_id;
      this._container_id = container_id;

      $(window).on("load", function() {
          console.log("document form load complete");
          that.show();
      });

    }

    hide() {
      // hide whole body > main container
      $(this._spinner_id).addClass("invisible");
      $(this._container_id).addClass("invisible");
    }

    show() {
      $(this._container_id).removeClass("invisible");
      $(this._spinner_id).removeClass("invisible");
      $(this._spinner_id).hide();
    }
}