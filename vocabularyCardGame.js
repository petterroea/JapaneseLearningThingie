var VocabularyCardGame = {
	vocabList: [],
	numberChoices: 4,
	currentWord: {},
	answerEnglish: false,
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
		this.losses++;
		$(".wrongButton").animate({ opacity: 0 })
		$(".correctButton").attr("onclick","VocabularyCardGame.newRound()");
	},
	newRound: function() {
		var randNum = Math.floor(Math.random()*this.vocabList.length);
		this.answerEnglish = Math.random() < 0.5;
		this.currentWord = this.vocabList[randNum];

		var numberToBeShown = Math.floor(Math.random()*this.numberChoices);
		var interfaceData = [];

		var answerString = "";
		if(this.answerEnglish) {
			//Question in japanese
			answerString = this.currentWord.kana;
		} else {
			//Question in english(duh)
			var englishOptions = this.serializeEnglish(this.currentWord.english);
			var englishToChoose = Math.floor(Math.random()*englishOptions.length);

			answerString = englishOptions[englishToChoose].english;
			if(englishOptions[englishToChoose].description.length != 0) {
				answerString += "(" + englishOptions[englishToChoose].description + ")";
			}
		}

		interfaceData.push('<div class="outerVocabularyArea"><div class="vocabGameComponent"><div class="vocabularyGameArea shaded">');
			interfaceData.push('<h1 id="vocabTask">' + answerString + '</h1>');

			interfaceData.push('<div class="row">');
			for(var i = 0; i < this.numberChoices; i++) {

				if(i%2==0&&i!=0) {
					interfaceData.push('</div><div class="row">');
				}
				var buttonWord = (i==numberToBeShown ? this.currentWord : this.getRandomChoice(randNum));
				var buttonString = "button";
				if(this.answerEnglish) {
					var englishWordArr = this.serializeEnglish(buttonWord.english);
					var englishWord = englishWordArr[Math.floor(Math.random()*englishWordArr.length)];
					buttonString = englishWord.english;
					if(englishWord.description.length != 0) {
						buttonString += "(" + englishWord.description + ")";
					}
				} else {
					buttonString = buttonWord.kana;
				}

				interfaceData.push('<div class="col-md-6">');
					interfaceData.push('<input class="answerButton ' + (i==numberToBeShown ? "correctButton" : "wrongButton") + '" type="button" value="' + buttonString + '" onClick="' + (i==numberToBeShown ? 'VocabularyCardGame.handleWin()' : 'VocabularyCardGame.handleLoss()') + '"/>');
				interfaceData.push('</div>');
			}
			interfaceData.push('</div>');

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

	},
	getRandomChoice: function(exceptionChoice) {
		var randNum = Math.floor(Math.random()*this.vocabList.length);
		if(randNum>=exceptionChoice) {
			randNum++;
		}
		return this.vocabList[randNum];
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
	}
};