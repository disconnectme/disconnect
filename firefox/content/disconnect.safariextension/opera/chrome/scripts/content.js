/*
  A content script that blocks requests to blacklisted domains.

  Copyright 2010-2013 Disconnect, Inc.

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

    Brian Kennish <byoogle@gmail.com>
*/

/* Retrieves the third-party metadata, if any, associated with a domain name. */
function getService(domain) { return servicePointer[domain]; }

/* The "extension" API. */
var EXTENSION = chrome.extension;

/* The active categories et al. */
var servicePointer;

/* Traps and selectively cancels a request and messages such. */
EXTENSION.sendRequest({initialized: true}, function(response) {
  servicePointer = response.servicePointer;
  var GET = (new Sitename(response.tlds)).get;
  var PARENT_DOMAIN = response.domain;
  var PARENT_SERVICE = getService(PARENT_DOMAIN);
  var WHITELIST = response.whitelist;
  var BLACKLIST = response.blacklist;

  document.addEventListener('beforeload', function(event) {
    var CHILD_URL = event.url;
    var CHILD_DOMAIN = GET(CHILD_URL);
    var CHILD_SERVICE = getService(CHILD_DOMAIN);
    var whitelisted;
    var blocked;
    var TARGET = event.target;

    if (CHILD_SERVICE) {
      var CHILD_NAME = CHILD_SERVICE.name;
      var CHILD_CATEGORY = CHILD_SERVICE.category;
      var CONTENT = CHILD_CATEGORY == 'Content';
      var CATEGORY_WHITELIST = WHITELIST[CHILD_CATEGORY] || {};

      if (
        !PARENT_DOMAIN || CHILD_DOMAIN == PARENT_DOMAIN ||
            PARENT_SERVICE && CHILD_NAME == PARENT_SERVICE.name
      ) { // The request is allowed: the topmost frame has the same origin.
        // No-op.
      } else if (
        (CONTENT && CATEGORY_WHITELIST.whitelisted != false ||
            CATEGORY_WHITELIST.whitelisted ||
                (CATEGORY_WHITELIST.services || {})[CHILD_NAME]) &&
                    !(BLACKLIST[CHILD_CATEGORY] || {})[CHILD_NAME]
      ) { // The request is allowed: the category or service is whitelisted.
        whitelisted = true;
      } else { // The request is denied.
        if (SAFARI) {
          event.preventDefault();
          blocked = true;
        }

        TARGET.className = 'disconnect-collapsed';
      }
    }

    EXTENSION.sendRequest({
      childDomain: CHILD_DOMAIN,
      childService: CHILD_SERVICE,
      parentDomain: PARENT_DOMAIN,
      blocked: blocked,
      whitelisted: whitelisted,
      type: TARGET.nodeName.toLowerCase()
    });
  }, true);

  function setTime() {
    var time = document.getElementsByClassName('time')[0],
      n = toHHMMSS(time.getAttribute("stat"));
      n = n.split(":"),
      minutes = n[1],
      seconds = n[2],
      hours = n[0],
      s_hours = document.createElement('span'),
      s_minutes = document.createElement('span'),
      s_seconds = document.createElement('span');

    s_hours.setAttribute("stat",hours);
    s_hours.className = "odometer";
    s_hours.innerHTML = 00;

    s_minutes.setAttribute("stat",minutes);
    s_minutes.className = "odometer";
    s_minutes.innerHTML = 00;

    s_seconds.setAttribute("stat", seconds);
    s_seconds.className = "odometer";
    s_seconds.innerHTML = 00

    time.appendChild(s_hours);
    time.innerHTML = time.innerHTML + ":";
    time.appendChild(s_minutes);
    time.innerHTML = time.innerHTML + ":";
    time.appendChild(s_seconds);

    function verifyTimeDigits(num){
      return num.length > 1 ? num : '0'+num;
    }

    function toHHMMSS(sec) {
      var sec_num = parseInt(sec, 10); // don't forget the second parm
      var hours   = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);

      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
      var time    = hours+':'+minutes+':'+seconds;
      return time;
    }
  }

  function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }

  if (location.href.indexOf('disconnect.me') + 1) {
	$(function() {
    if (location.href.indexOf('/d2/welcome') + 1) {
      EXTENSION.sendRequest({getStats: true}, function(response) {
        var blocked = response.totals.blocked;
        var secured = response.totals.secured;
        const TRACKING_RESOURCE_TIME = 72.6141083689391;
        const TRACKING_RESOURCE_SIZE = 8.51145760261889;
        var timeSaved = (blocked * TRACKING_RESOURCE_TIME / 1000).toFixed(2);
        var bandwidthSaved = (blocked * TRACKING_RESOURCE_SIZE).toFixed(2);

        $('#blocked').attr('stat', addCommas(blocked));
        $('#secured').attr('stat', secured);
        $('#time').attr('stat', timeSaved);
        $('#bandwidth').attr('stat', bandwidthSaved + "kb");

        setTime();

        var stats = document.getElementsByClassName('odometer');

        setTimeout(function(){
          for(var i=0,all=stats.length;i<all;i++) {
            var n = stats[i].getAttribute("stat");
            console.log("STAT -> ", n)
            stats[i].innerHTML = n;
          }
        }, 1)
      });
    }
    else {
      var CONTROL = document.getElementById('input-type');
      var BUCKET = CONTROL && CONTROL.getAttribute('value');
      BUCKET && EXTENSION.sendRequest({pwyw: true, bucket: BUCKET});
    }
	});
  }
});
