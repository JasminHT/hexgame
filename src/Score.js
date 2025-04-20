/////////////////////////////////////////////////////
//              Functions about keeping score
/////////////////////////////////////////////////////

import Events from './u/Events.js'

function clearScore() {
  document.getElementById('score').innerHTML = "";
}

function getScore() {
  return document.getElementById('score').innerHTML;
}

function addScore(message) {
  document.getElementById('score').innerHTML += message;
}

export default function Score(init) {

  let self = this;
  self.total = init | 0 ;

  Events.on('score_increase', (event) => { 
    self.total += event.detail.points;
    clearScore();
    addScore(self.total);
   });

}





