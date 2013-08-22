/*
  A script that determines whether a domain name belongs to a third party.

  Copyright 2012, 2013 Disconnect, Inc.

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

/* Destringifies an object. */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

/* Formats the blacklist. */
function processServices(data) {
  data = deserialize(sjcl.decrypt(
    'be1ba0b3-ccd4-45b1-ac47-6760849ac1d4', JSON.stringify(data)
  ));
  var categories = data.categories;

  for (var categoryName in categories) {
    var category = categories[categoryName];
    var serviceCount = category.length;
    var legacy = categoryName.length > 11;

    for (var i = 0; i < serviceCount; i++) {
      var service = category[i];

      for (var serviceName in service) {
        var urls = service[serviceName];

        for (var homepage in urls) {
          var domains = urls[homepage];
          var domainCount = domains.length;

          for (var j = 0; j < domainCount; j++)
              (legacy ? evenMoreServices : moreServices)[domains[j]] = {
                category: legacy ? categoryName.slice(7) : categoryName,
                name: serviceName,
                url: homepage
              };
        }
      }
    }
  }

  hardeningRules = data.hardeningRules;
  moreRules = data.moreRules;
}

/* Retrieves the third-party metadata, if any, associated with a domain name. */
function getService(domain) { return servicePointer[domain]; }

/* Rewrites a URL, if insecure. */
function harden(url) {
  var rules = [];
  if (deserialize(options.searchHardened)) rules = rules.concat(moreRules);
  if (deserialize(options.browsingHardened))
      rules = rules.concat(hardeningRules);
  var ruleCount = rules.length;
  var hardenedUrl = url;
  var hardened;

  for (var i = 0; i < ruleCount; i++) {
    var rule = rules[i];
    hardenedUrl = url.replace(RegExp(rule[0]), rule[1]);

    if (hardenedUrl != url) {
      hardened = true;
      break;
    }
  }

  return {url: hardenedUrl, hardened: hardened};
}

/* Hot-swaps the blacklists. */
function downgradeServices(downgraded) {
  servicePointer = downgraded ? evenMoreServices : moreServices;
}

/* The number of iterations. */
var index = 0;

/* The number of requests. */
var requestCount = 0;

/* The next iteration to make a request. */
var nextRequest = 0;

/*
  The categories and third parties, titlecased, and URL of their homepage and
  domain names they phone home with, lowercased.
*/
var moreServices = {};

/* The categories et al. for Disconnect 1. */
var evenMoreServices = {};

/* The matching regexes and replacement strings. */
var hardeningRules = [];

/* The rest of the matching regexes and replacement strings. */
var moreRules = [];

/* The active categories et al. */
var servicePointer = moreServices;

processServices(data);

/* Fetches the third-party metadata. */
var id = setInterval(function() {
  if (index == nextRequest) {
    $.get('https://services.disconnect.me/disconnect.json', function(data) {
      clearInterval(id);
      processServices(data);
    });

    nextRequest = index + Math.pow(2, Math.min(requestCount++, 12));
  }

  index++;
}, 1000);
