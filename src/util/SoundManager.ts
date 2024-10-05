import {AnimatedSpriteController, Button, Component, Entity, Key, System, Timer} from "lagom-engine";

import {LD56} from "../LD56.ts";

class MuteComp extends Component {
}

class MuteListener extends System<[AnimatedSpriteController, MuteComp]> {
    types = [AnimatedSpriteController, MuteComp];

    update(delta: number): void {
        this.runOnEntities((e: Entity, spr: AnimatedSpriteController) => {
            if (this.scene.game.mouse.isButtonPressed(Button.LEFT)) {
                const pos = e.scene.game.renderer.plugins.interaction.mouse.global;

                if (pos.x >= LD56.GAME_WIDTH - 24 && pos.x <= LD56.GAME_WIDTH - 8 && pos.y >= LD56.GAME_HEIGHT - 24 && pos.y <= LD56.GAME_HEIGHT - 8) {
                    (e.scene.getEntityWithName("audio") as SoundManager).toggleMute();
                    spr.setAnimation(Number(LD56.muted));
                }
            } else if (this.scene.game.keyboard.isKeyPressed(Key.KeyM)) {
                (e.scene.getEntityWithName("audio") as SoundManager).toggleMute();
                spr.setAnimation(Number(LD56.muted));
            }
        });
    }
}

export class SoundManager extends Entity {
    constructor() {
        super("audio", LD56.GAME_WIDTH - 16 - 8, LD56.GAME_HEIGHT - 24, 0);
        this.startMusic();
    }

    onAdded(): void {
        super.onAdded();

        this.addComponent(new MuteComp());
        const spr = this.addComponent(new AnimatedSpriteController(Number(LD56.muted), [
            {
                id: 0,
                textures: [this.scene.game.getResource("mute_button").texture(0, 0, 16, 16)]
            }, {
                id: 1,
                textures: [this.scene.game.getResource("mute_button").texture(1, 0, 16, 16)]
            }]));

        this.addComponent(new Timer(50, spr, false)).onTrigger.register((caller, data) => {
            data.setAnimation(Number(LD56.muted));
        });

        this.scene.addSystem(new MuteListener());
    }

    toggleMute() {
        LD56.muted = !LD56.muted;

        if (LD56.muted) {
            this.stopAllSounds();
        } else {
            this.startMusic();
        }
    }

    startMusic() {
        if (!LD56.muted && !LD56.musicPlaying) {
            LD56.audioAtlas.play("music");
            LD56.musicPlaying = true;
        }
    }

    stopAllSounds(music = true) {
        if (music) {
            LD56.audioAtlas.sounds.forEach((v: any, k: string) => v.stop());
            LD56.musicPlaying = false;
        } else {
            LD56.audioAtlas.sounds.forEach((v: any, k: string) => {
                if (k !== "music") v.stop();
            });
        }
    }

    onRemoved(): void {
        super.onRemoved();
        this.stopAllSounds(false);
    }

    playSound(name: string, restart = false) {
        if (!LD56.muted) {
            if (LD56.audioAtlas.sounds.get(name)?.playing() && !restart) return;
            LD56.audioAtlas.play(name);
        }
    }

    stopSound(name: string) {
        LD56.audioAtlas.sounds.forEach((value, key) => {
            if (key === name) {
                value.stop();
            }
        })
    }
}
