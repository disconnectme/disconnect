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
function incrementCounter(tabId, serviceIndex) {
  const TAB_BLOCKED_COUNTS =
      BLOCKED_COUNTS[tabId] ||
          (BLOCKED_COUNTS[tabId] = [0, initializeArray(SERVICE_COUNT, 0)]);
  const TAB_BLOCKED_COUNT = ++TAB_BLOCKED_COUNTS[0];
  TAB_BLOCKED_COUNTS[1][serviceIndex]++;
  if (deserialize(localStorage.blockingIndicated))
      BROWSER_ACTION.setBadgeText({tabId: tabId, text: TAB_BLOCKED_COUNT + ''});
}

/*
  The third parties and search engines, titlecased, and domain, subdomain, and
  path names they phone home with and secure URL of their query page,
  lowercased.
*/
const SERVICES = [
  ['Facebook', [
    'facebook.com',
    'facebook.net',
    'fbcdn.net',
    'disconnect.me',
    'localhost'
        // "disconnect.me" and "localhost" whitelisting is temporary, for FBME.
  ]],
  ['Google', [
    'google.com',
    '2mdn.net',
    'doubleclick.net',
    'feedburner.com',
    'gmodules.com',
    'google-analytics.com',
    'googleadservices.com',
    'googlesyndication.com'
  ], [
    'adwords',
    'apis',
    'checkout',
    'chrome',
    'code',
    'docs',
    'feedburner',
    'groups',
    'health',
    'knol',
    'mail',
    'music',
    'picasaweb',
    'plus',
    'plusone',
    'sites',
    'sketchup',
    'talkgadget',
    'wave'
  ], [
    'accounts',
    'analytics',
    'bookmarks',
    'calendar',
    'finance',
    'ig',
    'latitude',
    'reader',
    'voice',
    'webmasters',
    'adsense',
    'alerts',
    'cse',
    'dfp',
    'friendconnect',
    'local',
    'merchants',
    'notebook',
    'support'
  ], 'https://www.google.com/'],
  ['LinkedIn', ['linkedin.com']],
  ['Twitter', ['twitter.com', 'twimg.com']],
  ['Yahoo', ['yahoo.com'], [
    'address',
    'answers',
    'apps',
    'buzz',
    'calendar',
    'edit',
    'finance',
    'games',
    'groups',
    'hotjobs',
    'local',
    'mail',
    'my',
    'notepad',
    'pulse',
    'shine',
    'sports',
    'upcoming',
    'webmessenger',
    'www',
    'alerts',
    'autos',
    'avatars',
    'help',
    'login', // "login" is required for OpenID access but conflicts with "edit".
    'messages',
    'pipes',
    'realestate',
    'smallbusiness',
    'travel',
    'widgets'
  ], [], 'https://search.yahoo.com/']
];

/* The number of third parties. */
const SERVICE_COUNT = SERVICES.length;

/* The suffix of the blocking key. */
const BLOCKED_NAME = 'Blocked';

/* The number of blocked requests per tab, overall and by third party. */
const BLOCKED_COUNTS = {};

/* The "tabs" API. */
const TABS = chrome.tabs;

/* The "cookies" API. */
const COOKIES = chrome.cookies;

/* The "browserAction" API. */
const BROWSER_ACTION = chrome.browserAction;

/* The domain object. */
const SITENAME = new Sitename;

for (var i = 0; i < SERVICE_COUNT; i++) {
  var service = SERVICES[i];
  var subdomains = service[2];

  if (subdomains) {
    var subdomainCount = subdomains.length;
    var domains = service[1];
    var domain = domains[0];
    for (var j = 0; j < subdomainCount; j++)
        domains.push(subdomains[j] + '.' + domain);
    var paths = service[3];
    var pathCount = paths.length;
    for (j = 0; j < pathCount; j++) domains.push(domain + '/' + paths[j]);
  }
}

if (!deserialize(localStorage.initialized)) {
  for (i = 0; i < SERVICE_COUNT; i++)
      localStorage[SERVICES[i][0].toLowerCase() + BLOCKED_NAME] = true;
  localStorage.blockingIndicated = true;
  localStorage.initialized = true;
}

if (
  !deserialize(localStorage.searchRemoved) &&
      deserialize(localStorage.searchDepersonalized)
) {
  for (i = 0; i < SERVICE_COUNT; i++) {
    var service = SERVICES[i];
    var url = service[4];
    url && deserialize(localStorage[service[0].toLowerCase() + BLOCKED_NAME]) &&
        reduceCookies(url, service);
    localStorage.searchRemoved = true;
  }
}

localStorage.fbmeOpened = true;
if (!deserialize(localStorage.fbmeOpened))
    BROWSER_ACTION.setBadgeText({text: 'NEW!'});
else initializeToolbar();

/* Resets the number of blocked requests for a tab. */
TABS.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status == 'loading') delete BLOCKED_COUNTS[tabId];
  if (SAFARI && deserialize(localStorage.blockingIndicated))
      BROWSER_ACTION.setBadgeText({tabId: tabId, text: ''});
});

/* Builds a block list or adds to the number of blocked requests. */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  const TAB = sender.tab;

  if (request.initialized) {
    const URL = TAB.url;

    SITENAME.get(URL, function(domain) {
      const BLACKLIST = [];
      const SITE_WHITELIST =
          (deserialize(localStorage.whitelist) || {})[domain] || {};

      for (var i = 0; i < SERVICE_COUNT; i++) {
        var service = SERVICES[i];
        BLACKLIST[i] =
            !SITE_WHITELIST[service[0]] ? [service[1], !!service[2]] : [[]];
      }

      sendResponse({url: URL, blacklist: BLACKLIST});
    });
  } else {
    incrementCounter(TAB.id, request.serviceIndex);
    sendResponse({});
  }
});

/* Loads the FBME promo. */
BROWSER_ACTION.onClicked.addListener(function() {
  BROWSER_ACTION.getPopup({}, function(result) {
    if (!result) {
      TABS.create({url: 'https://fbme.disconnect.me/extension'});
      BROWSER_ACTION.setBadgeText({text: ''});
      initializeToolbar();
      localStorage.fbmeOpened = true;
    }
  });
});
