var VocabularyGame = {
	vocabList: [],
	currentWord: {},
	englishMode: false,
	isErrorMode: false,
	wins: 0,
	losses: 0,
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
		this.newRound();
	},
	handleLoss: function() {
		var posibilities = this.currentWord.english;
		if(this.englishMode)
			posibilities = this.currentWord.kana;

		if(typeof posibilities === 'string') {
			$("#correctionSpan").html("(" + posibilities + ")");
		} else {
			var words = [];
			for(var i = 0; i < posibilities.length; i++) {
				if(i != 0) {
					words.push(", ");
				}
				words.push(posibilities[i]);
			}
			$("#correctionSpan").html("(" + words.join("") + ")");
		}
		$("#vocabTask").css("color", "#f44336");
		this.isErrorMode = true;
		this.losses++;
	},
	newRound: function() {
		this.isErrorMode = false;
		var randNum = Math.floor(Math.random()*this.vocabList.length);
		this.currentWord = this.vocabList[randNum];
		this.englishMode = Math.floor(Math.random()*2)==0 ? true : false;
		var interfaceData = [];

		var entryString = this.currentWord.kana;
		if(this.englishMode) {
			if(typeof this.currentWord.english === 'string') {
				entryString = this.currentWord.english;
			} else {
				entryString = this.currentWord.english[Math.floor(Math.random()*this.currentWord.english.length)];
			}
			entryString = entryString.substring(0,1).toUpperCase() + entryString.substring(1);

		}

		interfaceData.push('<div class="outerVocabularyArea"><div class="vocabularyGameArea">');
			interfaceData.push('<h1 id="vocabTask">' + entryString + '</h1>');
			interfaceData.push('<span id="correctionSpan"></span>');
			interfaceData.push('<form id="entryForm">');
				interfaceData.push('<input type="text" class="input-area form-control" id="vocabEntry" placeholder="Type your answer here..." autocapitalize="off" autocomplete="off" lang="ja"></input>');
				interfaceData.push('<input type="submit" value="Submit" class="input-area wide-button" />');
			interfaceData.push('</form>');
		interfaceData.push('</div></div>');

		$("#content").html(interfaceData.join(""));

		//Register events
		if(this.englishMode) {
			wanakana.bind(document.getElementById("vocabEntry"));
		}

		$("#entryForm").submit({vocabGame: this}, function(e) {
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
							handleWin();
						} else {
							handleLoss();
						}
					}
				} else {
					//The text is in japanese, answer in english
					if(typeof currWord.english === 'string') {
						if(currWord.english == answer.toLowerCase()) {
							e.data.vocabGame.handleWin();
						} else {
							e.data.vocabGame.handleLoss();
						}
					} else {
						var correct = false;
						for(var i = 0; i < currWord.english.length; i++) {
							if(currWord.english[i] == answer.toLowerCase()) {
								correct = true;
							}
						}
						if(correct) {
							handleWin();
						} else {
							handleLoss();
						}
					}
				}
			}
			e.preventDefault();
		});
	}
};