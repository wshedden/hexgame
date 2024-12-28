class State {
  enter() {}
  exit() {}
  update() {}
}

class InitState extends State {
  enter() {
    // Initialization logic here
    console.log("Game initialized. Press any key to start.");
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
}

class PlayingState extends State {
  enter() {
    print("Entered playing state");
    startNewTurn();
    print("New turn started");
    stateManager.changeState(new ThinkingState());
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
}

class ThinkingState extends State {
  enter() {
    handleAIDecision(currentPlayerIndex);
    stateManager.changeState(new DecisionsMadeState());
  }
}

class DecisionsMadeState extends State {
  enter() {
    decisionsMadeTime = millis();
    progressBar.setDuration(1000);
    progressBar.setText(`Player ${players[currentPlayerIndex].id} done thinking`);
  }

  update() {
    if (millis() - decisionsMadeTime > decisionDelay) {
      stateManager.changeState(new AnimatingState());
    }
  }
}

class AnimatingState extends State {
  enter() {
    animationStartTime = millis();
    progressBar.setDuration(animationManager.totalAnimationDuration);
    progressBar.setText(`Player ${players[currentPlayerIndex].id} animating...`);
  }

  update() {
    animationManager.handleAnimations();
    if (animationManager.animationsComplete() && millis() - animationStartTime > animationManager.totalAnimationDuration) {
      stateManager.changeState(new ApplyingMovesState());
    }
  }
}

class ApplyingMovesState extends State {
  enter() {
    applyMoves();
  }
}

class PausedState extends State {
  enter() {
    // Handle pausing logic here
  }

  exit() {
    // Handle resuming logic here
  }
}

class StateManager {
  constructor() {
    this.currentState = null;
    this.previousState = null;
  }

  changeState(newState) {
    if (this.currentState) {
      this.currentState.exit();
    }
    this.previousState = this.currentState;
    this.currentState = newState;
    this.currentState.enter();
    print("Finished changing state");
  }

  update() {
    if (this.currentState) {
      this.currentState.update();
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
}
