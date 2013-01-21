/*
  The script for a popup that displays and drives the blocking of requests.

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

/* Outputs major third-party details as per the blocking state. */
function renderShortcut(
  name,
  lowercaseName,
  blocked,
  requestCount,
  control,
  wrappedControl,
  badge,
  text
) {
  if (blocked) {
    wrappedControl.removeClass(DEACTIVATED);
    control.title = UNBLOCK + name;
    badge.src = IMAGES + lowercaseName + EXTENSION;
  } else {
    wrappedControl.addClass(DEACTIVATED);
    control.title = BLOCK + name;
    badge.src = IMAGES + lowercaseName + '-' + DEACTIVATED + EXTENSION;
  }

  text.textContent = requestCount;
}

/* Outputs minor third-party details as per the blocking state. */
function renderCategory(
  name,
  lowercaseName,
  blocked,
  requestCount,
  control,
  wrappedControl,
  badge,
  textName,
  textCount
) {
  if (blocked) {
    wrappedControl.removeClass(DEACTIVATED);
    control.title = UNBLOCK + name;
    badge.src = IMAGES + lowercaseName + EXTENSION;
  } else {
    wrappedControl.addClass(DEACTIVATED);
    control.title = BLOCK + name;
    badge.src = IMAGES + lowercaseName + '-' + DEACTIVATED + EXTENSION;
  }

  textName.text(name);
  textCount.text(requestCount + ' requests');
}

/* The background window. */
const BACKGROUND = chrome.extension.getBackgroundPage();

/* The domain getter. */
const GET = BACKGROUND.GET;

/* The object deserializer. */
const DESERIALIZE = BACKGROUND.deserialize;

/* The major third parties. */
const SHORTCUTS = ['Facebook', 'Google', 'Twitter'];

/* The number of major third parties. */
const SHORTCUT_COUNT = SHORTCUTS.length;

/* The other types of third parties. */
const CATEGORIES = ['Advertising', 'Analytics', 'Content', 'Social'];

/* The number of other types of third parties. */
const CATEGORY_COUNT = CATEGORIES.length;

/* The "tabs" API. */
const TABS = BACKGROUND.TABS;

/* The deactivated keyword. */
const DEACTIVATED = 'deactivated';

/* The input keyword. */
const INPUT = 'input';

/* The blocking command. */
const BLOCK = 'Block ';

/* The unblocking command. */
const UNBLOCK = 'Unblock ';

/* The image directory. */
const IMAGES = '../images/';

/* The image extension. */
const EXTENSION = '.png';

