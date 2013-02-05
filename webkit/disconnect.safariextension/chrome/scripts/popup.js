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

/* Refreshes major third-party details. */
function updateShortcut(id, name, count) {
  TABS.query({currentWindow: true, active: true}, function(tabs) {
    if (id == tabs[0].id) {
      const DISCONNECT_LIVE =
          LIVE_REQUESTS.Disconnect || (LIVE_REQUESTS.Disconnect = {});
      DISCONNECT_LIVE[name] === undefined && (DISCONNECT_LIVE[name] = 0);

      setTimeout(function() {
        $($('.shortcut .text')[SHORTCUTS.indexOf(name) + 1]).text(count);
      }, DISCONNECT_LIVE[name]++ * 50);
    }
  });
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
  badgeIcon,
  text,
  textName,
  textCount
) {
  if (blocked) {
    wrappedControl.removeClass(DEACTIVATED);
    text.title =
        badge.title =
            UNBLOCK + lowercaseName +
                (name == CONTENT_NAME ? ' (' + RECOMMENDED + ')' : '');
    badgeIcon.src = IMAGES + lowercaseName + EXTENSION;
  } else {
    wrappedControl.addClass(DEACTIVATED);
    text.title =
        badge.title =
            BLOCK + lowercaseName +
                (name == CONTENT_NAME ? ' (not ' + RECOMMENDED + ')' : '');
    badgeIcon.src = IMAGES + lowercaseName + '-' + DEACTIVATED + EXTENSION;
  }

  textName.text(name);
  textCount.text(requestCount + REQUEST + (requestCount - 1 ? 's' : ''));
}

/* Refreshes minor third-party details. */
function updateCategory(
  id, categoryName, categoryCount, serviceName, serviceCount
) {
  TABS.query({currentWindow: true, active: true}, function(tabs) {
    if (id == tabs[0].id) {
      const CATEGORY_LIVE =
          LIVE_REQUESTS[categoryName] || (LIVE_REQUESTS[categoryName] = {});
      CATEGORY_LIVE[serviceName] === undefined &&
          (CATEGORY_LIVE[serviceName] = 0);
      const INDEX = CATEGORIES.indexOf(categoryName) + 1;

      setTimeout(function() {
        $($('.category .count')[INDEX]).
          text(categoryCount + REQUEST + (categoryCount - 1 ? 's' : ''));
      }, CATEGORY_LIVE[serviceName]++ * 50);
    }
  });
}

/* Picks a random animation path. */
function getScene() {
  return SCENES.splice(Math.floor(Math.random() * SCENES.length), 1)[0];
}

/* Plays a random animation. */
function animate(icon, callback) {
  for (var i = 0; i < FRAME_COUNT - 1; i++)
      setTimeout(function(scene, index) {
        icon.src = IMAGES + scene + '/' + (index + 2) + EXTENSION;
      }, i * FRAME_LENGTH, currentScene, i);
  const PREVIOUS_SCENE = currentScene;
  currentScene = getScene();
  SCENES.push(PREVIOUS_SCENE);
  for (i = 0; i < FRAME_COUNT; i++)
      setTimeout(function(scene, index) {
        icon.src = IMAGES + scene + '/' + (FRAME_COUNT - index) + EXTENSION;
        index == FRAME_COUNT - 1 && callback && callback();
      }, (i + FRAME_COUNT - 1) * FRAME_LENGTH, currentScene, i);
}

