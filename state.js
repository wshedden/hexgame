class State {
  constructor() {
    this.minimumDuration = 500; // Default minimum duration in milliseconds
  }

  enter() {}
  update() {}
  draw() {}
  exit() {}
  getName = () => this.constructor.name;
}

class InitState extends State {
  enter() {
    console.log("Game initialised. Press any key to start.");
  }

  update() {
    // Wait for user input to start the game
    if (keyIsPressed) {
      if (key === 't' || key === 'T') {
        players[0].isHuman = true;
        stateManager.changeState(new PlayingHumanState());
      } else {
        stateManager.changeState(new PlayingState());
      }
    }
  }

  draw() {
    drawInitState();
  }
}

class PlayingState extends State {
  enter() {
    print("Entered playing state");
    startNewTurn();
    print("New turn started");
    stateManager.changeState(new ThinkingState());
  }

  draw() {
    drawPlayingState();
  }
}

class PlayingHumanState extends State {
  enter() {
    startNewTurn();
    // Additional logic for human player
  }

  update() {
    // Handle human player input
    handleHumanInput();
  }

  draw() {
    drawPlayingState_human();
  }
}

class ThinkingState extends State {
  enter() {
    queueAIDecisionAttempts(currentPlayerIndex);
    stateManager.changeState(new DecisionsMadeState());
  }

  draw() {
    drawGrid();
    drawUnits();
  }
}

class DecisionsMadeState extends State {
  enter() {
    stateManager.setStartTime(millis());
    progressBar.setDuration(this.minimumDuration);
    progressBar.setText(`Player ${players[currentPlayerIndex].id} done thinking`);
  }

  update() {
    stateManager.checkAndTransition(new DecisionExecutionState());
  }

  draw() {
    drawDecisionsMadeState();
  }
}

class DecisionExecutionState extends State {
  enter() {
    executeDecisions();
    stateManager.setStartTime(millis()); // Set start time for the next delay
  }

  update() {
    stateManager.checkAndTransition(new AnimatingState());
  }

  draw() {
    drawGrid();
    drawUnits();
  }
}

class AnimatingState extends State {
  enter() {
    stateManager.setStartTime(millis());
    progressBar.setDuration(animationManager.totalAnimationDuration);
    progressBar.setText(`Player ${players[currentPlayerIndex].id} animating...`);
  }

  update() {
    animationManager.handleAnimations();
    if (animationManager.animationsComplete()) {
      stateManager.checkAndTransition(new PlayingState());
    }
  }

  draw() {
    drawGrid();
    drawUnits();
  }
}

class PausedState extends State {
  enter() {
    // Handle pausing logic here
  }

  exit() {
    // Handle resuming logic here
  }

  draw() {
    drawPausedState();
  }
}

class StateManager {
  constructor() {
    this.currentState = null;
    this.previousState = null;
    this.startTime = 0;
  }

  changeState(newState) {
    if (this.currentState) {
      this.currentState.exit();
    }
    print("Changing state to " + newState.getName());
    this.previousState = this.currentState;
    this.currentState = newState;
    this.currentState.enter();
  }

  update() {
    if (this.currentState) {
      this.currentState.update();
    }
  }

  draw() {
    if (this.currentState) {
      this.currentState.draw();
    }
  }

  pause() {
    if (this.currentState) {
      this.previousState = this.currentState;
      this.currentState = new PausedState();
      this.currentState.enter();
    }
  }

  resume() {
    if (this.previousState) {
      this.currentState.exit();
      this.currentState = this.previousState;
      this.previousState = null;
      this.currentState.enter();
    }
  }

  setStartTime(time) {
    this.startTime = time;
  }

  getStartTime() {
    return this.startTime;
  }

  checkAndTransition(nextState) {
    if (millis() - this.getStartTime() > this.currentState.minimumDuration) {
      this.changeState(nextState);
    }
  }
}
