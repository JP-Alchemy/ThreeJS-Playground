import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObj = {
    envMapIntensity: 2.5
}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/hamburger.glb', (gltf) => {
    gltf.scene.scale.set(0.3,0.3,0.3)
    gltf.scene.position.set(0, -4, 0)
    gltf.scene.rotation.y = Math.PI * 0.5
    scene.add(gltf.scene);

    gui.add(gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.001).name('Rotation');

    updateAllMaterials()
})

const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = debugObj.envMapIntensity
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
}
gui.add(debugObj, 'envMapIntensity',0,10,0.001).onChange(updateAllMaterials)

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])
environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap
/**
 * Test sphere
 */
const testSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial()
)
scene.add(testSphere)

const dirLight = new THREE.DirectionalLight('#FFFFFF', 3)
dirLight.castShadow = true;
dirLight.position.set(0.25, 3, -2.25)
dirLight.shadow.camera.far = 15
dirLight.shadow.mapSize.set(1024, 1024)
dirLight.shadow.normalBias = 0.05
scene.add(dirLight)

const dirLightCamHelper = new THREE.CameraHelper(dirLight.shadow.camera)
scene.add(dirLightCamHelper)

gui.add(dirLight, 'intensity', 0, 10, 0.001);
gui.add(dirLight.position, 'x', -5, 5, 0.001);
gui.add(dirLight.position, 'y', -5, 5, 0.001);
gui.add(dirLight.position, 'z', -5, 5, 0.001);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, - 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACES: THREE.ACESFilmicToneMapping,
})
gui.add(renderer, 'toneMappingExposure', 0, 10, 0.001)
/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()