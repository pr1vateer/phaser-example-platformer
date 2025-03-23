"use strict";
/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.score = 0;
        this.gameWon = false;
        this.gameWidth = 2400;
        this.gameHeight = 600;
    }
    preload() {
        this.load.image('sky', 'img/temple2.jpeg');
        this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('star', 'img/star2.png');
        this.load.image('door', 'img/door2.png');
        this.load.spritesheet('dude', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
    }
    create() {
        // Set world bounds
        this.physics.world.setBounds(0, 0, this.gameWidth, this.gameHeight, true);
        this.physics.world.bounds.width = this.gameWidth;
        this.physics.world.bounds.height = this.gameHeight;
        // Set up cursor keys early
        this.cursors = this.input.keyboard.createCursorKeys();
        // Add background
        for (let i = 0; i < 4; i++) {
            this.add.image(i * 800, 300, 'sky').setScrollFactor(1);
        }
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        // Create ground
        for (let i = 0; i < 3; i++) {
            this.platforms.create(400 + (i * 800), 568, 'ground').setScale(2).refreshBody();
        }
        // Create platforms
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
        this.platforms.create(1200, 350, 'ground');
        this.platforms.create(1500, 200, 'ground');
        this.platforms.create(1800, 400, 'ground');
        this.platforms.create(2300, 250, 'ground');
        // Create player
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        // Set up camera
        this.cameras.main.setBounds(0, 0, this.gameWidth, this.gameHeight);
        this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
        // Player animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        // Create stars
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 35,
            setXY: { x: 12, y: 0, stepX: 65 }
        });
        this.stars.children.iterate((child) => {
            if (child instanceof Phaser.Physics.Arcade.Sprite) {
                child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.3));
                child.setDisplaySize(32, 32);
            }
            return true; // Required for iterate callback
        });
        // Add colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        // Add overlap with proper type casting
        this.physics.add.overlap(this.player, this.stars, (obj1, obj2) => {
            if (obj1 instanceof Phaser.Physics.Arcade.Sprite &&
                obj2 instanceof Phaser.Physics.Arcade.Sprite) {
                this.collectStar(obj1, obj2);
            }
        }, undefined, this);
        // Add score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '16px',
            color: '#fff'
        }).setScrollFactor(0);
        // Add door
        this.door = this.physics.add.sprite(this.gameWidth - 100, 450, 'door');
        this.door.setDisplaySize(48, 64);
        this.door.setImmovable(true);
        if (this.door.body) {
            this.door.body.allowGravity = false;
        }
        this.physics.add.collider(this.door, this.platforms);
        this.physics.add.overlap(this.player, this.door, this.winGame, undefined, this);
    }
    collectStar(_player, star) {
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }
    winGame() {
        if (!this.gameWon) {
            this.gameWon = true;
            const winText = this.add.text(400, 300, 'You Win!\nScore: ' + this.score, {
                fontSize: '64px',
                color: '#fff',
                align: 'center'
            })
                .setScrollFactor(0)
                .setOrigin(0.5);
            this.player.setVelocity(0, 0);
            if (this.player.body) {
                this.player.body.allowGravity = false;
            }
            this.player.anims.play('turn');
            this.tweens.add({
                targets: winText,
                scale: 1.2,
                duration: 200,
                yoyo: true,
                repeat: 1
            });
        }
    }
    update() {
        var _a;
        if (this.gameWon)
            return;
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }
        if (this.cursors.up.isDown && ((_a = this.player.body) === null || _a === void 0 ? void 0 : _a.touching.down)) {
            this.player.setVelocityY(-330);
        }
    }
}
// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300, x: 0 },
            debug: false
        }
    },
    scene: MainScene
};
// Initialize the game
new Phaser.Game(config);
