import {CircleCollider, CollisionSystem, Component, Entity, MathUtil, RenderCircle, System, Vector} from "lagom-engine";
import {LD56} from "./LD56.ts";
import {Layers} from "./Layers.ts";

export class Bullet extends Entity
{
    constructor(x: number, y: number, readonly initDir: number)
    {
        super("bullet", x, y);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new CleanMe());
        this.addComponent(new Damage(1));
        this.addComponent(new Mover(100, this.initDir));
        this.addComponent(new RenderCircle(0, 0, 3, 0x0));

        // if this is slow pass it through
        this.addComponent(
            new CircleCollider(<CollisionSystem<any>>this.getScene().getGlobalSystem<CollisionSystem<any>>(CollisionSystem),
                {
                    layer: Layers.BULLET,
                    radius: 3
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
            const distance = MathUtil.pointDistance(LD56.GAME_WIDTH / 2, LD56.GAME_HEIGHT / 2,
                entity.transform.x, entity.transform.y);

            if (distance > LD56.GAME_WIDTH)
            {
                entity.destroy();
            }
        })
    }

    types = [CleanMe];
}