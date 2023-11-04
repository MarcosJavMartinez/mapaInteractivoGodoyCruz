import {
  Color,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  sRGBEncoding,
  SphereBufferGeometry,
  Scene,
  WebGLRenderer,
  Raycaster,
  Vector2,
  Vector3,
  SpotLight,
  AmbientLight,
} from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://unpkg.com/three@0.127.0/examples/jsm/loaders/OBJLoader.js";


let renderer;
let camera;
const buttons = [];
let currentInfoPanel = null;
const exteriorImages = ["exterior1.jpg", "exterior2.jpg", "exterior3.jpg"];
const interiorImages = ["interior1.jpg", "interior2.jpg", "interior3.jpg"];


init();




function init() {
//RENDER
  renderer = new WebGLRenderer();
  renderer.outputEncoding = sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const scene = new Scene();
  scene.background = new Color(0x464646);

  //LUCES

  // Luz Ambiental
  const ambientLight = new AmbientLight(0x999998);
  scene.add(ambientLight);

  // Luz Spotlight
  const spotlight = new SpotLight(0xffffff);
  spotlight.position.set(-5, 4, 1);
  spotlight.castShadow = true;
  spotlight.distance = 30;
  spotlight.angle = Math.PI / 0.8;
  spotlight.penumbra = 0.8; // Sombras suaves
  spotlight.target.position.copy(new Vector3(-1, -6, 0));
  spotlight.intensity = 1;

  spotlight.shadow.mapSize.width = 2048;
  spotlight.shadow.mapSize.height = 2048;
  spotlight.shadow.bias = -0.001;
  spotlight.shadow.camera.near = 1;
  spotlight.shadow.camera.far = 200;
  renderer.shadowMap.enabled = true;
  scene.add(spotlight);

  // Spotlight representación Visible
  const spotlightGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const spotlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const spotlightMesh = new THREE.Mesh(spotlightGeometry, spotlightMaterial);
  spotlightMesh.position.copy(spotlight.position);
  scene.add(spotlightMesh);

  //CAMARA
  camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000000);
  camera.position.set(0, 0, 3);
  const controls = new OrbitControls(camera, renderer.domElement);
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

 //CARGA ESCENA
  loadModel(scene);
}





//CARGA OBJETOS
function loadModel(scene) {

  const loader = new OBJLoader();
  loader.load('models/18.1.Compañiademaria.obj', (object) => {
    object.scale.multiplyScalar(0.1);
    object.position.y = -1;
    object.position.x = -6;

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
      new Vector3(60.5, 18, -11.3),

      "Compañia de María",

      "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.3.jpg",

      `
      <p>Con su tradicional sede de calle Rivadavia y Sargento Cabral, en la actualidad ubicado en Azopardo 206, es uno de los centros educativos más antiguos del departamento de Godoy Cruz, fue la primera escuela de gestión privada de la zona. Se fundó en el año 1905 como colegio de instrucción primaria de niñas. Los terrenos donde se asentó la institución fueron donados por la señora Olaya Pescara de Tomba.</p>

      <p>El antiguo Colegio de la Compañía de María de Godoy Cruz, antes de ser afectado por el terremoto de 1985, tenía un terreno más extenso que el actual y distinta disposición de sus dependencias. El ingreso a la institución se realizaba por calle Rivadavia. Detrás del muro de rejas y pilastras que circundaba toda la propiedad, se visualizaba un jardín externo desde donde se accedía al colegio, la capilla y distintos ambientes.</p>
  
      <p>En el interior de la edificación, se hallaban galerías que se abrían a patios internos a modo de claustro, aquí funcionaban las aulas. En uno de estos patios internos, se encontraba la escultura del Sagrado Corazón de Jesús sobre un gran pedestal -que hoy en día se sigue apreciando en la institución-. Sobre la misma línea de la calle Rivadavia, se observaba también el ingreso a la capilla. La edificación era de planta basilical con una sola nave y techo a dos aguas. Su exterior destacaba por la fachada con un gran portal de ingreso, resuelto por un arco de medio punto. El conjunto remataba con un frontón triangular, ornamentado con arcos de medio punto, que circundaban todo el perímetro de la construcción.</p>
  
      <p>Texto: María Virginia Goldar/ Andrea Segura.</p>
      <p>Fuentes:</p>
      <ul>
          <li>Archivo fotográfico del Colegio Compañia de María de Godoy Cruz</li>
          <li>Testimonios de personal del Colegio: Alicia Rey, Laura Deloche</li>
      </ul>
      <p>Bibliografía:</p>
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
      new Vector3(4, 25, 1.7),
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



function onClick(event) {
  event.preventDefault();
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
      showContent(title, imageUrl, text, exteriorImages, interiorImages);
    }
  }
}




function showContent(title, imageUrl, text, exteriorImages, interiorImages) {
  hideCurrentInfoPanel();

  const panel = document.createElement("div");
  panel.className = "info-panel";

  const closeButton = document.createElement("button");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", hideCurrentInfoPanel);
  panel.appendChild(closeButton);

  if (title) {
    const titleElement = document.createElement("h2");
    titleElement.textContent = title;
    panel.appendChild(titleElement);
  }

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    panel.appendChild(image);
  }

  if (text) {
    const textElement = document.createElement("div");
    textElement.innerHTML = text; // Usar innerHTML para interpretar HTML
    panel.appendChild(textElement);
  
    
  const Link = textElement.querySelector('a');
  if (Link) {
    Link.addEventListener("click", (e) => {
     e.preventDefault();
    window.open(Link.href, "_blank");
   });
   }
  }



  if (exteriorImages && exteriorImages.length > 0) {
    const exteriorGallery = document.createElement("div");
    exteriorGallery.className = "image-gallery";
    for (const imageUrl of exteriorImages) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.addEventListener("click", () => {
        const zoomedWindow = window.open(imageUrl, "Zoomed Image", "width=800, height=600");
        if (zoomedWindow) {
          zoomedWindow.focus();
        } else {
          alert("Tu navegador ha bloqueado la ventana emergente. Por favor, permite ventanas emergentes para ver la imagen ampliada.");
        }
      });
      exteriorGallery.appendChild(image);
    }
    panel.appendChild(exteriorGallery);
  }



  if (interiorImages && interiorImages.length > 0) {
    const interiorGallery = document.createElement("div");
    interiorGallery.className = "image-gallery";
    for (const imageUrl of interiorImages) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.addEventListener("click", () => {
        const zoomedWindow = window.open(imageUrl, "Zoomed Image", "width=800, height=600");
        if (zoomedWindow) {
          zoomedWindow.focus();
        } else {
          alert("Tu navegador ha bloqueado la ventana emergente. Por favor, permite ventanas emergentes para ver la imagen ampliada.");
        }
      });
      interiorGallery.appendChild(image);
    }
    panel.appendChild(interiorGallery);
  }

  document.body.appendChild(panel);
  currentInfoPanel = panel;
}

function hideCurrentInfoPanel() {
  if (currentInfoPanel) {
    document.body.removeChild(currentInfoPanel);
    currentInfoPanel = null;
  }
}

