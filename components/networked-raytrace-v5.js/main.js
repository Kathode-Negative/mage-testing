

class PlayerHealth extends CapElement {
    init() {
        console.log('[PlayerHealth] init')

        this.health = 100
        this.hudRoot = null
        this.healthText = null
        this.damageKeyHandler = null
        this.healthEntity = null

        this.healthNetworkId = null
        this.hitChannelSubscribed = false

        this.rig = this.el
        console.log('[PlayerHealth] attached to player rig:', this.rig)

        const startPos = this.rig.getAttribute('position')
        this.spawnPosition = {
            x: startPos.x,
            y: startPos.y,
            z: startPos.z,
        }

        const healthEntity = document.createElement('a-entity')
        healthEntity.setAttribute('networked', 'template:#health-template')
        healthEntity.setAttribute('position', '0 2.1 0')
        healthEntity.setAttribute('player-health-sync', 'hp: 100')

        this.rig.appendChild(healthEntity)
        this.healthEntity = healthEntity

        console.log('[PlayerHealth] networked health entity created and attached to rig')
        // local health
        const camera =
            document.querySelector('[camera]') ||
            document.querySelector('#player-camera') ||
            this.el

        if (!camera) {
            console.warn('[PlayerHealth] No camera found')
        } else {
            this.camera = camera
            console.log('[PlayerHealth] HUD attached to camera:', this.camera)

            const hud = document.createElement('a-entity')
            hud.setAttribute('id', 'player-health-hud')
            hud.setAttribute('position', '-0.3 -0.25 -0.5')
            hud.setAttribute('rotation', '0 0 0')

            const text = document.createElement('cap-uix-text')
            text.setAttribute('id', 'player-health-text')
            text.setAttribute('value', 'HP: ' + this.health)
            text.setAttribute('color', 'white')
            text.setAttribute('font-size', '0.04')
            text.setAttribute('position', '-0.12 0 0.01')

            hud.appendChild(text)
            this.hudRoot = hud
            this.healthText = text

            this.camera.appendChild(hud)

            const ammoText = document.createElement('cap-uix-text');
            ammoText.setAttribute('id', 'ammo-text');
            ammoText.setAttribute('value', 'Ammo: ');
            ammoText.setAttribute('color', 'white');
            ammoText.setAttribute('font-size', '0.04');
            ammoText.setAttribute('position', '-0.12 -0.065 0.01'); 
            hud.appendChild(ammoText);

            this.ammoText = ammoText;
            window.localAmmoText = this.ammoText;

            this.camera.setAttribute('simple-crosshair', '')
            this.camera.setAttribute('dummy-gun', '')
            console.log('[PlayerHealth] HUD created and attached')
        }

        this.hitChannelSubscribed = false

        if (window.NAF && NAF.connection && !this.hitChannelSubscribed) {
            this.onHitMessage = this.onHitMessage.bind(this)
            NAF.connection.subscribeToDataChannel('paintball-hit', this.onHitMessage)
            this.hitChannelSubscribed = true
            console.log('[PlayerHealth] subscribed to paintball-hit channel')
        }

        this.damageKeyHandler = (e) => {
            if (e.code === 'KeyP') {
                console.log('[PlayerHealth] P key pressed, applying damage')
                this.damage(10)
            }
        }
        document.addEventListener('keydown', this.damageKeyHandler)
    }

    onHitMessage(senderId, dataType, data, targetId) {
        let dmg = data.damage
        console.log('[PlayerHealth] received hit from', senderId, 'for', dmg, 'damage')
        this.damage(dmg)
    }

    disconnectedCallback() {
        console.log('[PlayerHealth] disconnectedCallback')
        if (this.damageKeyHandler) {
            document.removeEventListener('keydown', this.damageKeyHandler)
            this.damageKeyHandler = null
        }
        if (this.hudRoot && this.hudRoot.parentNode) {
            this.hudRoot.parentNode.removeChild(this.hudRoot)
            this.hudRoot = null
        }
        if (this.healthEntity && this.healthEntity.parentNode) {
            this.healthEntity.parentNode.removeChild(this.healthEntity)
            this.healthEntity = null
        }
        if (this.hitChannelSubscribed && window.NAF && NAF.connection && this.onHitMessage) {
            try {
                NAF.connection.unsubscribeFromDataChannel('paintball-hit', this.onHitMessage)
                console.log('[PlayerHealth] unsubscribed from paintball-hit')
            } catch (e) {
                console.warn('[PlayerHealth] error unsubscribing from paintball-hit:', e)
            }
        }
        this.hitChannelSubscribed = false
        this.onHitMessage = null
    }

    damage(amount) {
        this.health = Math.max(0, this.health - amount)
        console.log('[PlayerHealth] damage applied, new health =', this.health)

        this.updateUI()
        this.syncNetwork()
        if (this.health <= 0) {
            this.respawn()
        }
    }

    respawn() {
        this.health = 100
        this.updateUI()
        this.syncNetwork()

        const p = this.spawnPosition
        this.rig.setAttribute('position', `${p.x} ${p.y} ${p.z}`)
        console.log('[PlayerHealth] respawned at', p)
    }

    reset() {
        this.health = 100
        console.log('[PlayerHealth] reset, health = 100')
        this.updateUI()
        this.syncNetwork()
    }

    updateUI() {
        if (this.healthText) {
            this.healthText.setAttribute('value', 'HP: ' + this.health)
        }
    }

    syncNetwork() {
        if (!this.healthEntity) return
        if (!(window.NAF && NAF.utils)) return

        console.log('[PlayerHealth] syncing health to network')

        try {
            NAF.utils.takeOwnership(this.healthEntity)

            this.healthEntity.setAttribute('player-health-sync', 'hp: ' + this.health)
        } catch (e) {
            console.warn('[PlayerHealth] error while syncing:', e)
        }
    }
}

export default PlayerHealth
