var LetterGame = {
	//GAME
	//STATIC INFORMATION
	roundLengthMultiplyer: 3,

	//Format: {"character":"", "romaji": "", "passed":true}
	playedCharacters: [],
	currentChar: null,
	alphabetSave: null,
	currentAlphabet: null,
	roundRunning: false,

	enteredText: "",
	score: 0,
	roundLength: 20,

	validateText: function() {
		if(LetterGame.enteredText == LetterGame.currentChar.romaji) {
			if(LetterGame.gameTime <= 5) {
				LetterGame.score += ((5-LetterGame.gameTime)*100);
			} else {
				LetterGame.score += 50;
			}

			$("#characterPane").html("Good job!");

			var pushCharacter = {"character": LetterGame.currentChar.character, "romaji": LetterGame.currentChar.romaji};
			pushCharacter.gameTime = LetterGame.gameTime;
			pushCharacter.passed = true;
			LetterGame.playedCharacters.push(pushCharacter);

			LetterGame.renderScoreText();
			LetterGame.updateGame();
		} else if(LetterGame.enteredText.length <= LetterGame.currentChar.romaji.length) {
			if(LetterGame.currentChar.romaji.substring(0, LetterGame.enteredText.length) != LetterGame.enteredText) {
				LetterGame.passRound();
			}
		}
	},

	passRound: function() {
		$("#characterPane").html(LetterGame.currentChar.character + "(" + LetterGame.currentChar.romaji + ")");

		var pushCharacter = {"character": LetterGame.currentChar.character, "romaji": LetterGame.currentChar.romaji};
		pushCharacter.gameTime = 0;
		pushCharacter.passed = false;
		LetterGame.playedCharacters.push(pushCharacter);

		LetterGame.renderScoreText();
		LetterGame.updateGame();
	},

	renderScoreText: function() {
		var accuracy = LetterGame.getAccuracy();
		$("#gameScore").html(LetterGame.score + " pts - " + accuracy + "% acc. Round " + (LetterGame.playedCharacters.length+1) + "/" + LetterGame.roundLength);
	},

	getAccuracy: function() {
		var accumulatedAcc = 0;
		for(var i = 0; i < LetterGame.playedCharacters.length; i++) {
			if(LetterGame.playedCharacters[i].passed) {
				var acc = 5 - LetterGame.playedCharacters[i].gameTime;
				if(acc>0) {
					accumulatedAcc += (acc*20);
				}
			} else {
				accumulatedAcc += 0;
			}
		}
		return (accumulatedAcc / LetterGame.playedCharacters.length).toFixed(2);
	},

	initGame: function(alphabet) {
		LetterGame.alphabetSave = SaveHandler.getAlphabetSave(alphabet.name, "letterGame");
		LetterGame.playedCharacters = [];
		var gameGui = [];

		LetterGame.enteredText = "";
		LetterGame.score = 0;

		LetterGame.currentAlphabet = alphabet;
		LetterGame.roundLength = LetterGame.roundLengthMultiplyer * LetterGame.alphabetSave.progress;
		//Generate ui
		gameGui.push('<div id="gameScore">');
			gameGui.push('0 pts - 0% acc. Round ' + ( LetterGame.playedCharacters.length+1) + "/" + LetterGame.roundLength);
		gameGui.push('</div>');
		gameGui.push('<div id="Title">');
			gameGui.push('<b>' + alphabet.name + '</b>');
		gameGui.push('</div>');
		gameGui.push('<div id="characterPane">');
			gameGui.push('<b>Get ready!</b>');
			//gameGui.push('Characters will appear here');
		gameGui.push('</div>');
		gameGui.push('<div id="enteredTextPane">');
			gameGui.push('Text will be here');
		gameGui.push('</div>');
		gameGui.push('<div id="currentCharactersBox">');
			gameGui.push('<h1>Current characters</h1>');
			for(var i = 0; i < LetterGame.alphabetSave.progress; i++) {
				gameGui.push('<div class="alphabetPreviewSpan">');
					gameGui.push('<h1>' + LetterGame.currentAlphabet.characters[i].character + '</h1>');
					gameGui.push('<h3>(' + LetterGame.currentAlphabet.characters[i].romaji + ')</h3>');
				gameGui.push('</div>');
			}
			gameGui.push('')
		gameGui.push('</div>');
		gameGui.push('<div id="instructionsDiv">');
			gameGui.push('<i>Enter your guess, or press space to skip</i>');
		gameGui.push('</div>');
		//Render ui
		$("#content").html(gameGui.join(''));
		$(window).keypress(function(e){
			//console.log(e.charCode);

			if(LetterGame.roundRunning) {
				if(String.fromCharCode(e.charCode) == ' ') {
					LetterGame.passRound();
				} else {
					LetterGame.enteredText += String.fromCharCode(e.charCode);
					$("#enteredTextPane").html(LetterGame.enteredText);
					LetterGame.validateText();
				}
			}
		});
		$(window).keydown(function(e){
			//console.log(e.charCode);

			if(LetterGame.roundRunning) {
				if(e.keyCode === 8) {
					LetterGame.enteredText = LetterGame.enteredText.substring(0, LetterGame.enteredText.length-1);
					$("#enteredTextPane").html(LetterGame.enteredText);
					e.preventDefault();
				}
			}
		});
		//Start countdown
		LetterGame.gameStartCountdownHandle = setInterval(LetterGame.gameStartCountdown, 1000/LetterGame.countdownTicksPerSec);
	},

	updateGame: function() {
		if(LetterGame.playedCharacters.length < LetterGame.roundLength) {
			if(LetterGame.currentChar != null) {
				LetterGame.enteredText = "";
				LetterGame.currentChar = LetterGame.getNewChar();
				LetterGame.newCharacterCountdownHandle = setInterval(LetterGame.newCharCountdown, 1000/LetterGame.countdownTicksPerSec);
				clearInterval(LetterGame.gameScoreCounterHandle);
				LetterGame.gameTime = 0;
				LetterGame.roundRunning = false;
			} else {
				$("#currentCharactersBox").hide();
				LetterGame.currentChar = LetterGame.getNewChar();
				LetterGame.drawNewCharacter();
			}
		} else {
			//Round finished
			LetterGame.gameOver();
		}
	},

	getNewChar: function() {
		var charArray = [];
		//Add every character
		for(var i = 0; i < LetterGame.alphabetSave.progress; i++) {
			charArray.push(LetterGame.currentAlphabet.characters[i]);
		}
		//Add failed characters again so they can be replayed or something i dunno...
		for(var i = 0; i < LetterGame.alphabetSave.previousRounds.length; i++) {
			for(var x = 0; x < LetterGame.alphabetSave.previousRounds[i].data.length; x++) {
				if(!LetterGame.alphabetSave.previousRounds[i].data[x].passed) {
					charArray.push({"character": LetterGame.alphabetSave.previousRounds[i].data[x].character, "romaji": LetterGame.alphabetSave.previousRounds[i].data[x].romaji});
				}
			}
		}
		//Add failed characters from this round
		for(var i = 0; i < LetterGame.playedCharacters.length; i++) {
			if(!LetterGame.playedCharacters[i].passed) {
				charArray.push( {"character": LetterGame.playedCharacters[i].character, "romaji": LetterGame.playedCharacters[i].romaji} );
			}
		}
		console.log("Character array:");
		console.log(charArray)
		//Calculate the number
		var charNum = Math.round( Math.random()*(charArray.length-1) );
		console.log('Returning character ' + charNum);
		return charArray[charNum];
	},

	drawNewCharacter: function() {
		$("#characterPane").html(LetterGame.currentChar.character);
		$("#enteredTextPane").html("_");
		LetterGame.roundRunning = true;
		LetterGame.gameScoreCounterHandle = setInterval(LetterGame.gameScoreCounter, LetterGame.msecPerGameScore);

	},
	gameOver: function() {
		clearInterval(LetterGame.gameScoreCounterHandle);
		$(window).unbind('keypress');
		$(window).unbind('keydown');
		var rounds = [];
		rounds.push({"score": LetterGame.score, "accuracy": LetterGame.getAccuracy(), "data": LetterGame.playedCharacters});
		for(var i = 0; i < LetterGame.alphabetSave.previousRounds.length && i < 4; i++) {
			rounds.push(LetterGame.alphabetSave.previousRounds[i]);
		}

		LetterGame.currentChar = null;

		LetterGame.alphabetSave.previousRounds = rounds;
		SaveHandler.saveAlphabet(LetterGame.alphabetSave, "letterGame");

		LetterGame.gameRunning = false;
		LetterGame.gameStartCountdownValue = 0;
		LetterGame.renderGameOver();
	},

	renderGameOver: function() {
		var gameOverGui = [];
		//Push stuff
		gameOverGui.push('<h1>Game over!</h1>');
		gameOverGui.push('<p>You got ' + LetterGame.score + ' points, with a accuracy of ' + LetterGame.getAccuracy() + '%</p>');

		var hasFailed = false;

		for(var i = 0; i < LetterGame.playedCharacters.length; i++) {
			if(!LetterGame.playedCharacters[i].passed) {
				hasFailed = true;
			}
		}

		if(LetterGame.getAccuracy() > 85 && LetterGame.alphabetSave.progress<LetterGame.currentAlphabet.characters.length && !hasFailed) {
			gameOverGui.push('<p>');
				gameOverGui.push('<b>');
					gameOverGui.push('You seem to be managing quite good! <input type="button" value="More characters, please!" onClick="LetterGame.addCharacter()" />');
				gameOverGui.push('</b>');
			gameOverGui.push('</p>');
		}
		gameOverGui.push('<p><input type="button" value="Back to main menu" onClick="renderWelcomeScreen()" /></p>');

		$("#content").html(gameOverGui.join(''));
	},
	addCharacter: function() {
		LetterGame.alphabetSave.progress++;
		SaveHandler.saveAlphabet(LetterGame.alphabetSave, "letterGame");

		var newCharacterData = [];

		newCharacterData.push('<center><h1>Your new character is</h1></center>');
		newCharacterData.push('<center><h1>' + LetterGame.currentAlphabet.characters[LetterGame.alphabetSave.progress-1].character + '</h1></center>');
		newCharacterData.push('<center><h2>(' + LetterGame.currentAlphabet.characters[LetterGame.alphabetSave.progress-1].romaji + ') </h2></center>');
		newCharacterData.push('<center><p><input type="button" value="Back to main menu" onClick="renderWelcomeScreen()"/></p></center>');

		$("#content").html(newCharacterData.join(''));
	},
	//GAME TIMERS
	countdownTicksPerSec: 10,
	gameStartCountdownValue: 0,
	gameStartCountdownHandle: null,
	gameStartCountdown: function() {
		if(LetterGame.gameStartCountdownValue < 5 * LetterGame.countdownTicksPerSec) {
			LetterGame.gameStartCountdownValue++;
			var timeLeft = (5 * LetterGame.countdownTicksPerSec) - LetterGame.gameStartCountdownValue;
			var secondsLeft = Math.floor(timeLeft/LetterGame.countdownTicksPerSec);
			var hundredsLeft = Math.floor( ( (timeLeft % LetterGame.countdownTicksPerSec)/LetterGame.countdownTicksPerSec ) *100 );
			$("#enteredTextPane").html(secondsLeft + ":" + hundredsLeft);
		}
		else {
			clearInterval(LetterGame.gameStartCountdownHandle);
			LetterGame.gameStartCountdownValue = 0;
			LetterGame.updateGame();
		}
		//console.log("start");
	},
	newCharacterCountdownValue: 0,
	newCharacterCountdownHandle: null,
	newCharCountdown: function() {
		if(LetterGame.newCharacterCountdownValue < 1 * LetterGame.countdownTicksPerSec) {
			LetterGame.newCharacterCountdownValue++;
			var timeLeft = (1 * LetterGame.countdownTicksPerSec) - LetterGame.newCharacterCountdownValue;
			var secondsLeft = Math.floor(timeLeft/LetterGame.countdownTicksPerSec);
			var hundredsLeft = Math.floor( ( (timeLeft % LetterGame.countdownTicksPerSec)/LetterGame.countdownTicksPerSec ) *100 );
			$("#enteredTextPane").html(secondsLeft + ":" + hundredsLeft);
		}
		else {
			clearInterval(LetterGame.newCharacterCountdownHandle);
			LetterGame.newCharacterCountdownValue = 0;
			LetterGame.drawNewCharacter();
		}
		//console.log("newchar");
	},
	gameScoreCounterHandle: null,
	msecPerGameScore: 1000,
	gameTime: 0,
	gameScoreCounter: function() {
		LetterGame.gameTime++;
	}
};