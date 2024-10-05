import {CircleCollider, CollisionSystem, Component, Entity, RenderRect} from "lagom-engine";
import {Layers} from "../Layers.ts"
import {Damage} from "../Bullet.ts";

export class Enemy extends Entity
{
    constructor(name: string, x: number, y: number)
    {
        super(name, x, y, Layers.ENEMY);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderRect(0, 0, 5, 5, 0x000000, 0xffffff));

        // if this is slow pass it through
        this.addComponent(
            new CircleCollider(<CollisionSystem<any>>this.getScene().getGlobalSystem<CollisionSystem<any>>(CollisionSystem),
                {
                    layer: Layers.ENEMY,
                    radius: 2
                })).onTriggerEnter.register((caller, data) => {
            if (data.other.layer == Layers.BULLET)
            {
                const damage = data.other.parent.getComponent<Damage>(Damage);
                const hp = caller.parent.getComponent<Health>(Health);
                if (damage && hp)
                {
                    hp.amount = -damage.damage;
                    if (hp.amount <= 0)
                    {
                        caller.parent.destroy();

                    }
                }
                data.other.parent.destroy();
            }
        });
    }
}

export class Health extends Component
{

    constructor(public amount: number)
    {
        super();
    }
}

export class Minion extends Component
{
}