/* Restricts the animation to 1x per mouseover. */
function handleHover() {
  const ELEMENT = $(this);
  ELEMENT.off('mouseenter');

  animate(ELEMENT.find('img')[0], function() {
    ELEMENT.mouseenter(handleHover);
  });
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

/* The content key. */
const CONTENT_NAME = BACKGROUND.CONTENT_NAME;

/* The standard keyword. */
const STANDARD = 'standard';

/* The graph keyword. */
const GRAPH = 'graph';

/* The deactivated keyword. */
const DEACTIVATED = 'deactivated';

/* The recommended keyword. */
const RECOMMENDED = 'recommended';

/* The request keyword. */
const REQUEST = ' request';

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

/* The animation sequences. */
const SCENES = [1, 2, 3, 4, 5];

/* The number of animation cells. */
const FRAME_COUNT = 7;

/* The duration of animation cells. */
const FRAME_LENGTH = 100;

/* The number of request updates. */
const LIVE_REQUESTS = {};

/* The active animation sequence. */
var currentScene = getScene();

/* Paints the UI. */
(SAFARI ? safari.application : window).addEventListener(
  SAFARI ? 'popover' : 'load', function() {
    const BODY = $('body');
    if (SAFARI) BODY.addClass('safari');
    var activeServices = $();

    TABS.query({currentWindow: true, active: true}, function(tabs) {
      const TAB = tabs[0];
      const DOMAIN = domain = GET(TAB.url);
      const ID = tabId = TAB.id;
      const TAB_REQUESTS = BACKGROUND.REQUEST_COUNTS[ID] || {};
      const DISCONNECT_REQUESTS = TAB_REQUESTS.Disconnect || {};
      const SHORTCUT_SURFACE =
          document.getElementById('shortcuts').getElementsByTagName('td')[0];
      const SHORTCUT_TEMPLATE =
          SHORTCUT_SURFACE.getElementsByClassName('shortcut')[0];
      const SITE_WHITELIST =
          (DESERIALIZE(localStorage.whitelist) || {})[DOMAIN] || {};
      const SHORTCUT_WHITELIST =
          (SITE_WHITELIST.Disconnect || {}).services || {};

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
          !SHORTCUT_WHITELIST[name],
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
          const DISCONNECT_WHITELIST =
              LOCAL_SITE_WHITELIST.Disconnect ||
                  (LOCAL_SITE_WHITELIST.Disconnect =
                      {whitelisted: false, services: {}});
          const LOCAL_SHORTCUT_WHITELIST =
              DISCONNECT_WHITELIST.services ||
                  (DISCONNECT_WHITELIST.services = {});
          renderShortcut(
            name,
            lowercaseName,
            !(LOCAL_SHORTCUT_WHITELIST[name] = !LOCAL_SHORTCUT_WHITELIST[name]),
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
      const SITE_BLACKLIST =
          (DESERIALIZE(localStorage.blacklist) || {})[DOMAIN] || {};

      for (i = 0; i < CATEGORY_COUNT; i++) {
        var name = CATEGORIES[i];
        var lowercaseName = name.toLowerCase();
        var categoryRequests = TAB_REQUESTS[name];
        var requestCount = 0;
        var categoryControls = CATEGORY_TEMPLATE.clone(true);
        var wrappedCategoryControl = categoryControls.filter('.category');
        var categoryControl = wrappedCategoryControl[0];
        var serviceContainer = categoryControls.filter('.services').find('div');
        var serviceSurface = serviceContainer.find('tbody');
        var wrappedBadge = wrappedCategoryControl.find('.badge');
        var badge = wrappedBadge[0];
        var badgeIcon = wrappedBadge.find('img')[0];
        var wrappedText = wrappedCategoryControl.find('.text');
        var text = wrappedText[0];
        var textName = wrappedText.find('.name');
        var textCount = wrappedText.find('.count');
        var categoryWhitelist = SITE_WHITELIST[name] || {};
        var whitelisted = categoryWhitelist.whitelisted;
        var categoryBlacklist = SITE_BLACKLIST[name] || {};

        for (var serviceName in categoryRequests) {
          var serviceControl = SERVICE_TEMPLATE.clone(true);
          var checkbox = serviceControl.find(INPUT)[0];
          checkbox.checked =
              !whitelisted && !(categoryWhitelist.services || {})[serviceName]
                  || categoryBlacklist[serviceName];

          checkbox.onclick = function(name, serviceName) {
            const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
            const LOCAL_SITE_WHITELIST =
                WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
            const CATEGORY_WHITELIST =
                LOCAL_SITE_WHITELIST[name] ||
                    (LOCAL_SITE_WHITELIST[name] =
                        {whitelisted: false, services: {}});
            const SERVICE_WHITELIST = CATEGORY_WHITELIST.services;
            const BLACKLIST = DESERIALIZE(localStorage.blacklist) || {};
            const LOCAL_SITE_BLACKLIST =
                BLACKLIST[DOMAIN] || (BLACKLIST[DOMAIN] = {});
            const CATEGORY_BLACKLIST =
                LOCAL_SITE_BLACKLIST[name] || (LOCAL_SITE_BLACKLIST[name] = {});
            this.checked =
                SERVICE_WHITELIST[serviceName] =
                    !(CATEGORY_BLACKLIST[serviceName] =
                        SERVICE_WHITELIST[serviceName]);
            localStorage.whitelist = JSON.stringify(WHITELIST);
            localStorage.blacklist = JSON.stringify(BLACKLIST);
            TABS.reload(ID);
          }.bind(null, name, serviceName);

          var link = serviceControl.find('a')[0];
          link.title += serviceName;
          var service = categoryRequests[serviceName];
          link.href = service.url;
          $(link).text(serviceName);
          var serviceCount = service.count;
          serviceControl.
            find('.text').
            text(serviceCount + REQUEST + (serviceCount - 1 ? 's' : ''));
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
          badgeIcon,
          text,
          textName,
          textCount
        );
        badge.alt = name;

        wrappedBadge.add(wrappedText).click(function(
          name,
          lowercaseName,
          requestCount,
          categoryControl,
          wrappedCategoryControl,
          badge,
          badgeIcon,
          text,
          textName,
          textCount,
          serviceSurface
        ) {
          const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
          const LOCAL_SITE_WHITELIST =
              WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
          const CATEGORY_WHITELIST =
              LOCAL_SITE_WHITELIST[name] ||
                  (LOCAL_SITE_WHITELIST[name] =
                      {whitelisted: false, services: {}});
          const SERVICE_WHITELIST = CATEGORY_WHITELIST.services;
          const WHITELISTED =
              CATEGORY_WHITELIST.whitelisted = !CATEGORY_WHITELIST.whitelisted;
          const BLACKLIST = DESERIALIZE(localStorage.blacklist) || {};
          const LOCAL_SITE_BLACKLIST =
              BLACKLIST[DOMAIN] || (BLACKLIST[DOMAIN] = {});
          const CATEGORY_BLACKLIST =
              LOCAL_SITE_BLACKLIST[name] || (LOCAL_SITE_BLACKLIST[name] = {});
          for (var serviceName in SERVICE_WHITELIST)
              SERVICE_WHITELIST[serviceName] = WHITELISTED;
          for (var serviceName in CATEGORY_BLACKLIST)
              CATEGORY_BLACKLIST[serviceName] = !WHITELISTED;
          localStorage.whitelist = JSON.stringify(WHITELIST);
          localStorage.blacklist = JSON.stringify(BLACKLIST);
          renderCategory(
            name,
            lowercaseName,
            !WHITELISTED,
            requestCount,
            categoryControl,
            wrappedCategoryControl,
            badge,
            badgeIcon,
            text,
            textName,
            textCount
          );

          serviceSurface.find(INPUT).each(function(index) {
            if (index) this.checked = !WHITELISTED;
          });

          TABS.reload(ID);
        }.bind(
          null,
          name,
          lowercaseName,
          requestCount,
          categoryControl,
          wrappedCategoryControl,
          badge,
          badgeIcon,
          text,
          textName,
          textCount,
          serviceSurface
        ));

        var action = wrappedCategoryControl.find('.action');
        action[0].title += lowercaseName;

        action.click(function(serviceContainer) {
          const EXPANDED_SERVICES = activeServices.filter(':visible');
          if (EXPANDED_SERVICES.length && serviceContainer != activeServices)
              EXPANDED_SERVICES.slideUp('fast', function() {
                activeServices = serviceContainer.slideToggle('fast');
              });
          else activeServices = serviceContainer.slideToggle('fast');
        }.bind(null, serviceContainer));

        CATEGORY_SURFACE.append(categoryControls);
      }

      $('html').add(BODY).height($(window).height());
    });

    const LINKS = document.getElementsByTagName('a');
    const LINK_COUNT = LINKS.length;

    for (var i = 0; i < LINK_COUNT; i++) LINKS[i].onclick = function() {
      TABS.create({url: this.getAttribute('href')});
      return false;
    };

    $('.whitelist table').click(function() { whitelistSite(); });

    const VISUALIZATION = $('.visualization table');

    VISUALIZATION.click(function() {
      localStorage.displayMode = GRAPH;

      $('#' + STANDARD).fadeOut('fast', function() {
        activeServices.hide();
        $(".live-data").show();
        renderGraph();
        $('#' + GRAPH).fadeIn('slow');
      });
    });

    const ICON = VISUALIZATION.find('img')[0];
    ICON.src = IMAGES + currentScene + '/1' + EXTENSION;
    ICON.alt = 'Graph';

    const WIFI = $('.wifi ' + INPUT)[0];
    WIFI.checked = DESERIALIZE(localStorage.browsingHardened);

    WIFI.onclick = function() {
      this.checked =
          localStorage.browsingHardened =
              !DESERIALIZE(localStorage.browsingHardened);
    };

    const SEARCH = $('.search ' + INPUT)[0];
    SEARCH.checked = DESERIALIZE(localStorage.searchHardened);

    SEARCH.onclick = function() {
      this.checked =
          localStorage.searchHardened =
              !DESERIALIZE(localStorage.searchHardened);
    };

    const DISPLAY_MODE = localStorage.displayMode;
    DISPLAY_MODE == GRAPH && renderGraph();

    $('#' + DISPLAY_MODE).fadeIn('slow', function() {
      DISPLAY_MODE == STANDARD && animate(ICON, function() {
        VISUALIZATION.mouseenter(handleHover);
      });
    });
  }, true
);
