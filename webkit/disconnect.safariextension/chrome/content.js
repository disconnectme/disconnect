/*
  A content script that blocks requests to blacklisted domains.

  Copyright 2010 Brian Kennish

  Licensed under the Apache License, Version 2.0 (the "License"); you may not
  use this file except in compliance with the License. You may obtain a copy of
  the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
  License for the specific language governing permissions and limitations under
  the License.

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
  if ((serviceIndex = index(location.href, BLACKLIST)) >= 0)
      BLACKLIST.splice(serviceIndex, 1);
  const SERVICE_COUNT = BLACKLIST.length;

  for (var i = 0; i < SERVICE_COUNT; i++) {
    var service = BLACKLIST[i];
    if (service[1]) service[0].splice(0, 1);
  }

  document.addEventListener('beforeload', function(event) {
    if ((serviceIndex = index(event.url, BLACKLIST)) >= 0) {
      event.preventDefault();
      EXTENSION.sendRequest({serviceIndex: serviceIndex});
    }
  }, true);
});
