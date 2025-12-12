export const dummy_gun = () =>{ 
    AFRAME.registerComponent('dummy-gun', {
        init: function () {
            const scene = this.el.sceneEl
            if (!scene || !scene.camera) return

            const camEl = scene.camera.el
            if (!camEl) return

            const gun = document.createElement('a-entity')
            gun.setAttribute('id', 'paintball-gun')
            gun.setAttribute('position', '0.35 -0.25 -0.6')
            gun.setAttribute('rotation', '0 0 0')
            gun.setAttribute('geometry', 'primitive: box; width: 0.3; height: 0.15; depth: 0.7')
            gun.setAttribute('material', 'color: #333; metalness: 0.6; roughness: 0.3')

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

            camEl.appendChild(gun)
            console.log('[dummy-gun] attached gun to camera')
        },
    })
}