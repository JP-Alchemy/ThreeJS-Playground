import './style.css'
import * as THREE from 'three';

const scene = new THREE.Scene();

const geometery = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({color: 0xff0000});
const mesh = new THREE.Mesh(geometery, material);
scene.add(mesh);

// Size
const size = {
    width: 800,
    height: 600
};

// Camera
const camera = new THREE.PerspectiveCamera(75, size.width / size.height);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl')
});
renderer.setSize(size.width, size.height);
renderer.render(scene, camera);