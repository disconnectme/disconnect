/**
 * A class for finding a website’s favicon URL, if any. Requires a context, like
 * a browser extension, that allows cross-origin requests.
 * <br />
 * <br />
 * Copyright 2012, 2013 Disconnect, Inc.
 * <br />
 * <br />
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at <a
 * href="https://mozilla.org/MPL/2.0/">https://mozilla.org/MPL/2.0/</a>.
 * <br />
 * @constructor
 * @param {string} [alt] A default favicon URL, absolute or relative.
 * @author <a href="https://github.com/byoogle">Brian Kennish</a>
 */
function Favicon(alt) {
  /**
   * Fetches the default favicon URL.
   * @return {string} An absolute or relative URL.
   */
  this.getAlt = function() { return alt; };

  /**
   * Mungs the default favicon URL.
   * @param  {string}  alt An absolute or relative URL.
   * @return {Favicon}     The favicon object.
   */
  this.setAlt = function(newAlt) {
    alt = newAlt;
    return this;
  };

  /**
   * Finds a favicon URL.
   * @param  {string}           url      A website’s absolute URL or hostname.
   * @param  {function(string)} callback A continuation, to execute when the
   *                                     method completes, that takes a favicon
   *                                     URL.
   * @return {Favicon}                   The favicon object.
   */
  this.get = function(url, callback) {
    var favicon = this.getAlt();
    if (typeof favicon != undeclared) callback(favicon);

    var id = setInterval(function() {
      if (typeof jQuery != undeclared) {
        clearInterval(id);

        if (url.indexOf('/') + 1) {
          anchor.href = url;
          url = anchor.hostname;
        }

        var domain = url.slice(url.indexOf('.') + 1);
        var successful;

        for (var i = 0; i < protocolCount; i++) {
          for (var j = -1; j < subdomainCount; j++) {
            for (var k = 0; k < pathCount; k++) {
              favicon =
                  protocols[i] + (j + 1 ? subdomains[j] + domain : url) +
                      paths[k];

              jQuery.get(favicon, function(data, status, xhr) {
                var type = xhr.getResponseHeader('Content-Type');

                if (!successful && type && type.indexOf('image/') + 1 && data) {
                  successful = true;
                  callback(favicon);
                }
              }).bind(favicon);
            }
          }
        }
      }
    }, 100);

    return this;
  };

  var version = '1.3.0';
  var protocols = ['http://'];
  var subdomains = ['', 'www.'];
  var paths = ['/favicon.ico'];
  var protocolCount = protocols.length;
  var subdomainCount = subdomains.length;
  var pathCount = paths.length;
  var anchor = document.createElement('a');
  var undeclared = 'undefined';

  if (typeof jQuery == undeclared) {
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', 'vendor/jquery/jquery.js');
    script.onload = function() { jQuery.noConflict(); };
    document.head.appendChild(script);
  }

  return this;
}
