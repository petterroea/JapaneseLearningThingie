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
			data.push('<h2>Vocabulary training</h2>');
			data.push('<div id="vocabularyList">');
			for(var i = 0; i < vocabularies.length; i++) {
				var voc = vocabularies[i];
				data.push('<div class="vocabularyEntry">');
					data.push('<h4>' + voc.name + '</h4>');
					data.push('<i>' + voc.description + '. Source: ' + voc.source + '</i><br />');
					data.push('<input type="checkbox" class="vocabularyCheckbox" name="' + i + '" />');
					data.push("Use<br />");
				data.push('</div>');
			}
			data.push('</div>');
			data.push('<input type="button" value="Go!" onClick="initVocab()"/>');
			data.push('<h2>Romaji guessing</h2>');
			for(var i = 0; i < gameList.length; i++) {
				data.push('<div class="gameBox" id="gameBox' + i + '">');
					data.push('<center><h3>' + gameList[i].name + '</h3></center>');
					data.push('<center><h4>');
						for(var a = 0; a < gameList[i].characters.length && a < 4; a++) {
							data.push(gameList[i].characters[a].character + " ");
						}
					var gameSave = SaveHandler.getAlphabetSave(gameList[i].name, "letterGame");
					data.push('</h4><center>');
					data.push('<center><i>Progress: ' + gameSave.progress + '/' + gameList[i].characters.length + '</i></center>');
				data.push('</div>');
			}
			data.push('<h2>Writing</h2>');
			for(var i = 0; i < gameList.length; i++) {
				data.push('<div class="gameBox" id="writeGame' + i + '">');
					data.push('<center><h3>' + gameList[i].name + '</h3></center>');
					data.push('<center><h4>');
						for(var a = 0; a < gameList[i].characters.length && a < 4; a++) {
							data.push(gameList[i].characters[a].character + " ");
						}
					var gameSave = SaveHandler.getAlphabetSave(gameList[i].name, "writeGame");
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
		$("#gameBox" + i).click({characterSet: gameList[i]}, function(e){
			LetterGame.initGame(e.data.characterSet);
		});
		$("#writeGame" + i).click({characterSet: gameList[i]}, function(e){
			CharacterRecognitionGame.initialize(e.data.characterSet);
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
function initVocab() {
	var vocabList = [];
	$('input:checkbox.vocabularyCheckbox').each(function () {
	    if(this.checked) {
	    	vocabList.push(vocabularies[this.name]);
	    }
	});
	console.log(vocabList);
	VocabularyGame.init(vocabList);
}