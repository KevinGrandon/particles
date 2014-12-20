var BaseParticle = require('./base_particle');
var MarkovChainEvaluator = require('./../util/markov').ChainEvaluator;

function OrganicEaterParticle(world, config) {
	this.currentFuel = 5;
	this.requiredFuelToSpawn = 8;
	this.maxOffshootSpawnDistance = 5;

	this.targetCoords = null;

	this.name = 'OrganicEaterParticle';

	BaseParticle.call(this, world, config);
}

OrganicEaterParticle.prototype = {

	__proto__: BaseParticle.prototype,

	tick: function() {
		var states = {
			eating: this.hungerScore,
			breeding: this.breedScore,
		};

		var action = MarkovChainEvaluator.evaluate(states);
		if (action === 'eating') {
			this.findFood();
			this.feed();
		} else if (action === 'breeding') {
			this.breed();
		}

		this.action = action;
	},

	/**
	 * How hungry is this cell?
	 * 10 is really hungry!
	 */
	get hungerScore() {
		return 15 - this.currentFuel;
	},

	get breedScore() {
		return 10 - this.hungerScore;
	},

	findFood: function() {
		// Got to goal. Is food?
		if (this.targetCoords && this.targetCoords[0] === this.position[0] && this.targetCoords[1] === this.position[1]) {
			this.targetCoords = null;
		} else if (this.targetCoords) {
			// Move towards goal.
			BaseParticle.prototype.moveTowards.call(this, this.targetCoords);
		} else {
			// Find food and set coords to walk to.
			var closest = this.world.findClosest(this, 'OrganicBaseParticle');
			if (closest) {
				this.targetCoords = closest.position;
			}
		}
	},

	feed: function() {
		var fuel = this.world.tryToEatAtCurrentLocation(this, 'OrganicBaseParticle');
		// Increment the fuel by what we ate.
		this.currentFuel += fuel;
	},

	breed: function() {
		if (this.currentFuel > this.requiredFuelToSpawn) {
			this.world.spawnNear(this, OrganicEaterParticle);
			this.currentFuel = 0;
		}
	}
};

module.exports = OrganicEaterParticle;