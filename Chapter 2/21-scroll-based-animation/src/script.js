import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}
const textLoader = new THREE.TextureLoader();
const gradText = textLoader.load('textures/gradients/3.jpg')
gradText.magFilter = THREE.NearestFilter

const mat = new THREE.MeshToonMaterial({color: parameters.materialColor, gradientMap: gradText})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
// Meshes
const objDist = 4;
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), mat)
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), mat)
const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), mat)

mesh1.position.y = -objDist * 0;
mesh2.position.y = -objDist * 1;
mesh3.position.y = -objDist * 2;

mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2

scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [mesh1, mesh2, mesh3];

const dirLight = new THREE.DirectionalLight('#ff', 1);
dirLight.position.set(1,1,0);
scene.add(dirLight);

const paritcleCount = 200;
const pos = new Float32Array(paritcleCount * 3);

for (let i = 0; i < paritcleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 0] = (Math.random() - .5) * 10;
    pos[i3 + 1] = objDist * 0.5 - Math.random() * objDist * sectionMeshes.length;
    pos[i3 + 2] = (Math.random() - .5) * 10;
}
const partGeo = new THREE.BufferGeometry()
partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
const partMat = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})

const particles = new THREE.Points(partGeo, partMat);
scene.add(particles)

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        mat.color.set(parameters.materialColor)
        partMat.color.set(parameters.materialColor)
    })

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
const camGroup = new THREE.Group();
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
camGroup.add(camera)
scene.add(camGroup)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

let scrollY = window.scrollY
let currentSction = 0
window.addEventListener('scroll', (e) => {
    scrollY = window.scrollY;

    const newSection = Math.round(scrollY / sizes.height);

    if(newSection != currentSction) {
        currentSction = newSection;
        console.log('Section Changed');
        gsap.to(
            sectionMeshes[currentSction].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )
    }

})

const cursor = {
    x: 0, y: 0
}
window.addEventListener('mousemove', (e)=> {
    cursor.x = e.clientX / sizes.width - .5;
    cursor.y = e.clientY / sizes.height - .5;
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let prevTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevTime
    prevTime = elapsedTime

    //anim cam
    camera.position.y = -scrollY/ sizes.height * objDist
    const parallaxX = cursor.x * 0.5;
    const parallaxY = -cursor.y * 0.5;
    camGroup.position.x += (parallaxX - camGroup.position.x) * 5 * deltaTime;
    camGroup.position.y += (parallaxY - camGroup.position.y) * 5 * deltaTime;

    // animate mesh
    sectionMeshes.forEach(mesh => {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    });

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()