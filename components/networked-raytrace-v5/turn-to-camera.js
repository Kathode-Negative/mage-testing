
export const turn_to_camera = ()=>{
    // for the health text to always face the camera
    AFRAME.registerComponent('turn-to-camera', {
        tick: function () {
            const scene = this.el.sceneEl
            if (!scene || !scene.camera) return

            const camEl = scene.camera.el
            if (!camEl) return

            const camPos = new THREE.Vector3()
            camEl.object3D.getWorldPosition(camPos)

            this.el.object3D.lookAt(camPos)
        },
    })
}
