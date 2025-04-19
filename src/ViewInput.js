////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//////                                          
//////              VIEW INPUT
//////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

//receives input events from Canv_Input and affects only the View

import Hex from './u/Hex.js'
import {Point, HexLayout, HexMap} from './u/Hex.js'
import Events from './u/Events.js'

export default function ViewInput(view) {

  var world_drag = new Point(0,0);
  var screen_drag = new Point(0,0);

  var zoom_amount = 1;


  //Event listening
  Events.on('canvas_zoom', function(e){
    zoomViewEvent(e.detail.amount, e.detail.mouse_pos);
  } );
  Events.on('canvas_drag', function(e){
    dragEvent(e.detail.mousepos,e.detail.mouseposprevious);
  } );
  Events.on('canvas_resize', function(e){
    resizeEvent(e.detail.width, e.detail.height);
  } );
  document.addEventListener('keydown', logKey);




  //this one goes into WorldInput(world)
  function logKey(event) {
    //console.log(event.keyCode);
    if (event.keyCode === 189 || event.keyCode === 173) { // minus
        zoomViewEvent(1.2);
    }
    if (event.keyCode === 187 || event.keyCode === 61) { // plus
        zoomViewEvent(0.8);
    }

    return false;
  }


  //React to either mouse scrolling or finger pinching
  function zoomViewEvent(zoom, pivot) {

    zoom_amount *= zoom; //1.2 or 0.8
    

    if (1-zoom_amount <= -0.2) { // 1 - 1.1 = -=0.1     1 - 1.3 = -0.3
      view.zoom(zoom_amount, pivot);
      //console.log(zoom_amount);
      zoom_amount = 1;
    }
    if (1-zoom_amount <= 0.2) { // 1 - 0.7 = 0.3,  1-0.9 = 0.1
      view.zoom(zoom_amount, pivot);
      //console.log(zoom_amount);
      zoom_amount = 1;
    }
  }
  



  //React to dragging across the screen with finger or mouse
  function dragEvent(mouse, previous_mouse) {

    //get the movement the mouse has moved since last tick
    var x_move = view.screenToWorld1D(previous_mouse.x-mouse.x);
    var y_move = view.screenToWorld1D(previous_mouse.y-mouse.y);
    var drag_move = new Point(x_move, y_move);

    //shift the view by that movement
    view.shiftPosition(drag_move);

    //shift the image in the temporary canvas
    var temp_context = canvas.getContext('2d');
    temp_context.drawImage(canvas, -(previous_mouse.x-mouse.x), -(previous_mouse.y-mouse.y));
  }




  //React to the window being resized
  function resizeEvent(width, height) {
    view.resizeOutput(width, height);
  }

}