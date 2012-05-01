(function() {
	var uuid = '2b74ff14-7256-42e0-9bf1-0806eec78788';
	
	window.webmynd = window.webmynd || {};
	window.webmynd[uuid] = window.webmynd[uuid] || {};

	window.webmynd[uuid].userData = {
		
		/* Preferences */
		disconnect_data: {
			SERVICES: [
			['Digg', ['digg.com']],
			['Facebook', ['facebook.com', 'facebook.net', 'fbcdn.net']],
			['Google', [
			'google.com',
			'2mdn.net',
			'doubleclick.net',
			'feedburner.com',
			'gmodules.com',
			'google  analytics.com',
			'googleadservices.com',
			'googlesyndication.com'
			], [
			'adwords',
			'checkout',
			'chrome',
			'code',
			'docs',
			'feedburner',
			'groups',
			'health',
			'knol',
			'mail',
			'picasaweb',
			'sites',
			'sketchup',
			'wave'
			], [
			'accounts',
			'analytics',
			'bookmarks',
			'calendar',
			'finance',
			'ig',
			'latitude',
			'reader',
			'voice',
			'webmasters',
			'adsense',
			'alerts',
			'cse',
			'dfp',
			'friendconnect',
			'local',
			'merchants',
			'notebook',
			'support'
			], 'https://www.google.com/'],
			['Twitter', ['twitter.com', 'twimg.com']],
			['Yahoo', ['yahoo.com'], [
			'address',
			'answers',
			'apps',
			'buzz',
			'calendar',
			'edit',
			'finance',
			'games',
			'groups',
			'hotjobs',
			'local',
			'mail',
			'my',
			'notepad',
			'pulse',
			'shine',
			'sports',
			'upcoming',
			'webmessenger',
			'www',
			'alerts',
			'autos',
			'avatars',
			'help',
			'login', // "login" is required for OpenID access but conflicts with "edit".
			'messages',
			'pipes',
			'realestate',
			'smallbusiness',
			'travel',
			'widgets'
			], [], 'https://search.yahoo.com/']
			],
			BLOCKED_NAME: 'Blocked',
			REQUEST_COUNTS: {}
		},
		
		activations: [

			{
				"patterns": [""],
				"scripts": ["common/lib/jquery-tools-1.2.5.webmynd.min.js", "common/api-2b74ff14-7256-42e0-9bf1-0806eec78788.js", "2b74ff14-7256-42e0-9bf1-0806eec78788/in-page.js"],
				"styles": ["2b74ff14-7256-42e0-9bf1-0806eec78788/popup.css"],
				"allowedRemote": [],
				"htmlSnippets": {"disconnect-popup": "2b74ff14-7256-42e0-9bf1-0806eec78788/popup.html"}
			}
		],
		body: "<div class='wmWrapper'></div>" // Required
	}
})();