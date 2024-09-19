import * as tjs from 'three';
import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { KeyDisplay } from './controlUtil';
import { CharacterControls } from './tppControls';

//URL Setup
const hdri = new URL('./public/hdri/kloppenheim_02_4k.hdr', import.meta.url);
const islandURL = new URL('./public/models/garden.glb', import.meta.url);
const characterURL = new URL('./public/models/remy.glb', import.meta.url);

//WebGL Renderer Setup
const renderer = new tjs.WebGLRenderer( { antialias: true } );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = tjs.AgXToneMapping; //AGX Tone Mapping
renderer.toneMappingExposure = 1.0;
renderer.outputEncoding = tjs.sRGBEncoding;

//Camera + Control Setup
//Near & Far Values here determine the starting & ending points of view distance, heavily affects performance.
const camera = new tjs.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    300
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 5;
controls.maxDistance = 15;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.update();

camera.position.set(8, 5, 3);

const raycaster = new tjs.Raycaster();
let islandCenterTop;

var characterControls;
var character;
new GLTFLoader()
    .load(characterURL.href, function (gltf) {
        character = gltf.scene;
        character.traverse(function (object) {
            if (object.isMesh){
                object.receiveShadow = true;
                object.castShadow = true;
            }
        });
        scene.add(character);

        const gltfAnimations = gltf.animations;
        const mixer = new tjs.AnimationMixer(character);
        const animationsMap = new Map();
        gltfAnimations.filter(a => a.name != 'TPose').forEach((a) => {
            animationsMap.set(a.name, mixer.clipAction(a));
        });

        characterControls = new CharacterControls(character, mixer, animationsMap, controls, camera,  'Idle');
    });

const keysPressed = {  };
const keyDisplayQueue = new KeyDisplay();
document.addEventListener('keydown', (event) => {
    keyDisplayQueue.down(event.key);
    if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle();
    } else {
        (keysPressed)[event.key.toLowerCase()] = true;
    }
}, false);
document.addEventListener('keyup', (event) => {
    keyDisplayQueue.up(event.key);
    (keysPressed)[event.key.toLowerCase()] = false;
}, false);

//Loading Screen Setup
const loadingManager = new tjs.LoadingManager();

loadingManager.onStart = function(url, item, total){
    console.log(`Started Loading: ${url}`);
}

const progressBar = document.getElementById('progress-bar');

loadingManager.onProgress = function(url, loaded, total){
    console.log(`Loading: ${url}`);
    progressBar.value = (loaded / total) * 100;
}

const loadingProgressBar = document.querySelector('.loading-progress-bar');

loadingManager.onLoad = function(){
    console.log(`Finished Loading!`);
    loadingProgressBar.style.display = 'none';
}

loadingManager.onError = function(url){
    console.error(`Error loading: ${url}`);
}

/**
 * Scene Setup
 */
const scene = new tjs.Scene();
const gltfLoader= new GLTFLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);
let island;

scene.fog = new tjs.FogExp2(0xBCC8CC, 0.01); // Squared Exponential Fog

rgbeLoader
    .load(hdri.href, function(texture){
        texture.mapping = tjs.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;

        render();
        //GLTF Models
        gltfLoader
            .load(islandURL.href, function(gltf){
                island = gltf.scene;
                gltf.scene.scale.setScalar(1.5);
                island.traverse(function (object) {
                        if (object.isMesh) {
                            object.receiveShadow = true;
                            object.castShadow = true;
                        }
                  });

                const boundingBox = new tjs.Box3().setFromObject(island);
                islandCenterTop = new tjs.Vector3();
                boundingBox.getCenter(islandCenterTop);
                islandCenterTop.y = boundingBox.max.y;

                scene.add(island);
                render();
            }, undefined, function(err){
                console.error('Error loading the island model:', err);
            });
    });

const axes = new tjs.AxesHelper();
scene.add(axes);

const grid = new tjs.GridHelper(20);
scene.add(grid);

const boxGeo = new tjs.BoxGeometry(2, 2, 2);
const boxMat = new tjs.MeshPhysicalMaterial({
    metalness: 1,
    roughness: 0.05
});
const box = new tjs.Mesh(boxGeo, boxMat);
scene.add(box);
box.position.set(8, 8, 3);

// const groundGeo = new tjs.PlaneGeometry(200, 200, 10, 10);
// const groundMat = new tjs.MeshPhysicalMaterial({
//     side: tjs.DoubleSide
// });
// const ground = new tjs.Mesh(groundGeo, groundMat);
// ground.rotateX(Math.PI / 2);
// scene.add(ground);

/*
// World / Physics Setup
*/


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
const clock = new tjs.Clock();
let currentTime;

function animate(){
    currentTime = clock.getDelta();

    if(characterControls){
        characterControls.update(currentTime, keysPressed, raycaster, island);
    }

    render();
    stats.update();
    controls.update(currentTime);
}

renderer.setAnimationLoop(animate);

//Window Resizing Function
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});