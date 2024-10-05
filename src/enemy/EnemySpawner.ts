import {Component, Entity, LagomType, MathUtil, System} from "lagom-engine";
import {LD56} from "../LD56.ts";
import {Enemy, Health, Minion} from "./Enemy.ts";
import {Mover} from "../Bullet.ts";

export class EnemySpawner extends System<[Spawning]> {
    types = [Spawning]

    constructor(private elapsed: number = 0) {
        super();
    }

    update(delta: number): void {
        this.elapsed += delta;

        if (this.elapsed > 1000) {
            this.elapsed = 0;
            this.runOnEntities((entity: Entity, component: Spawning) => {
                const angle = MathUtil.randomRange(0, 360)
                const vec = MathUtil.lengthDirXY(LD56.GAME_WIDTH / 3, MathUtil.degToRad(angle));
                let spawned = this.getScene().addEntity(new Enemy("minion", LD56.MID_X + vec.x, LD56.MID_Y + vec.y))
                spawned.addComponent(new Health(1));
                spawned.addComponent(new Minion());

                const direction = MathUtil.pointDirection(spawned.transform.position.x, spawned.transform.position.y, LD56.MID_X, LD56.MID_Y);
                console.log(direction);
                spawned.addComponent(new Mover(10, direction * -1));
            });
        }
    }
}

export class SpawnArea extends Entity {

    constructor(depth: number) {
        super("SpawnArea", 0, 0, depth);
    }

    onAdded() {
        super.onAdded();
        this.addComponent(new Spawning(0, 0, LD56.GAME_WIDTH, LD56.GAME_HEIGHT))
    }
}

class Spawning extends Component {

    constructor(public x: number, public y: number, public width: number, public height: number) {
        super();
    }
}