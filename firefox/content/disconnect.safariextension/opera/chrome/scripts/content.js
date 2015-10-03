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
SAFARI && EXTENSION.sendRequest({initialized: true}, function(response) {
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

      if (!PARENT_DOMAIN || CHILD_DOMAIN == PARENT_DOMAIN ||
            PARENT_SERVICE && CHILD_NAME == PARENT_SERVICE.name
      ) { // The request is allowed: the topmost frame has the same origin.
        // No-op.
      } else if (
        (CONTENT && CATEGORY_WHITELIST.whitelisted != false ||
            CATEGORY_WHITELIST.whitelisted ||
                (CATEGORY_WHITELIST.services || {})[CHILD_NAME]) &&
                    !(BLACKLIST[CHILD_CATEGORY] || {})[CHILD_NAME]
      ) { // The request is allowed: the category or service is whitelisted.
        console.log("request is allowed");
        whitelisted = true;
      } else { // The request is denied.
          console.log("request is denied", event);
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
      type: (TARGET.nodeName || '').toLowerCase()
    });
  }, true);
});

if (location.href.indexOf('disconnect.me') + 1) {
  $(function() {
    var CONTROL = document.getElementById('input-type');
    var BUCKET = CONTROL && CONTROL.getAttribute('value');
    BUCKET && EXTENSION.sendRequest({pwyw: true, bucket: BUCKET});

    if (location.href.indexOf('paysomething') + 1) {
      var remindMe = document.getElementById('no');
      var alreadyPaid = document.getElementById('already-paid');
      var emailed = document.getElementById('email');

      remindMe && remindMe.addEventListener('click', function(e) {
        EXTENSION.sendRequest({
          deleteTab: true, 
          pingURL: "https://disconnect.me/cream/no"
        });
      }, false);
      alreadyPaid && alreadyPaid.addEventListener('click', function(e) {
        EXTENSION.sendRequest({pwyw: true, bucket: "already-paid"});
        EXTENSION.sendRequest({
          deleteTab: true, 
          pingURL: "https://disconnect.me/cream/already-paid"
        });
      }, false);
      emailed && emailed.addEventListener('click', function(e) {
        EXTENSION.sendRequest({pwyw: true, bucket: "emailed"});
        EXTENSION.sendRequest({
          deleteTab: true, 
          pingURL: "https://disconnect.me/cream/email-opened"
        });
      }, false);
    }
  });
}
