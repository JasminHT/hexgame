function HUDRenderer(world, game_input, hex_renderer) {

  this.game_input = game_input;
  this.world = world;
  this.unit_input = game_input.unit_input;
  this.hex_renderer = hex_renderer;
}





/////////////////////////////////////////////////////
//          Functions about map overlay information
/////////////////////////////////////////////////////
HUDRenderer.prototype.drawHUD = function() {


  var hex_hovered = this.game_input.hex_hovered;
  var hex_selected = this.unit_input.hex_selected;

  if (hex_selected) {
    let unit = this.unit_input.getActorSelected();
    if (unit) {
      let action = this.unit_input.getActionSelected();
      if (action && action.name != 'city-by-air')
        this.drawActorRange();
    } 

    this.drawSelectionHex(hex_selected);

    if (hex_hovered) {
      for (var hex of Hex.circle(hex_hovered, this.unit_input.getActionHoverRadius()))
        this.drawHoveredHex(hex);

      this.drawHoveredHex(hex_hovered);
    }

  } else {
    if (hex_hovered ) {
      this.drawHoveredHex(hex_hovered);
    }
  }



}

HUDRenderer.prototype.drawActionLine = function (hex_hovered, hex_selected) {

  //draw a line from actor to target
  let action = this.unit_input.getActionSelected();
  let actor = this.unit_input.getActorSelected();

  if (action && actor) {
    let path = action.getActionPath(world, actor, hex_selected, hex_hovered, 15);

    let color = '#C50';
    if ( action.targetFilterFunction(this.world, actor, hex_hovered) )
      color = '#5C0';

    this.drawPath(path, color);
  }
}

HUDRenderer.prototype.drawPath = function(hexarray, color) {
  var previous = hexarray[0];
  for (hex of hexarray) {
    this.hex_renderer.drawCenterLine(hex, previous, 6, color );
    previous = hex;
  }
}

HUDRenderer.prototype.actorHasRenderableRange = function(actor) {
  return (actor && actor.selectable && actor.range.length > 0)
}



HUDRenderer.prototype.drawActorRange = function() {
  //draw range of selected actor
  var actor = this.unit_input.getActorSelected();
  
  //range style
  var range_style = new RenderStyle();
  range_style.fill_color = "rgba(255,255,150, "+this.ocillate(900)+")";
  range_style.line_color = "rgba(255,255,100,"+(0.5+0.5*this.ocillate(900))+")";

  if (this.actorHasRenderableRange(actor)) {
    this.hex_renderer.drawHexes(actor.range, range_style);

  }
}

HUDRenderer.prototype.drawHoveredHex = function(hex_hovered) {
  //draw hovered hex
  var hover_style = new RenderStyle();
  hover_style.fill_color = "rgba(200,200,200,0.4)";
  hover_style.line_width = 0;
  this.hex_renderer.drawHex( hex_hovered, hover_style );
}

HUDRenderer.prototype.drawSelectionHex = function(hex_selected) {
    //draw selection hex
    var select_style = new RenderStyle();

    select_style.fill_color = "rgba(200,200,0,"+this.ocillate(500)+")";
    select_style.line_width = 2;
    //this.hex_renderer.drawHex(hex_selected, select_style);
    this.hex_renderer.drawCenterLine(
          hex_selected,
          Hex.add(hex_selected,new Hex(20,-40)),
          16*this.unit_input.getActorSelected().size, 
          "rgba(0,200,200,"+(0.3+0.7*this.ocillate(1000))+")" );
}

HUDRenderer.prototype.ocillate = function(length) {
  let time = new Date().getTime()%length;
  let opacity = Math.abs(time/length-0.5);
  return opacity;
}








/////////////////////////////////////////////////////
//              Functions about action buttons
/////////////////////////////////////////////////////

HUDRenderer.prototype.makeActionButton = function(action) {

  let extra_description = "<br><span class='extra-description'>" + action.getExtraDescription()+"</span>";

  return "<label><input class='action-button-input' name='actions' type='radio' "
           +" id='action-" + action.name + "'"
           +" value='" + action.name + "'><div class='action-button'>"
           + action.getDescription() + extra_description + "</div></label></input>";
}

HUDRenderer.prototype.updateActionButtons = function() {

  //do nothing if there is no unit to update
  let actor = this.unit_input.getActorSelected();
  let position = this.unit_input.getHexSelected();
  if (!actor) return;

  //remember previous action
  var current_action = this.unit_input.getActionSelectedId();

  //generate new button list
  this.generateButtons(actor, position);
  this.addClickDetection();

  //reselect the previously selected action
  if (current_action) {
    this.unit_input.selectActionById(current_action);
  } else {
    this.selectFirstActionIfNoneSelected();
  }
}

