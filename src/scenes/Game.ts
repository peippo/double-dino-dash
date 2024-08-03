import { Scene } from "phaser";

export class Game extends Scene {
	camera: Phaser.Cameras.Scene2D.Camera;
	background: Phaser.GameObjects.Image;
	player1: Phaser.Physics.Arcade.Sprite;
	player2: Phaser.Physics.Arcade.Sprite;
	activePlayer: Phaser.Physics.Arcade.Sprite;
	cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	switchKey: Phaser.Input.Keyboard.Key;
	inactiveOverlay: Phaser.GameObjects.Graphics;
	meteoritesGroup: Phaser.Physics.Arcade.Group;
	heartsGroup: Phaser.Physics.Arcade.Group;
	playerLives: number;
	livesDisplay: Phaser.GameObjects.Group;
	particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

	score: number;
	scoreText: Phaser.GameObjects.Text;
	scoreIncreaseRate: number;

	isGameOver: boolean;
	gameOverScreen: Phaser.GameObjects.Image;

	meteoriteSpawnDelay: number;
	minMeteoriteSpawnDelay: number;
	meteoriteSpawnDelayDecreaseRate: number;
	lastMeteoriteSpawnTime: number;

	heartSpawnDelay: number;
	lastHeartSpawnTime: number;

	constructor() {
		super("Game");
		this.initState();
	}

	initState() {
		this.playerLives = 3;
		this.score = 0;
		this.scoreIncreaseRate = 1;
		this.meteoriteSpawnDelay = 1500;
		this.minMeteoriteSpawnDelay = 300;
		this.meteoriteSpawnDelayDecreaseRate = 25;
		this.lastMeteoriteSpawnTime = 0;
		this.heartSpawnDelay = 20000;
		this.lastHeartSpawnTime = 0;
		this.isGameOver = false;
	}

	create() {
		this.initState();

		this.camera = this.cameras.main;
		this.camera.setBackgroundColor(0x00ff00);

		this.background = this.add.image(512, 384, "background");
		this.background.setAlpha(0.5);

		this.player1 = this.physics.add.sprite(250, 500, "player1");
		this.player1.setScale(2);
		this.player1.body?.setSize(16, 18);
		this.player1.body?.setOffset(4, 4);
		this.player2 = this.physics.add.sprite(780, 500, "player2");
		this.player2.setScale(2);
		this.player2.body?.setSize(16, 18);
		this.player2.body?.setOffset(4, 3);
		this.player2.flipY = true;

		this.activePlayer = this.player1;

		this.cursors = this.input.keyboard!.createCursorKeys();
		this.switchKey = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		this.createPlayerAnimations("player1");
		this.createPlayerAnimations("player2");

		this.player1.anims.play("player1_idle");
		this.player2.anims.play("player2_idle");

		this.anims.create({
			key: "heart_full",
			frames: [{ key: "hearts", frame: 1 }],
		});

		this.anims.create({
			key: "heart_loss",
			frames: this.anims.generateFrameNumbers("hearts", {
				start: 2,
				end: 4,
			}),
			frameRate: 10,
			repeat: 0,
		});

		this.anims.create({
			key: "heart_empty",
			frames: [{ key: "hearts", frame: 4 }],
		});

		this.createLifeDisplay();

		this.inactiveOverlay = this.add.graphics();
		this.updateInactiveOverlay();

		// Meteorites
		this.meteoritesGroup = this.physics.add.group({
			bounceX: 0.5,
			bounceY: 0.5,
		});

		this.physics.add.overlap(
			this.player1,
			this.meteoritesGroup,
			this.handlePlayerHit,
			null,
			this
		);

		this.physics.add.overlap(
			this.player2,
			this.meteoritesGroup,
			this.handlePlayerHit,
			null,
			this
		);

		this.physics.add.collider(
			this.meteoritesGroup,
			this.meteoritesGroup,
			this.handleMeteoroidCollision,
			undefined,
			this
		);

		this.particleEmitter = this.add.particles(0, 0, "particle", {
			speed: { min: -200, max: 200 },
			scale: { start: 0.5, end: 0 },
			lifespan: 500,
			gravityY: 200,
			rotate: { start: 0, end: 360 },
			blendMode: "ADD",
			emitting: false,
		});

		// Hearts pickups
		this.heartsGroup = this.physics.add.group();
		this.physics.add.overlap(
			this.player1,
			this.heartsGroup,
			this.collectHeart,
			null,
			this
		);
		this.physics.add.overlap(
			this.player2,
			this.heartsGroup,
			this.collectHeart,
			null,
			this
		);

		this.scoreText = this.add.text(40, 40, "Score: 0", {
			fontFamily: "sans-serif",
			fontSize: "20px",
			color: "#000",
		});
	}

