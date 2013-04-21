# Disconnect

A [browser extension](https://disconnect.me/) that makes the web faster, more
private, and more secure.

You might fancy [watching a demo](https://www.youtube.com/watch?v=Lvem1Z66C7Q)
or [trying the extension](https://disconnect.me/).

## Dev HOWTO

0. Fork this repository.
1. Switch to your working directory of choice.
2. Clone the development repo:

        git clone git@github.com:[username]/disconnect.git

### In Chrome

3. Go to the Chrome menu > **Tools** > **Extensions**.
4. Check **Developer mode** then press **Load unpacked extension...** .
5. Find your working directory.
6. Under `chrollusion.safariextension`, select `chrome`.
7. To test after you make a change, be sure to expand the extension listing then
   press **Reload**.
8. Push your changes.
9. Send us pull requests.

### In Firefox

3. Go to [your Mozilla profile
   folder](http://kb.mozillazine.org/Profile_folder).
4. Under `extensions`, create a new text file.
5. Enter the path to your working directory followed by `firefox` then a closing
   slash in the file.
6. Save the file as `2.0@disconnect.me`.
7. (Re)start Firefox.
8. To test after you make a change, be sure to restart Firefox.
9. Push your changes.
10. Send us pull requests.

### In Safari

3. Go to **Develop** > **Show Extension Builder**.
4. Click **+** then select **Add Extension...** .
5. Find your working directory.
6. Select `chrollusion.safariextension`.
7. Click **Install** then **Allow**.
8. To test after you make a change, be sure to click **Reload** then **Allow**.
9. Push your changes.
10. Send us pull requests.

## Software used

These libraries are bundled with the project and needn’t be updated manually:

* [jQuery](https://github.com/jquery/jquery)
* [SJCL](https://github.com/bitwiseshiftleft/sjcl)
* [D3.js](https://github.com/mbostock/d3)
* [port.js](https://github.com/disconnectme/port)
* [sitename.js](https://github.com/disconnectme/sitename)
* [favicon.js](https://github.com/disconnectme/favicon)

## License

Copyright 2010–2013 Disconnect, Inc.

This program, except as noted below, is free software: you can redistribute it
and/or modify it under the terms of the GNU General Public License as published
by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the [GNU General Public
License](https://www.gnu.org/licenses/gpl.html) for more details.

## Exceptions

The Disconnect logos, trademarks, domain names, and other brand features used in
this program cannot be reused without permission. The following, temporary,
portions of the program cannot be reused either:

* [tipped.js](https://github.com/disconnectme/disconnect/blob/master/firefox/content/disconnect.safariextension/chrome/scripts/vendor/tipped/tipped.js)
  provides tooltips and can be replaced with a library such as [jQuery
  UI](http://jqueryui.com/).

* [services.js](https://github.com/disconnectme/disconnect/blob/master/firefox/content/disconnect.safariextension/chrome/scripts/services.js)
  and
  [services-firefox.js](https://github.com/disconnectme/disconnect/blob/master/firefox/content/services-firefox.js)
  determine whether a domain name belongs to a third party and can be replaced
  by implementing a single method:

### {Object} getService({string} domain)

Retrieves the third-party metadata, if any, associated with a domain name.

#### Parameter

`domain` The domain name.

#### Return value

A hash with the keys `category` (`Advertising`, `Analytics`, `Social`, or
`Content`), (company) `name`, and (homepage) `url`.
