import {Component, Entity} from "lagom-engine";
import {LD56} from "./LD56.ts";

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

export class Carriage extends Entity {

    onAdded()
    {
        super.onAdded();


    }

}

export class Shooter extends Component {

}