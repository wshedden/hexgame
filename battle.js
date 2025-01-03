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
    // this.progressBattle();
  }

  progressBattle() {
    // Calculate damage for each unit
    let attackMultiplier = random(0.8, 1.2); // Random multiplier between 0.8 and 1.2
    let defenceMultiplier = random(0.8, 1.2); // Random multiplier between 0.8 and 1.2
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
            opponent.battle = null;
          }
        });
      });
    });

    // Check if the battle has ended
    if (this.isBattleOver()) {
    //   this.endBattle();
    }
  }

  isBattleOver() {
    return this.units.some(unitSet => Array.from(unitSet).every(unit => unit.health <= 0));
  }

  endBattle() {
    this.battleHex.endBattle();
    this.units.forEach(unitSet => {
      unitSet.forEach(unit => {
        unit.battle = null;
      });
    });
  }
}