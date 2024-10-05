import {Component, Entity, Key, MathUtil, RenderCircle, System, Timer} from "lagom-engine";
import {LD56} from "./LD56.ts";
import {Bullet} from "./Bullet.ts";
import {Layers} from "./Layers.ts";

export class Train extends Entity
{
    constructor()
    {
        super("train", LD56.GAME_WIDTH / 2, LD56.GAME_HEIGHT / 2);
    }

    onAdded()
    {
        super.onAdded();
    }
}

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

        this.addComponent(new RenderCircle(0, 0, 5, 0x00FF00))
        const angle = this.addComponent(new CarControllable(this.startAngle))
        this.addComponent(new Timer(300, angle, true)).onTrigger.register((caller, data) => {
            this.scene.addEntity(new Bullet(caller.parent.transform.x, caller.parent.transform.y, data.angleRad));
        });
    }

}

export class CarControllable extends Component
{
    constructor(public angleRad: number)
    {
        super();
    }
}

export class CarMover extends System<[CarControllable]>
{
    ROT_SPEED = 5;

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
