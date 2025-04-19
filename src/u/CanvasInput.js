////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
               
//                   CANVAS INPUT

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

//Dependencies
import Events from './Events.js'
import {Point} from './Hex.js'


//This is the event-detection part of the canvas interface
//Rather than defining the reaction to inputs, this section should only
//detect the inputs, then create a message that is sent to the entire system.
//Each part of the system can then decide how to react to it

export default CanvasInput;

function CanvasInput(canvas_element_id) {

    this.canvas = document.getElementById(canvas_element_id);
    
    //create the mouse pointer 
    this.mouse_pos = new Object();
    this.mouse_pos_previous = new Object();

    this.is_dragging = false;

    this.mouse_down = [];

    this.registerEvents();
}

//Registers all default functions to methods of CanvasInput
CanvasInput.prototype.registerEvents = function() {
  //            HTML5 event --> Reaction below which sends my own events
  this.registerEvent('click', 'clickCanvas');
  this.registerEvent('mousemove', 'mouseMove');
  this.registerEvent('touchmove', 'touchMove');
  this.registerEvent('touchend', 'touchEnd');
  this.registerEvent('touchstart', 'touchStart');
  this.registerEvent('mousewheel', 'mouseWheel');
  this.registerEvent('DOMMouseScroll', 'mouseWheel');
  this.registerEvent('mousedown', 'mouseDown');
  this.registerEvent('mouseup', 'mouseUp');

  var window_resize_function = this.windowResize.bind(this);
  window.addEventListener('resize', window_resize_function, false);
    
}   
//Registers a default HTML event to a method of CanvasInput
CanvasInput.prototype.registerEvent = function(event_name, callback_name) {
    var callback_function = this[callback_name].bind(this);
     this.canvas.addEventListener(event_name, callback_function, false);
    //Events.on(event_name, callback_function);

}

//react to clicking canvas 
CanvasInput.prototype.clickCanvas = function(event) {
  
    event.preventDefault();
    //avoid click at the end of a drag
    if (this.is_dragging == false) {
  
      //trigger the click event
      var click_pos = this.getCursorPosition(event);

      if (this.touching)
        Events.emit('canvas_touch', {click_pos: click_pos} );
      else
        Events.emit('canvas_click', {click_pos: click_pos} );
    }
    //remember that the mouse is done dragging
    this.is_dragging = false;
    this.touching = false;
    
}   

CanvasInput.prototype.mouseDown = function(event) {
  this.mouse_down[event.which] = true;
}

CanvasInput.prototype.mouseUp = function(event) {
  this.mouse_down[event.which] = false;
}

//React to scrolling the mouse wheel
CanvasInput.prototype.mouseWheel = function(event) {
    
  event.preventDefault();
    
  // cross-browser wheel delta
  var e = window.event || event; // old IE support
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

  this.mouse_pos = this.getCursorPosition(event);

  //HERE a message should be sent to the rest of the engine
  Events.emit('canvas_zoom', {amount: 1-delta*0.2, mouse_pos: this.mouse_pos} );

  return false;   
}

//react to the mouse moving, hovering and dragging
CanvasInput.prototype.mouseMove = function(event) {

  event = event || window.event;

  var drag_treshold = 2;
  //find the hovered position
  this.mouse_pos[0] = this.getCursorPosition(event);

  //detect mouse hovering for animations
  Events.emit('canvas_hover', {mousepos: this.mouse_pos[0]} )

  //check if the mouse button is down, triggering a drag
  if (this.mouse_down[1]) {
    var mouse_pos = this.mouse_pos[0];
    var mouse_pos_previous = this.mouse_pos_previous[0];
    var distance_moved = distance(mouse_pos,mouse_pos_previous);
      //avoid mini-drags
      if (distance_moved > drag_treshold) {
          this.is_dragging = true; //prevents clicksat the end of a drag
      }
      //call the drag function
      Events.emit('canvas_drag', { mousepos: this.mouse_pos[0],
                                 mouseposprevious: this.mouse_pos_previous[0] });
      
  }

  //remember the previous mouse position
  this.mouse_pos_previous[0] = this.mouse_pos[0];
}


