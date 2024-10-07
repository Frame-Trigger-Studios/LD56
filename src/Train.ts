import {
    AnimatedSpriteController,
    AnimationEnd,
    CircleCollider,
    CollisionSystem,
    Component,
    Entity,
    Key,
    MathUtil,
    RenderCircle,
    System,
    Timer
} from "lagom-engine";
import {LD56} from "./LD56.ts";
import {Layers} from "./Layers.ts";
import {Upgrade} from "./upgrades/Upgrade.ts";
import {Bullet} from "./Bullet.ts";
import {SoundManager} from "./util/SoundManager";

const CENTRE_DIST = 48;

export class Carriage extends Entity {
    constructor(readonly startAngle: number) {
        const vec = MathUtil.lengthDirXY(CENTRE_DIST, startAngle);
        super("carriage", LD56.MID_X + vec.x, LD56.MID_Y + vec.y, Layers.TRAIN);
    }

    onAdded() {
        super.onAdded();

        const radius = 5;
        if (LD56.DEBUG) {
            this.addComponent(new RenderCircle(0, 0, radius, 0x00FF00));
        }

        const sheet = this.scene.game.getResource("carriage");

        this.addComponent(new AnimatedSpriteController(0, [
            {
                id: 0,
                textures: [sheet.textureFromIndex(0)],
                config: {
                    xAnchor: 0.5,
                    yAnchor: 0.5,
                }
            },
            {
                id: 1,
                textures: sheet.textures([[1, 0], [2, 0], [3, 0], [4, 0], [0, 0]]),
                config: {
                    xAnchor: 0.5,
                    yAnchor: 0.5,
                    animationSpeed: 60,
                    animationEndAction: AnimationEnd.STOP
                },
                events: {
                    4: () => {
                        this.getComponent<AnimatedSpriteController>(AnimatedSpriteController)?.setAnimation(0, true)
                    }
                }
            }
        ]))

        this.addComponent(new Gun());

        this.addComponent(new CarControllable(this.startAngle));
        this.addComponent(
            new CircleCollider(<CollisionSystem<any>>this.getScene().getGlobalSystem<CollisionSystem<any>>(CollisionSystem),
                {
                    layer: Layers.TRAIN,
                    radius: radius
                }));
    }
}

export class Gun extends Component {
    speed: number = 100;
    damage: number = 1;
    sizeMulti: number = 1;
    reloadTime: number = 300;
    batchSize: number = 1;
    batchDelay: number = 100;
    count: number = 1;

    time: number = 0;
    shootTime: number = -1;

    constructor(upgrades: Upgrade[] = []) {
        super();
    }

    shoot(entity: Entity, angle: number) {

        const spawnOffset = MathUtil.lengthDirXY(12, entity.transform.rotation);

        const angleVar = MathUtil.degToRad(5);
        let startAngle;

        if (this.count % 2 === 0) {
            const offset = angleVar / 2.0;
            startAngle = -offset - ((this.count - 2) / 2.0) * angleVar;
        } else {
            startAngle = ((this.count - 1) / 2.0) * angleVar;
        }

        const spr = entity.getComponent<AnimatedSpriteController>(AnimatedSpriteController);

        for (let batch = 0; batch < this.batchSize; batch++) {
            entity.addComponent(new Timer(this.batchDelay * batch, null, false)).onTrigger.register((caller, data) => {
                spr?.setAnimation(1, true);
                for (let count = 0; count < this.count; count++) {
                    entity.scene.addEntity(new Bullet(entity.transform.x + spawnOffset.x, entity.transform.y + spawnOffset.y, angle + startAngle + (count * angleVar), {
                        damage: this.damage,
                        speed: this.speed,
                        sizeMulti: this.sizeMulti
                    }));
                }
            })

        }
    }
}

export class CarControllable extends Component {
    constructor(public angleRad: number) {
        super();
    }
}

export class BulletSpawner extends System<[Gun, CarControllable]> {
    update(delta: number): void {
        this.runOnEntities((entity, gun, car) => {
            gun.time += delta;
            if (gun.time > gun.shootTime) {
                gun.shoot(entity, car.angleRad);
                gun.shootTime = gun.reloadTime;
                gun.time = 0;
                (entity.getScene().getEntityWithName("audio") as SoundManager).playSound("shoot");
            }
        })
    }

    types = [Gun, CarControllable]

}

export class CarMover extends System<[CarControllable]> {
    static ROT_SPEED = 1;

    onAdded() {
        super.onAdded();
        CarMover.ROT_SPEED = 1;
    }

    update(delta: number): void {
        const keyboard = this.scene.game.keyboard
        this.runOnEntities((entity, car) => {
            if (keyboard.isKeyDown(Key.KeyA)) {
                // Rotate left
                car.angleRad -= CarMover.ROT_SPEED * delta / 1000;
                (this.getScene().getEntityWithName("audio") as SoundManager).playSound("trainMove");
            } else if (keyboard.isKeyDown(Key.KeyD)) {
                // Rotate right
                car.angleRad += CarMover.ROT_SPEED * delta / 1000;
                (this.getScene().getEntityWithName("audio") as SoundManager).playSound("trainMove");
            }

            const vec = MathUtil.lengthDirXY(CENTRE_DIST, car.angleRad);
            entity.transform.position.x = LD56.MID_X + vec.x;
            entity.transform.position.y = LD56.MID_Y + vec.y;

            entity.transform.rotation = car.angleRad;
        });
    }

    types = [CarControllable];
}
