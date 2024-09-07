import * as tjs from 'three';
import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

//Setting up URLs
const test = new URL('./public/models/test.glb', import.meta.url);

//Basic Setup / Boilerplate Code
let renderer, camera, scene, controls, gui, stats;

init();
render();

async function init() {
    //Camera & Scene Setup
    camera = new tjs.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, -2, 6);
    scene = new tjs.Scene();

    //GUI Setup with Parameters
    let conf = {
        exposure: 1.0
    };
    gui = new GUI();
    gui.add(conf, 'exposure'.name('Exposure'));
    gui.open();

    stats = new Stats();
    document.body.appendChild(stats.dom);

    //Image Based Lighting (IBL) Setup
    new RGBELoader()
        .setPath('../assets/hdri/')
        .load('Acannon_8k.exr', function(texture){
            texture.mapping = tjs.EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;

            render();
            //Loading Models
            const grid = new tjs.GridHelper();
            scene.add(grid);

            const boxGeometry = new tjs.BoxGeometry();
            const boxMaterial = new tjs.MeshPhysicalMaterial({
                color: 0x0FFD700,
                metalness: 1.0,
                roughness: 0.2 
            });
            const box = new tjs.Mesh(boxGeometry, boxMaterial);
            box.position.set(8, 8, 0);
            scene.add(box);

            const sled = new GLTFLoader();
            sled.load(test.href, function(gltf){
                const model = gltf.scene;
                scene.add(model);
                model.scale = 0.1;
            }, undefined, function(err){
                console.error(err);
            });
        });

    //Renderer Initialisation
    renderer = new tjs.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.toneMapping = tjs.AgXToneMapping;
    renderer.exposure = 1.0;
    document.body.appendChild(renderer.domElement);

    //Control Setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.update();

    window.addEventListener('resize', onWindowResize);
}

//Animation Loop
function animate(){
    render();
}

//Window Resize Function
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}

//Rendering & Post Processing Setup
function render(){
    renderer.render(scene, camera);
}