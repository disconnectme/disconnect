/**
 * A class for determining a website’s canonical domain name
 * (<samp>disconnect.me</samp>, <samp>abc.net.au</samp>, even
 * <samp>byoogle.appspot.com</samp>).
 * <br />
 * <br />
 * Copyright 2012 Disconnect, Inc.
 * <br />
 * <br />
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * <br />
 * <br />
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the <a
 * href="https://www.gnu.org/licenses/gpl.html">GNU General Public License</a>
 * for more details.
 * <br />
 * @constructor
 * @author <a href="https://github.com/byoogle">Brian Kennish</a>
 */
function Sitename() {
  /**
   * Determines a canonical domain name.
   * @param  {string}           url      A website’s absolute URL.
   * @param  {function(string)} callback A continuation, to execute when the
   *                                     method completes, that takes a
   *                                     canonical domain name.
   * @return {Sitename}                  The domain object.
   */
  this.get = function(url, callback) {
    var id = setInterval(function() {
      if (initialized) {
        clearInterval(id);
        anchor.href = url;
        var domain = anchor.hostname;
        var labels = domain.split('.');
        var labelCount = labels.length - 1;

        // IP addresses shouldn’t be munged.
        if (isNaN(parseFloat(labels[labelCount]))) {
          domain = labels.slice(-2).join('.');
          for (var i = labelCount; i > 1; i--)
              if (tlds[labels.slice(-i).join('.')])
                  domain = labels.slice(-i - 1).join('.');
        }

        callback(domain);
      }
    }, 100);

    return this;
  };

  var version = '1.1.0';
  var tldList =
      'https://mxr.mozilla.org/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1';
  var altTldList = '../scripts/vendor/sitename/data/effective_tld_names.dat';
  var tldPatch = '../scripts/vendor/sitename/data/tldpatch.json';
  var undeclared = 'undefined';
  var initialized = false;
  var anchor = document.createElement('a');
  var tlds = localStorage.tlds;

  function parseTldList(data) {
    data = data.split('\n');
    var lineCount = data.length;
    initialized = false;
    tlds = {};

    for (var i = 0; i < lineCount; i++) {
      var line = jQuery.trim(data[i]);

      if (line && line.slice(0, 2) != '//') {
        // Fancy syntax is fancy.
        var prefix = line.charAt(0);
        if (prefix == '*' || prefix == '!') line = line.slice(1);

        if (line.charAt(0) == '.') line = line.slice(1);
        tlds[line] = true;
      }
    }

    jQuery.getJSON(tldPatch, function(data) {
      var tldCount = data.length;
      for (var i = 0; i < tldCount; i++) tlds[data[i]] = true;
      initialized = true;
      localStorage.tlds = JSON.stringify(tlds);
    });
  }

  if (typeof jQuery == undeclared) {
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', '../scripts/vendor/jquery/jquery-1.7.2.min.js');
    script.onload = function() { jQuery.noConflict(); };
    document.head.appendChild(script);
  }

  if (tlds) {
    tlds = JSON.parse(tlds);
    initialized = true;
  } else tlds = {};

  var id = setInterval(function() {
    if (typeof jQuery != undeclared) {
      clearInterval(id);
      var fetch = jQuery.get;

      fetch(tldList, function(data) { parseTldList(data); }).fail(function() {
        fetch(altTldList, function(data) { parseTldList(data); });
      });
    }
  }, 100);

  return this;
}
