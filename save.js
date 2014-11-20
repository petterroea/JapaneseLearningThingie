var SaveHandler = {
	//PROFILE STUFF
	getSavegame: function() {
		if(localStorage.savegame == null) {
			localStorage.savegame = '[]';
			return [];
		}
		return $.parseJSON(localStorage.savegame);
	},
	getAlphabetSave: function(alphabetName, gamemodeName) {
		var savegame = this.getSavegame();
		for(var i = 0; i < savegame.length; i++) {
			if(savegame[i].alphabet == alphabetName && savegame[i].gamemode == gamemodeName) {
				return savegame[i];
			}
		}
		savegame.push({"alphabet": alphabetName, "progress": 3, "previousRounds": [], "gamemode": gamemodeName});
		SaveHandler.saveSavegame(savegame);
		return savegame[savegame.length-1];
	},
	saveSavegame: function(savegame) {
		localStorage.savegame = JSON.stringify(savegame);
	},
	updateAlphabetSave: function(savegame, alphabet, gamemodeName) {
		for(var i = 0; i < savegame.length; i++) {
			if(savegame[i].alphabet == alphabet.alphabet && savegame[i].gamemode == gamemodeName) {
				savegame[i] = alphabet;
			}
		}
	},
	saveAlphabet: function(alphabet, gamemode) {
		var savegame = SaveHandler.getSavegame();
		SaveHandler.updateAlphabetSave(savegame, alphabet, gamemode);
		SaveHandler.saveSavegame(savegame);
	}
};