// Generated by CoffeeScript 1.10.0
(function() {
  var Game, MatchMaker, Player, Utils, seedrandom;

  Player = require("./player");

  MatchMaker = require("./matchmaker");

  Utils = require("./utils");

  seedrandom = require('seedrandom');

  seedrandom('zanpakuto', {
    global: true
  });

  Game = (function() {
    function Game() {
      this.utils = new Utils;
      this.matchMaker = new MatchMaker(this);
      this.player = new Player(this);
      this.N = this.utils.N;
      this.MisConnected = false;
      this.PisConnected = false;
      this.waitingForMMCandidate = false;
      this.waitingForPCandidate = true;
      this.epsilon = this.utils.EPSILON;
      this.turn = 0;
      this.maxScore = -100;
      this.setup();
    }

    Game.prototype.delay = function(ms, func) {
      return setTimeout(func, ms);
    };

    Game.prototype.setup = function() {
      this.matchMaker.addListener(this);
      this.player.addListener(this);
      return this.delay(1000, (function(_this) {
        return function() {
          _this.matchMaker.startServer();
          return _this.player.startServer();
        };
      })(this));
    };

    Game.prototype.checkIfBothPlayersConnected = function() {
      var value;
      return value = this.PisConnected && this.MisConnected;
    };

    Game.prototype.receivedCandidateFromMM = function(mmNumbers) {
      console.log("Received MM candidate");
      if (this.waitingForMMCandidate) {
        this.waitingForMMCandidate = false;
        this.currentMMCandidate = mmNumbers;
        return this.analyzeGame();
      }
    };

    Game.prototype.receivedCandidateFromP = function(pNumbers) {
      console.log("Received P candidate");
      if (this.waitingForPCandidate) {
        this.waitingForPCandidate = false;
        this.currentPCandidate = pNumbers;
        return this.analyzeGame();
      }
    };

    Game.prototype.connectedToMM = function() {
      console.log("Game knows MM is connected");
      this.MisConnected = true;
      return this.analyzeGame();
    };

    Game.prototype.connectedToP = function() {
      console.log("Game knows P is connected");
      return this.PisConnected = true;
    };

    Game.prototype.updateMaxValues = function(score) {
      if (score > this.maxScore) {
        this.maxScore = score;
        this.maxScoreTurn = this.turn;
        this.maxMMVector = this.currentMMCandidate;
        return this.maxPVector = this.currentPCandidate;
      }
    };

    Game.prototype.analyzeGame = function() {
      var bothPlayersConnected, i, index, mmMessage, pMessage, randomCandidate, score;
      if (!this.checkIfBothPlayersConnected()) {
        return;
      }
      if (this.waitingForMMCandidate || this.waitingForPCandidate) {
        return;
      }
      if (this.turn === 0) {
        while (true) {
          bothPlayersConnected = this.checkIfBothPlayersConnected();
          if (bothPlayersConnected) {
            break;
          }
        }
        mmMessage = "";
        for (index = i = 1; i <= 20; index = ++i) {
          randomCandidate = this.createRandomCandidateForMM();
          mmMessage += this.scoredCandidateString(randomCandidate, this.currentPCandidate);
        }
        this.waitingForPCandidate = true;
        this.waitingForMMCandidate = true;
        this.turn += 1;
        this.matchMaker.sendMessage(mmMessage);
        return this.player.sendMessage("continue");
      } else {
        score = this.scoreVector(this.currentMMCandidate, this.currentPCandidate);
        this.updateMaxValues(score);
        this.updateGUI(this.currentMMCandidate, this.currentPCandidate, score);
        if (Math.abs(score - 1) < this.epsilon || this.turn === 20 || this.matchMaker.timed_out() || this.player.timed_out()) {
          return this.endGame();
        } else {
          this.turn += 1;
          pMessage = "continue";
          mmMessage = this.scoredCandidateString(this.currentMMCandidate, this.currentPCandidate);
          this.waitingForPCandidate = true;
          this.waitingForMMCandidate = true;
          this.matchMaker.sendMessage(mmMessage);
          return this.player.sendMessage(pMessage);
        }
      }
    };

    Game.prototype.endGame = function() {
      var endMessage, score;
      endMessage = "";
      if (this.matchMaker.timed_out()) {
        endMessage += "Matchmaker timed out\n\n";
      }
      if (this.player.timed_out()) {
        endMessage += "Player timed out\n\n";
      }
      endMessage += "Ultimate Score is (" + this.maxScore + ", " + this.turn + ")\n\n";
      endMessage += "Breakdown of Score\n";
      endMessage += "-----------------------------------\n\n";
      endMessage += "Turn of Max Score: " + this.maxScoreTurn + "\n\n";
      endMessage += "Max Score: " + this.maxScore + "\n\n";
      endMessage += "Matchmaker Candidate with Max Score: " + this.maxMMVector + "\n\n";
      endMessage += "Player Candidate at turn of Max Score: " + this.maxPVector + "\n";
      endMessage += "\n\n";
      score = this.scoreVector(this.currentMMCandidate, this.currentPCandidate);
      endMessage += "Turn " + this.turn + "\n";
      endMessage += "Last Turn Score: " + score + "\n\n";
      endMessage += "Last Matchmaker Candidate: " + this.currentMMCandidate + "\n\n";
      endMessage += "Last Player Candidate: " + this.currentPCandidate + "\n";
      console.log(endMessage);
      this.matchMaker.sendMessage("gameover");
      return this.player.sendMessage("gameover");
    };

    Game.prototype.scoreVector = function(vectorA, vectorB) {
      var i, index, len, score, value;
      if (vectorA.length !== vectorB.length) {
        throw "can't dot product different length arrays";
      }
      score = 0;
      for (index = i = 0, len = vectorA.length; i < len; index = ++i) {
        value = vectorA[index];
        score += value * vectorB[index];
      }
      return score = score.toFixed(4);
    };

    Game.prototype.scoredCandidateString = function(matchmakerCandidate, playerCandidate) {
      var i, len, number, returnString, score;
      if (playerCandidate == null) {
        playerCandidate = this.currentPCandidate;
      }
      returnString = "";
      score = this.scoreVector(matchmakerCandidate, playerCandidate);
      for (i = 0, len = matchmakerCandidate.length; i < len; i++) {
        number = matchmakerCandidate[i];
        returnString += number + " ";
      }
      return returnString += "| " + score + " \n";
    };

    Game.prototype.createRandomCandidateForMM = function() {
      var i, index, numberArray, ref;
      numberArray = [];
      for (index = i = 1, ref = this.N; 1 <= ref ? i <= ref : i >= ref; index = 1 <= ref ? ++i : --i) {
        numberArray.push(Math.random().toFixed(4));
      }
      return numberArray;
    };

    Game.prototype.updateGUI = function(mmCandidate, pCandidate, score) {
      var currentWeight, data, i, index, mWeight, pWeight, ref, vAndF, vArray;
      data = [];
      for (index = i = 0, ref = this.N - 1; 0 <= ref ? i <= ref : i >= ref; index = 0 <= ref ? ++i : --i) {
        currentWeight = [];
        vArray = [index + 8, 0, 0];
        console.log(vArray);
        vAndF = {
          v: vArray,
          f: "Weight " + index
        };
        mWeight = mmCandidate[index];
        pWeight = pCandidate[index];
        currentWeight.push(vAndF);
        currentWeight.push(mWeight);
        currentWeight.push(pWeight);
        data.push(currentWeight);
      }
      console.log("weight data is: ");
      console.log(data);
      return console.log("Score is: " + score);
    };

    return Game;

  })();

  module.exports = Game;

}).call(this);
