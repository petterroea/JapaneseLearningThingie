var CharacterRecognition = {
	gridX: 12,
	gridY: 12,
	renderLetter: function(letter) {
		$("body").append('<canvas id="renderCanvas" width="500" height="500"> </canvas>');
		var canvasHandle = document.getElementById("renderCanvas");
		var contextHandle = canvasHandle.getContext("2d");
		//Render letter
		contextHandle.font = "400px Arial";
		contextHandle.textAligh = "start";
		contextHandle.fillText(letter, 0, 400);
	},
	generateBoundingBox: function(canvasId) {
		var canvasHandle = document.getElementById(canvasId);
		var contextHandle = canvasHandle.getContext("2d");

		//Image data
		var pixelData = contextHandle.getImageData(0, 0, canvasHandle.width, canvasHandle.height);

		//Get left bounds
		var leftBounds = 0; 

		mainLoopThing: 
		for(var x = 0; x < canvasHandle.width; x++) {
			for(var y = 0; y < canvasHandle.height; y++) {
				var arrayCoord = (4*x)+(4*canvasHandle.width*y);
				if(pixelData.data[arrayCoord+3]>128) {
					leftBounds = x;
					console.log("Left: " + x + ", " + pixelData.data[arrayCoord+0] + ", " + pixelData.data[arrayCoord+1] + ", " + pixelData.data[arrayCoord+2] + ", " + pixelData.data[arrayCoord+3]);
					break mainLoopThing;
				}
			}
		}

		//Get right bounds
		var rightBounds = 0;

		mainLoopThing: 
		for(var x = canvasHandle.width-1; x > 0; x--) {
			for(var y = 0; y < canvasHandle.height; y++) {
				var arrayCoord = (4*x)+(4*canvasHandle.width*y);
				if(pixelData.data[arrayCoord+3]>128) {
					rightBounds = x;
					console.log("Right: " + x + ", " + pixelData.data[arrayCoord+0] + ", " + pixelData.data[arrayCoord+1] + ", " + pixelData.data[arrayCoord+2] + ", " + pixelData.data[arrayCoord+3]);
					break mainLoopThing;
				}
			}
		}

		//Get top bounds
		var topBounds = 0; 

		mainLoopThing: 
		for(var y = 0; y < canvasHandle.height; y++) {
			for(var x = 0; x < canvasHandle.width; x++) {
				var arrayCoord = (4*x)+(4*canvasHandle.width*y);
				if(pixelData.data[arrayCoord+3]>128) {
					topBounds = y;
					console.log("Top: " + y + ", " + pixelData.data[arrayCoord+0] + ", " + pixelData.data[arrayCoord+1] + ", " + pixelData.data[arrayCoord+2] + ", " + pixelData.data[arrayCoord+3]);
					break mainLoopThing;
				}
			}
		}

		//Get bottom bounds
		var bottomBounds = 0; 

		mainLoopThing: 
		for(var y = canvasHandle.height-1; y > 0; y--) {
			for(var x = 0; x < canvasHandle.width; x++) {
				var arrayCoord = (4*x)+(4*canvasHandle.width*y);
				if(pixelData.data[arrayCoord+3]>128) {
					bottomBounds = y;
					console.log("Bottom: " + y + ", " + pixelData.data[arrayCoord+0] + ", " + pixelData.data[arrayCoord+1] + ", " + pixelData.data[arrayCoord+2] + ", " + pixelData.data[arrayCoord+3]);
					break mainLoopThing;
				}
			}
		}

		return {"topBounds": topBounds, "bottomBounds": bottomBounds, "leftBounds": leftBounds, "rightBounds": rightBounds, "width": rightBounds-leftBounds, "height": bottomBounds-topBounds};
	},
	renderBoundingBox: function(canvasId, boundingBox) {
		var canvasHandle = document.getElementById(canvasId);
		var contextHandle = canvasHandle.getContext("2d");

		contextHandle.lineWidth = 2;

		contextHandle.rect( boundingBox.leftBounds, 
							boundingBox.topBounds, 
							boundingBox.width, 
							boundingBox.height);
		contextHandle.stroke();
	},
	renderGrid: function(canvasId, boundingBox) {
		var canvasHandle = document.getElementById(canvasId);
		var contextHandle = canvasHandle.getContext("2d");

		var xPerGrid = boundingBox.width/this.gridX;
		var yPerGrid = boundingBox.height/this.gridY;

		contextHandle.lineWidth = 2;

		//Vertical lines
		for(var i = 1; i < this.gridX; i++) {
			contextHandle.moveTo(boundingBox.leftBounds+(i*xPerGrid), boundingBox.topBounds);
			contextHandle.lineTo(boundingBox.leftBounds+(i*xPerGrid), boundingBox.bottomBounds);
			contextHandle.stroke();
		}

		//Horizontal lines
		for(var i = 1; i < this.gridY; i++) {
			contextHandle.moveTo(boundingBox.leftBounds, boundingBox.topBounds+(i*yPerGrid));
			contextHandle.lineTo(boundingBox.rightBounds, boundingBox.topBounds+(i*yPerGrid));
			contextHandle.stroke();
		}

	},
	evaluateLetter: function(canvasId, boundingBox) {
		var canvasHandle = document.getElementById(canvasId);
		var contextHandle = canvasHandle.getContext("2d");
		contextHandle.lineWidth = 2;

		//Image data
		var pixelData = contextHandle.getImageData(boundingBox.leftBounds, boundingBox.topBounds, boundingBox.width, boundingBox.height).data;


		var xPerGrid = boundingBox.width/this.gridX;
		var yPerGrid = boundingBox.height/this.gridY;

		var collisionArray = [];
		for(var y = 0; y < this.gridY; y++) {
			for(var x = 0; x < this.gridX; x++) {
				//Evaluate a grid element
				//Count precentage of grid is dark
				var precentageCounter = 0;
				var precentageCount = 0;
				gridLoop:
				for(var internalY = 0; internalY < yPerGrid; internalY++) {
					var numbers = [];
					for(var internalX = 0; internalX < xPerGrid; internalX++) {
						var globalX = Math.round((x*xPerGrid)+internalX);
						var globalY = Math.round((y*yPerGrid)+internalY);
		
						var arrayCoord = (4*globalX)+(4*boundingBox.width*globalY);
						//console.log(pixelData[arrayCoord+3]);
						if(pixelData[arrayCoord+3]>128) {
							precentageCounter = precentageCounter + 100;
						} else {
							//precentageCounter += 0;
						}
						precentageCount++;
						numbers.push(/*"(" + leftPad(globalX, 3) + ", " + leftPad(globalY, 3) + ", " + leftPad(arrayCoord, 4) + ")" + */leftPad(pixelData[arrayCoord+3], 3));
					}
					//console.log(internalY + " " + numbers.join(" "));
				}

				var gridPopulationPrecentage = precentageCounter/precentageCount;
				if(gridPopulationPrecentage > 50) {
					collisionArray.push(true);
				} else {
					collisionArray.push(false);
				}
				//console.log("Validating from " + (x*xPerGrid) + ", " + (y*yPerGrid) + ". " + gridPopulationPrecentage + "% population");
			}
		}
		return collisionArray;
	},
	renderGridValidation: function(canvasId, boundingBox, gridData) {
		var canvasHandle = document.getElementById(canvasId);
		var contextHandle = canvasHandle.getContext("2d");

		var xPerGrid = boundingBox.width/this.gridX;
		var yPerGrid = boundingBox.height/this.gridY;
		for(var i = 0; i < gridData.length; i++) {
			var gridXCoord = Math.floor(i%this.gridX);
			var gridYCoord = Math.floor(i/this.gridY);

			var globalX = ( gridXCoord*xPerGrid ) + boundingBox.leftBounds;
			var globalY = ( gridYCoord * yPerGrid ) + boundingBox.topBounds;

			if(gridData[i]) {
				//Draw a cross
				contextHandle.lineWidth = 2;
				contextHandle.strokeStyle="#FF0000";

				contextHandle.moveTo(globalX, globalY);
				contextHandle.lineTo( globalX + xPerGrid, globalY + yPerGrid );
				contextHandle.stroke();

				contextHandle.moveTo(globalX + xPerGrid, globalY);
				contextHandle.lineTo( globalX, globalY + yPerGrid );
				contextHandle.stroke();

				contextHandle.strokeStyle="#000000";
			}
		}
	},
	test: function() {
		this.renderLetter("あ");
		var bb = this.generateBoundingBox("renderCanvas");
		var gridData = this.evaluateLetter("renderCanvas", bb);
		this.renderGrid("renderCanvas", bb);
		this.renderBoundingBox("renderCanvas", bb);
		this.renderGridValidation("renderCanvas", bb, gridData);
	},
	testDrawing: function() {
		$("body").append('<canvas id="drawTest" width="500" height="500"> </canvas>');
		CharacterRecognition.registerCanvasAsDrawingCanvas("drawTest");
	},
	drawingComplete: function() {
		var drawnBox = CharacterRecognition.generateBoundingBox("drawTest");
		var validated = CharacterRecognition.evaluateLetter("drawTest", drawnBox);

		CharacterRecognition.renderBoundingBox("drawTest", drawnBox);
		CharacterRecognition.renderGrid("drawTest", drawnBox);
		CharacterRecognition.renderGridValidation("drawTest", drawnBox, validated);
	},
	//Drawing data
	drawingCanvasId: "",
	drawingxCoords: [],
	drawingyCoords: [],
	mouseDown: false,
	registerCanvasAsDrawingCanvas: function(id) {
		this.drawingCanvasId = id;
		$("#"+id).mousedown(function(e){
			CharacterRecognition.mouseDown = true;
			var mouseX = e.pageX-this.offsetLeft;
			var mouseY = e.pageY-this.offsetTop;
			CharacterRecognition.registerMouse(mouseX, mouseY);
		});
		$("#"+id).mousemove(function(e){
			var mouseX = e.pageX-this.offsetLeft;
			var mouseY = e.pageY-this.offsetTop;
			CharacterRecognition.registerMouse(mouseX, mouseY);
		});
		$("#"+id).mouseup(function(e){
			var mouseX = e.pageX-this.offsetLeft;
			var mouseY = e.pageY-this.offsetTop;
			CharacterRecognition.finishMousePath(mouseX, mouseY);
		});
		$("#"+id).mouseleave(function(e){
			var mouseX = e.pageX-this.offsetLeft;
			var mouseY = e.pageY-this.offsetTop;
			CharacterRecognition.finishMousePath(mouseX, mouseY);
		});
	},
	registerMouse: function(x, y) {
		if(this.mouseDown == false) return;
		//console.log("Registering at " + x + ", " + y);
		this.drawingxCoords.push(x);
		this.drawingyCoords.push(y);
		CharacterRecognition.redrawDrawingCanvas();
	},
	finishMousePath: function(x, y) {
		this.drawingxCoords.push(x);
		this.drawingyCoords.push(y);

		CharacterRecognition.redrawDrawingCanvas();

		this.drawingxCoords = [];
		this.drawingyCoords = [];
		this.mouseDown = false;
	},
	redrawDrawingCanvas: function() {
		var canvasHandle = document.getElementById(this.drawingCanvasId);
		var contextHandle = canvasHandle.getContext("2d");

		if(this.drawingxCoords.length != 0) {
			//console.log("Drawing " + this.drawingxCoords.length + " coordinates");

			contextHandle.beginPath();
			contextHandle.lineWidth = 25;
			contextHandle.strokeStyle="#FF0000FF";
			//contextHandle.lineJoin = "round";

			contextHandle.moveTo(this.drawingxCoords[0], this.drawingyCoords[0]);
			for(var i = 1; i < this.drawingxCoords.length; i++) {
				contextHandle.lineTo( this.drawingxCoords[i], this.drawingyCoords[i] );
			}
			contextHandle.stroke();
		} else {
			console.log("No drawing coords");
		}
	},
	calculateAccuracy: function(gridValidationOne, gridValidationTwo) {
		var precentageHolder = 0;
		var precentageCount = 0;
		for(var i = 0; i < gridValidationOne.length; i++) {
			if(gridValidationOne[i] == gridValidationTwo[i]) {
				precentageHolder += 100;
			}
			precentageCount++;
		}
		return precentageHolder/precentageCount;
	}
};
function leftPad(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return output;
}