import {Entity, RenderCircle, Timer} from "lagom-engine";
import {LD56} from "./LD56.ts";
import {Bullet} from "./Bullet.ts";

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

export class Carriage extends Entity
{

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderCircle(0, 0, 5, 0x00FF00))
        this.addComponent(new Timer(1000, null, true)).onTrigger.register(caller => {
            this.scene.addEntity(new Bullet(caller.parent.transform.x, caller.parent.transform.y));
        });
    }

}
