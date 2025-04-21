/////////////////////////////////////////////////////
//              Functions about keeping score
/////////////////////////////////////////////////////

import Events from './u/Events.js'

function setScore(to) {
  document.getElementById('score').innerHTML = to;
}

function setProfit(to) {
  document.getElementById('profit').innerHTML = to;
}

export default function Score(init) {

  let self = this;
  self.total = init | 0 ;

  Events.on('score_increase', (event) => { 
    self.total += event.detail.points;
    setScore(self.total);
   });

  Events.on('set_profit', (event) => { 
    setProfit(event.detail.profit);
   });

}





