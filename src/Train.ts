import {Component, Entity, Key, MathUtil, RenderCircle, System, Timer} from "lagom-engine";
import {LD56} from "./LD56.ts";
import {Layers} from "./Layers.ts";
import {Upgrade} from "./upgrades/Upgrade.ts";
import {Bullet} from "./Bullet.ts";

const CENTRE_DIST = 48;

export class Carriage extends Entity
{
    constructor(readonly startAngle: number)
    {
        const vec = MathUtil.lengthDirXY(CENTRE_DIST, startAngle);
        super("carriage", LD56.MID_X + vec.x, LD56.MID_Y + vec.y, Layers.TRAIN);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderCircle(0, 0, 5, 0x00FF00));
        this.addComponent(new Gun());
        this.addComponent(new CarControllable(this.startAngle));
    }
}

export class Gun extends Component
{
    speed: number = 100;
    damage: number = 1;
    sizeMulti: number = 1;
    reloadTime: number = 300;
    batchSize: number = 1;
    batchDelay: number = 100;
    count: number = 1;

    time: number = 0;
    shootTime: number = -1;

    constructor(upgrades: Upgrade[] = [])
    {
        super();
    }

    shoot(entity: Entity, angle: number)
    {
        const angleVar = MathUtil.degToRad(5);
        let startAngle;

        if (this.count % 2 === 0)
        {
            const offset = angleVar / 2.0;
            startAngle = -offset - ((this.count - 2) / 2.0) * angleVar;
        } else
        {
            startAngle = ((this.count - 1) / 2.0) * angleVar;
        }

        for (let batch = 0; batch < this.batchSize; batch++)
        {
            for (let count = 0; count < this.count; count++)
            {
                entity.addComponent(new Timer(this.batchDelay * batch, null, false)).onTrigger.register((caller, data) => {
                    entity.scene.addEntity(new Bullet(entity.transform.x, entity.transform.y, angle + startAngle + (count * angleVar), {
                        damage: this.damage,
                        speed: this.speed,
                        sizeMulti: this.sizeMulti
                    }));
                })
            }
        }
    }
}

export class CarControllable extends Component
{
    constructor(public angleRad: number)
    {
        super();
    }
}

export class BulletSpawner extends System<[Gun, CarControllable]>
{
    update(delta: number): void
    {
        this.runOnEntities((entity, gun, car) => {
            gun.time += delta;
            if (gun.time > gun.shootTime)
            {
                gun.shoot(entity, car.angleRad);
                gun.shootTime = gun.reloadTime;
                gun.time = 0;
            }
        })
    }

    types = [Gun, CarControllable]

}

export class CarMover extends System<[CarControllable]>
{
    ROT_SPEED = 1;

    update(delta: number): void
    {
        const keyboard = this.scene.game.keyboard
        this.runOnEntities((entity, car) => {
            if (keyboard.isKeyDown(Key.KeyA))
            {
                // Rotate left
                car.angleRad -= this.ROT_SPEED * delta / 1000;
            }
            if (keyboard.isKeyDown(Key.KeyD))
            {
                // Rotate right
                car.angleRad += this.ROT_SPEED * delta / 1000;
            }

            const vec = MathUtil.lengthDirXY(CENTRE_DIST, car.angleRad);
            entity.transform.position.x = LD56.MID_X + vec.x;
            entity.transform.position.y = LD56.MID_Y + vec.y;
        });
    }

    types = [CarControllable];
}