	update(time: any, delta: any) {
		if (this.isGameOver) return;

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
				(this.activePlayer.anims.currentAnim?.key !==
					`${activePlayerKey}_walk` &&
					this.activePlayer.anims.currentAnim?.key !==
						`${activePlayerKey}_hit`)
			) {
				this.activePlayer.anims.play(`${activePlayerKey}_walk`);
			}
		} else {
			if (
				this.activePlayer.anims.currentAnim?.key !==
					`${activePlayerKey}_idle` &&
				this.activePlayer.anims.currentAnim?.key !==
					`${activePlayerKey}_hit`
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
				this.updateMeteorite(meteorite as Phaser.Physics.Arcade.Sprite);
			}

			return null;
		});

		this.score += this.scoreIncreaseRate * delta * 0.001; // Convert ms to seconds
		this.scoreText.setText("Score: " + Math.floor(this.score));

		// Gradually increase score rate
		this.scoreIncreaseRate += 1 * delta * 0.001;

		if (time - this.lastMeteoriteSpawnTime > this.meteoriteSpawnDelay) {
			this.spawnMeteorites();
			this.lastMeteoriteSpawnTime = time;
			// Decrease spawn delay over time, but don't go below minMeteoriteSpawnDelay
			this.meteoriteSpawnDelay = Math.max(
				this.meteoriteSpawnDelay - this.meteoriteSpawnDelayDecreaseRate,
				this.minMeteoriteSpawnDelay
			);
		}

		if (time - this.lastHeartSpawnTime > this.heartSpawnDelay) {
			this.spawnHeart();
			this.lastHeartSpawnTime = time;
		}
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

		this.anims.create({
			key: `${spriteSheetKey}_hit`,
			frames: this.anims.generateFrameNumbers(spriteSheetKey, {
				start: 13,
				end: 16,
			}),
			frameRate: 10,
		});
	}

	createLifeDisplay() {
		this.livesDisplay = this.add.group({
			key: "life",
			repeat: 2,
			setXY: { x: this.scale.width / 2 - 50, y: 50, stepX: 50 },
		});

		this.livesDisplay.children.iterate((heart) => {
			let heartSprite = heart as Phaser.GameObjects.Sprite;

			heartSprite.setScale(2);
			heartSprite.play("heart_full");

			return null;
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
		const velocityY = Phaser.Math.Between(75, 125);
		const angularVelocity = Phaser.Math.Between(-20, 20);

		const meteoriteNum = Phaser.Math.Between(1, 5);
		const meteoriteLeft = this.meteoritesGroup.create(
			startX,
			startY,
			`meteorite${meteoriteNum}`
		);
		meteoriteLeft.setVelocity(velocityX, velocityY);
		meteoriteLeft.setAngularVelocity(angularVelocity);
		meteoriteLeft.setScale(0.3);

		if (meteoriteNum >= 3) {
			meteoriteLeft.body.setSize(64, 64);
		} else {
			meteoriteLeft.body.setSize(192, 192);
		}

		// Create mirrored right side meteorite
		const mirrorX = screenWidth - startX;
		const meteoriteRight = this.meteoritesGroup.create(
			mirrorX,
			startY,
			`meteorite${meteoriteNum}`
		);
		meteoriteRight.setVelocity(-velocityX, velocityY);
		meteoriteRight.setAngularVelocity(angularVelocity);
		meteoriteRight.setScale(0.3);

		if (meteoriteNum >= 3) {
			meteoriteRight.body.setSize(64, 64);
		} else {
			meteoriteRight.body.setSize(192, 192);
		}
	}

	spawnHeart() {
		if (this.heartsGroup.getTotalUsed() > 0) {
			return;
		}

		const heart = this.heartsGroup.create(
			Phaser.Math.Between(100, this.scale.width - 100),
			Phaser.Math.Between(100, this.scale.height - 100),
			"heart"
		);

		heart.setScale(1.5);
		heart.setInteractive();
		heart.setCollideWorldBounds(true);
	}

	updateMeteorite(meteorite: Phaser.Physics.Arcade.Sprite) {
		if (meteorite.y > this.scale.height) {
			meteorite.destroy();
		}
	}

	handlePlayerHit(
		player: Phaser.Physics.Arcade.Sprite,
		meteorite: Phaser.Physics.Arcade.Sprite
	) {
		meteorite.destroy();
		player.anims.stop();
		player.anims.play(`${player.texture.key}_hit`);
		player.once("animationcomplete", () => {
			player.anims.play(`${player.texture.key}_idle`);
		});

		this.playerLives--;
		this.updateLivesDisplay(this.playerLives);

		if (this.playerLives <= 0) {
			this.endGame();
		}
	}

	handleMeteoroidCollision(
		meteorite1: Phaser.Physics.Arcade.Sprite,
		meteorite2: Phaser.Physics.Arcade.Sprite
	) {
		const x = (meteorite1.x + meteorite2.x) / 2;
		const y = (meteorite1.y + meteorite2.y) / 2;

		this.particleEmitter.emitParticleAt(x, y, 20);
	}

	collectHeart(
		player: Phaser.Physics.Arcade.Sprite,
		heart: Phaser.Physics.Arcade.Sprite
	) {
		heart.destroy();
		this.lastHeartSpawnTime = this.time.now;

		if (this.playerLives < 3) {
			this.playerLives++;
			this.updateLivesDisplay(this.playerLives);
		}
	}

	updateLivesDisplay(currentLives: number) {
		let hearts = this.livesDisplay.getChildren();

		hearts.forEach((heart, index) => {
			let heartSprite = heart as Phaser.GameObjects.Sprite;

			if (index < currentLives) {
				heartSprite.play("heart_full");
			} else if (index === currentLives && this.playerLives >= 0) {
				heartSprite.play("heart_loss");
			} else {
				heartSprite.play("heart_empty");
			}
		});
	}

	endGame() {
		this.isGameOver = true;
		this.player1.alpha = 0;
		this.player2.alpha = 0;
		this.meteoritesGroup.setAlpha(0);
		this.heartsGroup.setAlpha(0);
		this.inactiveOverlay.clear();

		this.camera.shake(500);

		this.physics.pause();
		this.meteoritesGroup.setVelocityX(0);
		this.meteoritesGroup.setVelocityY(0);

		const endFade = this.add.graphics();
		endFade.fillStyle(0x000000, 1);
		endFade.fillRect(0, 0, this.scale.width, this.scale.height);
		endFade.alpha = 0;

		this.tweens.add({
			targets: endFade,
			alpha: 0.4,
			duration: 500,
			onComplete: () => {
				this.add.image(512, 384, "gameOverScreen");

				this.input.keyboard?.once("keydown-SPACE", () => {
					this.scene.restart();
				});
			},
		});
	}
}
