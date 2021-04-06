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
          deleteTab: true
        });
      }, false);
      alreadyPaid && alreadyPaid.addEventListener('click', function(e) {
        EXTENSION.sendRequest({pwyw: true, bucket: "already-paid"});
        EXTENSION.sendRequest({
          deleteTab: true
        });
      }, false);
      emailed && emailed.addEventListener('click', function(e) {
        EXTENSION.sendRequest({pwyw: true, bucket: "emailed"});
        EXTENSION.sendRequest({
          deleteTab: true
        });
      }, false);
    }
  });
}
