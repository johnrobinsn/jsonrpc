// John Robinson (c) 2009-2014
// https://github.com/johnrobinsn/jsonrpc
// JSON RPC Over Websockets
// MIT License

jsonRPC = function(u) {
    var self = this;
    this.id = 1;
    this.url = u;
    this.websocket = new WebSocket(this.url);
    this.outstanding = {};

    this.websocket.onopen = function(e) {
        if (self.onOpen)
            self.onOpen(e);
    }
    
    this.websocket.onclose = function(e) {
        if (self.onClose)
            self.onClose(e);
    }
    
    this.websocket.onerror = function(e) {
        if (self.onError)
            self.onError(e);
    }
    
    this.websocket.onmessage = function(e) {
        var o = JSON.parse(e.data);
        if (o) {
		    if (o.id != null) {
		        var f = self.outstanding[o.id];
                if (f) {
                    f(o.error, o.result);
                    delete self.outstanding[o.id];
                }
            }
	    	else {
	    	    if (self.onNotification)
	    			self.onNotification(o.method, o.params);
	    	}
	    }
    }
    
    this.call = function(m, p, f) {
		var id = self.id++;
		var o = {
        method: m,
	    	id: id,
	    	params: p};
		if (f) {
		    self.outstanding[id] = f;
		}
		self.websocket.send(JSON.stringify(o));
    }
    
    return this;
}
