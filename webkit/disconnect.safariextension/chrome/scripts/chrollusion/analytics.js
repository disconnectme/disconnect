/*
  A content script that flags tracking requests.

  Copyright 2012 Disconnect, Inc.

  This program is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  this program. If not, see <http://www.gnu.org/licenses/>.

  Authors (one per line):

    Gary Teh <garyjob@gmail.com>
*/

var analytics = function() {
  var self = this;
  var d = new Date();
  self.sessionId = d.getTime();
}

analytics.prototype.triggerEvent = function(event, attr) {
  var self = this;
  attr = attr || {};
  attr.recommendKey = recommender.getCurrentCampaignKey();
  var url = 'http://artariteenageriot.disconnect.me:9000/' + event + '/' + self.sessionId;
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