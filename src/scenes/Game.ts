import { Scene } from "phaser";

export class Game extends Scene {
	camera: Phaser.Cameras.Scene2D.Camera;
	background: Phaser.GameObjects.Image;
	msg_text: Phaser.GameObjects.Text;
	player1: Phaser.Physics.Arcade.Sprite;
	player2: Phaser.Physics.Arcade.Sprite;
	activePlayer: Phaser.Physics.Arcade.Sprite;
	cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	switchKey: Phaser.Input.Keyboard.Key;

	constructor() {
		super("Game");
	}

	createPlayerAnimations(spriteSheetKey: string, animBaseKey: string) {
		this.anims.create({
			key: `${animBaseKey}_walk`,
			frames: this.anims.generateFrameNumbers(spriteSheetKey, {
				start: 4,
				end: 9,
			}),
			frameRate: 20,
			repeat: -1,
		});

		this.anims.create({
			key: `${animBaseKey}_idle`,
			frames: this.anims.generateFrameNumbers(spriteSheetKey, {
				start: 0,
				end: 3,
			}),
			frameRate: 10,
			repeat: -1,
		});
	}

	create() {
		this.camera = this.cameras.main;
		this.camera.setBackgroundColor(0x00ff00);

		this.background = this.add.image(512, 384, "background");
		this.background.setAlpha(0.5);

		this.player1 = this.physics.add.sprite(200, 300, "player1");
		this.player1.setScale(2);
		this.player2 = this.physics.add.sprite(600, 300, "player2");
		this.player2.setScale(2);

		this.activePlayer = this.player1;

		this.cursors = this.input.keyboard!.createCursorKeys();
		this.switchKey = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		this.createPlayerAnimations("player1", "player1");
		this.createPlayerAnimations("player2", "player2");

		this.player1.anims.play("player1_idle");
		this.player2.anims.play("player2_idle");
	}

	update() {
		const screenWidth = this.scale.width;
		const screenHeight = this.scale.height;
		const halfScreenWidth = screenWidth / 2;

		const playerWidth = this.activePlayer.width;
		const playerHeight = this.activePlayer.height;

		const player1MaxX = halfScreenWidth - playerWidth;
		const player2MinX = halfScreenWidth + playerWidth;
		const minY = playerHeight;
		const maxY = screenHeight - playerHeight;

		// Movement control for the active player
		this.activePlayer.setVelocity(0);

		let isMoving = false;

		const activePlayerKey =
			this.activePlayer === this.player1 ? "player1" : "player2";

		if (this.activePlayer === this.player1) {
			// Normal controls for player1
			if (
				this.cursors.left.isDown &&
				this.activePlayer.x > this.activePlayer.width
			) {
				this.activePlayer.setVelocityX(-160);
				isMoving = true;
			} else if (
				this.cursors.right.isDown &&
				this.activePlayer.x < player1MaxX
			) {
				this.activePlayer.setVelocityX(160);
				isMoving = true;
			}

			if (this.cursors.up.isDown && this.activePlayer.y > minY) {
				this.activePlayer.setVelocityY(-160);
				isMoving = true;
			} else if (this.cursors.down.isDown && this.activePlayer.y < maxY) {
				this.activePlayer.setVelocityY(160);
				isMoving = true;
			}
		} else {
			// Reversed controls for player2
			if (
				this.cursors.left.isDown &&
				this.activePlayer.x < screenWidth - this.activePlayer.width
			) {
				this.activePlayer.setVelocityX(160);
				isMoving = true;
			} else if (
				this.cursors.right.isDown &&
				this.activePlayer.x > player2MinX
			) {
				this.activePlayer.setVelocityX(-160);
				isMoving = true;
			}

			if (this.cursors.up.isDown && this.activePlayer.y < maxY) {
				this.activePlayer.setVelocityY(160);
				isMoving = true;
			} else if (this.cursors.down.isDown && this.activePlayer.y > minY) {
				this.activePlayer.setVelocityY(-160);
				isMoving = true;
			}
		}

		// Play walking animation if moving, otherwise play idle
		if (isMoving) {
			if (
				!this.activePlayer.anims.isPlaying ||
				this.activePlayer.anims.currentAnim?.key !==
					`${activePlayerKey}_walk`
			) {
				this.activePlayer.anims.play(`${activePlayerKey}_walk`);
			}
		} else {
			if (
				this.activePlayer.anims.currentAnim?.key !==
				`${activePlayerKey}_idle`
			) {
				this.activePlayer.anims.play(`${activePlayerKey}_idle`);
			}
		}

		// Switch control between players
		if (Phaser.Input.Keyboard.JustDown(this.switchKey)) {
			this.activePlayer.setVelocity(0);
			this.activePlayer.anims.play(`${activePlayerKey}_idle`);

			this.activePlayer =
				this.activePlayer === this.player1 ? this.player2 : this.player1;
		}
	}
}
