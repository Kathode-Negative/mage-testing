const crosshair = () =>{
    AFRAME.registerComponent('simple-crosshair', {
    init: function () {
        const scene = this.el.sceneEl;
        if (!scene || !scene.camera) return

        const camEl = scene.camera.el;

        const cross = document.createElement('a-entity');
        cross.setAttribute('id', 'player-crosshair');
        cross.setAttribute('position', '0 0 -0.4');
        cross.setAttribute('text', {
            value: '+',
            align: 'center',
            color: 'white',
            width: 1,
        });

        camEl.appendChild(cross);
        this.cross = cross;
    },
});
};

const dummy_gun = () =>{ 
    AFRAME.registerComponent('dummy-gun', {
        init: function () {
            const scene = this.el.sceneEl;
            if (!scene || !scene.camera) return

            const camEl = scene.camera.el;
            if (!camEl) return

            const gun = document.createElement('a-entity');
            gun.setAttribute('id', 'paintball-gun');
            gun.setAttribute('position', '0.35 -0.25 -0.6');
            gun.setAttribute('rotation', '0 0 0');
            gun.setAttribute('geometry', 'primitive: box; width: 0.3; height: 0.15; depth: 0.7');
            gun.setAttribute('material', 'color: #333; metalness: 0.6; roughness: 0.3');

            gun.setAttribute('animation__reload', {
                property: 'rotation',
                from: '0 0 0',
                to: '-20 0 0',
                dur: 750,
                dir: 'alternate',
                loop: 2,
                easing: 'easeInOutQuad',
                startEvents: 'reload'
            });

            camEl.appendChild(gun);
            console.log('[dummy-gun] attached gun to camera');
        },
    });
};

const health_sync = () => {
    AFRAME.registerComponent('player-health-sync', {
    schema: {
        hp: { type: 'int', default: 100 },
    },

    init: function () {
        const text = document.createElement('a-entity');
        text.setAttribute('text', {
            value: 'HP: ' + this.data.hp,
            align: 'center',
            color: 'white',
            width: 2,
        });
        text.setAttribute('position', '0 0 0');
        text.setAttribute('turn-to-camera', '');
        this.el.appendChild(text);
        this.textEl = text;
    },

    update: function () {
        if (this.textEl) {
            this.textEl.setAttribute('text', 'value', 'HP: ' + this.data.hp);
        }
    },
});
};

const simple_shooter = () => {
    AFRAME.registerComponent('simple-shooter', {
    schema: {
        damage: { type: 'int', default: 10 },
        magAmmo: { type: 'int', default: 5 },
        reloadMs: { type: 'int', default: 1500}
    },

    init: function () {

        this.ammo = this.data.magAmmo;
        this.reloading = false;

        this.shoot = this.shoot.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.updateAmmoUI = this.updateAmmoUI.bind(this);
        this.updateAmmoUI();
        this.playReloadAnimationOnGun = this.playReloadAnimationOnGun.bind(this);


        window.addEventListener('click', this.shoot);
        document.addEventListener('keydown', this.onKeyDown);
        
    },

    remove: function () {
        window.removeEventListener('click', this.shoot);
        document.removeEventListener('keydown', this.onKeyDown);
    },

    updateAmmoUI: function () {
        if (!window.localAmmoText) {
            setTimeout(() => this.updateAmmoUI(), 50);
            return;
        }

    window.localAmmoText.setAttribute('value', 'Ammo: ' + this.ammo);
    },

    onKeyDown: function (e) {
        // G to reload bc R respawns at start
        if (e.code === 'KeyG') {
        this.tryReload();
        }
    },

    tryReload: function () {
        if (this.reloading) {
        console.log('[SimpleShooter] already reloading');
        return;
        }

        if (this.ammo === this.data.magAmmo) {
        console.log('[SimpleShooter] mag already full');
        return;
        }

        console.log('[SimpleShooter] reloading...');
        this.reloading = true;
        this.playReloadAnimationOnGun();

        const self = this;
        setTimeout(function () {
            self.ammo = self.data.magAmmo;
            self.updateAmmoUI();
            self.reloading = false;
            console.log('[SimpleShooter] reload complete, ammo:', self.ammo, '/', self.data.magAmmo);
        }, this.data.reloadMs);
    },


    shoot: function () {

        if (this.reloading) {
            console.log('[SimpleShooter] cannot shoot, reloading');
            return;
        }

        if (this.ammo <= 0) {
            console.log('[SimpleShooter] no ammo, press G to reload');
            return;
        }

        this.ammo--;
        this.updateAmmoUI();

        const cam = document.querySelector('[camera]');
        if (!cam) return

        const origin = new THREE.Vector3();
        const direction = new THREE.Vector3();

        cam.object3D.getWorldPosition(origin);
        cam.object3D.getWorldDirection(direction);
        direction.normalize();
        direction.negate();

        const raycaster = new THREE.Raycaster(origin, direction, 0, 50);
        const sceneEl = cam.sceneEl;
        const objs = sceneEl.querySelectorAll('*');
        const intersects = raycaster.intersectObjects(
            Array.from(objs)
                .map((el) => el.object3D)
                .filter((obj) => obj),
            true,
        );

        if (!intersects || intersects.length === 0) {
            console.log('[simple-shooter] intersects empty');
            return
        }

        this.shooteffect(origin, intersects[0].object.el.object3D.position);

        const hit = intersects[0].object.el;
        this.handleHit(hit);
    },

    handleHit: function (hitEl) {
        console.log('[simple-shooter] handling hit');
        if (hitEl.id == 'playerRemotePhysics') {
            let nafRoot = hitEl.parentNode.parentNode.parentNode;
            console.log('nafRoot children: ', nafRoot.children);
            const netData = nafRoot.getAttribute('networked');
            const targetClientId = netData.owner;
            console.log('Client ID of the person I shot:', targetClientId);

            if (window.sendHitToClient) {
                window.sendHitToClient(targetClientId, this.data.damage);
            } else {
                console.warn('[simple-shooter] sendHitToClient not defined');
            }
        } else {
            console.log('Did not hit a player!');
            return
        }
    },

    shooteffect: function (spawn, end) {
        const camEl = scene.camera.el;
        if (!camEl) return

        const rotations = [
            ['90 0 0', '0.35 -0.25 -2.2'],
            ['120 0 0', '0.35 0 -2'],
            ['60 0 0', '0.35 -0.5 -2'],
            ['90 20 0', '0.1 -0.25 -2'],
            ['90 -20 0', '0.55 -0.25 -2'],
        ];

        rotations.forEach((item, i) => {
            const spark = document.createElement('a-entity');
            spark.setAttribute('position', item[1]);
            spark.setAttribute('rotation', item[0]);
            spark.setAttribute('geometry', 'primitive: cylinder; radius:0.05');
            spark.setAttribute('material', 'emissive: #fb0;emissiveIntensity: 200');
            camEl.appendChild(spark);

            setTimeout(() => {
                if (spark.parentNode) {
                    spark.parentNode.removeChild(spark);
                }
            }, 70);
        });
    },

    playReloadAnimationOnGun: function () {
        const gun = document.getElementById('paintball-gun');
        gun.emit('reload');
    },

});
};

