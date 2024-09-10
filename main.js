import * as tjs from 'three';
import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

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
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(6, 8, 14);
orbit.update();

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

const boxGeo = new tjs.BoxGeometry();
const boxMat = new tjs.MeshPhysicalMaterial({
    metalness: 1,
    roughness: 0.05
});
const box = new tjs.Mesh(boxGeo, boxMat);
scene.add(box);
box.position.set(8, 8, 3);

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