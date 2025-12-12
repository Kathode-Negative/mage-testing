
export const simple_shooter = () => {
    AFRAME.registerComponent('simple-shooter', {
    schema: {
        damage: { type: 'int', default: 10 },
        magAmmo: { type: 'int', default: 5 },
        reloadMs: { type: 'int', default: 1500}
    },

    init: function () {

        this.ammo = this.data.magAmmo;
        this.reloading = false;

        this.shoot = this.shoot.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this);
        this.updateAmmoUI = this.updateAmmoUI.bind(this);
        this.updateAmmoUI();
        this.playReloadAnimationOnGun = this.playReloadAnimationOnGun.bind(this);


        window.addEventListener('click', this.shoot);
        document.addEventListener('keydown', this.onKeyDown);
        
    },

    remove: function () {
        window.removeEventListener('click', this.shoot)
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

        const cam = document.querySelector('[camera]')
        if (!cam) return

        const origin = new THREE.Vector3()
        const direction = new THREE.Vector3()

        cam.object3D.getWorldPosition(origin)
        cam.object3D.getWorldDirection(direction)
        direction.normalize()
        direction.negate()

        const raycaster = new THREE.Raycaster(origin, direction, 0, 50)
        const sceneEl = cam.sceneEl
        const objs = sceneEl.querySelectorAll('*')
        const intersects = raycaster.intersectObjects(
            Array.from(objs)
                .map((el) => el.object3D)
                .filter((obj) => obj),
            true,
        )

        if (!intersects || intersects.length === 0) {
            console.log('[simple-shooter] intersects empty')
            return
        }

        this.shooteffect(origin, intersects[0].object.el.object3D.position)

        const hit = intersects[0].object.el
        this.handleHit(hit)
    },

    handleHit: function (hitEl) {
        console.log('[simple-shooter] handling hit')
        if (hitEl.id == 'playerRemotePhysics') {
            let nafRoot = hitEl.parentNode.parentNode.parentNode
            console.log('nafRoot children: ', nafRoot.children)
            const netData = nafRoot.getAttribute('networked')
            const targetClientId = netData.owner
            console.log('Client ID of the person I shot:', targetClientId)

            if (window.sendHitToClient) {
                window.sendHitToClient(targetClientId, this.data.damage)
            } else {
                console.warn('[simple-shooter] sendHitToClient not defined')
            }
        } else {
            console.log('Did not hit a player!')
            return
        }
    },

    shooteffect: function (spawn, end) {
        const camEl = scene.camera.el
        if (!camEl) return

        const rotations = [
            ['90 0 0', '0.35 -0.25 -2.2'],
            ['120 0 0', '0.35 0 -2'],
            ['60 0 0', '0.35 -0.5 -2'],
            ['90 20 0', '0.1 -0.25 -2'],
            ['90 -20 0', '0.55 -0.25 -2'],
        ]

        rotations.forEach((item, i) => {
            const spark = document.createElement('a-entity')
            spark.setAttribute('position', item[1])
            spark.setAttribute('rotation', item[0])
            spark.setAttribute('geometry', 'primitive: cylinder; radius:0.05')
            spark.setAttribute('material', 'emissive: #fb0;emissiveIntensity: 200')
            camEl.appendChild(spark)

            setTimeout(() => {
                if (spark.parentNode) {
                    spark.parentNode.removeChild(spark)
                }
            }, 70)
        })
    },

    playReloadAnimationOnGun: function () {
        const gun = document.getElementById('paintball-gun');
        gun.emit('reload');
    },

})
}