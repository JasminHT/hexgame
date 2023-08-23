import Events from './u/Events.js'
import Hex from './u/Hex.js'
import HexRender from './HexRender.js'
import RenderStyle from './ViewRender.js'
import updateTooltip from './Tooltip.js'

export default function HUDRender(world, world_input, render) {

  var action_input = world_input.getActionInput();
  var hex_render = new HexRender(render, world.getLayout() );
  var action_path = [];
  var action_targets = [];
  var hover_timeout;

  Events.on('hex_hovered_changed', (e) => updateHover(e.detail.world, e.detail.hex_hovered) );
















  // UPDATE FUNCTIONS


  function updateHover(world_hovered, hex_hovered) {

    //TODO this triggers two pathfinding events with each hover of the mouth
    // In order for hovering not to retrace the pathways, the pathways need to be remembered
    // The action can remember them
    //find a way to pathfind once only


    if (!world_hovered.containsHex(hex_hovered))
      return;

    action_targets = [];

    //use a timeout to only trigger when the mouse stops moving
    if (hover_timeout)
      clearTimeout(hover_timeout);
    hover_timeout = setTimeout(function(){ updateActionTargets(world_hovered, hex_hovered);
                                               updateActionPath(world_hovered, hex_hovered); 
                                               //updateTooltip(world, hex_hovered) 
                                             }, 20);

  }


  function updateActionPath (world_hovered, hex_hovered) {
    
    if (!world.sameAs(world_hovered)) 
      return

    let actor = action_input.getActorSelected();
    let action = action_input.getActionSelected();
    let hex_selected = action_input.getHexSelected();

    if (action && actor && hex_selected) {
      action.getPathAsync2(world, hex_selected, hex_hovered, (hexes)=>{action_path=hexes} );
    } else {
      action_path = [];
    }
  }

  function updateActionTargets (world_hovered, hex_hovered) {
    
    let actor = action_input.getActorSelected();
    let action = action_input.getActionSelected();

    action_targets = [];

    if (action && actor && action.hover_action) {
      if (!action.targetFilterFunction(world_hovered, actor, hex_hovered))
        return;


      //ASYNCHRONOUS PATHFINDING: launch a pathfinding mission, and over time store results in "action_targets"
      //pass in a callback so the PathFinder can send results back every so often?
      if (action.hover_action) {
        let hover_action = action.hover_action;

        //returns a "dynamic array" that changes over time as the pathfinder progresses
        action_targets = [];
        hover_action.initialize(world_hovered, hex_hovered);
        hover_action.getTargetsDynamic2(world_hovered, actor, hex_hovered, (hex)=>action_targets.push(hex) );
      }

    } 


  }









  //DRAW FUNCTIONS

  this.drawHUD = function() {

    var hex_hovered = world_input.getHexHovered();
    var hex_selected = action_input.getHexSelected();

    if (hex_hovered && world.containsHex(hex_hovered)) 
      drawHoveredHex(hex_hovered);

    if (!hex_selected) 
      return

    let actor = action_input.getActorSelected();
    if (!actor) 
      return

    let action = action_input.getActionSelected();
    if (!action) 
      return;

    if (action.sky_action && hex_selected && hex_hovered)
      drawStraightLine(actor, action, hex_selected, hex_hovered);

    if (action_path && action_path.length > 0) 
      drawActionPath(actor, action, hex_hovered);

    if ((action.sky_action || action_path) && action_targets && action_targets.length > 0)
      drawActionTargets(actor, action, hex_hovered);

  }

  function drawStraightLine(actor, action, hex1, hex2) {

    let color = '#C50'; //red
    if ( action.targetFilterFunction(world, actor, hex2) )
      color = '#5C0'; //green
    if (!action.infinite_range && Hex.distance(hex1,hex2) > action.max_distance )
      color = '#C50'; //red

    hex_render.drawCenterLine(hex1, hex2, 12, color );
  }

  function drawActionPath (actor, action, hex) {

    //draw a line from actor to target
    let color = '#C50';
    if ( action.targetFilterFunction(world, actor, hex) )
      color = '#5C0';

    drawPath(action_path, color);
  }

  function drawActionTargets (actor, action, hex) {
    
    //Style for Action targets
    var hover_style = new RenderStyle();
    hover_style.fill_color = "rgba(50,200,50,0)";
    hover_style.line_width = 6;
    hover_style.line_color = "rgba(50,200,50,1)";

    for (let target of action_targets) {
      if (!world.getTile(target).hidden)
        hex_render.drawHex( target, hover_style );
    }
  }


  function drawPath(hexarray, color) {
    if (!hexarray)
      return;

    for (let i = 0; i < hexarray.length-1; i++) {
      //TODO FIX THIS MESS OF A FUNCTION
      let tile1 = world.getTile(hexarray[i]);
      let tile2 = world.getTile(hexarray[i+1])
      //if (!tile1.roadConnected(tile2))  //don't draw path through roads
        hex_render.drawCenterLine(hexarray[i], hexarray[i+1], 6, color );
    }
  }



  function drawHoveredHex(hex_hovered) {

    //draw hovered hex
    var hover_style = new RenderStyle();
    hover_style.fill_color = "rgba(200,200,200,0.4)";
    hover_style.line_width = 0;

    hex_render.drawHex( hex_hovered, hover_style );
  }

  function drawSelectionHex(hex_selected) {
    //draw selection hex
    var select_style = new RenderStyle();

    select_style.fill_color = "rgba(200,200,0,"+ocillate(500)+")";
    select_style.line_width = 2;
    //hex_render.drawHex(hex_selected, select_style);
    hex_render.drawCenterLine(
          hex_selected,
          hex_selected.add(new Hex(20,-40)),
          16*action_input.getActorSelected().size, 
          "rgba(0,200,200,"+(0.3+0.7*ocillate(1000))+")" );
  }

  //return a varying opacity depending on the time it is called
  function ocillate(length) {
    let time = new Date().getTime()%length;
    let opacity = Math.abs(time/length-0.5);
    return opacity;
  }


}

