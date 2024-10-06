import {Component, Entity, System, Timer} from "lagom-engine";
import {WaveSpawning} from "./EnemySpawner";
import {WaveCounter} from "../WaveCounter";

interface Units {
    ladyBugs: number,
    smallBugs: number,
    wasps: number,
}

interface WaveData {
    waveNumber: number,
    numClusters: number,
    waveSpeed: number,
    angleVar: number,
    units: Units
}

const waves: WaveData[] = [
    {waveNumber: 1, numClusters: 1, waveSpeed: 20, angleVar: 10, units: {smallBugs: 10, ladyBugs: 0, wasps: 0}},
    {waveNumber: 2, numClusters: 1, waveSpeed: 20, angleVar: 10, units: {smallBugs: 10, ladyBugs: 3, wasps: 0}},
    {waveNumber: 3, numClusters: 1, waveSpeed: 20, angleVar: 10, units: {smallBugs: 20, ladyBugs: 5, wasps: 1}},
    {waveNumber: 4, numClusters: 1, waveSpeed: 20, angleVar: 10, units: {smallBugs: 20, ladyBugs: 10, wasps: 3}},
    {waveNumber: 5, numClusters: 2, waveSpeed: 20, angleVar: 10, units: {smallBugs: 20, ladyBugs: 0, wasps: 10}},
    {waveNumber: 6, numClusters: 2, waveSpeed: 22, angleVar: 10, units: {smallBugs: 20, ladyBugs: 10, wasps: 7}},
    {waveNumber: 7, numClusters: 2, waveSpeed: 24, angleVar: 10, units: {smallBugs: 30, ladyBugs: 10, wasps: 10}},
    {waveNumber: 8, numClusters: 2, waveSpeed: 26, angleVar: 12, units: {smallBugs: 20, ladyBugs: 20, wasps: 10}},
    {waveNumber: 9, numClusters: 3, waveSpeed: 28, angleVar: 12, units: {smallBugs: 20, ladyBugs: 20, wasps: 12}},
    {waveNumber: 10, numClusters: 3, waveSpeed: 30, angleVar: 12, units: {smallBugs: 30, ladyBugs: 20, wasps: 15}},
];

export function getWave(number: number): Wave {
    let wave_data;
    if (number <= waves.length) {
        wave_data = waves[number - 1];
    } else {
        let lastWave = waves[waves.length - 1];
        let multiplier = number - lastWave.waveNumber;
        wave_data = {
            waveNumber: number,
            numClusters: Math.max(3, number / 5),
            waveSpeed: Math.min(lastWave.waveSpeed + (multiplier * 2), 50),
            angleVar: Math.min(lastWave.angleVar + multiplier, 30),
            units: {
                smallBugs: lastWave.units.smallBugs + (multiplier * 10),
                ladyBugs: lastWave.units.ladyBugs + (multiplier * 5),
                wasps: lastWave.units.wasps + (multiplier * 3)
            }
        };
    }

    return new Wave(wave_data.waveNumber, wave_data.numClusters, wave_data.waveSpeed, wave_data.angleVar, wave_data.units);
}

export class Wave extends Component {

    constructor(readonly waveNumber: number,
                readonly numClusters: number,
                readonly waveSpeed: number,
                readonly angleVar: number,
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
        // console.log(this.killedEnemies + " >= " + this.totalEnemies)
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

                    entity.addComponent(new WaveSpawning());
                    const waveCounter = entity.getScene().getEntityWithName<WaveCounter>("waveCounter");
                    if (waveCounter) {
                        waveCounter.onNewWave.trigger(waveCounter, newWave.waveNumber);
                    }
                });
            }
        });
    }

}
