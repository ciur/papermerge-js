

export class WFeedback {
    constructor() {
        let host, url;

        host = window.location.host; 
        ws_url = `ws://${host}/ws/page-status/`
        
        this.socket = new WebSocket(ws_url);
        this.socket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            console.log(data);
        };
    }
}