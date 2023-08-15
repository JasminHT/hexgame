
import Events from './u/Events.js'

export default function ButtonMenu(menu_id, world) {

  this.getActionSelected = getActionSelected
  this.unselectActions = unselectActions
  this.update = update


  function update(unit_input) { 

    let actor = unit_input.getActorSelected();
    let position = unit_input.getHexSelected();

    let free_res = world.getPopulation();
    let total_res = world.resources_collected;

    //updateBonusButtons(world.bonus_list, world);

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

    var action_buttons = getButtonElements('action-buttons');
    
    for (let button of action_buttons)
      if (button.checked) {
        var current_action_id = button.id;
        break;
      }

    return current_action_id;
  };

  function getActionFromId(actor, action_id) {

    if (!actor || !actor.actions || !action_id)
      return;

    for (let action of actor.actions)
      if ('action-'.concat(action.name) == action_id)
        return action;
  };

  function selectActionById(action_id) {
    if (document.getElementById(action_id))
      document.getElementById(action_id).checked = true;
  };

  function selectFirstAction(actor, position) {

    let radio_elements = getButtonElements('action-buttons')

    let first_action = radio_elements[0];
    if (first_action && !first_action.disabled) {
      first_action.checked = true;
      updateActionTargets(actor, position);
    }
  }

  function unselectActions() {
    let buttons = getButtonElements('action-buttons');
    for (button of buttons)
      button.checked = false;
  }

  function getButtonElements(menu_name) {
    return document.getElementById(menu_name).getElementsByClassName('button-input')
  }

  function updateActionTargets(actor, position) {
    let action = getActionSelected(actor);

    if (action)
      action.updateActionTargets( world, actor, position);
  }























  /////////////////////////////////////////////////////
  //              Functions about HTML action buttons
  /////////////////////////////////////////////////////



  function makeActionButton(action) {

    let description = action.getDescription();
    let extra_description = action.getExtraDescription();

    return makeHTMLButton('action', action.name, description, extra_description);
  }

  //This is the place where REACT should take over
  function makeHTMLButton(menu_name, button_id, button_title, text) {

    return "<label>"+
            "<input class='button-input' name='"+menu_name+
            "' type='radio' id='" +menu_name+ "-" + button_id + "'"
             +" value='" + button_id + "'>"+
             "<div class='action-button'>"+ button_title +"<br>"+
             "<span class='extra-description'>"+ text +"</span>"+
             "</div></label></input>";
  }

  function updateActionButtons(world, actor, position) {

    if (!actor) return;

    var current_action_id = getActionSelectedId();
    generateButtons(world, actor, position);

    //re-select the current action after the buttons have been re-generated
    if (current_action_id) 
      selectActionById(current_action_id);
    else 
      selectFirstAction(actor, position);
  }

  function generateButtons(world, actor, position) {

    var html_menu = document.getElementById('action-buttons');
    html_menu.innerHTML = "<h2 class='action-header'>"+actor.name+"</h2>";

    for (let action of actor.actions) {
      
      //don't show action if its activation is not met
      if (!action.activation(world, actor, position)) 
        continue;

      html_menu.innerHTML += makeActionButton(action);
      let html_button = findHTMLButton(action);

      //Add click listeners to each button
      html_button.addEventListener('click', () => updateActionTargets(actor, position) );
      
      //Show action in grey if its requirement is not met
      if (!action.requirement(world, actor, position))
        html_button.disabled = true;

      //Show action in grey if you don't have enough resource to use it
      if (action.takes_city_pop && (action.free_pop_cost > actor.getPop() ))
        html_button.disabled = true;
    }
  }

  function findHTMLButton(action) {
    return document.getElementById("action-".concat(action.name));
  }



  function clearButtons() {
    document.getElementById('action-buttons').innerHTML = "<h2 class='action-header'>Click a town</h2>";
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