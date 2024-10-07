import {
    CircleCollider,
    CollisionSystem,
    Component,
    Entity,
    MathUtil,
    RenderRect,
    ScreenShake,
    Sprite,
    System,
    Timer
} from "lagom-engine";
import {LD56} from "./LD56.ts";
import {Layers} from "./Layers.ts";
import {Enemy, Explosion, Health} from "./enemy/Enemy.ts";
import {SoundManager} from "./util/SoundManager";
import {Gun} from "./Train.ts";
import {GameOver} from "./GameOver.ts";
import {UpgradeEntity} from "./upgrades/Upgrade.ts";

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
        this.addComponent(new CityHp());
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
                        // Jankily stop things from happening
                        this.getScene().getEntityWithName("carriage")?.getComponent(Gun)?.destroy();
                        this.getScene().getEntityWithName("SpawnArea")?.destroy();
                        this.getScene().getEntityWithName("powerup_spawner")?.destroy();
                        this.getScene().getEntityWithName("healthbar")?.destroy();
                        this.scene.entities.filter(value => value instanceof Enemy || value instanceof UpgradeEntity).forEach(value => value.destroy());
                        (this.getScene().getEntityWithName("audio") as SoundManager).playSound("gameOver");
                        caller.parent?.addComponent(new ScreenShake(0.1, 5000));
                        const exp_timer = caller.parent?.addComponent(new Timer(200, null, true));
                        exp_timer
                            .onTrigger.register(() => {
                            caller.parent.scene.addEntity(new Explosion(LD56.MID_X + MathUtil.randomRange(-50, 50), LD56.MID_Y + MathUtil.randomRange(-50, 50), true, true))
                            caller.parent.scene.addEntity(new Explosion(LD56.MID_X + MathUtil.randomRange(-50, 50), LD56.MID_Y + MathUtil.randomRange(-50, 50), true, true))
                            caller.parent.scene.addEntity(new Explosion(LD56.MID_X + MathUtil.randomRange(-50, 50), LD56.MID_Y + MathUtil.randomRange(-50, 50), true, true))
                            caller.parent.scene.addEntity(new Explosion(LD56.MID_X + MathUtil.randomRange(-50, 50), LD56.MID_Y + MathUtil.randomRange(-50, 50), true, true))
                            caller.parent.scene.addEntity(new Explosion(LD56.MID_X + MathUtil.randomRange(-50, 50), LD56.MID_Y + MathUtil.randomRange(-50, 50), true))
                            caller.parent.scene.addEntity(new Explosion(LD56.MID_X + MathUtil.randomRange(-50, 50), LD56.MID_Y + MathUtil.randomRange(-50, 50), true))
                        })
                        caller.parent?.addComponent(new Timer(1_000, exp_timer, false)).onTrigger.register((caller1, data1) => {

                            // remove the good city
                            this.getScene().getEntityWithName("city_top")?.destroy();
                            this.getComponent(Sprite)?.destroy();

                            caller.parent?.scene.addEntity(new Entity("city_dead", LD56.MID_X, LD56.MID_Y, Layers.CITY_TOP))
                                .addComponent(new Sprite(this.scene.game.getResource("city_dead").textureFromIndex(0), {
                                    xAnchor: 0.5,
                                    yAnchor: 0.5
                                }));


                        });
                        caller.parent?.addComponent(new Timer(5_000, exp_timer, false)).onTrigger.register((caller1, data1) => {
                            data1?.destroy()
                            this.scene.addGUIEntity(new GameOver());
                        });

                    }
                    (this.getScene().getEntityWithName("audio") as SoundManager).playSound("cityDamage");
                }
                this.addComponent(new ScreenShake(0.3, 500));
                data.other.parent.destroy();
            }
        });
    }
}

export class CityHp extends Component {
    static MAX_HP = 50;

    constructor(public hp = CityHp.MAX_HP, public last = -1) {
        super();
    }
}

export class HpUpdater extends System<[CityHp]> {
    update(delta: number): void {
        this.runOnEntities((entity, cityHp) => {
            if (cityHp.hp != cityHp.last) {
                cityHp.last = cityHp.hp;
                const healthbar = this.getScene().getEntityWithName("healthbar");

                if (healthbar === null) {
                    return;
                }
                healthbar.getComponent(RenderRect)?.destroy();
                // 222 pixels wide total
                healthbar.addComponent(new RenderRect(8, 2, (cityHp.hp / CityHp.MAX_HP) * 230, 5, 0x3c6b64, 0x3c6b64
                ))
                ;
            }
        });
    }

    types = [CityHp]

}
