import {AnimatedSprite, CircleCollider, CollisionSystem, Component, Entity, MathUtil, RenderCircle} from "lagom-engine";
import {Layers} from "../Layers.ts"
import {Damage} from "../Bullet.ts";
import {LD56} from "../LD56.ts";

export class Enemy extends Entity
{
    constructor(name: string, x: number, y: number, readonly colliderRadius: number)
    {
        super(name, x, y, Layers.ENEMY);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderCircle(0, 0, this.colliderRadius));

        // if this is slow pass it through
        this.addComponent(
            new CircleCollider(<CollisionSystem<any>>this.getScene().getGlobalSystem<CollisionSystem<any>>(CollisionSystem),
                {
                    layer: Layers.ENEMY,
                    radius: this.colliderRadius
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


export class Ladybug extends Enemy
{
    constructor(x: number, y: number)
    {
        super("ladybug", x, y, 10);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new AnimatedSprite(this.scene.game.getResource("ladybug").textures([[0, 0], [1, 0], [2, 0], [1, 0]]), {
            animationSpeed: 100,
            xAnchor: 0.5,
            yAnchor: 0.5,
            rotation: -MathUtil.pointDirection(this.transform.x, this.transform.y, LD56.MID_X, LD56.MID_Y) - MathUtil.degToRad(90)
        }));
    }
}

export class SmallBug extends Enemy
{
    constructor(x: number, y: number)
    {
        super("little_bug", x, y, 4);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new AnimatedSprite(this.getScene().getGame().getResource("little_bug").textureSliceFromRow(0, 0, 1), {
            animationSpeed: 100,
            xAnchor: 0.5,
            yAnchor: 0.5,
            rotation: -MathUtil.pointDirection(this.transform.x, this.transform.y, LD56.MID_X, LD56.MID_Y) + MathUtil.degToRad(90)
        }));
    }
}

export class Wasp extends Enemy
{
    constructor(x: number, y: number)
    {
        super("wasp", x, y, 8);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new AnimatedSprite(this.getScene().getGame().getResource("wasp").textureSliceFromRow(0, 0, 1), {
            animationSpeed: 50,
            xAnchor: 0.5,
            yAnchor: 0.5,
            rotation: -MathUtil.pointDirection(this.transform.x, this.transform.y, LD56.MID_X, LD56.MID_Y) - MathUtil.degToRad(90)
        }));
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