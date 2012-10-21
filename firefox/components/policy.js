/*
  An XPCOM component that stops third parties and search engines from tracking
  the webpages you go to and searches you do.

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
    Gary Teh <garyjob@gmail.com>
*/
Components.utils['import']('resource://gre/modules/XPCOMUtils.jsm');
var loader =
    Components.classes['@mozilla.org/moz/jssubscript-loader;1'].
      getService(Components.interfaces.mozIJSSubScriptLoader);
loader.loadSubScript('chrome://disconnect/content/sjcl.js');
loader.loadSubScript('chrome://disconnect/content/sitename-firefox.js');
loader.loadSubScript('chrome://disconnect/content/services-firefox.js');
loader.loadSubScript('chrome://disconnect/content/debug.js');

/**
 * Constants.
 */
var preferences =
    Components.classes['@mozilla.org/preferences-service;1'].
      getService(Components.interfaces.nsIPrefService).
      getBranch('extensions.disconnect.');
var contentPolicy = Components.interfaces.nsIContentPolicy;
var accept = contentPolicy.ACCEPT;
var sitename = new Sitename;
var get = sitename.get;
var requests = {};
var redirects = {};
var requestCounts = {};
var contentName = 'Content';

/**
 * Creates the component.
 */
function Disconnect() { this.wrappedJSObject = this; }

/**
 * A content policy that stops third parties and search engines from tracking
 * the webpages you go to and searches you do.
 */
Disconnect.prototype = {
  /**
   * The properties required for XPCOM registration.
   */
  classID: Components.ID('{3f722c5d-555d-4fbc-9444-c5e0d963de8f}'),
  classDescription:
      'A content policy that stops third parties and search engines from tracking the webpages you go to and searches you do.',
  contractID: '@disconnect.me/d2;1',

  /**
   * The categories to register the component in.
   */
  _xpcom_categories: [{category: 'content-policy'}],

  /**
   * Gets a component interface.
   */
  QueryInterface: XPCOMUtils.generateQI([contentPolicy]),

  /**
   * Traps and selectively cancels a request.
   */
  shouldLoad: function(contentType, contentLocation, requestOrigin, context) {
    var result = accept;

    if (contentLocation.asciiHost && context) {
      var html = context.ownerDocument;

      if (html) {
        var content = html.defaultView.content;

        if (content) {
          var childUrl = contentLocation.spec;
          var childDomain = get(contentLocation.host);
          var childService = getService(childDomain);
          var parentUrl = content.top.location;
          var parent = contentType == contentPolicy.TYPE_DOCUMENT;
          var hardenedUrl;
          var hardened;
          var whitelisted;
          parent && (requestCounts[parentUrl] = {});

          if (childService) {
            var parentDomain = get(parentUrl.hostname);
            var parentService = getService(parentDomain);
            var childName = childService.name;
            var redirectSafe = childUrl != requests[parentUrl];

            if (
              parent || childDomain == parentDomain ||
                  parentService && childName == parentService.name ||
                      childService.category == contentName
            ) { // The request is allowed: the top frame has the same origin.
              if (redirectSafe) {
                hardenedUrl = harden(childUrl);
                hardened = hardenedUrl.hardened;
                hardenedUrl = hardenedUrl.url;
                if (hardened) contentLocation.spec = hardenedUrl;
              }
            } else if (
              (JSON.parse(preferences.getCharPref('whitelist'))[parentDomain] ||
                  {})[childName]
            ) { // The request is allowed: the service is whitelisted.
              if (redirectSafe) {
                hardenedUrl = harden(childUrl);
                hardened = hardenedUrl.hardened;
                hardenedUrl = hardenedUrl.url;
                if (hardened) contentLocation.spec = hardenedUrl;
                else whitelisted = true;
              }
            } else result = contentPolicy.REJECT_SERVER;
                // The request is denied.

            if (hardened || whitelisted || result != accept) {
              var tabRequests =
                  requestCounts[parentUrl] || (requestCounts[parentUrl] = {});
              var category = childService.category;
              var categoryRequests =
                  tabRequests[category] || (tabRequests[category] = {});
              var service = childService.name;
              var serviceRequests =
                  categoryRequests[service] || (
                    categoryRequests[service] =
                        {url: childService.url, count: 0}
                  );
              serviceRequests.count++;
            }
          }

          childUrl != redirects[parentUrl] && delete requests[parentUrl];
          delete redirects[parentUrl];

          if (hardened) {
            requests[parentUrl] = childUrl;
            redirects[parentUrl] = hardenedUrl;
          }
        }
      }
    }

    return result;
  },

  /**
   * Passes a request through.
   */
  shouldProcess: function() { return accept; }
}

/**
 * The component entry point.
 */
if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([Disconnect]);
else var NSGetModule = XPCOMUtils.generateNSGetModule([Disconnect]);
