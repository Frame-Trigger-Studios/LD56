import {Component, Entity, LagomType, System} from "lagom-engine";

class EnemyHit extends System<[]>
{
    types: LagomType<Component>[];

    update(delta: number): void {

    }
}