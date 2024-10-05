import {Component, Entity, RenderRect} from "lagom-engine";
import {Layers} from "../Layers.ts"

export class Enemy extends Entity
{
    constructor(name: string, x: number, y: number) {
        super(name, x, y, Layers.ENEMY);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new RenderRect(0, 0, 5, 5, 0x000000, 0xffffff));
    }
}

export class Health extends Component {

    constructor(public amount: Number)
    {
        super();
    }
}

export class Minion extends Component {}