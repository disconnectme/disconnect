/*
  The script for a popup that displays and drives the blocking of requests.

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

/* Outputs third-party details as per the blocking state. */
function renderService(
  name, lowercaseName, blocked, requestCount, control, badge, text
) {
  if (blocked) {
    control.title = 'Unblock ' + name;
    badge.src = IMAGES + lowercaseName + '-activated.png';
    text.removeAttribute('class');
    text.textContent = requestCount + ' blocked';
  } else {
    control.title = 'Block ' + name;
    badge.src = IMAGES + lowercaseName + '-deactivated.png';
    text.className = 'deactivated';
    text.textContent = requestCount + ' unblocked';
  }
}

/* The background window. */
const BACKGROUND = chrome.extension.getBackgroundPage();

/* The domain getter. */
const GET = BACKGROUND.GET;

/* The object deserializer. */
const DESERIALIZE = BACKGROUND.deserialize;

/* The third parties. */
const SERVICES = ['Facebook', 'Google', 'LinkedIn', 'Twitter', 'Yahoo'];

/* The number of third parties. */
const SERVICE_COUNT = SERVICES.length;

/* The "tabs" API. */
const TABS = BACKGROUND.TABS;

/* The image directory. */
const IMAGES = '../images/';

/* Paints the UI. */
(SAFARI ? safari.application : window).addEventListener(
  SAFARI ? 'popover' : 'load', function() {
    if (SAFARI) document.getElementsByTagName('body')[0].className = 'safari';

    TABS.query({currentWindow: true, active: true}, function(tabs) {
      const TAB = tabs[0];
      const ID = TAB.id;
      const CATEGORY_REQUESTS =
          (BACKGROUND.REQUEST_COUNTS[ID] || {}).Disconnect || {};
      const SURFACE = document.getElementsByTagName('tbody')[0];
      const TEMPLATE = SURFACE.getElementsByTagName('tr')[0];
      var expiredControl;
      while (expiredControl = TEMPLATE.nextSibling)
          SURFACE.removeChild(expiredControl);
      const DOMAIN = GET(TAB.url);

      for (var i = 0; i < SERVICE_COUNT; i++) {
        var name = SERVICES[i];
        var lowercaseName = name.toLowerCase();
        var serviceRequests = CATEGORY_REQUESTS[name];
        var requestCount = serviceRequests ? serviceRequests.count : 0;
        var control = SURFACE.appendChild(TEMPLATE.cloneNode(true));
        var badge = control.getElementsByTagName('img')[0];
        var text = control.getElementsByTagName('td')[1];
        renderService(
          name,
          lowercaseName,
          !((DESERIALIZE(localStorage.whitelist) || {})[DOMAIN] || {})[name],
          requestCount,
          control,
          badge,
          text
        );
        badge.alt = name;

        control.onmouseover = function() { this.className = 'mouseover'; };

        control.onmouseout = function() { this.removeAttribute('class'); };

        control.onclick = function(
          name, lowercaseName, requestCount, control, badge, text
        ) {
          const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
          const SITE_WHITELIST = WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
          renderService(
            name,
            lowercaseName,
            !(SITE_WHITELIST[name] = !SITE_WHITELIST[name]),
            requestCount,
            control,
            badge,
            text
          );
          localStorage.whitelist = JSON.stringify(WHITELIST);
          TABS.reload(ID);
        }.bind(null, name, lowercaseName, requestCount, control, badge, text);
      }
    });

    if (DESERIALIZE(localStorage.searchHardenable)) {
      document.getElementById('search').className = 'shown';
      const CHECKBOX = document.getElementsByTagName('input')[0];
      CHECKBOX.checked = DESERIALIZE(localStorage.searchHardened);

      CHECKBOX.onclick = function() {
        CHECKBOX.checked =
            localStorage.searchHardened =
                !DESERIALIZE(localStorage.searchHardened);
      };
    }

    const LINKS = document.getElementsByTagName('a');
    const LINK_COUNT = LINKS.length;

    for (var i = 0; i < LINK_COUNT; i++) LINKS[i].onclick = function() {
      TABS.create({url: this.getAttribute('href')});
      return false;
    };
  }, true
);