const turn_to_camera = ()=>{
    // for the health text to always face the camera
    AFRAME.registerComponent('turn-to-camera', {
        tick: function () {
            const scene = this.el.sceneEl;
            if (!scene || !scene.camera) return

            const camEl = scene.camera.el;
            if (!camEl) return

            const camPos = new THREE.Vector3();
            camEl.object3D.getWorldPosition(camPos);

            this.el.object3D.lookAt(camPos);
        },
    });
};

const setup = () => {
    turn_to_camera();
    dummy_gun();
    crosshair();
    health_sync();
    simple_shooter();

    const templateID = '#health-template';
    if (!document.getElementById('health-template')) {
        const tpl = document.createElement('template');
        tpl.id = 'health-template';
        tpl.innerHTML = `
            <a-entity player-health-sync="hp: 100"></a-entity>
        `;
        document.body.appendChild(tpl);

        NAF.schemas.add({
            template: templateID,
            components: ['player-health-sync', 'position', 'rotation'],
        });
        console.log('[DEBUG] NAF.schemas added template:', templateID);
    }
    let scene = document.querySelector('a-scene');
    scene.setAttribute('simple-shooter', '');
    console.log('Attached simple-shooter to scene.');

    function sendHitToClient(targetClientId, damage) {
        const data = {
            damage: damage,
        };

        console.log('[Hit] sending paintball-hit to client', targetClientId, data);
        NAF.connection.sendDataGuaranteed(targetClientId, 'paintball-hit', data);
    }

    window.sendHitToClient = sendHitToClient;

};

// attach to player-rig

