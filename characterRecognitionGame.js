var CharacterRecognitionGame = {
	alphabetSave: {},
	currentAlphabet: {},
	history: [],
	currentChar: {},
	finishButtonString: '<div id="finishButton" class="btn" width="500"><center><h3>Done!</h3></center></div>',
	undoButtonString: '<div id="undoButton" class="btn" width="500"><center><h3>Clear!</h3></center></div>',
	nextLetterbutton: '<div id="nextLetterButton" class="btn" width="500"><center><h3>Next!</h3></center></div>',
	initialize: function(alphabet) {
		this.alphabetSave = SaveHandler.getAlphabetSave(alphabet.name, "writeGame");
		this.currentAlphabet = alphabet;
		this.history = [];

		var buildArray = [];

		//Generate screen
		buildArray.push('<h1>Drawing game</h1>');
		buildArray.push('<i>Draw the character displayed in romaji to play</i>');
		buildArray.push('<br />');
		buildArray.push('<div id="writeGameRomajiBox">placeholder</div>');
		buildArray.push('<div id="writeGameCanvas">canvas goes here...</div>');
		buildArray.push('<div id="writeGameScoreData">Total accuracy: 0%. Round 1 of ' + this.getGameLength() + '</div>');
		buildArray.push('<div id="buttonHolder">placeholder</div>');

		$("#content").html(buildArray.join(""));
		this.generateCharacter();
		this.resetGameButtons();
	},
	doneDrawing: function() {
		var boundingBox = CharacterRecognition.generateBoundingBox("drawCanvas");
		var validationArray = CharacterRecognition.evaluateLetter("drawCanvas", boundingBox);

		CharacterRecognition.renderBoundingBox("drawCanvas", boundingBox);
		CharacterRecognition.renderGrid("drawCanvas", boundingBox);
		CharacterRecognition.renderGridValidation("drawCanvas", boundingBox, validationArray);

		CharacterRecognition.renderLetter(this.currentChar.character);
		var bb = CharacterRecognition.generateBoundingBox("renderCanvas");
		var originalData = CharacterRecognition.evaluateLetter("renderCanvas", bb);

		CharacterRecognition.renderGrid("renderCanvas", bb);
		CharacterRecognition.renderBoundingBox("renderCanvas", bb);
		CharacterRecognition.renderGridValidation("renderCanvas", bb, originalData);

		var accuracy = CharacterRecognition.calculateAccuracy(originalData, validationArray);

		this.history.push({character: this.currentChar, accuracy: accuracy});
		this.updateGameStatus();

		$("#buttonHolder").html('<h1>Accuracy: ' + accuracy.toFixed(2) + '%</h1>' + this.nextLetterbutton);
		$("#nextLetterButton").click(function(e) {
			if(CharacterRecognitionGame.history.length < CharacterRecognitionGame.getGameLength()) {
				CharacterRecognitionGame.generateCharacter();
				CharacterRecognitionGame.resetGameButtons();
				$("#renderCanvas").remove();
			} else {
				CharacterRecognitionGame.gameOver();
			}
		});
	},
	getAccuracy: function() {
		var accCarry = 0;
		for(var i = 0; i < this.history.length; i++) {
			accCarry += this.history[i].accuracy;
		}
		return accCarry / this.history.length;
	},
	gameOver: function() {
		var acc = this.getAccuracy();
		var buildArray = [];

		//Generate screen
		buildArray.push('<h1>Game over!</h1>');
		buildArray.push('<p>Your accuracy was ' + acc + '</p>');
		if(acc>70) {
			buildArray.push('<b>You seem to be doing good. <input type="button" value="Add new character!" onClick="CharacterRecognitionGame.addNewCharacter()" /></b><br />');
		}
		buildArray.push('<input type="button" value="Go back" onClick="renderWelcomeScreen()" />');
		$("#content").html(buildArray.join(""));
	},
	addNewCharacter: function() {
		this.alphabetSave.progress++;
		SaveHandler.saveAlphabet(this.alphabetSave, "writeGame");

		var newCharacterData = [];

		newCharacterData.push('<center><h1>Your new character is</h1></center>');
		newCharacterData.push('<center><h1>' + this.currentAlphabet.characters[this.alphabetSave.progress-1].character + '</h1></center>');
		newCharacterData.push('<center><h2>(' + this.currentAlphabet.characters[this.alphabetSave.progress-1].romaji + ') </h2></center>');
		newCharacterData.push('<center><p><input type="button" value="Back to main menu" onClick="renderWelcomeScreen()"/></p></center>');

		$("#content").html(newCharacterData.join(''));
	},
	resetGameButtons: function() {
		$("#buttonHolder").html(this.finishButtonString + this.undoButtonString);
		$("#undoButton").click(function(e){
			$("#writeGameCanvas").html('<canvas id="drawCanvas" width="500" height="500"> </canvas>');
			CharacterRecognition.registerCanvasAsDrawingCanvas("drawCanvas");
		});
		$("#finishButton").click(function(e){
			CharacterRecognitionGame.doneDrawing();
		});
	},
	updateGameStatus: function() {
		
		$("#writeGameScoreData").html("Total accuracy: " + this.getAccuracy().toFixed(2) + "%. Round " + ( this.history.length+1) + " of " + this.getGameLength());
	},
	generateCharacter: function() {
		var randNum = Math.floor(Math.random()*this.alphabetSave.progress);
		this.currentChar = this.currentAlphabet.characters[randNum];
		console.log("Current character: " + this.currentChar.romaji);
		$("#writeGameRomajiBox").html(this.currentChar.romaji.toUpperCase());
		$("#writeGameCanvas").html('<canvas id="drawCanvas" width="500" height="500"> </canvas>');
		CharacterRecognition.registerCanvasAsDrawingCanvas("drawCanvas");
	},
	getGameLength: function() {
		return this.alphabetSave.progress*3;
	}
};