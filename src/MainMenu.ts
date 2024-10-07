import {Entity, Sprite, TextDisp} from "lagom-engine";
import {LD56, MainScene} from "./LD56.ts";
import {City} from "./City.ts";
import {SpaceListener, SpaceToRestart} from "./GameOver.ts";
import {Layers} from "./Layers.ts";

export class MainMenu extends Entity {

    constructor() {
        super("main", LD56.MID_X, LD56.MID_Y, Layers.CITY);
    }
    onAdded() {
        super.onAdded();

        const title = this.scene.addGUIEntity(new Entity("title"));
        title.addComponent(new TextDisp(22, 20, "Insecticide\nExpress",
            {
                fill: 0x1f244b,
                fontFamily: "retro",
                fontSize: 30,
                align: "center",
                dropShadow: true,
                dropShadowColor: 0xb6cf8e,
                dropShadowDistance: 1
            }));

        title.addComponent(new TextDisp(70, LD56.GAME_HEIGHT - 100, "Press <Space>\nto start",
            {
                fill: 0x1f244b,
                fontFamily: "retro",
                fontSize: 18,
                align: "center",
                dropShadow: true,
                dropShadowColor: 0xb6cf8e,
                dropShadowDistance: 1
            }));


        title.addComponent(new TextDisp(4, LD56.GAME_HEIGHT - 30, "By Quackqack, Masterage\nand Earlybard for LD56",
            {
                fill: 0x1f244b,
                fontFamily: "retro",
                fontSize: 12,
                align: "left",
                dropShadow: true,
                dropShadowColor: 0xb6cf8e,
                dropShadowDistance: 1
            }));


        this.scene.addEntity(new Entity("city_bg", LD56.MID_X, LD56.MID_Y, Layers.BACKGROUND))
            .addComponent(new Sprite(this.scene.game.getResource("city_bg").textureFromIndex(0), {
                xAnchor: 0.5,
                yAnchor: 0.5
            }));
        this.addComponent(new Sprite(this.scene.game.getResource("city").textureFromIndex(0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }));

        this.scene.addEntity(new Entity("city_top", LD56.MID_X, LD56.MID_Y, Layers.CITY_TOP))
            .addComponent(new Sprite(this.scene.game.getResource("city_top").textureFromIndex(0), {
                xAnchor: 0.5,
                yAnchor: 0.5
            }));

        this.scene.addEntity(new Entity("track_top", LD56.MID_X, LD56.MID_Y, Layers.TRACKS_TOP))
            .addComponent(new Sprite(this.scene.game.getResource("track_top").textureFromIndex(0), {
                xAnchor: 0.5,
                yAnchor: 0.5
            }));
        this.scene.addEntity(new Entity("track_bot", LD56.MID_X, LD56.MID_Y, Layers.TRACKS_BOT))
            .addComponent(new Sprite(this.scene.game.getResource("track_bot").textureFromIndex(0), {
                xAnchor: 0.5,
                yAnchor: 0.5
            }));
        this.addComponent(new SpaceToRestart());
        this.scene.addSystem(new SpaceListener());
    }
}

