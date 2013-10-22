#!/bin/bash
# A script that packages Disconnect for distribution.
#
# Copyright 2013 Disconnect, Inc.
#
# This program is free software: you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free Software
# Foundation, either version 3 of the License, or (at your option) any later
# version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along with
# this program. If not, see <http://www.gnu.org/licenses/>.
#
# Authors (one per line):
#
#   Eason Goodale <eason.goodale@gmail.com>
#   Brian Kennish <byoogle@gmail.com>
cd builds
rm disconnect.xpi disconnect.zip
cd ../firefox
zip -r ../builds/disconnect.xpi * -x \*.DS_Store \
content/disconnect.safariextension/Icon-32.png \
content/disconnect.safariextension/Icon-48.png \
content/disconnect.safariextension/Icon.png \
content/disconnect.safariextension/Info.plist \
content/disconnect.safariextension/opera/manifest.json \
content/disconnect.safariextension/opera/chrome/images/legacy/\* \
content/disconnect.safariextension/opera/chrome/manifest.json \
content/disconnect.safariextension/opera/chrome/markup/\* \
content/disconnect.safariextension/opera/chrome/scripts/background.js \
content/disconnect.safariextension/opera/chrome/scripts/chrollusion/graphrunner.js \
content/disconnect.safariextension/opera/chrome/scripts/chrollusion/index-embed.js \
content/disconnect.safariextension/opera/chrome/scripts/chrollusion/index.js \
content/disconnect.safariextension/opera/chrome/scripts/content.js \
content/disconnect.safariextension/opera/chrome/scripts/popup.js \
content/disconnect.safariextension/opera/chrome/scripts/services.js \
content/disconnect.safariextension/opera/chrome/scripts/share.js \
content/disconnect.safariextension/opera/chrome/scripts/vendor/port/\* \
content/disconnect.safariextension/opera/chrome/scripts/vendor/tipped/\* \
content/disconnect.safariextension/opera/chrome/stylesheets/chrollusion/\* \
content/disconnect.safariextension/opera/chrome/stylesheets/content.css \
content/disconnect.safariextension/opera/chrome/stylesheets/legacy.css \
content/disconnect.safariextension/opera/chrome/stylesheets/popup.css \
content/disconnect.safariextension/opera/chrome/stylesheets/vendor/tipped/\*
cd content/disconnect.safariextension/opera
zip -r ../../../../builds/disconnect chrome -x \*.DS_Store
