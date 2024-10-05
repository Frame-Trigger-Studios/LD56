import {Component, Entity, MathUtil, System} from "lagom-engine";
import {LD56} from "../LD56.ts";
import {Health, Ladybug, SmallBug, Wasp} from "./Enemy.ts";
import {Mover} from "../Bullet.ts";
import {getWave, Wave} from "./WaveManager.ts";
import {Warning} from "./Warning.ts";

function randIntBetween(min: number, max: number) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

enum ENEMY_TYPE {
    SMALL_BUG,
    LADY_BUG,
    WASP
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
                entity.removeComponent(waveSpawning, true);
                return;
            }

            if (wave.clusterSpawned(waveSpawning.CurrentCluster)) {
                wave.spawnedClusters++;
                waveSpawning.nextCluster();
                this.getScene().addGUIEntity(new Warning(MathUtil.degToRad(waveSpawning.spawnDirection)));
                // console.log("next cluster");
            }

            if (waveSpawning.CurrentCluster == wave.spawnedEnemies.length) {
                // console.log("finished clusters");
                return;
            }

            for (let i = 0; i < 3; i++) {
                // console.log("Spawn enemy " + i)
                const enemyOptions: ENEMY_TYPE[] = [];

                if (wave.clusters.smallBugs > 0 && wave.clusters.smallBugs > wave.spawnedEnemies[waveSpawning.CurrentCluster].smallBugs) {
                    enemyOptions.push(ENEMY_TYPE.SMALL_BUG);
                }

                if (wave.clusters.ladyBugs > 0 && wave.clusters.ladyBugs > wave.spawnedEnemies[waveSpawning.CurrentCluster].ladyBugs) {
                    enemyOptions.push(ENEMY_TYPE.LADY_BUG);
                }

                if (wave.clusters.wasps > 0 && wave.clusters.wasps > wave.spawnedEnemies[waveSpawning.CurrentCluster].wasps) {
                    enemyOptions.push(ENEMY_TYPE.WASP);
                }

                if (enemyOptions.length == 0) {
                    break;
                }

                let angleVariance = MathUtil.randomRange(waveSpawning.spawnDirection - 10, waveSpawning.spawnDirection + 10);
                const vec = MathUtil.lengthDirXY(waveSpawning.spawnDistance, MathUtil.degToRad(angleVariance));

                // let xVariance = 0;
                let xVariance = randIntBetween(-5, 5);
                // let yVariance = 0;
                let yVariance = randIntBetween(-5, 5);

                const x = LD56.MID_X + vec.x + xVariance;
                const y = LD56.MID_Y + vec.y + yVariance;

                let enemy = undefined;

                const newEnemy: ENEMY_TYPE = enemyOptions[MathUtil.randomRange(0, enemyOptions.length)];
                if (newEnemy == ENEMY_TYPE.WASP) {
                    enemy = new Wasp(x, y);
                    wave.spawnedEnemies[waveSpawning.CurrentCluster].wasps++;
                } else if (newEnemy == ENEMY_TYPE.LADY_BUG) {
                    enemy = new Ladybug(x, y);
                    wave.spawnedEnemies[waveSpawning.CurrentCluster].ladyBugs++;
                } else if (newEnemy == ENEMY_TYPE.SMALL_BUG) {
                    enemy = new SmallBug(x, y);
                    wave.spawnedEnemies[waveSpawning.CurrentCluster].smallBugs++;
                }

                let spawned = this.getScene().addEntity(enemy);
                spawned.addComponent(new Health(1));
                const direction = MathUtil.pointDirection(spawned.transform.position.x, spawned.transform.position.y, LD56.MID_X, LD56.MID_Y);
                spawned.addComponent(new Mover(20, direction * -1));

                // console.log("cluster[" + waveSpawning.CurrentCluster + "] = " + wave.spawnedEnemies[waveSpawning.CurrentCluster])
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
        const wave = this.addComponent(getWave(2));
        // console.log(wave.num_clusters)
        this.addComponent(new WaveSpawning());
    }
}

export class WaveSpawning extends Component {

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

    onAdded()
    {
        super.onAdded();
        this.getScene().addGUIEntity(new Warning(MathUtil.degToRad(this.spawnDirection)));
    }
}
