import * as tjs from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import * as dat from 'dat.gui';

//3js Setup / Boilerplate code
const renderer = new tjs.WebGLRenderer();

renderer.shadowMap.enabled = true;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new tjs.Scene();
const camera = new tjs.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

//Setting up the basic scene
const axes = new tjs.AxesHelper(5);
scene.add(axes);

camera.position.set(0, 2, 6);
orbit.update();

//Setting up various 3D objects present in the scene.
//Lights
const ambi = new tjs.AmbientLight(0xFFDF22);
scene.add(ambi);

const lamp = new tjs.DirectionalLight(0xFFFFFF, 0.8);
scene.add(lamp);
lamp.position.set(0, 6, 0);
// lamp.shadow.camera.bottom(-12);

const lampHelper = new tjs.DirectionalLightHelper(lamp);
scene.add(lampHelper);

const spotLight = new tjs.SpotLight(0xFFFFFF);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;

//Meshes
const boxgeo = new tjs.BoxGeometry();
const boxmat = new tjs.MeshBasicMaterial({color: 0x00FF00});
const box = new tjs.Mesh(boxgeo, boxmat);
scene.add(box);
box.position.set(-4, 0, 0);

const planegeo = new tjs.PlaneGeometry(20, 20);
const planemat = new tjs.MeshStandardMaterial({
    color: 0x000080,
    side: tjs.DoubleSide
});
const plane = new tjs.Mesh(planegeo, planemat);
scene.add(plane);
plane.receiveShadow = true;
plane.rotation.x = -0.5 * Math.PI;

const spheregeo = new tjs.SphereGeometry(3, 50, 50);
const spheremat = new tjs.MeshStandardMaterial({
    color: 0x252500
});
const sphere = new tjs.Mesh(spheregeo, spheremat);
scene.add(sphere);
sphere.castShadow = true;

const grid = new tjs.GridHelper(20);
scene.add(grid);

//Setting up the GUI and it's various options.
const gui = new dat.GUI();
let step = 0;

const options = {
    sphereColor: '#252500',
    boxColor: '#000080',
    animationSpeed: '0.01'
};

gui.addColor(options, 'sphereColor').onChange(function(e){
    sphere.material.color.set(e);
});

gui.addColor(options, 'boxColor').onChange(function(e){
    box.material.color.set(e);
});

gui.add(options, 'animationSpeed', 0, 0.2);

//Defining the animation loop.
function animate(time){
    sphere.rotation.x+= 0.005;
    sphere.rotation.y+= 0.005;
    sphere.rotation.z+= 0.005;

    step+= options.animationSpeed;
    sphere.position.y = 10 * Math.abs(Math.sin(step));

    renderer.render(scene, camera);
}

//Finally, rendering the scene after adding all elements to it.
renderer.setAnimationLoop(animate);