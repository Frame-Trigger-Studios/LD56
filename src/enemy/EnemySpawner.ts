import {Component, Entity, MathUtil, System} from "lagom-engine";
import {LD56} from "../LD56.ts";
import {Enemy, Health} from "./Enemy.ts";
import {Mover} from "../Bullet.ts";
import {getWave, Wave} from "./WaveManager.ts";

function randIntBetween(min: number, max: number) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export class EnemySpawner extends System<[Wave, WaveSpawning]> {
    types = [Wave, WaveSpawning]

    constructor(private elapsed: number = 0) {
        super();
    }

    update(delta: number): void {
        this.elapsed += delta;

        if (this.elapsed <= 1000) {
            return;
        }

        this.elapsed = 0;

        this.runOnEntities((entity: Entity, wave: Wave, waveSpawning: WaveSpawning) => {
            if (wave.waveSpawned()) {
                // console.log("wave spawned")
                return;
            }

            if (wave.spawned_enemies[waveSpawning.CurrentCluster] == wave.cluster_size) {
                wave.spawnedClusters++;
                waveSpawning.nextCluster();
                // console.log("next cluster");
            }
            if (waveSpawning.CurrentCluster == wave.spawned_enemies.length) {
                // console.log("finished clusters");
                return;
            }

            for (let i = 0; i < 3 && wave.spawned_enemies[waveSpawning.CurrentCluster] < wave.cluster_size; i++) {
                let angleVariance = randIntBetween(waveSpawning.spawnDirection - 10, waveSpawning.spawnDirection + 10);
                const vec = MathUtil.lengthDirXY(waveSpawning.spawnDistance, MathUtil.degToRad(angleVariance));

                // let xVariance = 0;
                let xVariance = randIntBetween(-5, 5);
                // let yVariance = 0;
                let yVariance = randIntBetween(-5, 5);

                let spawned = this.getScene().addEntity(new Enemy("minion",
                    LD56.MID_X + vec.x + xVariance,
                    LD56.MID_Y + vec.y + yVariance))
                spawned.addComponent(new Health(1));
                const direction = MathUtil.pointDirection(spawned.transform.position.x, spawned.transform.position.y, LD56.MID_X, LD56.MID_Y);
                spawned.addComponent(new Mover(20, direction * -1));
                wave.spawned_enemies[waveSpawning.CurrentCluster]++;
                // console.log("cluster[" + waveSpawning.CurrentCluster + "] = " + wave.spawned_enemies[waveSpawning.CurrentCluster])
            }
        });
    }
}

export class SpawnArea extends Entity {

    constructor(depth: number) {
        super("SpawnArea", 0, 0, depth);
    }

    onAdded() {
        super.onAdded();
        const wave = this.addComponent(getWave(4));
        // console.log(wave.num_clusters)
        this.addComponent(new WaveSpawning());
    }
}

class WaveSpawning extends Component {

    constructor(public spawnDistance: number = 0,
        public CurrentCluster: number = -1,
        public spawnDirection: number = 0) {
        super();
        this.spawnDistance = MathUtil.pointDistance(0, 0, LD56.MID_X, LD56.MID_Y);
        this.nextCluster();
    }

    nextCluster() {
        this.CurrentCluster++;
        this.spawnDirection = randIntBetween(0, 360);
    }
}