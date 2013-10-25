/*
  The script containing the functions responsible for whitelisting and
  blacklisting sites.

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

    Eason Goodale <eason.goodale@gmail.com>
*/

  /* Creates whitelist for URL if it doesn't exist
      If we get all fields, whitelist/blacklist service
      If we get everything except service, whitelist/blacklist category
      If we get only get whitelisted and the url, whitelist/blacklist url
      Treats global whitelist as just another url passed in as 'Global'
      TODO: Change the blacklist at the same time
  */
function changeWhitelist(whitelisted, url, category, service) {
  chrome.extension.getBackgroundPage().console.log(arguments);
  whitelistExistenceCheck(url, category);
  changeBlacklist(!(whitelisted), url, category, service);

  if (service) {
    whitelist[url][category].services[service] = whitelisted;
  }
  else if (category) {
    whitelist[url][category].whitelisted = whitelisted;
  }
  else if (url) {
    for (var currentCategory in whitelist[url]) {
      changeWhitelist(whitelisted, url, currentCategory);
    }
  }
  options.whitelist = JSON.stringify(whitelist);
  return (whitelisted);
}

function changeBlacklist(blacklisted, domain, name) {
  const BLACKLIST = JSON.parse(options.blacklist) || {};
  const LOCAL_SITE_BLACKLIST =
      BLACKLIST[domain] || (BLACKLIST[domain] = {});
  const CATEGORY_BLACKLIST =
      LOCAL_SITE_BLACKLIST[name] || (LOCAL_SITE_BLACKLIST[name] = {});
  for (var serviceName in CATEGORY_BLACKLIST) {
    CATEGORY_BLACKLIST[serviceName] = blacklisted;
  }
  options.blacklist = JSON.stringify(BLACKLIST);
}

function getSiteWhitelist(domain) {
  whitelistExistenceCheck(domain);
  return whitelist[domain];
}

//TODO: Create the blacklist at the same time
function whitelistExistenceCheck(url, category) {
  chrome.extension.getBackgroundPage().console.log(url);
  whitelist = JSON.parse(options.whitelist) || {};
  whitelist[url] = whitelist[url] || createWhitelist();
  if (category && !(whitelist[url][category])) {
    if (category == 'Content') {
      whitelist[url][category] = {whitelisted: true, services: {}};
    }
    else if (category == 'Disconnect') {
      whitelist[url][category] = {
        whitelisted: false, 
        services: {
          Google: false,
          Facebook: false,
          Twitter: false
        }
      };
    }
    else {
      whitelist[url][category] = {whitelisted: false, services: {}};
    }
  }
  if (url == 'Global') {
    whitelist[url].Content.whitelisted = false;
  }
}

function createWhitelist() {
  return {
    Disconnect: {whitelisted: false, 
      services: {
        Google: false,
        Facebook: false,
        Twitter: false
      }
    },
    Advertising: {whitelisted: false, services: {}},
    Analytics: {whitelisted: false, services: {}},
    Social: {whitelisted: false, services: {}},
    Content: {whitelisted: true, services: {}}
  };
}

function createBlacklist() {
  return {
    Advertising: {},
    Analytics: {},
    Social: {},
    Content: {},
    Disconnect: {}
  };
}

function isUndefined(object) {
  return (typeof object == 'undefined')
}

function isWhitelisted(parentDomain, category, url) {
  whitelistExistenceCheck(parentDomain, category);
  if (whitelist != {}) {
    var domainWhitelist = whitelist[parentDomain] || {};
    var categoryWhitelist = domainWhitelist[category] || {};
    var servicesWhitelist = categoryWhitelist.services || {};
    var undefinedWhitelist = isUndefined(categoryWhitelist.whitelisted);

    if (category == "Content" && undefinedWhitelist) {
      return !(isBlacklisted(parentDomain, category, url));
    }
    else if (categoryWhitelist.whitelisted) {
      return !(isBlacklisted(parentDomain, category, url));
    }
    else if (servicesWhitelist[url]) {
      return !(isBlacklisted(parentDomain, category, url));
    }
    else if (parentDomain != 'Global') {
      return (isWhitelisted('Global', category, url));
    }
  }
  return false;
}

function isBlacklisted(parentDomain, category, url) {
    var blacklist = deserialize(options.blacklist) || {};
    var parentBlacklist = blacklist[parentDomain] || createBlacklist();
    var categoryBlacklist = parentBlacklist[category] || {};
    var globalBlacklist = blacklist.Global || createBlacklist();
    if (!(url) && category){
      //right now the UI blacklists every service listed under it for categories
      return categoryBlacklist.blacklisted;
    }
    else if (categoryBlacklist[url]) {
      return true;
    }
    else if (globalBlacklist[category][url]) {
      return true
    }
    return false;
}

function setDefaultWhitelist () {
  var defaultWhitelist = {
    'mediafire.com': {
      Facebook: {category: "Disconnect", buildReleased: 35}
    },
    'salon.com': {
      Google: {category: "Disconnect", buildReleased: 35}
    },
    'latimes.com': {
      Google: {category: "Disconnect", buildReleased: 38}
    },
    'udacity.com': {
      Twitter: {category: "Disconnect", buildReleased: 39}
    },
    'feedly.com': {
      Google: {category: "Disconnect", buildReleased: 44}
    },
    'udacity.com': {
      Google: {category: "Disconnect", buildReleased: 54},
      Facebook: {category: "Disconnect", buildReleased: 54}
    },
    'freshdirect.com': {
      Google: {category: "Disconnect", buildReleased: 57}
    },
    'newyorker.com': {
      Google: {category: "Disconnect", buildReleased: 57}
    },
    'hm.com': {
      IBM: {category: "Analytics", buildReleased: "current"}
    }
  };

  for (var siteURL in defaultWhitelist) {
    for (var service in defaultWhitelist[siteURL]) {
      var category = defaultWhitelist[siteURL][service].category;
      var buildReleased = defaultWhitelist[siteURL][service].buildReleased;

      if (!PREVIOUS_BUILD || PREVIOUS_BUILD > buildReleased){
        changeWhitelist(true, siteURL, category, service);
      }
      else if (buildReleased == "current" && PREVIOUS_BUILD < CURRENT_BUILD) {
        changeWhitelist(true, siteURL, category, service);
      }
    }
  }
}