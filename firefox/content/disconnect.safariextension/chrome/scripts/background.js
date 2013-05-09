/*
  The script for a background page that handles request blocking and the
  visualization thereof.

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
  BROWSER_ACTION.setBadgeBackgroundColor({
    color:
        localStorage.displayMode == LEGACY_NAME ? [85, 144, 210, 255] :
            [0, 186, 77, 255]
  });
  const DETAILS = {popup: (SAFARI ? 'chrome' : '') + '/markup/popup.html'};

  if (SAFARI) {
    DETAILS.width = 148;
    DETAILS.height = 210;
  }

  BROWSER_ACTION.setPopup(DETAILS);
}

/* Tallies the number of tracking requests. */
function getCount(tabRequests) {
  var count = 0;

  for (var categoryName in tabRequests) {
    var category = tabRequests[categoryName];
    for (var serviceName in category) count += category[serviceName].count;
  }

  return count;
}

/* Indicates the number of tracking requests. */
function updateCounter(tabId, count, deactivated) {
  if (
    deserialize(localStorage.blockingIndicated) &&
        deserialize(localStorage.blogOpened) &&
            (deserialize(localStorage.pwyw) || {}).bucket != 'pending'
  ) {
    deactivated && BROWSER_ACTION.setBadgeBackgroundColor({
      tabId: tabId,
      color:
          localStorage.displayMode == LEGACY_NAME ? [136, 136, 136, 255] :
              [93, 93, 93, 255]
    });

    setTimeout(function() {
      BROWSER_ACTION.setBadgeText({tabId: tabId, text: (count || '') + ''});
    }, count * 50);
  }
}

/* Indicates the number of tracking requests, if the tab is rendered. */
function safelyUpdateCounter(tabId, count, deactivated) {
  TABS.query({}, function(tabs) {
    const TAB_COUNT = tabs.length;

    for (var i = 0; i < TAB_COUNT; i++) {
      if (tabId == tabs[i].id) {
        updateCounter(tabId, count, deactivated);
        break;
      }
    }
  });
}

/* Tallies and indicates the number of tracking requests. */
function incrementCounter(tabId, service, blocked, popup) {
  const TAB_REQUESTS = REQUEST_COUNTS[tabId] || (REQUEST_COUNTS[tabId] = {});
  const CATEGORY = service.category;
  const CATEGORY_REQUESTS =
      TAB_REQUESTS[CATEGORY] || (TAB_REQUESTS[CATEGORY] = {});
  const SERVICE = service.name;
  const SERVICE_URL = service.url;
  const SERVICE_REQUESTS =
      CATEGORY_REQUESTS[SERVICE] ||
          (CATEGORY_REQUESTS[SERVICE] = {url: SERVICE_URL, count: 0});
  const SERVICE_COUNT = ++SERVICE_REQUESTS.count;
  safelyUpdateCounter(tabId, getCount(TAB_REQUESTS), !blocked);

  if (popup)
      if (CATEGORY == 'Disconnect')
          popup.updateShortcut(tabId, SERVICE, SERVICE_COUNT);
      else {
        var categoryCount = 0;
        for (var name in CATEGORY_REQUESTS)
            categoryCount += CATEGORY_REQUESTS[name].count;
        popup.updateCategory(
          tabId, CATEGORY, categoryCount, SERVICE, SERVICE_URL, SERVICE_COUNT
        );
      }
}

/* The current build number. */
const CURRENT_BUILD = 44;

/* The previous build number. */
const PREVIOUS_BUILD = localStorage.build;

/* The domain name of the tabs. */
const DOMAINS = {};

/* The blacklisted services per domain name. */
const BLACKLIST = deserialize(localStorage.blacklist) || {};

/* The previous requested URL of the tabs. */
const REQUESTS = {};

/* The previous redirected URL of the tabs. */
const REDIRECTS = {};

/* The number of tracking requests per tab, overall and by third party. */
const REQUEST_COUNTS = {};

/* The number of total, blocked, and secured requests per tab. */
const DASHBOARD = {};

/* The Collusion data structure. */
const LOG = {};

/* The content key. */
const CONTENT_NAME = 'Content';

/* The list value. */
const LIST_NAME = 'list';

