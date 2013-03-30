/*
  An overlay script that stops third parties and search engines from tracking
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
Components.utils['import']('resource://modules/requests.js');
var loader =
    Components.classes['@mozilla.org/moz/jssubscript-loader;1'].
      getService(Components.interfaces.mozIJSSubScriptLoader);
loader.loadSubScript('chrome://disconnect/content/sitename-firefox.js');
loader.loadSubScript('chrome://disconnect/content/debug.js');

/**
 * The Disconnect namespace.
 */
if (typeof Disconnect == 'undefined') {
  var Disconnect = {
    /**
     * Navigates to a URL.
     */
    go: function(that) {
      gBrowser.selectedTab = gBrowser.addTab(that.getAttribute('value'));
    },

    /**
     * Registers event handlers.
     */
    initialize: function() {
      var preferences =
          Components.classes['@mozilla.org/preferences-service;1'].
            getService(Components.interfaces.nsIPrefService).
            getBranch('extensions.disconnect.');
      var build = 'build';
      var navbar = 'nav-bar';
      var currentSet = 'currentset';

      if (!preferences.getIntPref(build)) {
        var toolbar = document.getElementById(navbar);
        toolbar.insertItem('disconnect-button');
        toolbar.setAttribute(currentSet, toolbar.currentSet);
        document.persist(navbar, currentSet);
        preferences.setIntPref(build, 1);
      }

      var button = document.getElementById('disconnect-button');
      var get = (new Sitename).get;
      var services =
          document.
            getElementById('disconnect-popup').
            getElementsByTagName('menuitem');
      var labelName = 'label';
      var serviceLabel = ' request';
      var command = 'command';
      var browsingHardenedName = 'browsingHardened';
      var wifi = document.getElementById('disconnect-wifi');
      var wifiLabel = 'Secure Wi-Fi';

      button.addEventListener('click', function() {
        var url = gBrowser.contentWindow.location;
        var whitelist = JSON.parse(preferences.getCharPref('whitelist'));
        var domain = get(url.hostname);
        var domainWhitelist = whitelist[domain] || (whitelist[domain] = {});

        for (var i = 0; i < 5; i++) {
          var service = services[i];
          var name = service.getAttribute('value');
          var blocked = !domainWhitelist[name];
          var count =
              (((requestCounts[url] || {}).Disconnect || {})[name] || {}).count
                  || 0;

          if (blocked) {
            service.className = service.className.slice(0, 15);
            service.setAttribute(
              labelName,
              count + serviceLabel + (count - 1 ? 's' : '') + ' blocked'
            );
          } else {
            service.className += ' disabled';
            service.setAttribute(
              labelName,
              count + serviceLabel + (count - 1 ? 's' : '') + ' unblocked'
            );
          }

          service.addEventListener(command, function(name, blocked) {
            domainWhitelist[name] = blocked;
            preferences.setCharPref('whitelist', JSON.stringify(whitelist));
            content.location.reload();
          }.bind(null, name, blocked), false);
        }

        var browsingHardened = preferences.getBoolPref(browsingHardenedName);
        browsingHardened && wifi.setAttribute(labelName, '✓ ' + wifiLabel);

        wifi.addEventListener(command, function() {
          preferences.setBoolPref(browsingHardenedName, !browsingHardened);
          browsingHardened && this.setAttribute(labelName, wifiLabel);
        }, false);
      }, false);

      var go = this.go;

      document.
        getElementById('disconnect-help').
        addEventListener(command, function() { go(this); }, false);
    }
  };
}

/**
 * Initializes the object.
 */
addEventListener('load', function() { Disconnect.initialize(); }, false);
