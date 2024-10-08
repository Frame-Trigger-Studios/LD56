import {Component, Entity, Observable, TextDisp} from "lagom-engine";

export class ScoreDisplay extends Entity {
    constructor(x: number, y: number) {
        super("score", x, y, 0);
    }

    onAdded() {
        super.onAdded();
        const score = this.addComponent(new Score(0));
        const scoreLabel = this.addComponent(new TextDisp(0, 0, this.getScoreText(score.amount),
            {
                fill: 0x1f244b,
                fontFamily: "retro",
                fontSize: 8,
                dropShadow: true,
                dropShadowColor: 0xb6cf8e,
                dropShadowDistance: 1
            }));
        score.onScore.register((_, num) => {
            scoreLabel.pixiObj.text = this.getScoreText(num);
        });
    }

    getScoreText(points: number) {
        return points + " points";
    }
}

export class Score extends Component {

    constructor(private _amount: number) {
        super();
    }

    readonly onScore: Observable<Score, number> = new Observable();


    get amount(): number {
        return this._amount;
    }

    addAmount(value: number) {
        this._amount += value;
        this.onScore.trigger(this, this._amount);
    }

    resetAmount() {
        this._amount = 0;
        this.onScore.trigger(this, this._amount);
    }
}