/* Paints the UI. */
(SAFARI ? safari.application : window).addEventListener(
  SAFARI ? 'popover' : 'load', function() {
    const BODY = $('body');
    if (SAFARI) BODY.addClass('safari');

    TABS.query({currentWindow: true, active: true}, function(tabs) {
      const TAB = tabs[0];
      const ID = TAB.id;
      const TAB_REQUESTS = BACKGROUND.REQUEST_COUNTS[ID] || {};
      const DISCONNECT_REQUESTS = TAB_REQUESTS.Disconnect || {};
      const SHORTCUT_SURFACE =
          document.getElementById('shortcuts').getElementsByTagName('td')[0];
      const SHORTCUT_TEMPLATE =
          SHORTCUT_SURFACE.getElementsByClassName('shortcut')[0];
      const DOMAIN = GET(TAB.url);
      const SITE_WHITELIST =
          (DESERIALIZE(localStorage.whitelist) || {})[DOMAIN] || {};

      for (var i = 0; i < SHORTCUT_COUNT; i++) {
        var name = SHORTCUTS[i];
        var lowercaseName = name.toLowerCase();
        var shortcutRequests = DISCONNECT_REQUESTS[name];
        var requestCount = shortcutRequests ? shortcutRequests.count : 0;
        var control =
            SHORTCUT_SURFACE.appendChild(SHORTCUT_TEMPLATE.cloneNode(true));
        var wrappedControl = $(control);
        var badge =
            control.
              getElementsByClassName('badge')[0].
              getElementsByTagName('img')[0];
        var text = control.getElementsByClassName('text')[0];
        renderShortcut(
          name,
          lowercaseName,
          !SITE_WHITELIST[name],
          requestCount,
          control,
          wrappedControl,
          badge,
          text
        );
        badge.alt = name;

        control.onclick = function(
          name,
          lowercaseName,
          requestCount,
          control,
          wrappedControl,
          badge,
          text
        ) {
          const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
          const LOCAL_SITE_WHITELIST =
              WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
          renderShortcut(
            name,
            lowercaseName,
            !(LOCAL_SITE_WHITELIST[name] = !LOCAL_SITE_WHITELIST[name]),
            requestCount,
            control,
            wrappedControl,
            badge,
            text
          );
          localStorage.whitelist = JSON.stringify(WHITELIST);
          TABS.reload(ID);
        }.bind(
          null,
          name,
          lowercaseName,
          requestCount,
          control,
          wrappedControl,
          badge,
          text
        );
      }

      const CATEGORY_SURFACE = $('#categories');
      const CATEGORY_TEMPLATE = CATEGORY_SURFACE.children();
      const SERVICE_TEMPLATE = CATEGORY_TEMPLATE.find('.service');
      var activeServices = $();

      for (i = 0; i < CATEGORY_COUNT; i++) {
        var name = CATEGORIES[i];
        var lowercaseName = name.toLowerCase();
        var categoryRequests = TAB_REQUESTS[name];
        var requestCount = 0;
        var categoryControls = CATEGORY_TEMPLATE.clone(true);
        var wrappedCategoryControl = categoryControls.filter('.category');
        var categoryControl = wrappedCategoryControl[0];
        var serviceSurface = categoryControls.filter('.services').find('tbody');
        var protoBadge = wrappedCategoryControl.find('.badge');
        var badge = protoBadge.find('img')[0];
        var text = wrappedCategoryControl.find('.text');
        var textName = text.find('.name');
        var textCount = text.find('.count');
        var categoryWhitelist = SITE_WHITELIST[name] || {};
        var whitelisted = categoryWhitelist.whitelisted;

        for (var serviceName in categoryRequests) {
          var serviceControl = SERVICE_TEMPLATE.clone(true);
          var checkbox = serviceControl.find(INPUT)[0];
          checkbox.checked =
              !whitelisted && !(categoryWhitelist.services || {})[serviceName];

          checkbox.onclick = function() { this.checked = false; };

          var link = serviceControl.find('a')[0];
          link.title += serviceName;
          var service = categoryRequests[serviceName];
          link.href = service.url;
          $(link).text(serviceName);
          var count = serviceControl.find('.text');
          var serviceCount = service.count;
          count.text(serviceCount + count.text());
          serviceSurface.append(serviceControl);
          requestCount += serviceCount;
        }

        renderCategory(
          name,
          lowercaseName,
          !whitelisted,
          requestCount,
          categoryControl,
          wrappedCategoryControl,
          badge,
          textName,
          textCount
        );
        badge.alt = name;

        protoBadge.add(text).click(function(
          name,
          lowercaseName,
          requestCount,
          categoryControl,
          wrappedCategoryControl,
          badge,
          textName,
          textCount,
          serviceSurface
        ) {
          const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
          const LOCAL_SITE_WHITELIST =
              WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
          const CATEGORY_WHITELIST =
              LOCAL_SITE_WHITELIST[name] || (LOCAL_SITE_WHITELIST[name] = {});
          const BLOCKED = !(
            CATEGORY_WHITELIST.whitelisted = !CATEGORY_WHITELIST.whitelisted
          );
          renderCategory(
            name,
            lowercaseName,
            BLOCKED,
            requestCount,
            categoryControl,
            wrappedCategoryControl,
            badge,
            textName,
            textCount
          );

          serviceSurface.find(INPUT).each(function() {
            this.checked = BLOCKED;
          });

          localStorage.whitelist = JSON.stringify(WHITELIST);
          TABS.reload(ID);
        }.bind(
          null,
          name,
          lowercaseName,
          requestCount,
          categoryControl,
          wrappedCategoryControl,
          badge,
          textName,
          textCount,
          serviceSurface
        ));

        wrappedCategoryControl.find('.action').click(function(serviceSurface) {
          serviceSurface != activeServices &&
              activeServices.filter(':visible').hide();
          activeServices = serviceSurface.toggle();
        }.bind(null, serviceSurface));

        CATEGORY_SURFACE.append(categoryControls);
      }

      $('html').add(BODY).height($(window).height());
    });

    const SEARCH = $('.search ' + INPUT)[0];
    SEARCH.checked = DESERIALIZE(localStorage.searchHardened);

    SEARCH.onclick = function() {
      this.checked =
          localStorage.searchHardened =
              !DESERIALIZE(localStorage.searchHardened);
    };

    const WIFI = $('.wifi ' + INPUT)[0];
    WIFI.checked = DESERIALIZE(localStorage.browsingHardened);

    WIFI.onclick = function() {
      this.checked =
          localStorage.browsingHardened =
              !DESERIALIZE(localStorage.browsingHardened);
    };

    const LINKS = document.getElementsByTagName('a');
    const LINK_COUNT = LINKS.length;

    for (var i = 0; i < LINK_COUNT; i++) LINKS[i].onclick = function() {
      TABS.create({url: this.getAttribute('href')});
      return false;
    };
  }, true
);
