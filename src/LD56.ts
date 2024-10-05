import {
    ActionOnPress,
    AudioAtlas,
    Entity,
    FrameTriggerSystem,
    Game,
    Log,
    LogLevel,
    Scene,
    SpriteSheet,
    TextDisp,
    TimerSystem
} from 'lagom-engine';
import WebFont from 'webfontloader';
import muteButtonSpr from "./art/mute_button.png";
import citySpr from "./art/city.png";
import trackTopSpr from "./art/track-top.png";
import trackBotSpr from "./art/track-bottom.png";
import {SoundManager} from "./util/SoundManager.ts";
import {CleanOffScreen, MoveSystem} from "./Bullet.ts";
import {CarMover, Carriage} from "./Train.ts";
import {City} from "./City.ts";
import {Bullet, MoveSystem} from "./Bullet.ts";
import {Carriage} from "./Train.ts";
import {EnemySpawner, SpawnArea} from "./enemy/EnemySpawner.ts";
import {Layers} from "./Layers.ts";

class TitleScene extends Scene
{
    onAdded()
    {
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

class MainScene extends Scene
{
    onAdded()
    {
        super.onAdded();

        this.addGUIEntity(new SoundManager());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new FrameTriggerSystem());

        this.addEntity(new SpawnArea(Layers.BACKGROUND))
        this.addSystem(new EnemySpawner());

        this.addGUIEntity(new Entity("main scene")).addComponent(new TextDisp(100, 10, "MAIN SCENE", {
            fontFamily: "pixeloid",
            fill: 0xffffff
        }));

        const tile_size = 4;
        for (let i = 0; i < LD56.GAME_HEIGHT / tile_size; i++)
        {
            for (let j = 0; j < LD56.GAME_HEIGHT / tile_size; j++)
            {
                // this.addEntity(new Entity("tile", i * tile_size, j * tile_size))
                //     .addComponent(new RenderRect(0, 0, tile_size, tile_size));
            }
        }

        this.addEntity(new City());
        this.addEntity(new Carriage(0));
        this.addSystem(new MoveSystem());
        this.addSystem(new CleanOffScreen());
        this.addSystem(new CarMover());
    }
}

export class LD56 extends Game
{
    static GAME_WIDTH = 320;
    static GAME_HEIGHT = 320;
    static MID_X = LD56.GAME_WIDTH / 2;
    static MID_Y = LD56.GAME_HEIGHT / 2;

    static muted = false;
    static musicPlaying = false;
    static audioAtlas: AudioAtlas = new AudioAtlas();

    constructor()
    {
        super({
            width: LD56.GAME_WIDTH,
            height: LD56.GAME_HEIGHT,
            resolution: 2,
            backgroundColor: 0x200140
        });

        // Set the global log level
        Log.logLevel = LogLevel.WARN;

        this.addResource("mute_button", new SpriteSheet(muteButtonSpr, 16, 16));
        this.addResource("city", new SpriteSheet(citySpr, 320, 320))
        this.addResource("track_top", new SpriteSheet(trackTopSpr, 320, 320))
        this.addResource("track_bot", new SpriteSheet(trackBotSpr, 320, 320))

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
