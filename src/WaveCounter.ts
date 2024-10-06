import {Entity, Observable, TextDisp} from "lagom-engine";

export class WaveCounter extends Entity {
    constructor(x: number, y: number) {
        super("waveCounter", x, y, 0);
    }

    onAdded() {
        super.onAdded();
        const waveLabel = this.addComponent(new TextDisp(0, 0, "Wave 1",
            {fill: 0x777777, fontSize: 18, dropShadow: true, dropShadowColor: 0xdddddd, dropShadowDistance: 2}));

        this.onNewWave.register((_, waveNumber) => {
            waveLabel.pixiObj.text = "Wave " + waveNumber;
        });
    }

    readonly onNewWave: Observable<WaveCounter, number> = new Observable();
}
