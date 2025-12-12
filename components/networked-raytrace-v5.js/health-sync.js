export const health_sync = () => {
    AFRAME.registerComponent('player-health-sync', {
    schema: {
        hp: { type: 'int', default: 100 },
    },

    init: function () {
        const text = document.createElement('a-entity')
        text.setAttribute('text', {
            value: 'HP: ' + this.data.hp,
            align: 'center',
            color: 'white',
            width: 2,
        })
        text.setAttribute('position', '0 0 0')
        text.setAttribute('turn-to-camera', '')
        this.el.appendChild(text)
        this.textEl = text
    },

    update: function () {
        if (this.textEl) {
            this.textEl.setAttribute('text', 'value', 'HP: ' + this.data.hp)
        }
    },
})
}