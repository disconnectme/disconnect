/**
 * A class for determining a website’s canonical domain name
 * (<samp>disconnect.me</samp>, <samp>abc.net.au</samp>, even
 * <samp>byoogle.appspot.com</samp>).
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
 * @author <a href="https://github.com/byoogle">Brian Kennish</a>
 */
function Sitename() {
  /**
   * Indicates whether the reference TLDs are loaded.
   * @return {boolean} True if the reference TLDs are loaded or false if not.
   */
  this.isInitialized = function() { return initialized; };

  /**
   * Determines a canonical domain name.
   * @param  {string} url A website’s absolute URL.
   * @return {string}     A domain name or IP address.
   */
  this.get = function(url) {
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

    return domain;
  };

  var version = '1.4.0';
  var tldList =
      'https://mxr.mozilla.org/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1';
  var initialized = false;
  var anchor = document.createElement('a');
  var tlds = (options || localStorage).tlds;

  function parseTldList(data) {
    data = data.split('\n');
    var lineCount = data.length;
    initialized = false;
    tlds = altTlds;

    for (var i = 0; i < lineCount; i++) {
      var line = $.trim(data[i]);

      if (line && line.slice(0, 2) != '//') {
        // Fancy syntax is fancy.
        var prefix = line.charAt(0);
        if (prefix == '*' || prefix == '!') line = line.slice(1);

        if (line.charAt(0) == '.') line = line.slice(1);
        tlds[line] = true;
      }
    }

    var tldCount = tldPatch.length;
    for (var i = 0; i < tldCount; i++) tlds[tldPatch[i]] = true;
    initialized = true;
    (options || localStorage).tlds = JSON.stringify(tlds);
  }

  if (tlds) {
    tlds = JSON.parse(tlds);
    initialized = true;
  } else tlds = {};

  $.get(tldList, function(data) { parseTldList(data); });

  return this;
}
