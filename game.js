//PROFILE STUFF
function getSavegame() {
	if(localStorage.savegame == null) {
		localStorage.savegame = '[]';
		return [];
	}
	return $.parseJSON(localStorage.savegame);
}
function getAlphabetSave(alphabetName) {
	var savegame = getSavegame();
	for(var i = 0; i < savegame.length; i++) {
		if(savegame[i].alphabet == alphabetName) {
			return savegame[i];
		}
	}
	savegame.push({"alphabet": alphabetName, "progress": 3, "previousRounds": []});
	saveSavegame(savegame);
	return savegame[savegame.length-1];
}
function saveSavegame(savegame) {
	localStorage.savegame = JSON.stringify(savegame);
}
function updateAlphabetSave(savegame, alphabet) {
	for(var i = 0; i < savegame.length; i++) {
		if(savegame[i].alphabet == alphabet.alphabet) {
			savegame[i] = alphabet;
		}
	}
}
function saveAlphabet(alphabet) {
	var savegame = getSavegame();
	updateAlphabetSave(savegame, alphabet);
	saveSavegame(savegame);
}
//GAME INITIALIZERS
function hiraganaInit() {
	initGame(gameList[0]);
}
//GAME
//STATIC INFORMATION
var roundLengthMultiplyer = 3;

//Format: {"character":"", "romaji": "", "passed":true}
var playedCharacters = [];
var currentChar = null;
var alphabetSave = null;
var currentAlphabet = null;
var roundRunning = false;

var enteredText = "";
var score = 0;
var roundLength = 20;

function validateText() {
	if(enteredText == currentChar.romaji) {
		if(gameTime <= 5) {
			score += ((5-gameTime)*100);
		} else {
			score += 50;
		}

		$("#characterPane").html("Good job!");

		currentChar.gameTime = gameTime;
		currentChar.passed = true;
		playedCharacters.push(currentChar);

		renderScoreText();
		updateGame();
	} else if(enteredText.length <= currentChar.romaji.length) {
		if(currentChar.romaji.substring(0, enteredText.length) != enteredText) {
			passRound();
		}
	}
}

function passRound() {
	$("#characterPane").html(currentChar.character + "(" + currentChar.romaji + ")");

	currentChar.gameTime = 0;
	currentChar.passed = false;
	playedCharacters.push(currentChar);

	renderScoreText();
	updateGame();
}

function renderScoreText() {
	var accuracy = getAccuracy();
	$("#gameScore").html(score + " pts - " + accuracy + "% acc. Round " + (playedCharacters.length+1) + "/" + roundLength);
}
function getAccuracy() {
	var accumulatedAcc = 0;
	for(var i = 0; i < playedCharacters.length; i++) {
		if(playedCharacters[i].passed) {
			var acc = 5 - playedCharacters[i].gameTime;
			if(acc>0) {
				accumulatedAcc += (acc*20);
			}
		}
	}
	return (accumulatedAcc / playedCharacters.length).toFixed(2);
}

