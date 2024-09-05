import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 3js Setup / Boilerplate code
// Basic Parameters
let renderer, camera, scene, orbit;

init();

function init(){
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // IBL Setup (To be implemented)

    orbit = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 2, 6);
    orbit.update();
    window.addEventListener('resize', onWindowResize);
}

// Rendering Setup
function render(){
    renderer.render(scene, camera);
}

// Defining the animation loop.
function animate(time){
    render();
}

// Finally, rendering the scene after adding all elements to it.
renderer.setAnimationLoop(animate);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
