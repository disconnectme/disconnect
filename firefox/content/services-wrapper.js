var myFunction = ServiceFirefox;

function getService(domain) {
	return myFunction.getFirefoxService(domain);
}

function harden(url) {
	return myFunction.hardenFirefoxService(url);
}