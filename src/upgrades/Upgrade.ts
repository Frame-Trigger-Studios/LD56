import {CarMover, Gun} from "../Train.ts";
import {CircleCollider, CollisionSystem, Entity, MathUtil, RenderCircle, Sprite} from "lagom-engine";
import {LD56} from "../LD56.ts";
import {Mover} from "../Bullet.ts";
import {Layers} from "../Layers.ts";
import {SoundManager} from "../util/SoundManager";

export abstract class Upgrade {
    abstract apply(gun: Gun): void;

    abstract sprIdx: number;
}


export class TrainSpeed extends Upgrade {
    sprIdx = 0;

    apply(gun: Gun): void {
        CarMover.ROT_SPEED += 1;
    }
}

export class MoreBullets extends Upgrade {
    sprIdx = 1;

    apply(gun: Gun): void {
        gun.count += 1;
    }
}

export class BiggerBullets extends Upgrade {
    sprIdx = 2;

    apply(gun: Gun): void {
        gun.sizeMulti += 0.5;
    }
}

export class BulletSpeed extends Upgrade {
    sprIdx = 3;

    apply(gun: Gun) {
        gun.speed += 30;
    }
}

const shuffle = (array: Upgrade[]): Upgrade[] => {
    return array.map((a) => ({sort: Math.random(), value: a}))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value);
};


export class UpgradeEntity extends Entity {

    static upgradePool: Upgrade[] = shuffle([
        new TrainSpeed(), new TrainSpeed(), new TrainSpeed(), new TrainSpeed(),
        new MoreBullets(), new MoreBullets(), new MoreBullets(), new MoreBullets(),
        new BiggerBullets(), new BiggerBullets(), new BiggerBullets(), new BiggerBullets(),
        new BulletSpeed(), new BulletSpeed(), new BulletSpeed(), new BulletSpeed()]);

    constructor(readonly upgrade: Upgrade) {
        const spawn = MathUtil.lengthDirXY(LD56.GAME_WIDTH * 2, MathUtil.degToRad(MathUtil.randomRange(0, 360)))

        super("upgrade", Layers.UPGRADE, spawn.x, spawn.y);
    }

    onAdded() {
        super.onAdded();

        const radius = 8;

        this.addComponent(new Mover(20, -MathUtil.pointDirection(this.transform.x, this.transform.y, LD56.MID_X, LD56.MID_Y)));
        if (LD56.DEBUG) {
            this.addComponent(new RenderCircle(0, 0, radius));
        }
        this.addComponent(new Sprite(this.scene.game.getResource("upgrades").texture(this.upgrade.sprIdx, 0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }));

        this.addComponent(
            new CircleCollider(<CollisionSystem<any>>this.getScene().getGlobalSystem<CollisionSystem<any>>(CollisionSystem),
                {
                    layer: Layers.UPGRADE,
                    radius: radius
                })).onTriggerEnter.register((caller, data) => {
            if (data.other.layer == Layers.TRAIN) {
                const gun = data.other.getEntity().getComponent<Gun>(Gun);
                if (gun) {
                    this.upgrade.apply(gun);
                    (this.getScene().getEntityWithName("audio") as SoundManager).playSound("powerUp");
                }
            } else if (data.other.layer == Layers.CITY) {
                // put it back
                UpgradeEntity.upgradePool.unshift(this.upgrade);
            }
            this.destroy();
        });
    }
}
