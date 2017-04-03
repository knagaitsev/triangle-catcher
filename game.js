/*
* Example by Loonride - https://loonride.com/learn/phaser/p2-physics-bodies
*/

//set width and height variables for game
var width = 800;
var height = 500;
//create game object and initialize the canvas
var game = new Phaser.Game(width, height, Phaser.AUTO, null, {preload: preload, create: create, update: update});

//initialize some variables
var catcher;
var triangles;
var catcherSpeed = 250;
var maxTriangleSpeed = 200;
var showBodies = false;
var currentTime = 0;
var timer;
var gameDuration = 20;

function preload() {
	//set background color of canvas
	game.stage.backgroundColor = '#eee';

	//load assets
	game.load.image('catcher', 'asset/semicircle.png');
	game.load.image('triangle', 'asset/triangle.png');

	//load physics body polygon data from a local JSON file
	this.game.load.physics("physics", "asset/data.json");

	/*
	* alternatively, load physics body data from a URL
	* this is useful for testing, but requires an internet connection to load
	* uncomment the code below and comment out the code above to test
	* replace with the code provided by Loon Physics as well
	*/

	/*
	this.game.load.physics("physics", "https:" +
	"//firebasestorage.googleapis.com/v0/b/lo" +
	"on-ride-webpage.appspot.com/o/lDce4f2cCT" +
	"hC5RWtGaT4pe2flEy1%2Fjson%2F-KgeJbYbQyaA" +
	"sfGEh6Mk?alt=media&token=2db1f23f-5122-4" +
	"e21-9776-55d260c7248e");
	*/
}
function create() {

	//set world boundaries, allowing room at the bottom for triangles to fall
	game.world.setBounds(0,0,width,height+100);

	//start p2 physics engine
	game.physics.startSystem(Phaser.Physics.P2JS);

	//initialize keyboard arrows for the game controls
	cursors = game.input.keyboard.createCursorKeys();

	//initialize catcher
	catcher = game.add.sprite(width*0.5, height*0.8, "catcher");
	game.physics.p2.enable(catcher, showBodies);
	//add physics body polygon
	catcher.body.clearShapes();
	catcher.body.loadPolygon("physics", "semicircle");
	//make catcher kinematic so that it does not respond to collisions
	catcher.body.kinematic = true;

	//initialize triangle group
	triangles = game.add.group();

	//spawn a triangle every .8 seconds, unless the end of the game is near
	game.time.events.loop(800, function() {
		if (currentTime < gameDuration - 4) {
			spawnTriangle();
		}
	}, game);

	//place timer text in the top left to count down
	timer = game.add.text(10, 10, gameDuration, { fontSize: "24px"} );
	//decrement the remaining time every second
	game.time.events.loop(1000, updateTimer, game);
}
function update() {

	//move the catcher right and left based on keyboard arrows
	if (cursors.left.isDown && catcher.position.x > 0) {
		catcher.body.velocity.x = -catcherSpeed;
	}
	else if (cursors.right.isDown && catcher.position.x < width) {
		catcher.body.velocity.x = catcherSpeed;
	}
	else {
		catcher.body.velocity.x = 0;
	}

	//iterate through the triangle group
	for (var i in triangles.children) {
		var triangle = triangles.children[i];
		//accelerate triangles downards if below a maximum speed
		if (triangle.body.velocity.y < maxTriangleSpeed) {
			triangle.body.velocity.y+= 20;
		}
		//destroy triangles that have left through the bottom of the viewport
		if (triangle.position.y > height + 50) {
			triangle.destroy();
		}
	}
}

function spawnTriangle() {
	//spawn triangle randomly at the top of the screen
	var x = Math.random() * width;
	var triangle = game.add.sprite(x, height*0.1, "triangle");
	game.physics.p2.enable(triangle, showBodies);
	//add physics body polygon
	triangle.body.clearShapes();
	triangle.body.loadPolygon("physics", "triangle");
	//move triangle downwards
	triangle.body.moveDown(maxTriangleSpeed);

	//add triangle to the triangles group
	triangles.add(triangle);
}

function updateTimer() {
	//increase current timer and set remaining time text
	currentTime++;
	timer.setText(gameDuration - currentTime);

	/*
	* stop the game and display the number of triangles caught
	* when time has run out
	*/
	if (currentTime == gameDuration) {
		var score = triangles.children.length;
		var txt = game.add.text(width*0.5, height*0.5, score, {fontSize: "40px"});
		txt.anchor.set(0.5);
		game.paused = true;
	}
}
