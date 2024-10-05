import {Component, Entity, RenderCircle, System, TextDisp} from "lagom-engine";
import {LD56} from "./LD56.ts";

export class City extends Entity
{

    constructor()
    {
        super("city", LD56.MID_X, LD56.MID_Y);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new RenderCircle(0, 0, 20));
        this.addComponent(new TextDisp(-14, -16, "50", {align: "center"}));
        this.addComponent(new CityHp(50));
        this.scene.addSystem(new HpUpdater());
    }
}

export class CityHp extends Component
{
    constructor(public hp: number)
    {
        super();
    }
}

export class HpUpdater extends System<[CityHp, TextDisp]>
{
    update(delta: number): void
    {
        this.runOnEntities((entity, cityHp, text) => {
            text.pixiObj.text = cityHp.hp.toString();
        });
    }

    types = [CityHp, TextDisp]

}