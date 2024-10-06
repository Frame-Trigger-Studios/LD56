import {CircleCollider, CollisionSystem, Component, Entity, ScreenShake, Sprite, System, TextDisp} from "lagom-engine";
import {LD56} from "./LD56.ts";
import {Layers} from "./Layers.ts";
import {Health} from "./enemy/Enemy.ts";

export class City extends Entity {
    constructor() {
        super("city", LD56.MID_X, LD56.MID_Y, Layers.CITY);
    }

    onAdded() {
        super.onAdded();
        this.scene.addEntity(new Entity("city_bg", LD56.MID_X, LD56.MID_Y, Layers.BACKGROUND))
            .addComponent(new Sprite(this.scene.game.getResource("city_bg").textureFromIndex(0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }));
        this.addComponent(new Sprite(this.scene.game.getResource("city").textureFromIndex(0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }));
        this.addComponent(new TextDisp(-14, -16, "50", {align: "center"}));
        this.addComponent(new CityHp(50));
        this.scene.addSystem(new HpUpdater());

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

        const healthBar = this.scene.addGUIEntity(new Entity("healthbar", 5, 5));
        healthBar.addComponent(new Sprite(this.scene.game.getResource("healthbar").textureFromIndex(0)));

        this.addComponent(
            new CircleCollider(<CollisionSystem<any>>this.getScene().getGlobalSystem<CollisionSystem<any>>(CollisionSystem),
                {
                    layer: Layers.CITY,
                    radius: 40
                })).onTriggerEnter.register((caller, data) => {
            if (data.other.layer == Layers.ENEMY) {
                const damage = data.other.parent.getComponent<Health>(Health);
                const hp = caller.parent.getComponent<CityHp>(CityHp);
                if (damage && hp) {
                    hp.hp -= damage.amount;
                    if (hp.hp <= 0) {
                        caller.parent.destroy();
                    }
                }
                this.addComponent(new ScreenShake(0.3, 500));
                data.other.parent.destroy();
            }
        });
    }
}

export class CityHp extends Component {
    constructor(public hp: number) {
        super();
    }
}

export class HpUpdater extends System<[CityHp, TextDisp]> {
    update(delta: number): void {
        this.runOnEntities((entity, cityHp, text) => {
            text.pixiObj.text = cityHp.hp.toString();
        });
    }

    types = [CityHp, TextDisp]

}