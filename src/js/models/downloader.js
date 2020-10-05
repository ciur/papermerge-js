import $ from "jquery";

export class Downloader {

    constructor(url, node_ids) {
        this._url = url;
        this._node_ids = node_ids;
        this._param = $.param({'node_ids': node_ids});
    }

    get url() {
        /*
        * URL with node_ids as parameters
        */
        return `${this._url}?${this._param}`;
    }

    download() {
        let req = new XMLHttpRequest();

        req.responseType = "arraybuffer";

        req.onload = function() {
            
            let type = this.getResponseHeader('Content-Type');
            let data = this.response;
            let blob = new Blob([data], { type });
            let reader = new FileReader();

            reader.onload = function(e) {
                let anchor = document.createElement('a');
                
                anchor.style.display = 'none';
                anchor.href = e.target.result;
                anchor.download = 'download.tar';
                anchor.click();
            };
            
            reader.readAsDataURL(blob);
          };
          
        req.onreadystatechange = function() {
            if( req.readyState === XMLHttpRequest.OPENED ) {
                req.setRequestHeader('Accept', 'application/tar');
                req.send();
            }
          };
        
        req.open('get', this.url);
    }
}
