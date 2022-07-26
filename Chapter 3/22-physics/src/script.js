import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'
/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {
    createSphere: () => {
        createSphere(Math.random(), { x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3 })
    },
    createBox: () => {
        createBox(Math.random(), Math.random(), Math.random(), { x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3 })
    },
    reset: ()=> {
        for(const obj of objectsToUpdate) {
            obj.body.removeEventListener('collide', playHitSound)
            world.removeBody(obj.body)
            scene.remove(obj.mesh)
        }
        objectsToUpdate = [];
    }
}
gui.add(debugObject, 'createSphere')
gui.add(debugObject, 'createBox')
gui.add(debugObject, 'reset')
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const hitSound = new Audio('/sounds/hit.mp3')
const playHitSound = (collision) => {
    if(collision.contact.getImpactVelocityAlongNormal() <= 1.5) return;
    hitSound.volume = Math.random();
    hitSound.currentTime = 0;
    hitSound.play();
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])



const defualtMat = new CANNON.Material('defualt')

const defulatContactMat = new CANNON.ContactMaterial(
    defualtMat, defualtMat,
    {
        friction: 0.1,
        restitution: 0.7
    }
)

// PHYSICS
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.addContactMaterial(defulatContactMat);
world.defaultContactMaterial = defulatContactMat;

world.gravity.set(0, -9.82, 0)
// const sphereShape = new CANNON.Sphere(0.5)
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0, 3, 0),
//     shape: sphereShape,
// })
// sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0,0,0))
// world.add(sphereBody);



/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture,
//         envMapIntensity: 0.5
//     })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape,
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
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
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const objectsToUpdate = [];

const sphereGeo = new THREE.SphereBufferGeometry(1, 20, 20)
const sphereMat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.3, envMap: environmentMapTexture })
// Utils
const createSphere = (rad, pos) => {
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.scale.set(rad, rad, rad)
    mesh.castShadow = true;
    mesh.position.copy(pos);
    scene.add(mesh);

    const shape = new CANNON.Sphere(rad)
    const body = new CANNON.Body({
        mass: 1, position: new CANNON.Vec3(0, 3, 0),
        shape: shape, material: defualtMat
    });
    body.position.copy(pos)
    body.addEventListener('collide', playHitSound);

    world.addBody(body)

    objectsToUpdate.push({ mesh, body });
}
createSphere(0.5, { x: 0, y: 3, z: 0 });

const boxGeo = new THREE.BoxBufferGeometry(1, 1, 1)
const createBox = (w, h, d, pos) => {
    const mesh = new THREE.Mesh(boxGeo, sphereMat);
    mesh.scale.set(w, h, d)
    mesh.castShadow = true;
    mesh.position.copy(pos);
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(w * .5, h * .5, d * .5))
    const body = new CANNON.Body({
        mass: 1, position: new CANNON.Vec3(0, 3, 0),
        shape: shape, material: defualtMat
    });
    body.position.copy(pos)

    body.addEventListener('collide', playHitSound);
    world.addBody(body)

    objectsToUpdate.push({ mesh, body });
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let currentTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - currentTime;
    currentTime = elapsedTime;

    // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)

    world.step(1 / 60, deltaTime, 3)

    objectsToUpdate.forEach(obj => {
        obj.mesh.position.copy(obj.body.position)
        obj.mesh.quaternion.copy(obj.body.quaternion)
    });

    // sphere.position.copy(sphereBody.position)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()