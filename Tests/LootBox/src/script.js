import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'
import lootVertexShader from './shaders/lootmachine/vertex.glsl'
import lootFragmentShader from './shaders/lootmachine/fragment.glsl'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

/**
 * Base
 */
// Debug
const debugObject = {}
// const gui = new dat.GUI({
//     width: 400
// })
debugObject.clearColor = '#0a0a0a'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const objectsToTest = [];

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
const bakedTexture = textureLoader.load('/models/Baked.jpg');
const clickTexture = textureLoader.load('/images/click.png');
const alphaMapTexture = textureLoader.load('/images/alphaMap.jpg');
bakedTexture.encoding = THREE.sRGBEncoding;
bakedTexture.flipY = false;

const bakedMaterial = new THREE.MeshStandardMaterial({ map: bakedTexture });
const topMaterial = new THREE.MeshStandardMaterial({ color: 0x16191e, roughness: 0.35, metalness: 0.89 });
const clickMaterial = new THREE.MeshStandardMaterial({map: clickTexture, transparent: true});
const clickDecal = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.15, 0.15), clickMaterial)
/**
 * Lights
 */
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);
const spotLight = new THREE.SpotLight(0xd6ffff, 3);
spotLight.position.z = spotLight.position.z + 4;
spotLight.position.y = spotLight.position.y + 0.2;
spotLight.penumbra = 0.1;
spotLight.decay = 2;
spotLight.angle = Math.PI * 0.2;
spotLight.distance = 3;
scene.add(spotLight);

const lootMachineGroup = new THREE.Group();
const particlesGeo = new THREE.BufferGeometry();
const particlesMat = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    transparent: true,
    uniforms:
    {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 30.0 },
        uLootLid: { value: null }
    },
    vertexShader: lootVertexShader,
    fragmentShader: lootFragmentShader
});
let particlesPoints = null;
debugObject.particleSpeed = 0.0;
let spawnPos = new THREE.Vector3();

const placeholderMat = new THREE.MeshStandardMaterial({ color: 0xff00ea, emissive: 0xff0Fea, emissiveIntensity: 0.25, flatShading: true, roughness: 0.5, metalness: 1, alphaMap: alphaMapTexture, alphaTest: 1});
let winningPlaceholder;

const emmisiveMaterial = new THREE.MeshStandardMaterial({ color: 0xffa50a, emissive: 0xffa50a, emissiveIntensity: 5 });
const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0x880000, emissive: 0xff0000, emissiveIntensity: 0 });

const fontLoader = new FontLoader();
let digitalFont;
let fontMesh;
let fontGeometry;
fontLoader.load('/fonts/led/led.json', (font) => {
    digitalFont = font;
    CreateCounterText(`02`);
});

const CreateCounterText = (input) => {
    if(fontGeometry) {
        fontGeometry.dispose();
        lootMachineGroup.remove(fontGeometry);
    }
    if(fontMesh) lootMachineGroup.remove(fontMesh);

    fontGeometry = new TextGeometry(input, {
        font: digitalFont,
        size: 0.25,
        height: 0,
    });
    
    fontGeometry.center();
    fontMesh = new THREE.Mesh(fontGeometry, emmisiveMaterial);
    fontMesh.position.y = fontMesh.position.y + 0.05;
    fontMesh.rotateX(-Math.PI * 0.5);
    lootMachineGroup.add(fontMesh);
};

gltfLoader.load('/models/Gemstone.glb', (gltf) => {
    gltf.scene.traverse((child) => {
        child.material = placeholderMat
    })

    winningPlaceholder = gltf.scene;
    spotLight.target = winningPlaceholder;
    scene.add(winningPlaceholder);
});

