// Usage : 
var analytics = function() {
  var self = this;
  var d = new Date();
  self.sessionId = d.getTime();
}

analytics.prototype.triggerEvent = function(event, attr) {
  var self = this;
  attr = attr || {};
  var url = 'http://artariteenageriot.disconnect.me:9080/' + event + '/' + self.sessionId;
  var queryString = '';
  if (Object.keys(attr).length > 0) {
    for(key in attr) {
      queryString += key + '=' + attr[key] + '&'
    }
  }
  
  url += '/?' + queryString;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // JSON.parse does not evaluate the attacker's scripts.
      //console.log(xhr.responseText);
    }    
  }; // Implemented elsewhere.
  xhr.open("GET", url, true);
  xhr.send();
}

var atr = new analytics();