//react to touchscreen events across the screen
CanvasInput.prototype.touchMove = function(ev) {
    ev.preventDefault();
    ev = ev || window.event;
    var id = new Object();


    //iterate over all touches
    for (var i=0;i < ev.touches.length; i++) {

        //get the ID of that touch
        id[i] = ev.touches[i].identifier;

        //find the touch position on the canvas
        this.mouse_pos[id[i]] = this.getCursorPosition(ev.touches[i]);

    }

    //these only happen for one touch (should be for the first touch)
    if (ev.touches.length == 1) {

        if (this.mouse_pos_previous[id[0]] != undefined) {
            this.is_dragging = true; //prevents clicks at the end of a drag
            var drag = { mousepos: this.mouse_pos[id[0]],
	                 mouseposprevious: this.mouse_pos_previous[id[0]]};
	      Events.emit('canvas_drag', drag);
        }
    }

    //this is what happens for double touches
    if (ev.touches.length == 2) {

        if (this.mouse_pos[id[0]] != undefined &&
            this.mouse_pos[id[1]] != undefined &&
            this.mouse_pos_previous[id[0]] != undefined &&
            this.mouse_pos_previous[id[1]] != undefined    ) {
       var average_pos = point_average(this.mouse_pos[id[0]], this.mouse_pos[id[1]]);
       var average_pos_previous = point_average(this.mouse_pos_previous[id[0]], this.mouse_pos_previous[id[1]]);
     }

        //move screen for both finders
        if (average_pos != undefined) {
            this.is_dragging = true; //prevents clicks at the end of a drag
            var drag = { mousepos: average_pos,
                   mouseposprevious: average_pos_previous};
        Events.emit('canvas_drag', drag);
        }

        //zoom screen with two fingers      
        if (this.mouse_pos_previous[id[0]] != undefined && 
	          this.mouse_pos_previous[id[1]] != undefined) {
            var previous_distance = distance(this.mouse_pos_previous[id[0]],  this.mouse_pos_previous[id[1]]);
            var current_distance =  distance(this.mouse_pos[id[0]],           this.mouse_pos[id[1]] );
            var difference = current_distance-previous_distance;

            Events.emit('canvas_zoom', {amount: 1-difference/200} );
        }
    }

    //remember the previous touches
    for (var i=0;i < ev.touches.length; i++) {
        //remember the previous 
        this.mouse_pos_previous[id[i]] = this.mouse_pos[id[i]];
    }
}

//React to finger starting to touch screen
CanvasInput.prototype.touchStart = function(ev) {

    //ev.preventDefault();
    for(var i=0;i<ev.changedTouches.length;i++) {
        var id = ev.changedTouches[i].identifier;
        delete this.mouse_pos_previous[id];
    }
}

//React to finger removed from screen
CanvasInput.prototype.touchEnd = function(ev) {

    this.touching = true;

    //ev.preventDefault();
    for(var i=0;i<ev.changedTouches.length;i++) {
        var id = ev.changedTouches[i].identifier;
        delete this.mouse_pos_previous[id];
    }
    if (this.is_dragging == false) {
      //  this.clickCanvas(ev);
    }
    this.is_dragging = false;
}

//React to screen being resized
CanvasInput.prototype.windowResize = function()  {

    //mesure the new window size
    var width = window.innerWidth;
    var height = window.innerHeight;

    //Send the resize event here
    Events.emit('canvas_resize', {width:width, height:height} );

    //size canvas to fit resized window
    this.canvas.width = width;
    this.canvas.height = height;

}









//HELPER FUNCTIONS

//returns the (x,y) position of the cursor in the canvas
CanvasInput.prototype.getCursorPosition = function(event) {
    //get mouse position
    var e = event;
    var coords = this.canvas.rel_mouse_coords(e); //function defined
    return new Point(coords.x,coords.y);
}

function point_average(point1, point2) {

  return new Point((point1.x+point2.x)/2, (point1.y+point2.y)/2);
}

//returns the cartesian distance between two points
function distance(point1,point2) {

    return Math.hypot(point2.x-point1.x, point2.y-point1.y);
}


/* 
 * Get Mouse Coordinates on the Canvas element 
 */
function rel_mouse_coords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft 
        totalOffsetY += currentElement.offsetTop 
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
};
HTMLCanvasElement.prototype.rel_mouse_coords = rel_mouse_coords;



