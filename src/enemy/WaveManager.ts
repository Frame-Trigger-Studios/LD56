import {Component, LagomType, System} from "lagom-engine";

const waves = [
    [1, 1, 40],
    [2, 1, 60],
    [3, 1, 80],
    [4, 2, 40],
    [5, 2, 60],
    [6, 2, 80],
];

export function getWave(number: number): Wave {
    const wave_index = (number >= waves.length) ? waves.length - 1 : number - 1;
    const wave_data = waves[wave_index];

    return new Wave(wave_data[0], wave_data[1], wave_data[2]);
}

export class Wave extends Component {

    constructor(readonly waveNumber: number,
                readonly num_clusters: number,
                readonly cluster_size: number,
                public spawnedClusters: number = 0,
                public spawned_enemies: number[] = [0, 0],
                public killed_enemies: number = 0,
                public totalEnemies: number = 0) {
        super();
        this.totalEnemies = num_clusters * cluster_size;
    }

    waveEnded(): boolean {
        return this.killed_enemies >= this.num_clusters * this.cluster_size;
    }
    waveSpawned(): boolean {
        return this.spawned_enemies.reduce((total, num) => total + num, 0) >= this.totalEnemies;
    }
}

export class WaveManager extends System<[Wave]> {
    types: LagomType<Component>[];

    update(delta: number): void {

    }

}