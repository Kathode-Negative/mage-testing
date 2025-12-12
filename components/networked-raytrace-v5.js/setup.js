export function setup(){
const templateID = '#health-template'
if (!document.getElementById('health-template')) {
    const tpl = document.createElement('template')
    tpl.id = 'health-template'
    tpl.innerHTML = `
        <a-entity player-health-sync="hp: 100"></a-entity>
    `
    document.body.appendChild(tpl)

    NAF.schemas.add({
        template: templateID,
        components: ['player-health-sync', 'position', 'rotation'],
    })
    console.log('[DEBUG] NAF.schemas added template:', templateID)
}
let scene = document.querySelector('a-scene')
scene.setAttribute('simple-shooter', '')
console.log('Attached simple-shooter to scene.')

function sendHitToClient(targetClientId, damage) {
    const data = {
        damage: damage,
    }

    console.log('[Hit] sending paintball-hit to client', targetClientId, data)
    NAF.connection.sendDataGuaranteed(targetClientId, 'paintball-hit', data)
}

window.sendHitToClient = sendHitToClient
}