/* The graph value. */
const GRAPH_NAME = 'graph';

/* The legacy value. */
const LEGACY_NAME = 'legacy';

/* The "extension" API. */
const EXTENSION = chrome.extension;

/* The "tabs" API. */
const TABS = chrome.tabs;

/* The "privacy" API. */
if (false) const PRIVACY = chrome.privacy.services;

/* The "cookies" API. */
const COOKIES = chrome.cookies;

/* The "browserAction" API. */
const BROWSER_ACTION = chrome.browserAction;

/* The "instantEnabled" property. */
if (false) const INSTANT_ENABLED = PRIVACY.instantEnabled;

/* The "searchSuggestEnabled" property. */
if (false) const SUGGEST_ENABLED = PRIVACY.searchSuggestEnabled;

/* The experimental value of the "levelOfControl" property. */
const EDITABLE = 'controllable_by_this_extension';

/* The domain object. */
const SITENAME = new Sitename;

/* The domain initialization. */
const IS_INITIALIZED = SITENAME.isInitialized;

/* The domain getter. */
const GET = SITENAME.get;

/* The Shadow Web. */
const PLAYBACK = [];

/* The whitelisted services per domain name. */
var whitelist = deserialize(localStorage.whitelist) || {};

/* T-0. */
var startTime;

if (!PREVIOUS_BUILD) localStorage.blockingIndicated = true;
if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 26) localStorage.blogOpened = true;

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 31) {
  delete localStorage.settingsEditable;
  localStorage.browsingHardened = true;
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 35) {
  const MEDIAFIRE_DOMAIN = 'mediafire.com';
  (whitelist[MEDIAFIRE_DOMAIN] || (whitelist[MEDIAFIRE_DOMAIN] = {})).Facebook =
      true;
  const SALON_DOMAIN = 'salon.com';
  (whitelist[SALON_DOMAIN] || (whitelist[SALON_DOMAIN] = {})).Google = true;
  localStorage.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 38) {
  const LATIMES_DOMAIN = 'latimes.com';
  (whitelist[LATIMES_DOMAIN] || (whitelist[LATIMES_DOMAIN] = {})).Google = true;
  localStorage.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 39) {
  const UDACITY_DOMAIN = 'udacity.com';
  (whitelist[UDACITY_DOMAIN] || (whitelist[UDACITY_DOMAIN] = {})).Twitter =
      true;
  localStorage.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 41) delete localStorage.blogOpened;
if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 42) localStorage.blogOpened = true;

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 43) {
  const MIGRATED_WHITELIST = {};

  for (var domain in whitelist) {
    var siteWhitelist =
        (MIGRATED_WHITELIST[domain] = {}).Disconnect =
            {whitelisted: false, services: {}};
    for (var service in whitelist[domain])
        siteWhitelist.services[service] = true;
  }

  localStorage.displayMode = LEGACY_NAME;
  var date = new Date();
  var month = date.getMonth() + 1;
  month = (month < 10 ? '0' : '') + month;
  var day = date.getDate();
  day = (day < 10 ? '0' : '') + day;
  date = date.getFullYear() + '-' + month + '-' + day;

  if (PREVIOUS_BUILD) {
    localStorage.displayMode = LEGACY_NAME;
    localStorage.pwyw = JSON.stringify({});
  } else {
    localStorage.displayMode = LIST_NAME;

    if (navigator.userAgent.indexOf('WhiteHat Aviator') + 1)
        localStorage.pwyw = JSON.stringify({date: date, bucket: 'trying'});
    else {
      localStorage.pwyw = JSON.stringify({date: date, bucket: 'viewed'});
      TABS.create({url: 'https://disconnect.me/d2/welcome'});
    }
  }

  localStorage.whitelist = JSON.stringify(whitelist = MIGRATED_WHITELIST);
  localStorage.blacklist = JSON.stringify(BLACKLIST);
  localStorage.updateClosed = true;
  localStorage.sitesHidden = true;
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < CURRENT_BUILD) {
  const FEEDLY_DOMAIN = 'feedly.com';
  const DOMAIN_WHITELIST =
      whitelist[FEEDLY_DOMAIN] || (whitelist[FEEDLY_DOMAIN] = {});
  const DISCONNECT_WHITELIST =
      DOMAIN_WHITELIST.Disconnect ||
          (DOMAIN_WHITELIST.Disconnect = {whitelisted: false, services: {}});
  DISCONNECT_WHITELIST.services.Google = true;
  localStorage.whitelist = JSON.stringify(whitelist);
  localStorage.build = CURRENT_BUILD;
}

