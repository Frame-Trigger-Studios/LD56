import {Entity, MathUtil, TextDisp, Timer} from "lagom-engine";
import {LD56} from "../LD56.ts";
import {UI_Layers} from "../Layers.ts";

export class Warning extends Entity
{
    constructor(angle: number)
    {
        const vec = MathUtil.lengthDirXY(110, angle);
        super("warning", LD56.MID_X + vec.x, LD56.MID_Y + vec.y, UI_Layers.WARNING);
    }

    onAdded()
    {
        super.onAdded();
        const text = this.addComponent(new TextDisp(0, 0, "!",
            {
                fontFamily: "retro",
                fontSize: 18,
                fill: 0x1f244b,
                align: "center"
            }));
        this.addComponent(new Timer(4000, null, false)).onTrigger.register(caller => caller.parent.destroy());
        this.addComponent(new Timer(200, text, true)).onTrigger.register((caller, data) => {
            if (data.pixiObj.text === "")
            {
                data.pixiObj.text = "!";
            } else
            {
                data.pixiObj.text = "";
            }
        })
    }
}