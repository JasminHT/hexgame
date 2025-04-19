
export default function Events () {}

//Pass the name of the event, and the callback function
//Example: on("test", function(e){ alert(e.detail);});
Events.on = function(name, callback) {
		window.addEventListener(name, callback,  { passive: false });
}

 
 //Pass the name of the event
 //Example: offEvent('test');
Events.stopListening = function(name) {
	window.removeEventListener(name);	
}


//Pass the name of the event, and all the variables you want as the detail
Events.emit = function(name, val) {
    window.dispatchEvent(new CustomEvent(name, {
        detail: val
    }));
};