HUDRenderer.prototype.generateButtons = function(actor, position) {

  //get button-list HTML element
  var action_buttons = document.getElementById('action-buttons');
  action_buttons.innerHTML = "<h2 class='action-header'>"+actor.name+"</h2>";

  //display simple message if no unit is selected
  if (!actor.actions || actor.actions.length == 0) {
    action_buttons.innerHTML = "Click a town";
    return;
  }

  for (let action of actor.actions) {
    
    //only show actions whose activation is met
    if (!action.activation(this.world, actor, position)) 
      continue;

    if (action.getActionRange(this.world, actor, position).length < 1 && !action.infinite_range)
      continue;

    let new_button = this.makeActionButton(action);
    action_buttons.innerHTML += new_button;
    
    //Show actions in grey if their requirements are not met
    if (!action.requirement(this.world, actor, position)) {
      document.getElementById("action-".concat(action.name)).disabled = true;
    }
  }
}

HUDRenderer.prototype.selectFirstActionIfNoneSelected = function() {

  //test if an action is already selected
  let radio_elements = document.getElementById('action-buttons').getElementsByClassName('action-button-input');
  for (radio of radio_elements) {
    if (radio.checked) 
      return;
  }

  //if none were selected, select the first one
  let first_action = radio_elements[0];
  if (!first_action.disabled) {
    first_action.checked = true;
    this.unit_input.updateActionRangeIndirectly();
  }


}

HUDRenderer.prototype.addClickDetection = function() {
  let self = this;
  //add the click-detection code
  for (let button of document.getElementsByClassName('action-button-input')) {
    button.addEventListener('click', function(){ self.unit_input.updateActionRangeIndirectly(); });
  }
}

HUDRenderer.prototype.clearButtons = function() {
  document.getElementById('action-buttons').innerHTML = "<h2 class='action-header'>Click a town</h2>";
}











/////////////////////////////////////////////////////
//           Functions about top bar messages
/////////////////////////////////////////////////////

HUDRenderer.prototype.writeMessage = function(message, element) {
  if (!element) 
    var element = 'free-ants';
  document.getElementById(element).innerHTML = message;
}

HUDRenderer.prototype.update_function = function() { 
  let actor = this.unit_input.getActorSelected();
  let free_pop = this.world.getPopulation();
  let total_pop = this.world.total_population;
  let busy_pop = total_pop-free_pop;

  let resources = this.world.total_resources;
  this.writeMessage("Free ants: "+free_pop, 'free-ants');
  this.writeMessage("Total ants: "+total_pop, 'total-ants');


  if (actor && actor.selectable) {
    this.updateActionButtons();
  } else {
    this.clearButtons();
    this.writeMessage("", 'city-resources');
  }
}









/////////////////////////////////////////////////////
//              Functions about Tooltip
/////////////////////////////////////////////////////

function clearTooltip() {
  document.getElementById('tooltip').innerHTML = "";
}

function getTooltip() {
  return document.getElementById('tooltip').innerHTML;
}

function addTooltip(message) {
  document.getElementById('tooltip').innerHTML += message;
}

HUDRenderer.prototype.updateTooltip = function(hex_hovered) {
  clearTooltip();
  
  //skip hidden and out-of-bounds hexes
  if (!hex_hovered) 
    return;
  if (!this.world.tileIsRevealed(hex_hovered)) {
    addTooltip("clouds");
    return;
  }

  //HOVERING OVER THINGS
  this.addTooltipUnit(hex_hovered);
  if (!getTooltip())
    this.addTooltipResource(hex_hovered);
  if (!getTooltip())
    this.addTooltipTile(hex_hovered);

}

HUDRenderer.prototype.addTooltipUnit = function(hex_hovered) {
  let unit = this.world.getUnit(hex_hovered);
  if (unit && unit.hasOwnProperty('size'))
    addTooltip(unit.type+", ");
}

HUDRenderer.prototype.addTooltipResource = function(hex_hovered) {
  let resource = this.world.getResource(hex_hovered);
  if (resource && resource.resources) 
    addTooltip(resource.type+", ");
}

HUDRenderer.prototype.addTooltipTile = function(hex_hovered) {
  let tile = this.world.getTile(hex_hovered);
  if (tile && tile.hasOwnProperty('elevation')) {
    addTooltip(land_tiles[tile.elevation]+", ");
  }
  if (this.world.onRiver(hex_hovered)) {
    addTooltip('river, ');
  }
}