if (!deserialize(localStorage.pwyw).date) {
  downgradeServices(true);
  BROWSER_ACTION.setIcon({path: 'images/legacy/19.png'});

  $.getJSON('https://goldenticket.disconnect.me/existing', function(data) {
    if (data.goldenticket === 'true') {
      localStorage.displayMode = LIST_NAME;
      localStorage.pwyw = JSON.stringify({date: date, bucket: 'pending'});
      downgradeServices();
      BROWSER_ACTION.setIcon({path: 'images/19.png'});
      BROWSER_ACTION.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
      BROWSER_ACTION.setBadgeText({text: 'NEW!'});
      BROWSER_ACTION.setPopup({popup: ''});
    }
  });
} else if (deserialize(localStorage.pwyw).bucket == 'postponed') {
  localStorage.displayMode = LEGACY_NAME;
  downgradeServices(true);
  BROWSER_ACTION.setIcon({path: 'images/legacy/19.png'});
} else BROWSER_ACTION.setIcon({path: 'images/19.png'});

if (
  !deserialize(localStorage.blogOpened) ||
      (deserialize(localStorage.pwyw) || {}).bucket == 'pending'
) BROWSER_ACTION.setBadgeText({text: 'NEW!'});
else initializeToolbar();
localStorage.displayMode == GRAPH_NAME &&
    parseInt(localStorage.sidebarCollapsed, 10) &&
        localStorage.sidebarCollapsed--; // An experimental "semisticky" bit.

/* Prepopulates the store of tab domain names. */
const ID = setInterval(function() {
  if (IS_INITIALIZED()) {
    clearInterval(ID);
    const TLDS = deserialize(localStorage.tlds);
    TLDS['google.com'] = true;
    TLDS['yahoo.com'] = true;
    localStorage.tlds = JSON.stringify(TLDS);

    TABS.query({}, function(tabs) {
      const TAB_COUNT = tabs.length;

      for (var i = 0; i < TAB_COUNT; i++) {
        var tab = tabs[i];
        DOMAINS[tab.id] = GET(tab.url);
      }
    });
  }
}, 100);

/* Tests the writability of the search preferences. */
false && INSTANT_ENABLED.get({}, function(details) {
  details.levelOfControl == EDITABLE &&
      SUGGEST_ENABLED.get({}, function(details) {
        if (details.levelOfControl == EDITABLE)
            localStorage.settingsEditable = true;
        deserialize(localStorage.settingsEditable) &&
            deserialize(localStorage.searchHardened) && editSettings();
      });
});