class PlayerHealth extends CapElement {
    init() {
        setup();
        console.log('[PlayerHealth] init');

        this.health = 100;
        this.hudRoot = null;
        this.healthText = null;
        this.damageKeyHandler = null;
        this.healthEntity = null;

        this.healthNetworkId = null;
        this.hitChannelSubscribed = false;

        this.rig = this.el;
        console.log('[PlayerHealth] attached to player rig:', this.rig);

        const startPos = this.rig.getAttribute('position');
        this.spawnPosition = {
            x: startPos.x,
            y: startPos.y,
            z: startPos.z,
        };

        const healthEntity = document.createElement('a-entity');
        healthEntity.setAttribute('networked', 'template:#health-template');
        healthEntity.setAttribute('position', '0 2.1 0');
        healthEntity.setAttribute('player-health-sync', 'hp: 100');

        this.rig.appendChild(healthEntity);
        this.healthEntity = healthEntity;

        console.log('[PlayerHealth] networked health entity created and attached to rig');
        // local health
        const camera =
            document.querySelector('[camera]') ||
            document.querySelector('#player-camera') ||
            this.el;

        if (!camera) {
            console.warn('[PlayerHealth] No camera found');
        } else {
            this.camera = camera;
            console.log('[PlayerHealth] HUD attached to camera:', this.camera);

            const hud = document.createElement('a-entity');
            hud.setAttribute('id', 'player-health-hud');
            hud.setAttribute('position', '-0.3 -0.25 -0.5');
            hud.setAttribute('rotation', '0 0 0');

            const text = document.createElement('cap-uix-text');
            text.setAttribute('id', 'player-health-text');
            text.setAttribute('value', 'HP: ' + this.health);
            text.setAttribute('color', 'white');
            text.setAttribute('font-size', '0.04');
            text.setAttribute('position', '-0.12 0 0.01');

            hud.appendChild(text);
            this.hudRoot = hud;
            this.healthText = text;

            this.camera.appendChild(hud);

            const ammoText = document.createElement('cap-uix-text');
            ammoText.setAttribute('id', 'ammo-text');
            ammoText.setAttribute('value', 'Ammo: ');
            ammoText.setAttribute('color', 'white');
            ammoText.setAttribute('font-size', '0.04');
            ammoText.setAttribute('position', '-0.12 -0.065 0.01'); 
            hud.appendChild(ammoText);

            this.ammoText = ammoText;
            window.localAmmoText = this.ammoText;

            this.camera.setAttribute('simple-crosshair', '');
            this.camera.setAttribute('dummy-gun', '');
            console.log('[PlayerHealth] HUD created and attached');
        }

        this.hitChannelSubscribed = false;

        if (window.NAF && NAF.connection && !this.hitChannelSubscribed) {
            this.onHitMessage = this.onHitMessage.bind(this);
            NAF.connection.subscribeToDataChannel('paintball-hit', this.onHitMessage);
            this.hitChannelSubscribed = true;
            console.log('[PlayerHealth] subscribed to paintball-hit channel');
        }

        this.damageKeyHandler = (e) => {
            if (e.code === 'KeyP') {
                console.log('[PlayerHealth] P key pressed, applying damage');
                this.damage(10);
            }
        };
        document.addEventListener('keydown', this.damageKeyHandler);
    }

    onHitMessage(senderId, dataType, data, targetId) {
        let dmg = data.damage;
        console.log('[PlayerHealth] received hit from', senderId, 'for', dmg, 'damage');
        this.damage(dmg);
    }

    disconnectedCallback() {
        console.log('[PlayerHealth] disconnectedCallback');
        if (this.damageKeyHandler) {
            document.removeEventListener('keydown', this.damageKeyHandler);
            this.damageKeyHandler = null;
        }
        if (this.hudRoot && this.hudRoot.parentNode) {
            this.hudRoot.parentNode.removeChild(this.hudRoot);
            this.hudRoot = null;
        }
        if (this.healthEntity && this.healthEntity.parentNode) {
            this.healthEntity.parentNode.removeChild(this.healthEntity);
            this.healthEntity = null;
        }
        if (this.hitChannelSubscribed && window.NAF && NAF.connection && this.onHitMessage) {
            try {
                NAF.connection.unsubscribeFromDataChannel('paintball-hit', this.onHitMessage);
                console.log('[PlayerHealth] unsubscribed from paintball-hit');
            } catch (e) {
                console.warn('[PlayerHealth] error unsubscribing from paintball-hit:', e);
            }
        }
        this.hitChannelSubscribed = false;
        this.onHitMessage = null;
    }

    damage(amount) {
        this.health = Math.max(0, this.health - amount);
        console.log('[PlayerHealth] damage applied, new health =', this.health);

        this.updateUI();
        this.syncNetwork();
        if (this.health <= 0) {
            this.respawn();
        }
    }

    respawn() {
        this.health = 100;
        this.updateUI();
        this.syncNetwork();

        const p = this.spawnPosition;
        this.rig.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
        console.log('[PlayerHealth] respawned at', p);
    }

    reset() {
        this.health = 100;
        console.log('[PlayerHealth] reset, health = 100');
        this.updateUI();
        this.syncNetwork();
    }

    updateUI() {
        if (this.healthText) {
            this.healthText.setAttribute('value', 'HP: ' + this.health);
        }
    }

    syncNetwork() {
        if (!this.healthEntity) return
        if (!(window.NAF && NAF.utils)) return

        console.log('[PlayerHealth] syncing health to network');

        try {
            NAF.utils.takeOwnership(this.healthEntity);

            this.healthEntity.setAttribute('player-health-sync', 'hp: ' + this.health);
        } catch (e) {
            console.warn('[PlayerHealth] error while syncing:', e);
        }
    }
}

export { PlayerHealth };
