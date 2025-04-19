



export default function BonusList() {
	this.bonuses = [

	new bonusCreateVillages(),
	new bonusCreateWaterDens(),
	new bonusMoveCities(),
	new bonusCreateExpedition(),
	new bonusCitiesRange3(),
	new bonusCitiesRange5()


	];

	this.number_of_bonuses = 0;
	this.next_bonus = [ 1,3,10,30,100,300,1000];
}

BonusList.prototype.bonusNameList = function() {
	return this.bonuses.filter(bonus => bonus.name);
}

BonusList.prototype.bonusAvailable = function(world) {
	for (let bonus of this.bonuses) {

		if (bonus.activation(world) && !bonus.enabled)
			return true;
	}
	return false;
}

BonusList.prototype.bonusEnabled = function(bonus_name) {
	let bonus = this.getBonus(bonus_name);
	return (bonus && bonus.enabled);
}

BonusList.prototype.getBonus = function(bonus_name) {
	for (let bonus of this.bonuses) {
		if (bonus.name == bonus_name)
			return bonus;
	}
	return false;
}

BonusList.prototype.getBonuses = function() {

	return this.bonuses;
}

BonusList.prototype.getBonusesAvailable = function(world) {
	return this.bonuses.filter(bonus => (!bonus.enabled && bonus.requirement(world)));
}

BonusList.prototype.enableBonus = function(bonus_name) {
	let bonus = this.getBonus(bonus_name);

	if (bonus) {
		bonus.enabled = true;
		this.number_of_bonuses++;
	}
}

//bonus list should not need to refer to the world
BonusList.prototype.nextBonusCostMet = function(world) {
	//return world.resources_collected >= this.next_bonus[this.number_of_bonuses];
}






function Bonus() {
	this.name = 'generic-bonus';
	this.description = 'Generic bonus';
	this.extra_description = '';
	this.enabled = false;

	this.getDescription = function() {
		return this.description;
	}

		this.getExtraDescription = function() {
		return this.extra_description;
	}

	this.requirement = function(world) {

		if (!world.bonus_list.nextBonusCostMet(world))
			return false; 

		//if (this.min_collected && world.resources_collected < this.min_collected)
			//return false;

		if (this.required_bonus && !world.bonus_list.bonusEnabled(this.required_bonus))
			return false;
		
		return this.activation(world);
	}

	this.activation = function(world) {
		return true;
	}

	this.effect = function(world) {

	}
}







function bonusCreateVillages() {
	Bonus.call(this);
	this.name = 'can-create-villages';
	this.description = "Tunneling";
	this.extra_description = "Create tunnels to reach resources further away";
}

function bonusCitiesRange3() {
	Bonus.call(this);
	this.name = 'cities-range-3';
	this.description = "Bigger city";
	this.required_bonus = 'can-create-villages';
}
function bonusCitiesRange5() {
	Bonus.call(this);
	this.name = 'cities-range-5';
	this.description = "Bigger city";
	this.required_bonus = 'cities-range-3';
}

function bonusCreateExpedition() {
	Bonus.call(this);
	this.name = 'expedition-centers';
	this.description = "Exploration";
	this.required_bonus = 'can-create-villages';
}

function bonusCreateWaterDens() {
	Bonus.call(this);
	this.name = 'can-create-waterdens';
	this.description = "Amphibious";
}

function bonusMoveCities() {
	Bonus.call(this);
	this.name = 'moveable-cities';
	this.description = "Nomadic Hives";
}

function bonusCreateHarbours() {
	Bonus.call(this);
	this.name = 'harbours';
	this.description = "Ocean navigation";
	this.required_bonus = 'can-create-waterdens';
}


