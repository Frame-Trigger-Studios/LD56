import {AnimatedSprite, CircleCollider, CollisionSystem, Component, Entity, MathUtil, RenderCircle} from "lagom-engine";
import {Layers} from "../Layers.ts"
import {Damage} from "../Bullet.ts";
import {LD56} from "../LD56.ts";
import {Wave} from "./WaveManager.ts";
import {Score} from "../Score";
import {SoundManager} from "../util/SoundManager";

export class Explosion extends Entity {
    constructor(x: number, y: number, readonly big: boolean, readonly bigger: boolean = false) {
        super("exposion", x, y, Layers.EXPLOSION);
    }

    onAdded() {
        super.onAdded();

        let resource = "explosion"
        if (!this.big) {
            resource = "small_explosion"
        }

        this.addComponent(new AnimatedSprite(this.scene.game.getResource(resource).textureSliceFromSheet(), {
            animationSpeed: 65,
            xAnchor: 0.5,
            yAnchor: 0.5,
            xScale: this.bigger ? 2 : 1,
            yScale: this.bigger ? 2 : 1,
            rotation: MathUtil.degToRad(MathUtil.randomRange(0, 360)),
            animationEndEvent: () => this.destroy()
        }))
    }
}

export class Enemy extends Entity {
    constructor(name: string, x: number, y: number, readonly colliderRadius: number) {
        super(name, x, y, Layers.ENEMY);
    }

    onAdded() {
        super.onAdded();

        if (LD56.DEBUG) {
            this.addComponent(new RenderCircle(0, 0, this.colliderRadius));
        }

        // if this is slow pass it through
        this.addComponent(
            new CircleCollider(<CollisionSystem<any>>this.getScene().getGlobalSystem<CollisionSystem<any>>(CollisionSystem),
                {
                    layer: Layers.ENEMY,
                    radius: this.colliderRadius
                })).onTriggerEnter.register((caller, data) => {
            if (data.other.layer == Layers.BULLET) {
                const damage = data.other.parent.getComponent<Damage>(Damage);
                const hp = caller.parent.getComponent<Health>(Health);
                if (damage && hp) {
                    hp.amount -= damage.damage;
                    if (hp.amount <= 0) {
                        caller.parent.destroy();
                        const scoreboard = this.getScene().getEntityWithName("score")?.getComponent<Score>(Score);
                        scoreboard?.addAmount(1);
                        (this.getScene().getEntityWithName("audio") as SoundManager).playSound("hitEnemy");
                    }
                }
                this.scene.addEntity(new Explosion(data.other.parent.transform.x, data.other.parent.transform.y, false));
                data.other.parent.destroy();
            }
        });
    }

    onRemoved() {
        super.onRemoved();
        const wave = this.getScene().getEntityWithName("SpawnArea")?.getComponentsOfType<Wave>(Wave);
        this.scene.addEntity(new Explosion(this.transform.x, this.transform.y, true));

        if (wave && wave.length > 0) {
            wave[0].killedEnemies++;
        }
    }
}


export class Ladybug extends Enemy {
    constructor(x: number, y: number) {
        super("ladybug", x, y, 10);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new AnimatedSprite(this.scene.game.getResource("ladybug").textures([[0, 0], [1, 0], [2, 0], [1, 0]]), {
            animationSpeed: 50,
            xAnchor: 0.5,
            yAnchor: 0.5,
            rotation: -MathUtil.pointDirection(this.transform.x, this.transform.y, LD56.MID_X, LD56.MID_Y) - MathUtil.degToRad(90)
        }));
    }
}

export class SmallBug extends Enemy {
    constructor(x: number, y: number) {
        super("little_bug", x, y, 4);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new AnimatedSprite(this.getScene().getGame().getResource("little_bug").textureSliceFromRow(0, 0, 1), {
            animationSpeed: 100,
            xAnchor: 0.5,
            yAnchor: 0.5,
            rotation: -MathUtil.pointDirection(this.transform.x, this.transform.y, LD56.MID_X, LD56.MID_Y) + MathUtil.degToRad(90)
        }));
    }
}

export class Wasp extends Enemy {
    constructor(x: number, y: number) {
        super("wasp", x, y, 8);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new AnimatedSprite(this.getScene().getGame().getResource("wasp").textureSliceFromRow(0, 0, 1), {
            animationSpeed: 50,
            xAnchor: 0.5,
            yAnchor: 0.5,
            rotation: -MathUtil.pointDirection(this.transform.x, this.transform.y, LD56.MID_X, LD56.MID_Y) - MathUtil.degToRad(90)
        }));
    }
}


export class Health extends Component {
    constructor(public amount: number) {
        super();
    }
}
