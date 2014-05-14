/*
  A script that catches errors and reports them to Disconnect.

  Copyright 2010-2014 Disconnect, Inc.

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

function pingURL(url) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', url);
  httpRequest.send();
}

function errorReport(message, filename, linenumber) {
  var version = 'unknown'
  var firstBuild = localStorage.firstBuild || 'unknownBuild'
  if (!linenumber) linenumber = 'unknown'
  if (!message) message = 'unknown'

  try {
    version = chrome.runtime.getManifest().version;
    console.log('message: ' + message + ' linenumber: ' + linenumber);
    var filename = filename.substr(filename.lastIndexOf('/') + 1);
    filename = filename.slice(0, -3)
    message = message.split(' ').join('+');
    pingURL('https://disconnect.me/error/d2/' + firstBuild + '/' + version + '/' + filename + '/' + linenumber + "/" + message);
    console.log('https://disconnect.me/error/d2/' + firstBuild + '/' + version + '/' + filename + '/' + linenumber)
  }
  catch(e) {
    console.log('message: ' + message + ' linenumber: ' + linenumber);
    pingURL('https://disconnect.me/error/d2/' + firstBuild + version + '/' + linenumber);
  }
  return true;
};

window.onerror = errorReport;
