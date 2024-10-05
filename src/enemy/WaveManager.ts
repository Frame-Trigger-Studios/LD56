import {Component, Entity, LagomType, System, Timer} from "lagom-engine";

interface Units {
    ladyBugs: number,
    smallBugs: number,
    wasps: number,
}

interface WaveData {
    waveNumber: number,
    numClusters: number,
    units: Units
}

const waves: WaveData[] = [
    {waveNumber: 1, numClusters: 1, units: {smallBugs: 10, ladyBugs: 0, wasps: 0}},
    {waveNumber: 2, numClusters: 1, units: {smallBugs: 10, ladyBugs: 5, wasps: 0}},
    {waveNumber: 3, numClusters: 1, units: {smallBugs: 20, ladyBugs: 10, wasps: 3}},
    {waveNumber: 4, numClusters: 2, units: {smallBugs: 20, ladyBugs: 0, wasps: 6}},
    {waveNumber: 5, numClusters: 2, units: {smallBugs: 40, ladyBugs: 20, wasps: 0}},
    {waveNumber: 6, numClusters: 4, units: {smallBugs: 10, ladyBugs: 20, wasps: 10}},
];

export function getWave(number: number): Wave {
    const wave_index = (number >= waves.length) ? waves.length - 1 : number - 1;
    const wave_data = waves[wave_index];

    return new Wave(wave_data.waveNumber, wave_data.numClusters, wave_data.units);
}

export class Wave extends Component {

    constructor(readonly waveNumber: number,
                readonly numClusters: number,
                readonly clusters: Units,
                public spawnedClusters: number = 0,
                public spawnedEnemies: Units[] = [],
                public killedEnemies: number = 0,
                public totalEnemies: number = 0) {
        super();
        const enemiesInCluster = clusters.wasps + clusters.ladyBugs + clusters.smallBugs;
        this.totalEnemies = numClusters * enemiesInCluster;
        this.spawnedEnemies = [];
        for (let i = 0; i < numClusters; i++) {
            this.spawnedEnemies.push({ladyBugs: 0, smallBugs: 0, wasps: 0});
        }
    }

    waveEnded(): boolean {
        return this.killedEnemies >= this.totalEnemies;
    }

    waveSpawned(): boolean {
        const totalSpawnedEnemies = this.spawnedEnemies.reduce((total, cluster) => total + cluster.smallBugs + cluster.ladyBugs + cluster.wasps, 0);
        return totalSpawnedEnemies >= this.totalEnemies;
    }

    clusterSpawned(clusterNum: number): boolean {
        if (clusterNum > this.spawnedEnemies.length) {
            return true;
        }
        const cluster: Units = this.spawnedEnemies[clusterNum];

        return cluster.smallBugs >= this.clusters.smallBugs
            && cluster.ladyBugs >= this.clusters.ladyBugs
            && cluster.wasps >= this.clusters.wasps;
    }
}

export class WaveManager extends System<[Wave]> {
    types = [Wave];

    update(delta: number): void {
        this.runOnEntities((entity: Entity, wave: Wave) => {
            if (wave.waveEnded() && entity.getComponent(Timer) == null) {
                console.log("wave ended");
                const waveEndTimer = entity.addComponent(new Timer(5 * 1000, {}, false))
                waveEndTimer.onTrigger.register(() => {
                    const newWave = entity.addComponent(getWave(wave.waveNumber + 1));
                    console.log("New wave: " + newWave.waveNumber);
                    wave.destroy();
                });
            }
        });
    }

}