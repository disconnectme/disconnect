/*
  The script for a background page that handles request blocking and the
  visualization thereof.

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

/* Populates an array of a given length with a default value. */
function initializeArray(length, defaultValue) {
  const ARRAY = [];
  for (var i = 0; i < length; i++) ARRAY[i] = defaultValue;
  return ARRAY;
}

/* Destringifies an object. */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

/* Toggles the search preferences. */
function editSettings(state) {
  state = !!state;
  INSTANT_ENABLED.set({value: state});
  SUGGEST_ENABLED.set({value: state});
}

/* Rewrites a generic cookie with specific domains and paths. */
function mapCookie(cookie, storeId, url, domain, subdomains, paths) {
  const MINIMIZE = Math.min;
  const SUBDOMAIN_COUNT = MINIMIZE(subdomains.length, 20);
      // Chrome won't persist more than 22 domains because of cookie limits.
  delete cookie.hostOnly;
  delete cookie.session;
  const DOMAIN = cookie.domain;

  for (var i = 0; i < SUBDOMAIN_COUNT; i++) {
    var subdomain = subdomains[i];
    cookie.url = url.replace('www', subdomain).replace('search', subdomain);
    cookie.domain = subdomain + domain;
    COOKIES.set(cookie);
  }

  const PATH_COUNT = MINIMIZE(paths.length, 10);
      // Chrome won't persist more than 11 paths.
  cookie.domain = DOMAIN;

  for (i = 0; i < PATH_COUNT; i++) {
    var path = paths[i];
    cookie.url = url + path;
    cookie.path = '/' + path;
    COOKIES.set(cookie);
  }

  COOKIES.remove({url: url, name: cookie.name, storeId: storeId});
}

/* Rewrites a batch of generic cookies with specific domains and paths. */
function mapCookies(url, service) {
  COOKIES.getAllCookieStores(function(cookieStores) {
    const STORE_COUNT = cookieStores.length;
    const DOMAIN = '.' + service[1][0];
    const SUBDOMAINS = service[2];
    const PATHS = service[3];

    for (var i = 0; i < STORE_COUNT; i++) {
      var storeId = cookieStores[i].id;

      COOKIES.getAll({url: url, storeId: storeId}, function(cookies) {
        const COOKIE_COUNT = cookies.length;
        for (var j = 0; j < COOKIE_COUNT; j++)
            mapCookie(cookies[j], storeId, url, DOMAIN, SUBDOMAINS, PATHS);
      });
    }
  });
}

/* Erases a batch of cookies. */
function deleteCookies(url, domain, path, storeId, name) {
  const DETAILS = {url: url, storeId: storeId};
  if (name) DETAILS.name = name;

  COOKIES.getAll(DETAILS, function(cookies) {
    const COOKIE_COUNT = cookies.length;

    for (var i = 0; i < COOKIE_COUNT; i++) {
      var cookie = cookies[i];
      if (cookie.domain == domain && cookie.path == path)
          COOKIES.remove(
            {url: url, name: name || cookie.name, storeId: storeId}
          );
    }
  });
}

/* Rewrites a batch of specific cookies with a generic domain and path. */
function reduceCookies(url, service, name) {
  COOKIES.getAllCookieStores(function(cookieStores) {
    const STORE_COUNT = cookieStores.length;
    const SUBDOMAINS = service[2];
    const SUBDOMAIN_COUNT = SUBDOMAINS.length;
    const DOMAIN = '.' + service[1][0];
    const PATHS = service[3];
    const PATH_COUNT = PATHS.length;

    for (var i = 0; i < STORE_COUNT; i++) {
      var storeId = cookieStores[i].id;

      for (var j = 0; j < SUBDOMAIN_COUNT; j++) {
        var subdomain = SUBDOMAINS[j];
        var mappedUrl =
            url.replace('www', subdomain).replace('search', subdomain);

        if (!name && !j) {
          COOKIES.getAll({url: mappedUrl, storeId: storeId}, function(cookies) {
            const COOKIE_COUNT = cookies.length;

            for (var i = 0; i < COOKIE_COUNT; i++) {
              var details = cookies[i];
              details.url = url;
              details.domain = DOMAIN;
              delete details.hostOnly;
              delete details.session;

              setTimeout(function(details) {
                COOKIES.set(details);
              }.bind(null, details), 1000);
            }
          });
        }

        deleteCookies(mappedUrl, '.' + subdomain + DOMAIN, '/', storeId, name);
      }

      for (j = 0; j < PATH_COUNT; j++) {
        var path = PATHS[j];
        deleteCookies(url + path, DOMAIN, '/' + path, storeId, name);
      }
    }
  });
}