/* Traps and selectively cancels or redirects a request. */
chrome.webRequest.onBeforeRequest.addListener(function(details) {
  const TYPE = details.type;
  const PARENT = TYPE == 'main_frame';
  const TAB_ID = details.tabId;
  const REQUESTED_URL = details.url;
  const CHILD_DOMAIN = GET(REQUESTED_URL);

  if (PARENT) {
    DOMAINS[TAB_ID] = CHILD_DOMAIN;
    if (!startTime) startTime = new Date();
  }

  const CHILD_SERVICE = getService(CHILD_DOMAIN);
  const PARENT_DOMAIN = DOMAINS[TAB_ID];
  var hardenedUrl;
  var hardened;
  var blockingResponse = {cancel: false};
  var whitelisted;
  var blockedCount;
  const TAB_DASHBOARD =
      DASHBOARD[TAB_ID] ||
          (DASHBOARD[TAB_ID] = {total: 0, blocked: 0, secured: 0});
  const TOTAL_COUNT = ++TAB_DASHBOARD.total;
  var date = new Date();
  var month = date.getMonth() + 1;
  month = (month < 10 ? '0' : '') + month;
  var day = date.getDate();
  day = (day < 10 ? '0' : '') + day;
  date = date.getFullYear() + '-' + month + '-' + day;
  const POPUP =
      localStorage.displayMode != LEGACY_NAME &&
          EXTENSION.getViews({type: 'popup'})[0];

  if (CHILD_SERVICE) {
    const PARENT_SERVICE = getService(PARENT_DOMAIN);
    const CHILD_NAME = CHILD_SERVICE.name;
    const REDIRECT_SAFE = REQUESTED_URL != REQUESTS[TAB_ID];
    const CHILD_CATEGORY = CHILD_SERVICE.category;
    const CONTENT = CHILD_CATEGORY == CONTENT_NAME;
    const CATEGORY_WHITELIST =
        ((deserialize(localStorage.whitelist) || {})[PARENT_DOMAIN] ||
            {})[CHILD_CATEGORY] || {};

    if (
      PARENT || !PARENT_DOMAIN || CHILD_DOMAIN == PARENT_DOMAIN ||
          PARENT_SERVICE && CHILD_NAME == PARENT_SERVICE.name
    ) { // The request is allowed: the topmost frame has the same origin.
      if (REDIRECT_SAFE) {
        hardenedUrl = harden(REQUESTED_URL);
        hardened = hardenedUrl.hardened;
        hardenedUrl = hardenedUrl.url;
        if (hardened) blockingResponse = {redirectUrl: hardenedUrl};
      }
    } else if (
      (CONTENT || CATEGORY_WHITELIST.whitelisted ||
          (CATEGORY_WHITELIST.services || {})[CHILD_NAME]) &&
              !(((deserialize(localStorage.blacklist) || {})[PARENT_DOMAIN] ||
                  {})[CHILD_CATEGORY] || {})[CHILD_NAME]
    ) { // The request is allowed: the category or service is whitelisted.
      if (REDIRECT_SAFE) {
        hardenedUrl = harden(REQUESTED_URL);
        hardened = hardenedUrl.hardened;
        hardenedUrl = hardenedUrl.url;
        if (hardened) blockingResponse = {redirectUrl: hardenedUrl};
        else whitelisted = true;
      }
    } else {
      blockingResponse = {
        redirectUrl:
            TYPE == 'image' ?
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
                    : 'about:blank'
      };
      blockedCount = ++TAB_DASHBOARD.blocked;
      const BLOCKED_REQUESTS = deserialize(localStorage.blockedRequests) || {};
      BLOCKED_REQUESTS[date] ? BLOCKED_REQUESTS[date]++ :
          BLOCKED_REQUESTS[date] = 1;
      localStorage.blockedRequests = JSON.stringify(BLOCKED_REQUESTS);
    } // The request is denied.

    if (blockingResponse.redirectUrl || whitelisted)
        incrementCounter(TAB_ID, CHILD_SERVICE, !whitelisted || CONTENT, POPUP);
  }

  REQUESTED_URL != REDIRECTS[TAB_ID] && delete REQUESTS[TAB_ID];
  delete REDIRECTS[TAB_ID];
  var securedCount;

  if (hardened) {
    REQUESTS[TAB_ID] = REQUESTED_URL;
    REDIRECTS[TAB_ID] = hardenedUrl;
    securedCount = ++TAB_DASHBOARD.secured;
    const HARDENED_REQUESTS = deserialize(localStorage.hardenedRequests) || {};
    HARDENED_REQUESTS[date] ? HARDENED_REQUESTS[date]++ :
        HARDENED_REQUESTS[date] = 1;
    localStorage.hardenedRequests = JSON.stringify(HARDENED_REQUESTS);
  }

  // The Collusion data structure.
  if (!(CHILD_DOMAIN in LOG))
      LOG[CHILD_DOMAIN] = {host: CHILD_DOMAIN, referrers: {}, visited: false};
  if (!(PARENT_DOMAIN in LOG))
      LOG[PARENT_DOMAIN] = {host: PARENT_DOMAIN, referrers: {}};
  LOG[PARENT_DOMAIN].visited = true;
  const REFERRERS = LOG[CHILD_DOMAIN].referrers;
  const ELAPSED_TIME = new Date() - startTime;
  if (CHILD_DOMAIN != PARENT_DOMAIN && !(PARENT_DOMAIN in REFERRERS))
      REFERRERS[PARENT_DOMAIN] = {
        host: PARENT_DOMAIN,
        types: [ELAPSED_TIME]
      };
  const PARENT_REFERRERS = REFERRERS[PARENT_DOMAIN];

  if (PARENT_REFERRERS) {
    const TYPES = PARENT_REFERRERS.types;
    TYPES.indexOf(TYPE) == -1 && TYPES.push(TYPE);
  }

  // For art.
  false && PLAYBACK.push({
    time: ELAPSED_TIME,
    domain: CHILD_DOMAIN,
    type: TYPE,
    tracker: !!(CHILD_SERVICE && CHILD_SERVICE.category != CONTENT_NAME)
  });

  // A live update.
  if (POPUP)
      if (localStorage.displayMode == GRAPH_NAME) {
        const GRAPH = POPUP.graph;
        GRAPH && GRAPH.update(LOG);
      } else {
        const TIMEOUT = POPUP.timeout;

        blockedCount && setTimeout(function() {
          POPUP.renderBlockedRequest(
            TAB_ID,
            Math.min(blockedCount + TOTAL_COUNT * .28, TOTAL_COUNT),
            TOTAL_COUNT
          );
        }, TIMEOUT);

        securedCount && setTimeout(function() {
          POPUP.renderSecuredRequest(
            TAB_ID,
            Math.min(securedCount + TOTAL_COUNT * .28, TOTAL_COUNT),
            TOTAL_COUNT
          );
        }, TIMEOUT);
      }
  return blockingResponse;
}, {urls: ['http://*/*', 'https://*/*']}, ['blocking']);

