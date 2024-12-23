class Battle {
  constructor(battleHex, units, options = {}) {
    this.battleHex = battleHex;
    this.units = units || []; // Ensure units is an array
    this.enablePrinting = options.enablePrinting || false;

    // Set battle references
    this.battleHex.startBattle();
    this.units.forEach(unitSet => {
      unitSet.forEach(unit => {
        unit.battle = this;
      });
    });
  }

  start() {
    if (this.enablePrinting) {
      print(`Battle started at hex (${this.battleHex.q}, ${this.battleHex.r})`);
    }
    this.resolve();
  }

  resolve() {
    // Calculate damage and resolve the battle
    let attackMultiplier = random(0.8, 1.2); // Random multiplier between 0.8 and 1.2
    let defenceMultiplier = random(0.8, 1.2); // Random multiplier between 0.8 and 1.2

    // Apply defensive bonus if defender is on a mountain tile
    let defenceBonus = this.battleHex.type === 'mountain' ? 1.5 : 1.0;

    this.units.forEach(unitSet => {
      unitSet.forEach(unit => {
        let opponentSet = this.units.find(set => set !== unitSet);
        opponentSet.forEach(opponent => {
          let damageToOpponent = Math.max(0, Math.floor(unit.attack * attackMultiplier - opponent.defence * defenceMultiplier * defenceBonus));
          opponent.health -= damageToOpponent;

          if (this.enablePrinting) {
            print(`${unit.type} dealt ${damageToOpponent} damage to ${opponent.type}`);
          }

          // Check for unit deaths
          if (opponent.health <= 0) {
            if (this.enablePrinting) {
              print(`${unit.type} wins the battle against ${opponent.type}!`);
            }
            this.battleHex.units.splice(this.battleHex.units.indexOf(opponent), 1); // Remove the opponent unit
            this.battleHex.endBattle();
            opponent.battle = null;
          }
        });
      });
    });
  }
}