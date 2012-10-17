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

/**
 * The Disconnect namespace.
 */
if (typeof Disconnect == 'undefined') {
  var Disconnect = {
    /**
     * Fetches the number of tracking requests.
     */
    getRequestCount: function() {
      return gBrowser.contentWindow.document.thirdPartyRequestCount;
    },

    /**
     * Fetches the blocking state.
     */
    isUnblocked: function() {
      return JSON.parse(content.localStorage.thirdPartiesUnblocked);
    },

    /**
     * Paints the UI.
     */
    render: function(that, button) {
      var sourceName = 'src';
      if (that.getRequestCount())
          button.setAttribute(
            sourceName,
            'chrome://disconnect/content/' +
                (that.isUnblocked() ? 'unblocked' : 'blocked') + '.png'
          );
      else button.removeAttribute(sourceName);
    },

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

      var render = this.render;
      var that = this;
      var button = document.getElementById('disconnect-button');

      gBrowser.tabContainer.addEventListener('TabAttrModified', function() {
        render(that, button);
      }, false);

      gBrowser.addEventListener('error', function() {
        render(that, button);
      }, false);

      gBrowser.addEventListener('DOMContentLoaded', function() {
        render(that, button);
      }, false);

      var toolbarButton = 'toolbarbutton-1';

      button.addEventListener('mouseover', function() {
        this.className = toolbarButton + ' highlighted';
      }, true);

      button.addEventListener('mouseout', function() {
        this.className = toolbarButton;
      }, false);

      var blocking = document.getElementById('disconnect-blocking');

      button.addEventListener('click', function() {
        var labelName = 'label';
        var requestCount = that.getRequestCount() || 0;
        var label = ' third-party request';
        var shortcutName = 'accesskey';

        if (that.isUnblocked()) {
          blocking.setAttribute(
            labelName,
            'Block ' + requestCount + label + (requestCount - 1 ? 's' : '')
          );
          blocking.setAttribute(shortcutName, 'B');
        } else {
          blocking.setAttribute(
            labelName,
            'Unblock ' + requestCount + label + (requestCount - 1 ? 's' : '')
          );
          blocking.setAttribute(shortcutName, 'U');
        }
      }, false);

      var command = 'command';

      blocking.addEventListener(command, function() {
        content.localStorage.thirdPartiesUnblocked = !that.isUnblocked();
        content.location.reload();
      }, false);

      var go = this.go;

      document.
        getElementById('disconnect-help').
        addEventListener(command, function() { go(this); }, false);

      document.
        getElementById('disconnect-feedback').
        addEventListener(command, function() { go(this); }, false);
    }
  };
}

/**
 * Initializes the object.
 */
addEventListener('load', function() { Disconnect.initialize(); }, false);
