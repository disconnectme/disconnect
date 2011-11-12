/*
  The script for a popup that displays and drives the blocking of requests.

  Copyright 2010, 2011 Brian Kennish

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

/* Outputs third-party or search details according to the blocking state. */
function renderService(
  name, lowercaseName, blocked, requestCount, control, badge, text
) {
  if (blocked) {
    control.title = 'Unblock ' + name;
    badge.src =
        lowercaseName + (requestCount ? '-blocked.png' : '-activated.png');
    text.removeAttribute('class');
  } else {
    control.title = 'Block ' + name;
    badge.src = lowercaseName + '-deactivated.png';
    text.className = 'deactivated';
  }
}

/* The background window. */
const BACKGROUND = chrome.extension.getBackgroundPage();

/* The initialization function for arrays. */
const INITIALIZE_ARRAY = BACKGROUND.initializeArray;

/* The deserialization function. */
const DESERIALIZE = BACKGROUND.deserialize;

/* The third parties and search engines. */
const SERVICES = BACKGROUND.SERVICES;

/* The number of third parties and search engines. */
const SERVICE_COUNT = BACKGROUND.SERVICE_COUNT;

/* The suffix of the blocking key. */
const BLOCKED_NAME = BACKGROUND.BLOCKED_NAME;

/* Paints the UI. */
onload = function() {
  chrome.tabs.getSelected(null, function(tab) {
    const TAB_REQUEST_COUNTS = BACKGROUND.REQUEST_COUNTS[tab.id];
    var serviceRequestCounts;
    var servicesBlocked;

    if (TAB_REQUEST_COUNTS) {
      serviceRequestCounts = TAB_REQUEST_COUNTS[2];
      servicesBlocked = TAB_REQUEST_COUNTS[3];
    } else {
      serviceRequestCounts = INITIALIZE_ARRAY(SERVICE_COUNT, 0);
      servicesBlocked = INITIALIZE_ARRAY(SERVICE_COUNT, true);
    }

    const SURFACE = document.getElementsByTagName('tbody')[0];

    for (var i = 0; i < SERVICE_COUNT; i++) {
      var service = SERVICES[i];
      var name = service[0];
      var lowercaseName = name.toLowerCase();
      var blockedName = lowercaseName + BLOCKED_NAME;
      var requestCount = serviceRequestCounts[i];
      var control =
          SURFACE.appendChild(
            SURFACE.getElementsByTagName('tr')[0].cloneNode(true)
          );
      var badge = control.getElementsByTagName('img')[0];
      var text = control.getElementsByTagName('td')[1];
      renderService(
        name,
        lowercaseName,
        DESERIALIZE(localStorage[blockedName]),
        requestCount,
        control,
        badge,
        text
      );
      badge.alt = name;
      text.textContent =
          requestCount + (servicesBlocked[i] ? ' blocked' : ' unblocked');

      control.onmouseover = function() { this.className = 'mouseover'; };

      control.onmouseout = function() { this.removeAttribute('class'); };

      control.onclick = function(
        service,
        name,
        lowercaseName,
        blockedName,
        requestCount,
        control,
        badge,
        text
      ) {
        const URL = service[4];
        const BLOCKED =
            localStorage[blockedName] = !DESERIALIZE(localStorage[blockedName]);

        if (DESERIALIZE(localStorage.searchDepersonalized) && URL) {
          if (BLOCKED) BACKGROUND.mapCookies(URL, service);
          else BACKGROUND.reduceCookies(URL, service);
        }

        renderService(
          name, lowercaseName, BLOCKED, requestCount, control, badge, text
        );
      }.bind(
        null,
        service,
        name,
        lowercaseName,
        blockedName,
        requestCount,
        control,
        badge,
        text
      );
    }

    const CHECKBOX = document.getElementsByTagName('input')[0];
    CHECKBOX.checked = DESERIALIZE(localStorage.searchDepersonalized);

    CHECKBOX.onchange = function() {
      const DEPERSONALIZED = localStorage.searchDepersonalized = this.checked;

      for (var i = 0; i < SERVICE_COUNT; i++) {
        var service = SERVICES[i];
        var url = service[4];

        if (
          url &&
              DESERIALIZE(localStorage[service[0].toLowerCase() + BLOCKED_NAME])
        ) {
          if (DEPERSONALIZED) BACKGROUND.mapCookies(url, service);
          else BACKGROUND.reduceCookies(url, service);
        }
      }
    };
  });
};
