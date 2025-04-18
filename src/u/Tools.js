// HELPERS

function assert(condition,message) {
	if (!condition) {
		complain(message);
	}
}

function scream() {
	document.getElementById('console').innerHTML += '<br>aaah!';
}

function complain(message) {
	document.getElementById('console').innerHTML += "<br>";
	document.getElementById('console').innerHTML += message;
}

