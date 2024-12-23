class Battle {
  constructor(attackerHex, defenderHex, options = {}) {
    this.attackerHex = attackerHex;
    this.defenderHex = defenderHex;
    this.attacker = attackerHex.units[0]; // Assuming the first unit is the attacker
    this.defender = defenderHex.units[0]; // Assuming the first unit is the defender
    this.enablePrinting = options.enablePrinting || false;

    // Set battle references
    this.attackerHex.battle = this;
    this.defenderHex.battle = this;
    this.attacker.battle = this;
    this.defender.battle = this;
  }

  start() {
    if (this.enablePrinting) {
      print(`Battle started between Player ${this.attacker.id} and Player ${this.defender.id}`);
    }
    this.resolve();
  }

  resolve() {
    // Calculate damage and resolve the battle
    let attackMultiplier = random(0.8, 1.2); // Random multiplier between 0.8 and 1.2
    let defenceMultiplier = random(0.8, 1.2); // Random multiplier between 0.8 and 1.2

    // Apply defensive bonus if defender is on a mountain tile
    let defenceBonus = this.defenderHex.type === 'mountain' ? 1.5 : 1.0;

    let damageToDefender = Math.max(0, Math.floor(this.attacker.attack * attackMultiplier - this.defender.defence * defenceMultiplier * defenceBonus));
    let damageToAttacker = Math.max(0, Math.floor(this.defender.attack * defenceMultiplier - this.attacker.defence * attackMultiplier));

    // Apply damage
    this.defender.health -= damageToDefender;
    this.attacker.health -= damageToAttacker;

    if (this.enablePrinting) {
      print(`Attacker dealt ${damageToDefender} damage, Defender dealt ${damageToAttacker} damage`);
    }

    // Check for unit deaths
    if (this.defender.health <= 0) {
      if (this.enablePrinting) {
        print(`Player ${this.attacker.id} wins the battle!`);
      }
      this.defenderHex.units.splice(this.defenderHex.units.indexOf(this.defender), 1); // Remove the defender unit
      this.defenderHex.battle = null;
      this.defender.battle = null;
    }

    if (this.attacker.health <= 0) {
      if (this.enablePrinting) {
        print(`Player ${this.defender.id} wins the battle!`);
      }
      this.attackerHex.units.splice(this.attackerHex.units.indexOf(this.attacker), 1); // Remove the attacker unit
      this.attackerHex.battle = null;
      this.attacker.battle = null;
    }
  }
}