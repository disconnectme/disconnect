/*
  A content script that blocks requests to blacklisted domains.

  Copyright 2010-2012 Disconnect, Inc.

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

/* Picks out which of a bucket of domains is part of a URL, regex free. */
function index(url, services) {
  const SERVICE_COUNT = services.length;

  services:
  for (var i = 0; i < SERVICE_COUNT; i++) {
    var domains = services[i][0];
    var domainCount = domains.length;
    for (var j = 0; j < domainCount; j++)
        if (url.toLowerCase().indexOf(domains[j], 7) >= 7) break services;
            // An OK URL has seven-plus characters ("http://"), then the domain.
  }

  return i < SERVICE_COUNT ? i : -1;
}

/* The "extension" API. */
const EXTENSION = chrome.extension;

/* Traps and selectively cancels a request and messages such. */
EXTENSION.sendRequest({initialized: true}, function(response) {
  const BLACKLIST = response.blacklist;
  var serviceIndex;
  if ((serviceIndex = index(response.url, BLACKLIST)) >= 0)
      BLACKLIST.splice(serviceIndex, 1);
  const SERVICE_COUNT = BLACKLIST.length;

  for (var i = 0; i < SERVICE_COUNT; i++) {
    var service = BLACKLIST[i];
    if (service[1]) service[0].splice(0, 1);
  }

  document.addEventListener('beforeload', function(event) {
    if ((serviceIndex = index(event.url, BLACKLIST)) >= 0) {
      const BLOCKED = BLACKLIST[serviceIndex][2];

      if (BLOCKED) {
        SAFARI && event.preventDefault();
        event.target.className = 'disconnect-collapsed';
      }

      EXTENSION.sendRequest({serviceIndex: serviceIndex, blocked: BLOCKED});
    }
  }, true);
});