/* Preps the browser action. */
function initializeToolbar() {
  BROWSER_ACTION.setBadgeBackgroundColor({color: [85, 144, 210, 255]});
  const DETAILS = {popup: (SAFARI ? 'chrome' : '') + '/markup/popup.html'};

  if (SAFARI) {
    DETAILS.width = 148;
    DETAILS.height = 210;
  }

  BROWSER_ACTION.setPopup(DETAILS);
}

/* Tallies and indicates the number of blocked requests. */
function incrementCounter(tabId, serviceIndex, blocked) {
  const TAB_BLOCKED_COUNTS =
      BLOCKED_COUNTS[tabId] ||
          (BLOCKED_COUNTS[tabId] =
              [0, initializeArray(0, 0), initializeArray(0, null)]);
  const TAB_BLOCKED_COUNT = ++TAB_BLOCKED_COUNTS[0];
  TAB_BLOCKED_COUNTS[1][serviceIndex]++;
  TAB_BLOCKED_COUNTS[2][serviceIndex] = blocked;

  if (deserialize(localStorage.blockingIndicated)) {
    !blocked && BROWSER_ACTION.setBadgeBackgroundColor({
      tabId: tabId,
      color: [136, 136, 136, 255]
    });
    BROWSER_ACTION.setBadgeText({tabId: tabId, text: TAB_BLOCKED_COUNT + ''});
  }
}

/* The current build number. */
const CURRENT_BUILD = 31;

/* The previous build number. */
const PREVIOUS_BUILD = localStorage.build;

/* The domain name of the tabs. */
const DOMAINS = {};

/* The ID of redirected requests. */
const REDIRECTS = {};

/* The number of blocked requests per tab, overall and by third party. */
const BLOCKED_COUNTS = {};

/* The "tabs" API. */
const TABS = chrome.tabs;

/* The "privacy" API. */
const PRIVACY = chrome.privacy.services;

/* The "cookies" API. */
const COOKIES = chrome.cookies;

/* The "browserAction" API. */
const BROWSER_ACTION = chrome.browserAction;

/* The "instantEnabled" property. */
const INSTANT_ENABLED = PRIVACY.instantEnabled;

/* The "searchSuggestEnabled" property. */
const SUGGEST_ENABLED = PRIVACY.searchSuggestEnabled;

/* The experimental value of the "levelOfControl" property. */
const EDITABLE = 'controllable_by_this_extension';

/* The domain object. */
const SITENAME = new Sitename;

/* The domain getter. */
const GET = SITENAME.get;

if (!PREVIOUS_BUILD) localStorage.blockingIndicated = true;
if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 26) localStorage.blogOpened = true;

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < CURRENT_BUILD) {
  localStorage.browsingHardened = true;
  localStorage.searchHardened = true;
  localStorage.build = CURRENT_BUILD;
}

delete localStorage.settingsEditable;

INSTANT_ENABLED.get({}, function(details) {
  details.levelOfControl == EDITABLE &&
      SUGGEST_ENABLED.get({}, function(details) {
        if (details.levelOfControl == EDITABLE)
            localStorage.settingsEditable = true;
      });
});

