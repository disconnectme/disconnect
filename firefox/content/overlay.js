/*
  An overlay script that makes the web faster, more private, and more secure.

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

/**
 * The Disconnect namespace.
 */
if (typeof Disconnect == 'undefined') {
  var Disconnect = {
    /**
     * Outputs major third-party details as per the blocking state.
     */
    renderShortcut: function(
      name,
      lowercaseName,
      blocked,
      requestCount,
      control,
      wrappedControl,
      badge,
      text,
      animation,
      callback
    ) {
      var whitelistingClicked = 0;
      var count =
          animation > 1 || whitelistingClicked && whitelistingClicked-- ? 21 :
              animation;
      var imageDirectory = Disconnect.imageDirectory;
      var deactivatedName = Disconnect.deactivatedName;
      var imageExtension = Disconnect.imageExtension;
      var highlightedName = Disconnect.highlightedName;

      if (blocked) {
        wrappedControl.removeClass(deactivatedName);
        control.title = Disconnect.unblockName + name;
        for (var i = 0; i < count; i++)
            setTimeout(function(badge, lowercaseName, index) {
              index || wrappedControl.off('mouseenter').off('mouseleave');
              badge.src =
                  imageDirectory + lowercaseName + '/' +
                      (index < 14 ? index + 1 : 4 - Math.abs(4 - index % 13)) +
                          (index < count - 7 ? '-' + deactivatedName : '') +
                              imageExtension;

              if (index > count - 2) {
                wrappedControl.mouseenter(function() {
                  badge.src = badge.src.replace('.', highlightedName);
                }).mouseleave(function() {
                  badge.src = badge.src.replace(highlightedName, '.');
                });

                callback && wrappedControl.click(callback);
              }
            }, i * 40, badge, lowercaseName, i);
      } else {
        wrappedControl.addClass(deactivatedName);
        control.title = Disconnect.blockName + name;
        for (var i = 0; i < count; i++)
            setTimeout(function(badge, lowercaseName, index) {
              index || wrappedControl.off('mouseenter').off('mouseleave');
              badge.src =
                  imageDirectory + lowercaseName + '/' +
                      (index < 14 ? index + 1 : 4 - Math.abs(4 - index % 13)) +
                          (index < count - 7 ? '' : '-' + deactivatedName) +
                              imageExtension;

              if (index > count - 2) {
                wrappedControl.mouseenter(function() {
                  badge.src = badge.src.replace('.', highlightedName);
                }).mouseleave(function() {
                  badge.src = badge.src.replace(highlightedName, '.');
                });

                callback && wrappedControl.click(callback);
              }
            }, i * 40, badge, lowercaseName, i);
      }

      text.textContent = requestCount;
    },

    /**
     * Restricts the animation of major third parties to 1x per click.
     */
    handleShortcut: function(
      domain,
      url,
      name,
      lowercaseName,
      requestCount,
      control,
      wrappedControl,
      badge,
      text
    ) {
      wrappedControl.off('click');
      var preferences = Disconnect.preferences;
      var whitelistName = Disconnect.whitelistName;
      var whitelist = JSON.parse(preferences.getCharPref(whitelistName));
      var siteWhitelist = whitelist[domain] || (whitelist[domain] = {});
      var disconnectWhitelist =
          siteWhitelist.Disconnect ||
              (siteWhitelist.Disconnect = {whitelisted: false, services: {}});
      var shortcutWhitelist = disconnectWhitelist.services;
      shortcutWhitelist[name] = !shortcutWhitelist[name];
      preferences.setCharPref(whitelistName, JSON.stringify(whitelist));
      Disconnect.renderShortcut(
        name,
        lowercaseName,
        !shortcutWhitelist[name],
        requestCount,
        control,
        wrappedControl,
        badge,
        text,
        2,
        function() {
          Disconnect.handleShortcut(
            domain,
            url,
            name,
            lowercaseName,
            requestCount,
            control,
            wrappedControl,
            badge,
            text
          );
        }
      );
      Disconnect.renderWhitelisting(siteWhitelist);
      content.location.reload();
    },

    /**
     * Outputs the global blocking state.
     */
    renderWhitelisting: function(siteWhitelist) {},

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
      Components.utils['import']('resource://modules/state.js');
      var loader =
          Components.
            classes['@mozilla.org/moz/jssubscript-loader;1'].
            getService(Components.interfaces.mozIJSSubScriptLoader);
      loader.loadSubScript('chrome://disconnect/content/sitename-firefox.js');
      loader.loadSubScript(
        'chrome://disconnect/skin/scripts/vendor/jquery/jquery.js'
      );
      loader.loadSubScript('chrome://disconnect/content/debug.js');
      var preferences =
          Components.classes['@mozilla.org/preferences-service;1'].
            getService(Components.interfaces.nsIPrefService).
            getBranch('extensions.disconnect.');
      var get = (new Sitename).get;
      var renderShortcut = this.renderShortcut;
      var handleShortcut = this.handleShortcut;
      var shortcutNames = ['Facebook', 'Google', 'Twitter'];
      var shortcutCount = shortcutNames.length;
      var buildName = 'build';
      var navbarName = 'nav-bar';
      var currentSetName = 'currentset';
      var browsingHardenedName = 'browsingHardened';
      var clickName = 'click';
      var whitelistName = this.whitelistName;
      var highlightedName = this.highlightedName;
      var currentBuild = 2;
      var previousBuild = preferences.getIntPref(buildName);
      var whitelist = JSON.parse(preferences.getCharPref(whitelistName));
      var browsingHardened = preferences.getBoolPref(browsingHardenedName);
      var button = document.getElementById('disconnect-button');
      var shortcutSurface =
          document.
            getElementById('shortcuts').getElementsByTagName('html:td')[0];
      var shortcutTemplate =
          shortcutSurface.getElementsByClassName('shortcut')[0];
      var activeServices = [];
      var wifi =
          document.
            getElementsByClassName('wifi')[0].
            getElementsByTagName('html:input')[0];
      this.preferences = preferences;

      if (!previousBuild) {
        var toolbar = document.getElementById(navbarName);
        toolbar.insertItem('disconnect-button');
        toolbar.setAttribute(currentSetName, toolbar.currentSet);
        document.persist(navbarName, currentSetName);
      }

      if (!previousBuild || previousBuild < currentBuild) {
        var migratedWhitelist = {};

        for (var domain in whitelist) {
          var siteWhitelist =
              (migratedWhitelist[domain] = {}).Disconnect =
                  {whitelisted: false, services: {}};
          for (var service in whitelist[domain])
              siteWhitelist.services[service] = true;
        }

        preferences.
          setCharPref(whitelistName, JSON.stringify(migratedWhitelist));
        preferences.setIntPref(buildName, currentBuild);
      }

      $(document.getElementById('navbar').getElementsByTagName('html:img')[0]).
        mouseenter(function() {
          this.src = this.src.replace('.', highlightedName);
        }).
        mouseleave(function() {
          this.src = this.src.replace(highlightedName, '.');
        });

      for (var i = 0; i < shortcutCount; i++)
          shortcutSurface.
            appendChild(shortcutTemplate.cloneNode(true)).
            getElementsByTagName('html:img')[0].
            alt = shortcutNames[i];
      wifi.checked = browsingHardened;

      wifi.addEventListener(clickName, function() {
        browsingHardened = !browsingHardened;
        preferences.setBoolPref(browsingHardenedName, browsingHardened);
        this.checked = browsingHardened;
      }, false);

      button.addEventListener(clickName, function() {
        var url = gBrowser.contentWindow.location;
        var domain = get(url.hostname);
        var tabRequests = requestCounts[url] || {};
        var disconnectRequests = tabRequests.Disconnect || {};
        whitelist = JSON.parse(preferences.getCharPref(whitelistName));
        var siteWhitelist = whitelist[domain] || {};
        var shortcutWhitelist =
            (siteWhitelist.Disconnect || {}).services || {};

        for (var i = 0; i < shortcutCount; i++) {
          var name = shortcutNames[i];
          var lowercaseName = name.toLowerCase();
          var shortcutRequests = disconnectRequests[name];
          var requestCount = shortcutRequests ? shortcutRequests.count : 0;
          var control = document.getElementsByClassName('shortcut')[i + 1];
          var wrappedControl = $(control);
          var badge = control.getElementsByTagName('html:img')[0];
          var text = control.getElementsByClassName('text')[0];
          renderShortcut(
            name,
            lowercaseName,
            !shortcutWhitelist[name],
            requestCount,
            control,
            wrappedControl,
            badge,
            text,
            1
          );

          wrappedControl.click(function(
            name,
            lowercaseName,
            requestCount,
            control,
            wrappedControl,
            badge,
            text
          ) {
            handleShortcut(
              domain,
              url,
              name,
              lowercaseName,
              requestCount,
              control,
              wrappedControl,
              badge,
              text
            );
          }.bind(
            null,
            name,
            lowercaseName,
            requestCount,
            control,
            wrappedControl,
            badge,
            text
          ));
        }
      }, false);

      var go = this.go;
    },

    /**
     * Global variables.
     */
    preferences: null,
    whitelistName: 'whitelist',
    deactivatedName: 'deactivated',
    highlightedName: '-highlighted.',
    blockName: 'Block ',
    unblockName: 'Unblock ',
    imageDirectory: 'chrome://disconnect/skin/images/',
    imageExtension: '.png'
  };
}

/**
 * Initializes the object.
 */
addEventListener('load', function() { Disconnect.initialize(); }, false);
