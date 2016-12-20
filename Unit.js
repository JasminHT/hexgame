

//           GENERIC UNIT --------------------//

function Unit(unit_type) {
	this.range;
	
	this.sight = 3;
	
	this.color;
	this.movement;
	this.movement_left;

	this.heighto = 0;

	this.setType(unit_type);
};


	Unit.prototype.findRange = function(map,position) {
		var pathfinder = new PathFinder(map);
		this.range = pathfinder.rangePathfind(position,this.movement_left);
	};

	Unit.prototype.action = function(action) {
		switch (action.type) {
			//case 'move' :
			//	this.move_to(action.position)
				//break;
			case 'shoot' :
				this.attack(action.position);
				break;

		}
	}

	Unit.prototype.setType = function(unit_type) {
		this.unit_type = unit_type;
		switch (unit_type) {
		case 'player':
			this.setMovement(6);
			this.setColor('red');
			break;
		case 'fast-player':
			this.setMovement(24);
			this.setColor('blue');
			break;
		case 'tree':
			this.setMovement(0);
			this.setColor('red');
			break;
		default:
			this.setMovement(0);
			this.setColor('yellow');
			break;
		}
	}

	Unit.prototype.getType = function() {
		return this.unit_type;
	}

	Unit.prototype.setMovement = function(movement) {
		this.movement = movement;
		this.movement_left = movement;
	}
	Unit.prototype.setColor = function(color) {
		this.color = color;
	}

	Unit.prototype.move = function(map,current_hex,next_hex) {
		//measure the distance moved
		var pathfinder = new PathFinder(map);
		//var movement_cost = pathfinder.moveCostRelative(current_hex,next_hex);
		pathfinder.destinationPathfind(current_hex,next_hex,this.movement_left);
		//calculate movement cost
		var movement_cost = pathfinder.moveCostRelative(current_hex,next_hex,this.movement_left)
		//substract it from the movement remaining
		this.movement_left -= movement_cost;

		if (this.movement_left <= 0) {
			//this.movement_left = this.movement;
		}

	}