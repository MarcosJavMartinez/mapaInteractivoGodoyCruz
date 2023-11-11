import { Color, PerspectiveCamera, Scene, SphereBufferGeometry, MeshStandardMaterial, Mesh, Raycaster, Vector2, Vector3 } from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { setupLights } from './lightModule.js';
import { setupRenderer, setupCamera, render } from "./renderModule.js";
import { OBJLoader } from "https://unpkg.com/three@0.127.0/examples/jsm/loaders/OBJLoader.js";
import { currentInfoPanel, showContent, hideCurrentInfoPanel } from './infoPanelModule.js';

let renderer;
let camera;
const buttons = [];

init();
function init() {
  // RENDER
  renderer = setupRenderer();

  const scene = new Scene();
  scene.background = new Color(0x464646);
  // LUCES
  setupLights(scene, renderer);
  // CAMARA
  camera = setupCamera(renderer);
  // Renderización utilizando la función importada
  render(scene, camera, renderer);
  // CARGA ESCENA
  loadModel(scene);
}
// CARGA OBJETOS
function loadModel(scene) {
  const loader = new OBJLoader();
  loader.load('models/untitled.obj', (object) => {
    object.scale.multiplyScalar(0.1);
    object.position.y = -2;
    object.position.x = 3;
    object.position.z = -19;

    const modelMaterial = new MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0.2,
      color: 0xC8AD7F,
    });

    object.traverse(function (child) {
      if (child instanceof Mesh) {
        child.material = modelMaterial;
      }
    });

    scene.add(object);

    //MARKERS CARGAINFO
    createMarker(
      object,
      new Vector3(290, 20, 195),

      "Compañia de María",

      "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.3.jpg",

      `
      <p>Este colegio estaba ubicado originalmente en la calle Rivadavia y Sargento Cabral en terrenos donados por la Sra Olaya Pescara de Tomba. Actualmente se encuentra en Azopardo 206. Es uno de los centros educativos más antiguos del departamento de Godoy Cruz, fue la primera escuela de gestión privada de la zona. Se fundó en el año 1905 como colegio de instrucción primaria de niñas.</p>

      <p>El antiguo Colegio de la Compañía de María de Godoy Cruz, antes de ser afectado por el terremoto de 1985, tenía un terreno más extenso que el actual y distinta disposición de sus dependencias. El ingreso se realizaba por calle Rivadavia. Detrás del muro de rejas y pilastras que circundaba toda la propiedad, se visualizaba un jardín externo por el cual se accedía al colegio, la capilla y distintos ambientes.</p>
  
      <p>En el interior de la edificación, estaba organizado con galerías que se abrían a patios internos a modo de claustros donde funcionaban las aulas. En uno de estos patios internos, se encontraba la escultura del Sagrado Corazón de Jesús sobre un gran pedestal -que hoy en día se sigue apreciando en la institución-. Sobre la misma línea de la calle Rivadavia, se observaba también el ingreso a la capilla. La edificación del templo era de planta basilical con una sola nave y techo a dos aguas. Su exterior destacaba por la fachada con un gran portal de ingreso resuelto con un arco de medio punto. El conjunto remataba con un frontón triangular, ornamentado con arcos de medio punto que circundaban todo el perímetro de la construcción. Dicha capilla ya no existe en la actualidad.</p>
  
      <p><strong>Texto:</strong> María Virginia Goldar/ Andrea Segura.</p>
      <p><strong>Fuentes:</strong></p>
      <ul>
          <li>Archivo fotográfico del Colegio Compañia de María de Godoy Cruz</li>
          <li>Testimonios de personal del Colegio: Alicia Rey, Laura Deloche</li>
      </ul>
      <p><strong>Bibliografía:</strong></p>
      <ul>
          <li>Mastrangelo, F. (2016). <i>Godoy Cruz, una historia: del barrio de San Vicente a la ciudad de hoy</i>. Victorioso Ediciones.</li>
      </ul>
      <p>Más información de : 
      </p> <a href="https://museovirtual.godoycruz.gob.ar/instituciones/#maria">Compañia de maria</a></p>
      </p> <a href="https://museovirtual.godoycruz.gob.ar/personajes/#olaya">Olaya Pescara de Tomba</a></p>
      `,

      ["images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.1.jpg", "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.2.jpg"], // Exterior
      ["images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.4.jpg", "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.5.jpg"]  // Interior
    );


    createMarker(
      object,
      new Vector3(4, 15, 1.7),
      "Título 2",
      null,
      "Texto de ejemplo 2",
      "https://enlace2.com",
      ["img.ext1.jpg", "img.ext2.jpg"], // Exterior
      ["interior3.jpg"]                // Interior
    );

    createMarker(
      object,
      new Vector3(-6, 0, 4),
      "Título 3",
      null,
      "Texto de ejemplo 3",
      "https://enlace3.com",
      ["exterior5.jpg", "exterior6.jpg", "exterior7.jpg"], // Exterior
      ["interior4.jpg", "interior5.jpg"]                  // Interior
    );

     createMarker(
      object,
      //x/y/z
      new Vector3(-35, 20, 195),
      "Título 2",
      null,
      "Texto de ejemplo 2",
      "https://enlace2.com",
      ["img.ext1.jpg", "img.ext2.jpg"], // Exterior
      ["interior3.jpg"]                // Interior
    );
  });
}

//CREADOR MARKER
function createMarker(model, position, title, imageUrl, text, exteriorImages, interiorImages) {
  const sphereGeometry = new SphereBufferGeometry(1.5, 32, 32); // El primer parámetro es el radio de la esfera
  const customMaterial = new MeshStandardMaterial({
    color: 0xffff00, // Color personalizado
    opacity: 0.9,
    transparent: true,
  });

  const marker = new Mesh(sphereGeometry, customMaterial); // Usar esfera en lugar de cilindro
  marker.position.copy(position);
  marker.userData.title = title;
  marker.userData.imageUrl = imageUrl;
  marker.userData.text = text;
  marker.userData.exteriorImages = exteriorImages;
  marker.userData.interiorImages = interiorImages;
  model.add(marker);
  buttons.push(marker);
}


const raycaster = new Raycaster();
const mouse = new Vector2();

document.body.addEventListener('click', onClick);
document.body.addEventListener('touchstart', onTouchStart);

function onClick(event) {
  event.preventDefault();
  handleTouchEvent(event);
}

function onTouchStart(event) {
  event.preventDefault();
  handleTouchEvent(event.changedTouches[0]);
}

function handleTouchEvent(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(buttons);
  if (intersects.length > 0) {
    const button = intersects[0].object;
    const title = button.userData.title;
    const imageUrl = button.userData.imageUrl;
    const text = button.userData.text;
    const exteriorImages = button.userData.exteriorImages;
    const interiorImages = button.userData.interiorImages;
    if (title || imageUrl || text || (exteriorImages && interiorImages)) {
      showContent(title, imageUrl, text, exteriorImages, interiorImages, currentInfoPanel);
    }
  }
}

window.addEventListener('load', () => {
  document.body.addEventListener('click', onClick);
  document.body.addEventListener('touchstart', onTouchStart);
});

