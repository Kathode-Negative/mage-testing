export async function load() {
const {crosshair} = await import('https://cdn.jsdelivr.net/gh/Kathode-Negative/mage-testing/components/networked-raytrace-v5/crosshair.js')
crosshair()

const {dummy_gun} = await import('https://cdn.jsdelivr.net/gh/Kathode-Negative/mage-testing/components/networked-raytrace-v5/dummy-gun.js')
dummy_gun()

const {health_sync} = await import('https://cdn.jsdelivr.net/gh/Kathode-Negative/mage-testing/components/networked-raytrace-v5/health-sync.js')
health_sync()

const {simple_shooter} = await import('https://cdn.jsdelivr.net/gh/Kathode-Negative/mage-testing/components/networked-raytrace-v5/simple-shooter.js')
simple_shooter()
const {turn_to_camera} = await import('https://cdn.jsdelivr.net/gh/Kathode-Negative/mage-testing/components/networked-raytrace-v5/turn-to-camera.js')
turn_to_camera()
const {setup} = await import('https://cdn.jsdelivr.net/gh/Kathode-Negative/mage-testing/components/networked-raytrace-v5/setup.js')
setup()


const {PlayerHealth} = await import('https://cdn.jsdelivr.net/gh/Kathode-Negative/mage-testing/components/networked-raytrace-v5/main.js')
const player = new PlayerHealth()

}
