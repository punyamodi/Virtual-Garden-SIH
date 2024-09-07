import * as tjs from 'three';
import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

//WebGL Renderer Setup
const renderer = new tjs.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = tjs.AgXToneMapping; //AGX Tone Mapping
renderer.toneMappingExposure = 1.0;

//Camera + Control Setup
//Near & Far Values here determine the starting & ending points of view distance, heavily affects performance.
const camera = new tjs.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(6, 8, 14);
orbit.update();

/**
 * Scene Setup
 */
const scene = new tjs.Scene();

new RGBELoader()
    .setPath('./public/hdri/')
    .load('kloppenheim_02_4k.hdr', function(texture){
        texture.mapping = tjs.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;

        render();
    });

const axes = new tjs.AxesHelper();
scene.add(axes);

const grid = new tjs.GridHelper(20);
scene.add(grid);



//GUI Setup
const params = {
    "bgcol": 0xfefefe
};

const gui = new GUI();
gui.open();

const stats = new Stats();
document.body.appendChild(stats.dom);

//Rendering Setup
function render(){
    renderer.render(scene, camera);
}

//Animation Loop
function animate(){
    render();
    stats.update();
}

renderer.setAnimationLoop(animate);

//Window Resizing Function
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});