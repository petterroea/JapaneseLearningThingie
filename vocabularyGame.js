var VocabularyGame = {
	vocabList: [],
	currentWord: {},
	englishMode: false,
	isErrorMode: false,
	wins: 0,
	losses: 0,
	lastGames: [],
	lastMistakes: [],
	init: function(vocabularies) {
		for(var i = 0; i < vocabularies.length; i++) {
			for(var x = 0; x < vocabularies[i].data.length; x++) {
				this.vocabList.push(vocabularies[i].data[x]);
			}
		}
		this.newRound();
	},
	handleWin: function() {
		this.wins++;
		this.lastGames.push({"won": true});
		if(this.lastGames.length > 30) {
			this.lastGames.pop();
		}
		this.newRound();
	},
	handleLoss: function() {
		if(!this.englishMode) {
			var posibilities = this.currentWord.english;
			posibilities = this.serializeEnglish(this.currentWord.english);
			var possibilityShow = [];
			for(var i = 0; i < posibilities.length; i++) {
				if(i != 0) {
					possibilityShow.push(", ");
				}
				possibilityShow.push(posibilities[i].english);
			}
			$("#correctionSpan").html("(" + possibilityShow.join("") + ")");
			//var englishData = this.serializeEnglish(this.vocabList[randNum].english);
			//this.lastMistakes.push({"question": ""});
		} else {
			$("#correctionSpan").html("(" + this.currentWord.kana + ")");
		}
		$("#vocabTask").css("color", "#f44336");
		this.isErrorMode = true;
		this.losses++;
		this.lastGames.push({"won": false});
		if(this.lastGames.length > 30) {
			this.lastGames.pop();
		}

	},
	serializeEnglish: function(inData) {
		if(typeof inData === 'string') {
			return [{"english": inData, "description": ""}];
		} else if(inData.constructor === Array) {
			var newArray = [];
			for(var i = 0; i < inData.length; i++) {
				var serialized = this.serializeEnglish(inData[i]);
				for(var x = 0; x < serialized.length; x++) {
					newArray.push(serialized[x]);
				}
			}
			return newArray;
		} else {
			return [{"english": inData.english, "description": inData.description === undefined ? "" : inData.description}];
		}
	},
	newRound: function() {
		this.isErrorMode = false;
		var randNum = Math.floor(Math.random()*this.vocabList.length);
		this.currentWord = this.vocabList[randNum];
		this.englishMode = Math.floor(Math.random()*2)==0 ? true : false;
		var englishData = this.serializeEnglish(this.vocabList[randNum].english);
		var interfaceData = [];
		console.log("New round!");
		console.log(englishData);

		var entryString = this.currentWord.kana;
		if(this.englishMode) {
			var choice = Math.floor(Math.random()*englishData.length);
			entryString = englishData[choice].english + (englishData[choice].description.length != 0 ? "(" + englishData[choice].description + ")" : "");

			entryString = entryString.substring(0,1).toUpperCase() + entryString.substring(1);

		}

		interfaceData.push('<div class="outerVocabularyArea"><div class="vocabGameComponent"><div class="vocabularyGameArea shaded">');
			interfaceData.push('<h1 id="vocabTask">' + entryString + '</h1>');
			interfaceData.push('<span id="correctionSpan"></span>');
			interfaceData.push('<form id="entryForm">');
				interfaceData.push('<input type="text" class="input-area form-control" id="vocabEntry" placeholder="Type your answer here..." autocapitalize="off" autocomplete="off" lang="ja" autofocus></input>');
				interfaceData.push('<input type="submit" value="Submit" class="input-area wide-button" />');
			interfaceData.push('</form>');
			interfaceData.push('</div>');
			interfaceData.push('<div class="vocabularyScoreboard shaded">');
				interfaceData.push('<div class="row">');
					interfaceData.push('<div class="col-md-6">');
						interfaceData.push('<h3>' + this.wins + '</h3>');
					interfaceData.push('</div>');
					interfaceData.push('<div class="col-md-6">');
						interfaceData.push('<h3>' + this.losses + '</h3>');
					interfaceData.push('</div>');
				interfaceData.push('</div>');
				interfaceData.push('<div class="row">');
					interfaceData.push('<div class="col-md-6">');
						interfaceData.push('correct');
					interfaceData.push('</div>');
					interfaceData.push('<div class="col-md-6">');
						interfaceData.push('wrong');
					interfaceData.push('</div>');
				interfaceData.push('</div>');
				interfaceData.push('<div class="row">');
					interfaceData.push('<div class="col-md-12" style="">');
						var tot = 0;
						for(var x = 0; x < this.lastGames.length; x++) {
							if(this.lastGames[x].won) {
								tot = tot + 100;
							}
						}
						if(this.lastGames.length != 0) {
							interfaceData.push('<h3>' + (tot / this.lastGames.length) + '%</h3>');
						} else {
							interfaceData.push('<h3>0%</h3>');
						}
					interfaceData.push('</div>');
				interfaceData.push('</div>');
				interfaceData.push('<div class="row">');
					interfaceData.push('<div class="col-md-12" style="">');
						interfaceData.push('Accuracy(last 30 rounds)');
					interfaceData.push('</div>');
				interfaceData.push('</div>');
				interfaceData.push('<div class="row">');
					interfaceData.push('<div class="col-md-12" style="margin-top: 10px;">');
						interfaceData.push('Recent mistakes');
					interfaceData.push('</div>');
				interfaceData.push('</div>');

		interfaceData.push('</div></div></div>');

		$("#content").html(interfaceData.join(""));

		//Register events
		if(this.englishMode) {
			wanakana.bind(document.getElementById("vocabEntry"));
		}

		$("#entryForm").submit({vocabGame: this, englishData: englishData}, function(e) {
			if(e.data.vocabGame.isErrorMode) {
				e.data.vocabGame.newRound();
			} else {
				var currWord = e.data.vocabGame.currentWord;
				var answer = $("#vocabEntry").val();

				if(e.data.vocabGame.englishMode) {
					//The text is english, answer in japanese
					if(typeof currWord.kana === 'string') {
						if(currWord.kana == answer) {
							e.data.vocabGame.handleWin();
						} else {
							e.data.vocabGame.handleLoss();
						}
					} else {
						var correct = false;
						for(var i = 0; i < currWord.kana.length; i++) {
							if(currWord.kana[i] == answer) {
								correct = true;
							}
						}
						if(correct) {
							e.data.vocabGame.handleWin();
						} else {
							e.data.vocabGame.handleLoss();
						}
					}
				} else {
					//The text is in japanese, answer in english
					var isCorrect = false;
					for(var i = 0; i < e.data.englishData.length; i++) {
						if(e.data.englishData[i].english == answer.toLowerCase()) {
							isCorrect = true;
						}
					}
					if(isCorrect) {
						e.data.vocabGame.handleWin();
					} else {
						e.data.vocabGame.handleLoss();
					}
				}
			}
			e.preventDefault();
		});
	}
};