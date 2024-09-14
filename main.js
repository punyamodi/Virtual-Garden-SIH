import * as tjs from 'three';
import { GUI } from 'lil-gui';
import { FirstPersonControls } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as cannon from 'cannon-es';

//URL Setup
const hdri = new URL('./public/hdri/kloppenheim_02_4k.hdr', import.meta.url);
const testModel = new URL('./public/models/test.glb', import.meta.url);

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

const controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 12;
controls.lookSpeed = 0.08;

camera.position.set(8, 5, 3);

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

scene.fog = new tjs.FogExp2(0xBCC8CC, 0.01); // Squared Exponential Fog

rgbeLoader
    .load(hdri.href, function(texture){
        texture.mapping = tjs.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;

        render();
        //GLTF Models
        gltfLoader
            .load(testModel.href, function(gltf){
                gltf.scene.scale.setScalar(0.05);
                scene.add(gltf.scene);
                render();
            }, undefined, function(err){
                console.error(err);
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

const groundGeo = new tjs.PlaneGeometry(200, 200, 10, 10);
const groundMat = new tjs.MeshPhysicalMaterial({
    side: tjs.DoubleSide
});
const ground = new tjs.Mesh(groundGeo, groundMat);
scene.add(ground);

/*
// World / Physics Setup
*/

const world = new cannon.World({
    gravity: new cannon.Vec3(0, -9.80665, 0)
});

const timeStep = 1 / 60;

const groundBody = new cannon.Body({
    shape: new cannon.Plane(),
    mass: 10,
    type: cannon.Body.STATIC
});
world.addBody(groundBody);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

const boxBody = new cannon.Body({
    mass: 2,
    shape: new cannon.Box(new cannon.Vec3(2, 2, 2)),
    position: new cannon.Vec3(1, 20, 0)
});
world.addBody(boxBody);

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

function animate(){
    world.step(timeStep);

    ground.position.copy(groundBody.position);
    ground.quaternion.copy(groundBody.quaternion);

    box.position.copy(boxBody.position);
    box.quaternion.copy(boxBody.quaternion);

    render();
    stats.update();
    controls.update(clock.getDelta());
}

renderer.setAnimationLoop(animate);

//Window Resizing Function
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});