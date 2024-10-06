import {
    ActionOnPress,
    AudioAtlas,
    CollisionMatrix,
    DebugCollisionSystem,
    DiscreteCollisionSystem,
    Entity,
    FrameTriggerSystem,
    Game,
    Log,
    LogLevel,
    Scene,
    SpriteSheet,
    TextDisp,
    Timer,
    TimerSystem
} from 'lagom-engine';
import WebFont from 'webfontloader';
import muteButtonSpr from "./art/mute_button.png";
import citySpr from "./art/city.png";
import cityTopSpr from "./art/citytop.png";
import cityBgSpr from "./art/city-bg.png";
import littleBugSpr from "./art/enemies/little-bug.png";
import ladybugSpr from "./art/enemies/ladybug.png";
import bulletSpr from "./art/bullet.png";
import trackTopSpr from "./art/track-top.png";
import trackBotSpr from "./art/track-bottom.png";
import waspSpr from "./art/enemies/wasp.png";
import upgradesSpr from "./art/upgrades.png";
import carriageSpr from "./art/carriage.png";
import {SoundManager} from "./util/SoundManager.ts";
import {CleanOffScreen, MoveSineSystem, MoveSpiralSystem, MoveSystem} from "./Bullet.ts";
import {BulletSpawner, CarMover, Carriage} from "./Train.ts";
import {City} from "./City.ts";
import {EnemySpawner, SpawnArea} from "./enemy/EnemySpawner.ts";
import {Layers} from "./Layers.ts";
import {WaveManager} from "./enemy/WaveManager.ts";
import {UpgradeEntity, upgradePool} from "./upgrades/Upgrade.ts";
import {ScoreDisplay} from "./Score";

class TitleScene extends Scene {
    onAdded() {
        super.onAdded();

        this.addGUIEntity(new SoundManager());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addGUIEntity(new Entity("title")).addComponent(new TextDisp(100, 10, "LD56", {
            fontFamily: "retro",
            fill: 0xffffff
        }));

        this.addSystem(new ActionOnPress(() => {
            this.game.setScene(new MainScene(this.game))
        }));
    }
}

class MainScene extends Scene {
    onAdded() {
        super.onAdded();


        const collisionMatrix = new CollisionMatrix();
        collisionMatrix.addCollision(Layers.ENEMY, Layers.TRAIN); // what do we do if they hit you?
        collisionMatrix.addCollision(Layers.ENEMY, Layers.BULLET);
        collisionMatrix.addCollision(Layers.ENEMY, Layers.CITY);
        collisionMatrix.addCollision(Layers.TRAIN, Layers.UPGRADE);
        collisionMatrix.addCollision(Layers.CITY, Layers.UPGRADE);

        const collSys = this.addGlobalSystem(new DiscreteCollisionSystem(collisionMatrix));

        if (LD56.DEBUG) {
            this.addGlobalSystem(new DebugCollisionSystem(collSys));
        }

        this.addGUIEntity(new SoundManager());
        this.addGUIEntity(new ScoreDisplay(20, 20));
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addEntity(new SpawnArea(Layers.BACKGROUND))
        this.addSystem(new EnemySpawner());
        this.addSystem(new WaveManager());

        // this.addGUIEntity(new Entity("main scene")).addComponent(new TextDisp(100, 10, "MAIN SCENE", {
        //     fontFamily: "pixeloid",
        //     fill: 0xffffff
        // }));

        this.addEntity(new Entity("powerup_spawner")).addComponent(new Timer(35_000, null, true)).onTrigger.register((caller, data) => {
            const upgrade = upgradePool.pop();
            if (upgrade === undefined) {
                caller.parent.destroy();
            } else {
                this.addEntity(new UpgradeEntity(upgrade));
            }
        });

        this.addEntity(new City());
        this.addEntity(new Carriage(0));
        this.addSystem(new MoveSystem());
        this.addSystem(new MoveSineSystem());
        this.addSystem(new MoveSpiralSystem());
        this.addSystem(new CleanOffScreen());
        this.addSystem(new CarMover());
        this.addSystem(new BulletSpawner());
    }
}

export class LD56 extends Game {

    static DEBUG = false;

    static GAME_WIDTH = 320;
    static GAME_HEIGHT = 320;
    static MID_X = LD56.GAME_WIDTH / 2;
    static MID_Y = LD56.GAME_HEIGHT / 2;

    static muted = false;
    static musicPlaying = false;
    static audioAtlas: AudioAtlas = new AudioAtlas();

    constructor() {
        super({
            width: LD56.GAME_WIDTH,
            height: LD56.GAME_HEIGHT,
            resolution: 2.5,
            backgroundColor: 0xFFFF24
        });

        // Set the global log level
        Log.logLevel = LogLevel.WARN;

        this.addResource("mute_button", new SpriteSheet(muteButtonSpr, 16, 16));
        this.addResource("city", new SpriteSheet(citySpr, 320, 320))
        this.addResource("city_top", new SpriteSheet(cityTopSpr, 320, 320))
        this.addResource("city_bg", new SpriteSheet(cityBgSpr, 320, 320))
        this.addResource("track_top", new SpriteSheet(trackTopSpr, 320, 320))
        this.addResource("track_bot", new SpriteSheet(trackBotSpr, 320, 320))
        this.addResource("little_bug", new SpriteSheet(littleBugSpr, 4, 5))
        this.addResource("ladybug", new SpriteSheet(ladybugSpr, 15, 16))
        this.addResource("wasp", new SpriteSheet(waspSpr, 12, 13))
        this.addResource("upgrades", new SpriteSheet(upgradesSpr, 16, 16))
        this.addResource("bullet", new SpriteSheet(bulletSpr, 6, 6))
        this.addResource("carriage", new SpriteSheet(carriageSpr, 55, 40))

        // Load an empty scene while we async load the resources for the main one
        this.setScene(new Scene(this));

        // Import sounds and set their properties
        // const music = LD56.audioAtlas.load("music", "ADD_ME")
        //     .loop(true)
        //     .volume(0.3);

        // Import fonts. See index.html for examples of how to add new ones.
        WebFont.load({
            custom: {
                families: ["pixeloid", "retro"]
            }
        });

        // Wait for all resources to be loaded and then start the main scene.
        this.resourceLoader.loadAll().then(
            () => {
                // this.setScene(new TitleScene(this));
                this.setScene(new MainScene(this));
            }
        )

    }
}
