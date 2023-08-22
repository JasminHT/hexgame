
import Events from './u/Events.js'

export default function ActionButtons(menu_name) {

  this.getActionSelected = getActionSelected
  this.unselectActions = unselectActions
  this.showButtonsFor = showButtonsFor


  function showButtonsFor(world, actor, position) { 


    if (actor && actor.selectable) {
      updateActionButtons(world, actor, position);

    } else {
      clearButtons();
    }
  }





  /////////////////////////////////////////////////////////
                    // ACTION MENU AND SELECTION //
  /////////////////////////////////////////////////////////



  //returns the actual action object
  function getActionSelected(actor) {
    return getActionFromId(actor, getActionSelectedId());
  };

  function getActionId(action) {
    return 'action-'.concat(action.name);
  }

  function actionIsSelected(action) {
    return getActionId(action) == getActionSelectedId();
  }

  //Returns the currently selected action_id of the selected unit
  function getActionSelectedId() {

    var action_buttons = getButtonElements();
    
    for (let button of action_buttons)
      if (button.checked) {
        var current_action_id = button.id;
        break;
      }

    return current_action_id;
  };

  function getActionFromId(actor, action_id) {

    if (!actor || !actor.getActions() || !action_id)
      return;

    for (let action of actor.getActions())
      if ('action-'.concat(action.name) == action_id)
        return action;
  };

  function selectActionById(action_id) {
    if (document.getElementById(action_id))
      document.getElementById(action_id).checked = true;
  };

  function selectFirstAction(world, actor, position) {

    let radio_elements = getButtonElements()
    let first_button = radio_elements[0];

    if (first_button && !first_button.disabled) {
      first_button.checked = true;
      let action = getActionFromId(actor, first_button.id);

      //ASYNCHRONOUS PATHFINDING: launch a pathfinding mission, give it a callback to highlight tiles
      action.highlightRangeAsync(world, position);
      
    }
  }

  function unselectActions() {
    let buttons = getButtonElements();
    for (let button of buttons)
      button.checked = false;
  }



























  /////////////////////////////////////////////////////
  //              Functions about HTML action buttons
  /////////////////////////////////////////////////////

  function getButtonElements() {
    return document.getElementById(menu_name).getElementsByClassName('button-input')
  }

  function makeActionButton(action) {

    let description = action.getDescription();
    let extra_description = action.getExtraDescription();

    return makeHTMLButton('action', action.name, description, extra_description);
  }

  //This is the place where REACT should take over
  function makeHTMLButton(menu_name, button_id, button_title, text) {

    let label = document.createElement('label');
    let input = document.createElement('input');
      input.className = 'button-input';
      input.name = menu_name;
      input.type = 'radio';
      input.value = button_id;
      input.id = menu_name+"-"+button_id;

    let div = document.createElement('div')
      div.className = 'action-button'
    
    let span = document.createElement('span');
      span.className = 'extra-description'


    span.appendChild(document.createTextNode(text));
    div.appendChild(document.createTextNode(button_title));
    div.appendChild(document.createElement('br'))
    div.appendChild(span)
    label.appendChild(input)
    label.appendChild(div)

    return label;
  }

  function updateActionButtons(world, actor, position) {

    if (!actor) return;

    var current_action_id = getActionSelectedId();
    generateButtons(world, actor, position);

    //re-select the current action after the buttons have been re-generated
    if (current_action_id) 
      selectActionById(current_action_id);
    else 
      selectFirstAction(world, actor, position);
  }

  //TODO 
  // action.activation and action.requirement require a WORLD, for good reason
  // but this makes interplanetary actions difficult
  // the WORLD is always the location of the ACTOR, not of any TARGET
  // is there any way to pass it in from the UNIT-INPUT, who knows it?
  function generateButtons(world, actor, position) {

    var html_menu = document.getElementById(menu_name);
    html_menu.innerHTML = "<h2 class='action-header'>"+actor.name+"</h2>";

    for (let action of actor.getActions()) {
      
      //don't show action if its activation is not met
      if (!action.activation(world, actor, position)) 
        continue;

      let html_button = makeActionButton(action)
      html_menu.appendChild( html_button );

      //Add click listeners to each button (DOESNT)
      html_button.addEventListener('click', () => {action.highlightRangeAsync(world, position)} );
      
      //Show action in grey if its requirement is not met
      if (!action.requirement(world, actor, position))
        html_button.disabled = true;

      //Show action in grey if you don't have enough resource to use it
      if (action.takes_city_pop && (action.cost > actor.getPop() ))
        html_button.disabled = true;
    }
  }

  function findHTMLButton(action) {
    return document.getElementById("action-".concat(action.name));
  }



  function clearButtons() {
    document.getElementById(menu_name).innerHTML = "<h2 class='action-header'>Click a town</h2>";
  }












  /////////////////////////////////////////////////////
  //              Functions about bonus buttons
  /////////////////////////////////////////////////////

  function makeBonusButton(bonus) {
    return makeHTMLButton('bonus', bonus.name, bonus.getDescription(), bonus.getExtraDescription());
  }

  function generateBonusButtons(bonus_list, world) {

    //get button-list HTML element
    var buttons = document.getElementById('bonus-buttons');
    buttons.innerHTML = "<h2 class='action-header'>Evolution</h2>";

    //display simple message if no bonus available
    if ( !bonus_list.bonusAvailable() ) {
      buttons.innerHTML = "";
      return;
    }

    for (let bonus of bonus_list.getBonusesAvailable(world)) {
      let new_button = makeBonusButton(bonus);
      buttons.innerHTML += new_button;
      //add some click detection to these buttons
    }
  }


  function updateBonusButtons(bonus_list, world) {
    generateBonusButtons(bonus_list, world);
  }

  function clearBonusButtons() {
    document.getElementById('bonus-buttons').innerHTML = "<h2 class='action-header'>Evolution</h2>";
  }






































  /////////////////////////////////////////////////////
  //           Functions about top bar messages
  /////////////////////////////////////////////////////

  function writeMessage(message, element) {
    if (!element) 
      element = 'free-ants';

    document.getElementById(element).innerHTML = message;
  }





}