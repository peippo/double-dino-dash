import { Scene, GameObjects } from "phaser";

export class MainMenu extends Scene {
	background: GameObjects.Image;
	logo: GameObjects.Image;
	instructions: GameObjects.Image;
	dino1: Phaser.Physics.Arcade.Sprite;
	dino2: Phaser.Physics.Arcade.Sprite;
	title: GameObjects.Text;
	startSound:
		| Phaser.Sound.HTML5AudioSound
		| Phaser.Sound.NoAudioSound
		| Phaser.Sound.WebAudioSound;

	constructor() {
		super("MainMenu");
	}

	create() {
		this.background = this.add.image(512, 384, "background");

		this.dino1 = this.physics.add.sprite(320, 230, "player1");
		this.dino2 = this.physics.add.sprite(680, 230, "player2");
		this.dino1.setScale(20);
		this.dino1.flipX = true;
		this.dino2.setScale(20);
		this.logo = this.add.image(512, 350, "logo");

		this.startSound = this.sound.add("sound-start", { loop: false });

		this.anims.create({
			key: "dino1",
			frames: this.anims.generateFrameNumbers("player1", {
				start: 0,
				end: 3,
			}),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: "dino2",
			frames: this.anims.generateFrameNumbers("player2", {
				start: 10,
				end: 13,
			}),
			frameRate: 10,
			repeat: -1,
		});

		this.dino1.anims.play("dino1");
		this.dino2.anims.play("dino2");

		this.instructions = this.add.image(510, 600, "instructions");

		this.title = this.add
			.text(
				512,
				730,
				"MUSIC vubeo456 / DINO SPRITES @ScissorMarks / METEORITE SPRITES Daniel Kole Productions / CODE & DESIGN peippo",
				{
					fontFamily: "sans-serif",
					fontSize: 13,
					color: "#000",
					align: "center",
				}
			)
			.setOrigin(0.5);

		this.input.keyboard?.once("keydown-SPACE", () => {
			this.startSound.play();
			this.scene.start("Game");
		});
	}
}
