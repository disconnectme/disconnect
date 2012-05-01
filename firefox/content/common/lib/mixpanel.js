/*! Copyright 2011 WebMynd Corp. All rights reserved. */
try {
	var mpmetrics = new MixpanelLib("7a28abdbb998a9a894948b561b206654");
} catch(err) {
	var null_fn = function () {};
	var mpmetrics = { 
		track: null_fn, 
		track_funnel: null_fn, 
		register: null_fn, 
		register_once: null_fn,
		register_funnel: null_fn,
		identify: null_fn
	};
}

function pseudoUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
		}
	).toUpperCase();
}

var userUUID = window.localStorage.getItem('user_uuid');
if (userUUID === null) {
	// new install
	userUUID = pseudoUUID();
	window.localStorage.setItem('user_uuid', userUUID);
	mpmetrics.identify(userUUID);
	mpmetrics.track('install', {uuid:userUUID, browser:'Chrome'});
} else {
	mpmetrics.identify(userUUID);
	mpmetrics.track('start', {uuid:userUUID, browser:'Chrome'});
}