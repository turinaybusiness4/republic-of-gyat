import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const listener = new THREE.AudioListener();

// Create a Global Audio Object
const sound = new THREE.Audio(listener);

// Load the Audio File
const audioLoader = new THREE.AudioLoader();
audioLoader.load("fart.mp3", (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(false); // Set to true if you want the audio to loop
  sound.setVolume(0.5); // Set the volume (0.0 to 1.0)
});

// Handle Screen Tap
const handleTap = () => {
  if (!sound.isPlaying) {
    sound.play(); // Play the audio
  } else {
    sound.pause(); // Pause the audio
  }
};

// Add Event Listeners for Click and Touch
window.addEventListener("click", handleTap);
window.addEventListener("touchstart", handleTap);
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();

let mixer = null;

gltfLoader.load("/models/flag.glb", (gltf) => {
  gltf.scene.scale.set(1.5, 1.5, 1.5);

  scene.add(gltf.scene);

  // Animation
  mixer = new THREE.AnimationMixer(gltf.scene);
  mixer.timeScale = 0.4;
  const action = mixer.clipAction(gltf.animations[0]);
  action.play();
});

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(0, 5, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(-0.5, 4.25, 2.5);
scene.add(camera);
camera.add(listener);
// Controls
// const controls = new OrbitControls(camera, canvas);
// // controls.target.set(0, 0.75, 0);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x232323);
/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Model animation
  if (mixer) {
    mixer.update(deltaTime);
  }

  // Update controls
  //   controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
