var SaveHandler = {
	//PROFILE STUFF
	getSavegame: function() {
		if(localStorage.savegame == null) {
			localStorage.savegame = '[]';
			return [];
		}
		return $.parseJSON(localStorage.savegame);
	},
	getAlphabetSave: function(alphabetName) {
		var savegame = this.getSavegame();
		for(var i = 0; i < savegame.length; i++) {
			if(savegame[i].alphabet == alphabetName) {
				return savegame[i];
			}
		}
		savegame.push({"alphabet": alphabetName, "progress": 3, "previousRounds": []});
		saveSavegame(savegame);
		return savegame[savegame.length-1];
	},
	saveSavegame: function(savegame) {
		localStorage.savegame = JSON.stringify(savegame);
	},
	updateAlphabetSave: function(savegame, alphabet) {
		for(var i = 0; i < savegame.length; i++) {
			if(savegame[i].alphabet == alphabet.alphabet) {
				savegame[i] = alphabet;
			}
		}
	},
	saveAlphabet: function(alphabet) {
		var savegame = SaveHandler.getSavegame();
		SaveHandler.updateAlphabetSave(savegame, alphabet);
		SaveHandler.saveSavegame(savegame);
	}
};