gltfLoader.load('/models/LootBox.glb', (gltf) => {
    gltf.scene.traverse((child) => {
        child.material = bakedMaterial
    })

    const topMesh = gltf.scene.children.find((child) => child.name === 'Top')
    particlesMat.uniforms.uLootLid.value = lootMachineGroup.position;
    const topEmiisiveMesh = gltf.scene.children.find((child) => child.name === 'Top_Emmisive');
    topEmiisiveMesh.material = emmisiveMaterial;
    const bottomMesh = gltf.scene.children.find((child) => child.name === 'Bottom');
    const buttonMesh = gltf.scene.children.find((child) => child.name === 'Button');
    buttonMesh.material = buttonMaterial;
    clickDecal.rotation.set(buttonMesh.rotation.x, buttonMesh.rotation.y, buttonMesh.rotation.z);
    clickDecal.position.set(buttonMesh.position.x, buttonMesh.position.y+0.038, buttonMesh.position.z);
    clickDecal.rotateX(-Math.PI * 0.5);
    buttonMesh.add(clickDecal);
    scene.add(clickDecal);

    topMesh.material = topMaterial;
    lootMachineGroup.position.set(topMesh.position.x, topMesh.position.y, topMesh.position.z);
    spawnPos.set(topMesh.position.x, topMesh.position.y + 1.01, topMesh.position.z);

    topMesh.position.set(0, 0, 0);
    topEmiisiveMesh.position.set(0, 0, 0);
    lootMachineGroup.add(topMesh, topEmiisiveMesh);

    const spotLight = new THREE.SpotLight(0xffa50a, 100);
    spotLight.penumbra = 1;
    spotLight.position.set(0, 0, 0)
    spotLight.target = bottomMesh;
    lootMachineGroup.add(spotLight);

    const count = 20000;
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    let angle = 0
    const step = (2 * Math.PI) / count;
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 0] = Math.cos(angle) * 0.52;
        positions[i3 + 1] = Math.random() * 2.1;
        positions[i3 + 2] = Math.sin(angle) * 0.52;

        colors[i3 + 0] = Math.random();
        colors[i3 + 1] = Math.random();
        colors[i3 + 2] = Math.random();
        angle += step;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    // POints
    particlesPoints = new THREE.Points(particlesGeo, particlesMat);
    particlesPoints.position.set(lootMachineGroup.position.x, lootMachineGroup.position.y, lootMachineGroup.position.z);
    scene.add(particlesPoints);

    scene.add(gltf.scene);
    scene.add(lootMachineGroup);
    objectsToTest.push(...lootMachineGroup.children);
    objectsToTest.push(buttonMesh);
    console.log(objectsToTest);
});
let isClaiming = false;
debugObject.claim = () => {
    if(isClaiming) return;
    isClaiming = true;
    CreateCounterText(`01`);
    winningPlaceholder.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
    winningPlaceholder.scale.set(0, 0, 0);

    gsap.to(lootMachineGroup.position, {
        duration: 1, y: lootMachineGroup.position.y + 2.1, onComplete: () => {
            gsap.to(winningPlaceholder.scale, {
                duration: 3, x: 0.5, y: 0.5, z: 0.5, onComplete: () => {
                    gsap.to(winningPlaceholder.position, { duration: 1, z: winningPlaceholder.position.z + 2, onComplete: () => debugObject.lower() });
                }
            });
            gsap.fromTo(placeholderMat, { alphaTest: 1 }, { duration: 3, alphaTest: 0 });
        }
    });
    gsap.to(debugObject, {
        duration: 2, particleSpeed: 10.0, onComplete: () => {
            gsap.to(debugObject, { duration: 1, particleSpeed: 1.0 });
        }
    });
};
debugObject.lower = () => {
    gsap.to(lootMachineGroup.position, { duration: 1, y: lootMachineGroup.position.y - 2.1, onComplete: () => (isClaiming=false) });
    gsap.to(debugObject, { duration: 1, particleSpeed: 0.0 });
};

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
    particlesMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 1.63, 4.75);
camera.rotation.set(-0.1, 0, 0);
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setClearColor(debugObject.clearColor)

/**
 * Animate
 */
const clock = new THREE.Clock()

const shakeAmount = 0.1;
const originalPos = camera.position.clone();
const originalRos = camera.rotation.clone();

const getRandomPosition = () => {
    const randomVec = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5));
    const newPos = randomVec.multiplyScalar(shakeAmount).add(originalPos);
    return newPos;
}
const getRandomRotation = () => {
    const randomVec = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5));
    const newPos = randomVec.multiplyScalar(0.025).add(originalRos);
    return newPos;
}

const handheldShakePosition = () => {
    const nPos = getRandomPosition();
    gsap.to(camera.position, {
        duration: 1 + Math.random() * 10, x: nPos.x, y: nPos.y, z: nPos.z, ease: "sine.inOut", onComplete: (args) => {
            handheldShakePosition();
        }
    });
}
const handheldShakeRotation = () => {
    const nPos = getRandomRotation();
    gsap.to(camera.rotation, {
        duration: 1 + Math.random() * 10, x: nPos.x, y: nPos.y, z: nPos.z, ease: "sine.inOut", onComplete: (args) => {
            handheldShakeRotation();
        }
    });
}
handheldShakePosition();
handheldShakeRotation();

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentIntersect = false;
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / sizes.width * 2 - 1;
    mouse.y = -(e.clientY / sizes.height) * 2 + 1;
});
window.addEventListener('click', (e) => {
    if (currentIntersect) {
        debugObject.claim();
    }
});

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    if (particlesPoints) particlesPoints.rotation.y = elapsedTime * debugObject.particleSpeed;
    particlesMat.uniforms.uLootLid.value = lootMachineGroup.position;
    particlesMat.uniforms.uTime.value = elapsedTime;
    if(winningPlaceholder) {
        winningPlaceholder.rotation.y = elapsedTime * 0.5;
    }

    // Render
    renderer.render(scene, camera);
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objectsToTest)
    currentIntersect = intersects.length > 0;

    if (currentIntersect) {
        document.body.style.cursor = 'pointer';
        emmisiveMaterial.color = new THREE.Color(0x00FF0a);
        emmisiveMaterial.emissive = new THREE.Color(0x00FF0a);
        buttonMaterial.emissiveIntensity = 2;
    } else {
        document.body.style.cursor = '';
        emmisiveMaterial.color = new THREE.Color(0xffa50a);
        emmisiveMaterial.emissive = new THREE.Color(0xffa50a);
        buttonMaterial.emissiveIntensity = 0;
    }

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()