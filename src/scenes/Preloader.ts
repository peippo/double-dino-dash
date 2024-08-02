import { Scene } from "phaser";

export class Preloader extends Scene {
	constructor() {
		super("Preloader");
	}

	init() {
		//  We loaded this image in our Boot Scene, so we can display it here
		this.add.image(512, 384, "background");

		//  A simple progress bar. This is the outline of the bar.
		this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

		//  This is the progress bar itself. It will increase in size from the left based on the % of progress.
		const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

		//  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
		this.load.on("progress", (progress: number) => {
			//  Update the progress bar (our bar is 464px wide, so 100% = 464px)
			bar.width = 4 + 460 * progress;
		});
	}

	preload() {
		this.load.setPath("assets");

		this.load.image("logo", "logo.png");
		this.load.image("particle", "particle.png");

		// Keyboard keys by beamedeighth - https://beamedeighth.itch.io/simplekeys-animated-pixel-keyboard-keys
		this.load.image("instructions", "instructions.png");

		// Hearts by VampireGirl - https://fliflifly.itch.io/hearts-and-health-bar
		this.load.spritesheet("hearts", "heart-animated-1.png", {
			frameWidth: 17,
			frameHeight: 17,
		});

		// Meteorites by Daniel Kole - https://dkproductions.itch.io/pixel-art-package-asteroids
		this.load.image("meteorite1", "meteorite1.png");
		this.load.image("meteorite2", "meteorite2.png");
		this.load.image("meteorite3", "meteorite3.png");
		this.load.image("meteorite4", "meteorite4.png");
		this.load.image("meteorite5", "meteorite5.png");

		// Dino by Arks - https://arks.itch.io/dino-characters
		this.load.spritesheet("player1", "dino-yellow.png", {
			frameWidth: 24,
			frameHeight: 24,
		});
		this.load.spritesheet("player2", "dino-blue.png", {
			frameWidth: 24,
			frameHeight: 24,
		});
	}

	create() {
		//  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
		//  For example, you can define global animations here, so we can use them in other scenes.

		//  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
		// this.scene.start("MainMenu");
		this.scene.start("MainMenu");
	}
}
