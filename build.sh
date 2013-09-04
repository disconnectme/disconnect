#!/bin/bash          
( 
	cd firefox/; zip -r ../builds/FIREFOX-DISCONNECT.xpi * ;
	cd content/disconnect.safariextension/; zip -r ../../../builds/SAFARI-DISCONNECT.zip * ;
	cd opera/; zip -r ../../../../builds/OPERA-DISCONNECT.zip * ;
	cd chrome/; zip -r ../../../../../builds/CHROME-DISCONNECT.zip * ;
)