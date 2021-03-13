

export class WFeedback {
    constructor() {
        let host, ws_url;

        host = window.location.host; 
        ws_url = `ws://${host}/ws/page-feedback/`;
        
        this.socket = new WebSocket(ws_url);
        this.socket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            console.log(data);
        };
    }
}