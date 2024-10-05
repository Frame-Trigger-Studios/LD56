import {Component, Entity, MathUtil, RenderCircle, System, Vector} from "lagom-engine";

export class Bullet extends Entity
{
    constructor(x: number, y: number)
    {
        super("bullet", x, y);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new Mover(0));
        this.addComponent(new RenderCircle(0, 0, 3, 0x0));
    }
}


export class Mover extends Component
{
    vec: Vector

    constructor(readonly dir: number)
    {
        super();

        this.vec = MathUtil.lengthDirXY(1, dir)

    }
}

export class MoveSystem extends System<[Mover]>
{
    update(delta: number): void
    {
        this.runOnEntities((entity, component) => {
            entity.transform.position.x += component.vec.x;
            entity.transform.position.y += component.vec.y;
        })
    }

    types = [Mover];

}