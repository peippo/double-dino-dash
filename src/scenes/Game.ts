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
	inactiveOverlay: Phaser.GameObjects.Graphics;
	meteoritesGroup: Phaser.Physics.Arcade.Group;

	constructor() {
		super("Game");
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

		this.createPlayerAnimations("player1");
		this.createPlayerAnimations("player2");

		this.player1.anims.play("player1_idle");
		this.player2.anims.play("player2_idle");

		this.inactiveOverlay = this.add.graphics();
		this.updateInactiveOverlay();

		// Meteorites
		this.meteoritesGroup = this.physics.add.group();

		this.time.addEvent({
			delay: 1000,
			callback: this.spawnMeteorites,
			callbackScope: this,
			loop: true,
		});
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
		let isMovingLeft = false;

		const activePlayerKey =
			this.activePlayer === this.player1 ? "player1" : "player2";

		if (this.activePlayer === this.player1) {
			// Normal controls for player1
			if (this.cursors.left.isDown) {
				isMovingLeft = true;
				if (this.activePlayer.x > this.activePlayer.width) {
					this.activePlayer.setVelocityX(-200);
					isMoving = true;
				}
			} else if (
				this.cursors.right.isDown &&
				this.activePlayer.x < player1MaxX
			) {
				this.activePlayer.setVelocityX(200);
				isMoving = true;
			}

			if (this.cursors.up.isDown && this.activePlayer.y > minY) {
				this.activePlayer.setVelocityY(-200);
				isMoving = true;
			} else if (this.cursors.down.isDown && this.activePlayer.y < maxY) {
				this.activePlayer.setVelocityY(200);
				isMoving = true;
			}
		} else {
			// Reversed controls for player2
			if (
				this.cursors.left.isDown &&
				this.activePlayer.x < screenWidth - this.activePlayer.width
			) {
				this.activePlayer.setVelocityX(200);
				isMoving = true;
			} else if (this.cursors.right.isDown) {
				isMovingLeft = true;

				if (this.activePlayer.x > player2MinX) {
					this.activePlayer.setVelocityX(-200);
					isMoving = true;
				}
			}

			if (this.cursors.up.isDown && this.activePlayer.y < maxY) {
				this.activePlayer.setVelocityY(200);
				isMoving = true;
			} else if (this.cursors.down.isDown && this.activePlayer.y > minY) {
				this.activePlayer.setVelocityY(-200);
				isMoving = true;
			}
		}

		if (isMoving) {
			if (isMovingLeft) {
				this.activePlayer.flipX = true;
			} else {
				this.activePlayer.flipX = false;
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

			this.updateInactiveOverlay();
		}

		this.meteoritesGroup.children.iterate((meteorite) => {
			if (meteorite) {
				// Custom logic for each meteorite
				this.updateMeteorite(meteorite as Phaser.Physics.Arcade.Sprite);
			}

			return null;
		});
	}

	createPlayerAnimations(spriteSheetKey: string) {
		this.anims.create({
			key: `${spriteSheetKey}_walk`,
			frames: this.anims.generateFrameNumbers(spriteSheetKey, {
				start: 4,
				end: 9,
			}),
			frameRate: 20,
			repeat: -1,
		});

		this.anims.create({
			key: `${spriteSheetKey}_idle`,
			frames: this.anims.generateFrameNumbers(spriteSheetKey, {
				start: 0,
				end: 3,
			}),
			frameRate: 10,
			repeat: -1,
		});
	}

	updateInactiveOverlay() {
		this.inactiveOverlay.clear();

		const inactivePlayer =
			this.activePlayer === this.player1 ? this.player2 : this.player1;

		this.inactiveOverlay.fillStyle(0x000000, 0.2);

		// Draw overlay over the inactive player's half
		const screenWidth = this.scale.width;
		const screenHeight = this.scale.height;
		const halfScreenWidth = screenWidth / 2;

		if (inactivePlayer === this.player1) {
			this.inactiveOverlay.fillRect(0, 0, halfScreenWidth, screenHeight);
		} else {
			this.inactiveOverlay.fillRect(
				halfScreenWidth,
				0,
				halfScreenWidth,
				screenHeight
			);
		}
	}

	spawnMeteorites() {
		const screenWidth = this.scale.width;

		// Random position and velocity for the left side meteorite
		const startX = Phaser.Math.Between(0, screenWidth / 2);
		const startY = 0;
		const velocityX = Phaser.Math.Between(-100, 100);
		const velocityY = 100;

		const meteoriteLeft = this.meteoritesGroup.create(
			startX,
			startY,
			`meteorite${Phaser.Math.Between(1, 5)}`
		);
		meteoriteLeft.setVelocity(velocityX, velocityY);
		meteoriteLeft.setScale(0.3);

		// Create mirrored right side meteorite
		const mirrorX = screenWidth - startX;
		const meteoriteRight = this.meteoritesGroup.create(
			mirrorX,
			startY,
			`meteorite${Phaser.Math.Between(1, 5)}`
		);
		meteoriteRight.setVelocity(-velocityX, velocityY);
		meteoriteRight.setScale(0.3);
	}

	updateMeteorite(meteorite: Phaser.Physics.Arcade.Sprite) {
		if (meteorite.y > this.scale.height) {
			meteorite.destroy();
		}
	}
}
