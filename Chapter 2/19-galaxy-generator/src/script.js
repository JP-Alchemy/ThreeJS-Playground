import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Galaxy
const params = {
    count: 10000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 2,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
};

let geo = null;
let mat = null;
let points = null;
const generateGalaxy = () => {
    console.log("Generating Galaxy");
    if(geo || mat || points) {
        geo.dispose();
        mat.dispose();
        scene.remove(points);
    }

    geo = new THREE.BufferGeometry();
    mat = new THREE.PointsMaterial({
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })
    const pos = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);
    const colorIn = new THREE.Color(params.insideColor);
    const colorOut = new THREE.Color(params.outsideColor);

    for (let i = 0; i < params.count; i++) {
        const i3 = i * 3;

        const rad = Math.random() * params.radius;
        const spinAngle = rad * params.spin;
        const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;

        const randX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * rad
        const randY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * rad;
        const randZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * rad;

        pos[i3] = Math.cos(branchAngle + spinAngle) * rad + randX;
        pos[i3 + 1] = randY;
        pos[i3 + 2] = Math.sin(branchAngle + spinAngle) * rad + randZ;

        const mixedColor = colorIn.clone();
        mixedColor.lerp(colorOut, rad / params.radius);
        colors[i3    ] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    points = new THREE.Points(geo, mat);
    scene.add(points)
}
generateGalaxy();

gui.add(params, 'count', 100, 100000, 100).onFinishChange(generateGalaxy);
gui.add(params, 'size', 0.001, 0.1, 0.001).onFinishChange(generateGalaxy);
gui.add(params, 'radius', 0.01, 20, 0.01).onFinishChange(generateGalaxy);
gui.add(params, 'branches', 2, 20, 1).onFinishChange(generateGalaxy);
gui.add(params, 'spin', -5, 5, 0.001).onFinishChange(generateGalaxy);
gui.add(params, 'randomness', 0, 1, 0.001).onFinishChange(generateGalaxy);
gui.add(params, 'randomnessPower', 1, 10, 0.001).onFinishChange(generateGalaxy);
gui.addColor(params, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(params, 'outsideColor').onFinishChange(generateGalaxy);

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
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()