export const crosshair = () =>{
    AFRAME.registerComponent('simple-crosshair', {
    init: function () {
        const scene = this.el.sceneEl
        if (!scene || !scene.camera) return

        const camEl = scene.camera.el

        const cross = document.createElement('a-entity')
        cross.setAttribute('id', 'player-crosshair')
        cross.setAttribute('position', '0 0 -0.4')
        cross.setAttribute('text', {
            value: '+',
            align: 'center',
            color: 'white',
            width: 1,
        })

        camEl.appendChild(cross)
        this.cross = cross
    },
})
}