/* Resets the number of tracking requests and services for a tab. */
chrome.webNavigation.onCommitted.addListener(function(details) {
  if (!details.frameId) {
    const TAB_ID = details.tabId;
    delete REQUEST_COUNTS[TAB_ID];
    delete DASHBOARD[TAB_ID];
    safelyUpdateCounter(TAB_ID, 0);
    const POPUP =
        localStorage.displayMode != LEGACY_NAME &&
            EXTENSION.getViews({type: 'popup'})[0];
    POPUP && POPUP.clearServices(TAB_ID);
  }
});

/* Builds a block list or adds to the number of blocked requests. */
EXTENSION.onRequest.addListener(function(request, sender, sendResponse) {
  const TAB = sender.tab;
  
  if (request.sendEvent) {
    if (request.sendEvent == 'blimp-change-state' && request.data.hardenedState) {
      atr.triggerEvent('blimp-enabled', {});
    } else if (request.sendEvent == 'blimp-change-state' && !request.data.hardenedState) {
      atr.triggerEvent('blimp-disabled', {});
    }
    sendResponse({});
    return;
  }
  
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
  } else if (request.pwyw) {
    const PWYW = deserialize(localStorage.pwyw);
    PWYW.bucket = request.bucket;
    localStorage.pwyw = JSON.stringify(PWYW);
    sendResponse({});
  } else {
    SAFARI && incrementCounter(TAB.id, request.serviceIndex, request.blocked);
    sendResponse({});
  }
});

/* Loads the blog promo. */
!SAFARI && BROWSER_ACTION.onClicked.addListener(function() {
  const PWYW = deserialize(localStorage.pwyw) || {};

  if (!deserialize(localStorage.blogOpened) || PWYW.bucket == 'pending') {
    TABS.create({url: 'https://disconnect.me/d2/upgrade'});
    BROWSER_ACTION.setBadgeText({text: ''});
    initializeToolbar();
    localStorage.blogOpened = true;
    PWYW.bucket = 'viewed';
    localStorage.pwyw = JSON.stringify(PWYW);
  }
});

/* The interface is English only for now. */
if (deserialize(localStorage.searchDepersonalized) && !deserialize(localStorage.searchHardenable)) {
	chrome.cookies.getAll({url:'https://google.com', name:'PREF'}, function() {
		if (arguments[0] && arguments[0][0] && arguments[0][0].value && /LD=en/.test(arguments[0][0].value)) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://disconnect.me/test/sample", true);
			xhr.onreadystatechange = function() {
			  if (xhr.readyState == 4 && xhr.status == 200) {
					if (xhr.responseText == 'activate') {
						localStorage.searchHardenable = true;
            localStorage.searchHardened = true;
					}
			  }
			}
			xhr.send();
		}
	});
}
