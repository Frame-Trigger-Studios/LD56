import {CircleCollider, CollisionSystem, Component, Entity, MathUtil, RenderCircle, System, Vector} from "lagom-engine";
import {LD56} from "./LD56.ts";
import {Layers} from "./Layers.ts";

interface BulletOpts
{
    speed: number,
    damage: number,
    sizeMulti: number
}

export class Bullet extends Entity
{
    constructor(x: number, y: number, readonly initDir: number, readonly opts: BulletOpts)
    {
        super("bullet", x, y);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new CleanMe());
        this.addComponent(new Damage(this.opts.damage));
        this.addComponent(new Mover(this.opts.speed, this.initDir));
        this.addComponent(new RenderCircle(0, 0, this.opts.sizeMulti * 3, 0x0));

        // if this is slow pass it through
        this.addComponent(
            new CircleCollider(<CollisionSystem<any>>this.getScene().getGlobalSystem<CollisionSystem<any>>(CollisionSystem),
                {
                    layer: Layers.BULLET,
                    radius: this.opts.sizeMulti * 3
                }));
    }
}


export class Mover extends Component
{
    vec: Vector

    constructor(readonly speed: number, readonly dir: number)
    {
        super();

        this.vec = MathUtil.lengthDirXY(speed, dir)
    }
}

export class SineMover extends Component
{
    amplitude = 30;
    frequency = 0.3;
    distance: number;
    angle: number;
    step = 0;

    constructor(readonly speed: number, readonly start: Vector)
    {
        super();

        this.distance = MathUtil.pointDistance(this.start.x, this.start.y, LD56.MID_X, LD56.MID_Y);
        this.angle = -MathUtil.pointDirection(this.start.x, this.start.y, LD56.MID_X, LD56.MID_Y);
    }
}

export class CleanMe extends Component
{
}

export class Damage extends Component
{
    constructor(readonly damage: number)
    {
        super();
    }
}

export class MoveSineSystem extends System<[SineMover]>
{
    update(delta: number): void
    {
        this.runOnEntities((entity, component) => {

            const x = component.step;
            const y = component.amplitude * Math.sin(component.frequency * x);

            const rotatedX = x * Math.cos(component.angle) - y * Math.sin(component.angle) + component.start.x;
            const rotatedY = x * Math.sin(component.angle) + y * Math.cos(component.angle) + component.start.y;

            entity.transform.position.x = rotatedX;
            entity.transform.position.y = rotatedY;

            component.step += delta / 1000 * component.speed;
        });
    }

    types = [SineMover];
}

export class MoveSystem extends System<[Mover]>
{
    update(delta: number): void
    {
        this.runOnEntities((entity, component) => {
            entity.transform.position.x += component.vec.x * delta / 1000;
            entity.transform.position.y += component.vec.y * delta / 1000;
        })
    }

    types = [Mover];

}

export class CleanOffScreen extends System<[CleanMe]>
{
    update(delta: number): void
    {
        this.runOnEntities((entity) => {
            if (entity.transform.x > LD56.GAME_WIDTH || entity.transform.x < 0
                || entity.transform.y > LD56.GAME_HEIGHT || entity.transform.y < 0)
                entity.destroy();

        })
    }

    types = [CleanMe];
}