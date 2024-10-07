import {Component, Entity, Key, LagomType, System, TextDisp} from "lagom-engine";
import {MainScene} from "./LD56.ts";

export class GameOver extends Entity {
    constructor() {
        super("gameover", 0, 0);
    }

    onAdded() {
        super.onAdded();

        this.addComponent(new TextDisp(89, 50, "Game Over",
            {
                fill: 0x1f244b,
                fontFamily: "retro",
                fontSize: 20,
                dropShadow: true,
                dropShadowColor: 0xb6cf8e,
                dropShadowDistance: 1
            }));

        this.addComponent(new TextDisp(60, 250, "Press <Space>",
            {
                fill: 0x1f244b,
                fontFamily: "retro",
                fontSize: 20,
                dropShadow: true,
                dropShadowColor: 0xb6cf8e,
                dropShadowDistance: 1
            }));
        this.addComponent(new TextDisp(75, 270, " to restart",
            {
                fill: 0x1f244b,
                fontFamily: "retro",
                fontSize: 20,
                dropShadow: true,
                dropShadowColor: 0xb6cf8e,
                dropShadowDistance: 1
            }));

        this.addComponent(new SpaceToRestart());
        this.scene.addSystem(new SpaceListener());
    }
}


class SpaceToRestart extends Component {
}

class SpaceListener extends System<[SpaceToRestart]> {
    update(delta: number): void {
        this.runOnEntities(entity => {
            if (this.scene.game.keyboard.isKeyPressed(Key.Space)) {
                this.scene.game.setScene(new MainScene(this.scene.game));
            }
        })
    }
    types = [SpaceToRestart];

}