deserialize(localStorage.settingsEditable) &&
    deserialize(localStorage.searchHardened) && editSettings();
if (!deserialize(localStorage.blogOpened))
    BROWSER_ACTION.setBadgeText({text: 'NEW!'});
else initializeToolbar();

/* Prepopulates the store of tab domain names. */
TABS.query({}, function(tabs) {
  const TAB_COUNT = tabs.length;

  for (var i = 0; i < TAB_COUNT; i++) {
    var tab = tabs[i];
    DOMAINS[tab.id] = GET(tab.url);
  }
});

/* Traps and selectively cancels or redirects a request. */
chrome.webRequest.onBeforeRequest.addListener(function(details) {
  const PARENT = details.type == 'main_frame';
  const TAB_ID = details.tabId;
  const REQUESTED_URL = details.url;
  const CHILD_DOMAIN = GET(REQUESTED_URL);
  if (PARENT) DOMAINS[TAB_ID] = CHILD_DOMAIN;
  const PARENT_DOMAIN = DOMAINS[TAB_ID];
  var childService;
  if (!PARENT && CHILD_DOMAIN != PARENT_DOMAIN)
      childService = getService(CHILD_DOMAIN);
  var hardenedUrl = {};

  indication: if (childService) {
    const PARENT_SERVICE = getService(PARENT_DOMAIN);

    if (PARENT_SERVICE && childService.name == PARENT_SERVICE.name) {
      childService = false;
      break indication;
    }

    if (childService.category == 'Content') childService = false;
    else hardenedUrl = {url: 'about:blank', hardened: true};
    deserialize(localStorage.blockingIndicated) &&
        deserialize(localStorage.blogOpened) &&
            incrementCounter(TAB_ID, 5, true);
  } else hardenedUrl = harden(REQUESTED_URL);

  const REQUEST_ID = details.requestId;
  const HARDENED = hardenedUrl.hardened && !REDIRECTS[REQUEST_ID];
  var blockingResponse = {cancel: !!childService};

  if (HARDENED) {
    REDIRECTS[REQUEST_ID] = true;
    blockingResponse = {redirectUrl: hardenedUrl.url};
  }

  return blockingResponse;
}, {urls: ['http://*/*', 'https://*/*']}, ['blocking']);

/* Resets the number of tracking requests for a tab. */
chrome.webNavigation.onCommitted.addListener(function(details) {
  const TAB_ID = details.tabId;

  if (!details.frameId) {
    delete BLOCKED_COUNTS[TAB_ID];
    deserialize(localStorage.blockingIndicated) &&
        deserialize(localStorage.blogOpened) &&
            BROWSER_ACTION.setBadgeText({tabId: TAB_ID, text: ''});
  }
});

/* Builds a block list or adds to the number of blocked requests. */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  const TAB = sender.tab;

  if (request.initialized) {
    const URL = TAB.url;
    const BLACKLIST = [];
    const SITE_WHITELIST =
        (deserialize(localStorage.whitelist) || {})[GET(URL)] || {};

    for (var i = 0; i < 0; i++) {
      var service = [];
      BLACKLIST[i] = [service[1], !!service[2], !SITE_WHITELIST[service[0]]];
    }

    sendResponse({url: URL, blacklist: BLACKLIST});
  } else {
    SAFARI && deserialize(localStorage.blockingIndicated) &&
        incrementCounter(TAB.id, request.serviceIndex, request.blocked);
    sendResponse({});
  }
});

/* Loads the blog promo. */
!SAFARI && BROWSER_ACTION.onClicked.addListener(function() {
  if (!deserialize(localStorage.blogOpened)) {
    TABS.create({url: 'https://blog.disconnect.me/new-versions-of-disconnect'});
    BROWSER_ACTION.setBadgeText({text: ''});
    initializeToolbar();
    localStorage.blogOpened = true;
  }
});