function initGame(alphabet) {
	alphabetSave = getAlphabetSave(alphabet.name);
	playedCharacters = [];
	var gameGui = [];
	currentAlphabet = alphabet;
	roundLength = roundLengthMultiplyer * alphabetSave.progress;
	//Generate ui
	gameGui.push('<div id="gameScore">');
		gameGui.push('0 pts - 0% acc. Round ' + ( playedCharacters.length+1) + "/" + roundLength);
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
	gameGui.push('<div id="instructionsDiv">');
		gameGui.push('<i>Enter your guess, or press space to skip</i>');
	gameGui.push('</div>');
	//Render ui
	$("#content").html(gameGui.join(''));
	$(window).keypress(function(e){
		//console.log(e.charCode);

		if(roundRunning) {
			if(String.fromCharCode(e.charCode) == ' ') {
				passRound();
			} else {
				enteredText += String.fromCharCode(e.charCode);
				$("#enteredTextPane").html(enteredText);
				validateText();
			}
		}
	});
	$(window).keydown(function(e){
		//console.log(e.charCode);

		if(roundRunning) {
			if(e.keyCode === 8) {
				enteredText = enteredText.substring(0, enteredText.length-1);
				$("#enteredTextPane").html(enteredText);
				e.preventDefault();
			}
		}
	});
	//Start countdown
	gameStartCountdownHandle = setInterval(gameStartCountdown, 1000/countdownTicksPerSec);
}
function updateGame() {
	if(playedCharacters.length < roundLength) {
		if(currentChar != null) {
			enteredText = "";
			currentChar = getNewChar();
			newCharacterCountdownHandle = setInterval(newCharCountdown, 1000/countdownTicksPerSec);
			clearInterval(gameScoreCounterHandle);
			gameTime = 0;
			roundRunning = false;
		} else {
			currentChar = getNewChar();
			drawNewCharacter();
		}
	} else {
		//Round finished
		gameOver();
	}
}
function getNewChar() {
	var charArray = [];
	//Add every character
	for(var i = 0; i < alphabetSave.progress; i++) {
		charArray.push(currentAlphabet.characters[i]);
	}
	//Add failed characters again so they can be replayed or something i dunno...
	for(var i = 0; i < alphabetSave.previousRounds.length; i++) {
		for(var x = 0; x < alphabetSave.previousRounds[i].data.length; x++) {
			if(!alphabetSave.previousRounds[i].data[x].passed) {
				charArray.push({"character": alphabetSave.previousRounds[i].data[x].character, "romaji": alphabetSave.previousRounds[i].data[x].romaji});
			}
		}
	}
	//Add failed characters from this round
	for(var i = 0; i < playedCharacters.length; i++) {
		if(!playedCharacters[i].passed) {
			charArray.push( {"character": playedCharacters[i].character, "romaji": playedCharacters[i].romaji} );
		}
	}
	console.log("Character array:");
	console.log(charArray)
	//Calculate the number
	var charNum = Math.round( Math.random()*(charArray.length-1) );
	console.log('Returning character ' + charNum);
	return charArray[charNum];
}
function drawNewCharacter() {
	$("#characterPane").html(currentChar.character);
	$("#enteredTextPane").html("_");
	roundRunning = true;
	gameScoreCounterHandle = setInterval(gameScoreCounter, msecPerGameScore);

}
function gameOver() {
	$(window).unbind('keypress');
	$(window).unbind('keydown');
	var rounds = [];
	rounds.push({"score": score, "accuracy": getAccuracy(), "data": playedCharacters});
	for(var i = 0; i < alphabetSave.previousRounds.length && i < 4; i++) {
		rounds.push(alphabetSave.previousRounds[i]);
	}
	alphabetSave.previousRounds = rounds;
	saveAlphabet(alphabetSave);

	gameRunning = false;
	gameStartCountdownValue
	renderGameOver();
}
function renderGameOver() {
	var gameOverGui = [];
	//Push stuff
	gameOverGui.push('<h1>Game over!</h1>');
	gameOverGui.push('<p>You got ' + score + ' points, with a accuracy of ' + getAccuracy() + '%</p>');

	if(getAccuracy() > 85 && alphabetSave.progress<currentAlphabet.characters.length) {
		gameOverGui.push('<p>');
			gameOverGui.push('<b>');
				gameOverGui.push('You seem to be managing quite good! <input type="button" value="More characters, please!" onClick="addCharacter()" />');
			gameOverGui.push('</b>');
		gameOverGui.push('</p>');
	}
	gameOverGui.push('<p><input type="button" value="Back to main menu" onClick="renderWelcomeScreen()" /></p>');

	$("#content").html(gameOverGui.join(''));
}
function addCharacter() {
	alphabetSave.progress++;
	saveAlphabet(alphabetSave);

	var newCharacterData = [];

	newCharacterData.push('<center><h1>Your new character is</h1></center>');
	newCharacterData.push('<center><h1>' + currentAlphabet.characters[alphabetSave.progress-1].character + '</h1></center>');
	newCharacterData.push('<center><h2>(' + currentAlphabet.characters[alphabetSave.progress-1].romaji + ') </h2></center>');
	newCharacterData.push('<center><p><input type="button" value="Back to main menu" onClick="renderWelcomeScreen()"/></p></center>');

	$("#content").html(newCharacterData.join(''));
}
//GAME TIMERS
var countdownTicksPerSec = 10;
var gameStartCountdownValue = 0;
var gameStartCountdownHandle = null;
function gameStartCountdown() {
	if(gameStartCountdownValue < 5 * countdownTicksPerSec) {
		gameStartCountdownValue++;
		var timeLeft = (5 * countdownTicksPerSec) - gameStartCountdownValue;
		var secondsLeft = Math.floor(timeLeft/countdownTicksPerSec);
		var hundredsLeft = Math.floor( ( (timeLeft % countdownTicksPerSec)/countdownTicksPerSec ) *100 );
		$("#enteredTextPane").html(secondsLeft + ":" + hundredsLeft);
	}
	else {
		clearInterval(gameStartCountdownHandle);
		gameStartCountdownValue = 0;
		updateGame();
	}
	//console.log("start");
}
var newCharacterCountdownValue = 0;
var newCharacterCountdownHandle = null;
function newCharCountdown() {
	if(newCharacterCountdownValue < 1 * countdownTicksPerSec) {
		newCharacterCountdownValue++;
		var timeLeft = (1 * countdownTicksPerSec) - newCharacterCountdownValue;
		var secondsLeft = Math.floor(timeLeft/countdownTicksPerSec);
		var hundredsLeft = Math.floor( ( (timeLeft % countdownTicksPerSec)/countdownTicksPerSec ) *100 );
		$("#enteredTextPane").html(secondsLeft + ":" + hundredsLeft);
	}
	else {
		clearInterval(newCharacterCountdownHandle);
		newCharacterCountdownValue = 0;
		drawNewCharacter();
	}
	//console.log("newchar");
}
var gameScoreCounterHandle = null;
var msecPerGameScore = 800;
var gameTime = 0;
function gameScoreCounter() {
	gameTime++;
}
//FUNCTIONS
$(document).ready(function(){
	renderWelcomeScreen();
	if(window.location.pathname.indexOf("JapaneseLearningThingie/master") > -1) {
		$("#gitNotice").html('<i>You are running straight from git, and are therefore running the newest version.</i>');
	}
});
function renderWelcomeScreen() {
	var welcomeScreen = generateWelcomeScreen();
	$("#content").html(welcomeScreen);
	addWelcomeScreenEvents();
}
function generateWelcomeScreen() {
	var data = [];
	if(!hasLocalStorage()) {
		data.push('<h1>Please use a web browser that supports local storage.</h1>');
	} else {
		if(localStorage.name) {
			data.push('<h1>Welcome, ' + localStorage.name + '</h1>');
			data.push('<p><input type="button" value="Delete local account" onClick="deleteAcc()"/></p>');
			data.push('<h2>Select game</h2>');
			for(var i = 0; i < gameList.length; i++) {
				data.push('<div class="gameBox" id="gameBox' + i + '">');
					data.push('<center><h3>' + gameList[i].name + '</h3></center>');
					data.push('<center><h4>');
						for(var a = 0; a < gameList[i].characters.length && a < 4; a++) {
							data.push(gameList[i].characters[a].character + " ");
						}
					var gameSave = getAlphabetSave(gameList[i].name);
					data.push('</h4><center>');
					data.push('<center><i>Progress: ' + gameSave.progress + '/' + gameList[i].characters.length + '</i></center>');
				data.push('</div>');
			}
		} else {
			data.push('<h1>Welcome!</h1>');
			data.push('<p>Before you can begin, please enter your name:</p>');
			data.push('<input type="text" id="name" /><input type="button" value="Done" onClick="register()" />');
			data.push('<p>Everything is stored locally, so another computer will not remember you</p>');
		}
	}
	return data.join('');
}
function addWelcomeScreenEvents() {
	for(var i = 0; i < gameList.length; i++) {
		$("#gameBox" + i).click({func: gameList[i].initCode}, function(e){
			e.data.func();
		});
	}
}
function hasLocalStorage() {
	return typeof(Storage) !== "undefined";
}
function register() {
	localStorage.name = $("#name").val();
	renderWelcomeScreen();
}
function deleteAcc() {
	localStorage.clear();
	renderWelcomeScreen();
}
//DATA
var gameList = [
	{
		"name": "Hiragana", 
		"initCode": hiraganaInit, 
		"characters": [
			{"character": "あ", "romaji": "a"}, 
			{"character": "い", "romaji": "i"}, 
			{"character": "う", "romaji": "u"}, 
			{"character": "え", "romaji": "e"}, 
			{"character": "お", "romaji": "o"}, 
			{"character": "か", "romaji": "ka"}, 
			{"character": "き", "romaji": "ki"}, 
			{"character": "く", "romaji": "ku"}, 
			{"character": "け", "romaji": "ke"}, 
			{"character": "こ", "romaji": "ko"}, 
			{"character": "きゃ", "romaji": "kya"}, 
			{"character": "きゅ", "romaji": "kyu"}, 
			{"character": "きょ", "romaji": "kyo"}, 
			{"character": "さ", "romaji": "sa"}, 
			{"character": "し", "romaji": "shi"}, 
			{"character": "す", "romaji": "su"}, 
			{"character": "せ", "romaji": "se"}, 
			{"character": "そ", "romaji": "so"}, 
			{"character": "しゃ", "romaji": "sha"}, 
			{"character": "しゅ", "romaji": "shu"}, 
			{"character": "しょ", "romaji": "sho"},
			{"character": "た", "romaji": "ta"}, 
			{"character": "ち", "romaji": "chi"}, 
			{"character": "つ", "romaji": "tsu"}, 
			{"character": "て", "romaji": "te"}, 
			{"character": "と", "romaji": "to"}, 
			{"character": "ちゃ", "romaji": "cha"}, 
			{"character": "ちゅ", "romaji": "chu"}, 
			{"character": "ちょ", "romaji": "cho"}, 
			{"character": "な", "romaji": "na"}, 
			{"character": "に", "romaji": "ni"}, 
			{"character": "ぬ", "romaji": "nu"}, 
			{"character": "ね", "romaji": "ne"}, 
			{"character": "の", "romaji": "no"}, 
			{"character": "にゃ", "romaji": "nya"}, 
			{"character": "にゅ", "romaji": "nyu"}, 
			{"character": "にょ", "romaji": "nyo"},
			{"character": "は", "romaji": "ha"}, 
			{"character": "ひ", "romaji": "hi"}, 
			{"character": "ふ", "romaji": "fu"}, 
			{"character": "へ", "romaji": "he"}, 
			{"character": "ほ", "romaji": "ho"}, 
			{"character": "ひゃ", "romaji": "hya"}, 
			{"character": "ひゅ", "romaji": "hyu"}, 
			{"character": "ひょ", "romaji": "hyo"}, 
			{"character": "ま", "romaji": "ma"}, 
			{"character": "み", "romaji": "mi"}, 
			{"character": "む", "romaji": "mu"}, 
			{"character": "め", "romaji": "me"}, 
			{"character": "も", "romaji": "mo"}, 
			{"character": "みゃ", "romaji": "mya"}, 
			{"character": "みゅ", "romaji": "myu"}, 
			{"character": "みょ", "romaji": "myo"}, 
			{"character": "や", "romaji": "ya"}, 
			{"character": "ゆ", "romaji": "yu"}, 
			{"character": "よ", "romaji": "yo"}, 
			{"character": "ら", "romaji": "ra"}, 
			{"character": "り", "romaji": "ri"}, 
			{"character": "る", "romaji": "ru"}, 
			{"character": "れ", "romaji": "re"}, 
			{"character": "ろ", "romaji": "ro"}, 
			{"character": "りゃ", "romaji": "rya"}, 
			{"character": "りゅ", "romaji": "ryu"}, 
			{"character": "りょ", "romaji": "ryo"}, 
			{"character": "わ", "romaji": "wa"}, 
			{"character": "ゐ", "romaji": "wi"}, 
			{"character": "ゑ", "romaji": "we"}, 
			{"character": "を", "romaji": "wo"}, 
			{"character": "ん", "romaji": "n"}, 
			{"character": "が", "romaji": "ga"}, 
			{"character": "ぎ", "romaji": "gi"}, 
			{"character": "ぐ", "romaji": "gu"}, 
			{"character": "げ", "romaji": "ge"}, 
			{"character": "ご", "romaji": "go"}, 
			{"character": "ぎゃ", "romaji": "gya"}, 
			{"character": "ぎゅ", "romaji": "gyu"}, 
			{"character": "ぎょ", "romaji": "gyo"}, 
			{"character": "ざ", "romaji": "za"}, 
			{"character": "じ", "romaji": "ji"}, 
			{"character": "ず", "romaji": "zu"}, 
			{"character": "ぜ", "romaji": "ze"}, 
			{"character": "ぞ", "romaji": "zo"}, 
			{"character": "じゃ", "romaji": "ja"}, 
			{"character": "じゅ", "romaji": "ju"}, 
			{"character": "じょ", "romaji": "jo"}, 
			{"character": "だ", "romaji": "da"}, 
			{"character": "ぢ", "romaji": "(ji)"}, 
			{"character": "づ", "romaji": "(zu)"}, 
			{"character": "で", "romaji": "de"}, 
			{"character": "ど", "romaji": "do"}, 
			{"character": "ぢゃ", "romaji": "(ja)"}, 
			{"character": "ぢゅ", "romaji": "(ju)"}, 
			{"character": "ぢょ", "romaji": "(jo)"}, 
			{"character": "ば", "romaji": "ba"}, 
			{"character": "び", "romaji": "bi"}, 
			{"character": "ぶ", "romaji": "bu"}, 
			{"character": "べ", "romaji": "be"}, 
			{"character": "ぼ", "romaji": "bo"}, 
			{"character": "びゃ", "romaji": "bya"}, 
			{"character": "びゅ", "romaji": "byu"}, 
			{"character": "びょ", "romaji": "byo"}, 
			{"character": "ぱ", "romaji": "pa"}, 
			{"character": "ぴ", "romaji": "pi"}, 
			{"character": "ぷ", "romaji": "pu"}, 
			{"character": "ぺ", "romaji": "pe"}, 
			{"character": "ぽ", "romaji": "po"}, 
			{"character": "ぴゃ", "romaji": "pya"}, 
			{"character": "ぴゅ", "romaji": "pyu"}, 
			{"character": "ぴょ", "romaji": "pyo"}
		]
	}
];