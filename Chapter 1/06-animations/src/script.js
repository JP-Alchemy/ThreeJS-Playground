import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

gsap.to(mesh.position, {x: 2, duration: 1, delay: 1})
gsap.to(mesh.position, {x: -2, duration: 1, delay: 2})

const clock = new THREE.Clock();
function tick() {
    const elapTime = clock.getElapsedTime();

    // update object
    // mesh.rotation.y = elapTime * Math.PI;
    // mesh.position.y = Math.sin(elapTime);
    // camera.position.x = Math.cos(elapTime);
    // camera.lookAt(mesh.position);

    // Render
    renderer.render(scene, camera);

    // Call a function on next frame
    window.requestAnimationFrame(tick)
}
tick();