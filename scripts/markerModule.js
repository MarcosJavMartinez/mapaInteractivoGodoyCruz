import { SphereBufferGeometry, MeshStandardMaterial, Mesh, Vector3 } from "https://unpkg.com/three@0.127.0/build/three.module.js";

let buttons = [];

export function createMarkers(scene, buttons) {
  // Crear marcadores
  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-6, 0, 11),

    "Compañia de María",

    "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.3.jpg",

    `
    <p>Este colegio estaba ubicado originalmente en la calle Rivadavia y Sargento Cabral en terrenos donados por la Sra Olaya Pescara de Tomba. Actualmente se encuentra en Azopardo 206. Es uno de los centros educativos más antiguos del departamento de Godoy Cruz, fue la primera escuela de gestión privada de la zona. Se fundó en el año 1905 como colegio de instrucción primaria de niñas.</p>

    <p>El antiguo Colegio de la Compañía de María de Godoy Cruz, antes de ser afectado por el terremoto de 1985, tenía un terreno más extenso que el actual y distinta disposición de sus dependencias. El ingreso se realizaba por calle Rivadavia. Detrás del muro de rejas y pilastras que circundaba toda la propiedad, se visualizaba un jardín externo por el cual se accedía al colegio, la capilla y distintos ambientes.</p>

    <p>En el interior de la edificación, estaba organizado con galerías que se abrían a patios internos a modo de claustros donde funcionaban las aulas. En uno de estos patios internos, se encontraba la escultura del Sagrado Corazón de Jesús sobre un gran pedestal -que hoy en día se sigue apreciando en la institución-. Sobre la misma línea de la calle Rivadavia, se observaba también el ingreso a la capilla. La edificación del templo era de planta basilical con una sola nave y techo a dos aguas. Su exterior destacaba por la fachada con un gran portal de ingreso resuelto con un arco de medio punto. El conjunto remataba con un frontón triangular, ornamentado con arcos de medio punto que circundaban todo el perímetro de la construcción. Dicha capilla ya no existe en la actualidad.</p>

    <p><strong>Texto:</strong> María Virginia Goldar/ Andrea Segura. (Equipo MUVI GC)</p>
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
    </p> <a href="https://museovirtual.godoycruz.gob.ar/instituciones/#maria"  target="_blank">Compañia de maria</a></p>
    </p> <a href="https://museovirtual.godoycruz.gob.ar/personajes/#olaya"  target="_blank">Olaya Pescara de Tomba</a></p>
    `,

    ["images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.1.jpg", "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.2.jpg"], // Exterior
    ["images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.4.jpg", "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.5.jpg"],  // Interior
    0xffff00
  );


  createMarker(
    scene,
    buttons, 
    new Vector3(-6, 0, 9),
    "Plaza de Godoy Cruz",

    "images/M-0/0.1.plazadepartamental/0.1.plazadepartamental.1.jpg",

    `<p><i>"Las plazas son artefactos históricos en los que subyacen ideas, representaciones, proyectos culturales y políticos, claves de tradiciones técnicas e ideológicas y son al mismo tiempo, instrumentos de intervención urbanística".</i></p>
  
    <p>La plaza del casco histórico antiguo de San Vicente se originó alrededor del año 1820. Era una plaza seca, de dimensiones regulares y que se ajustaba a los diseños utilizados para la planificación urbana en América de raíz hispánica.</p>
    
    <p>A finales del siglo XIX, se fueron añadiendo gradualmente árboles y se abrieron canales de agua, adaptando el espacio a los nuevos conceptos de higiene y modernidad. Además, se sumaron diagonales y senderos alrededor de la plaza, cuyos bordes estaban decorados con setos vivos, lo que generó un espacio propicio para el paseo. A principios del siglo XX, la plaza contaba con pinos, cipreses y otras especies de árboles. En la década de 1920, se instalaron bancos y una fuente con la escultura de Tomas Godoy Cruz que miraba hacia la iglesia de San Vicente. En ese momento, los plátanos del borde fueron reemplazados por llamativos jacarandás que todavía se conservan en la actualidad.</p>
    
    <p>En el año 2001, el Municipio decidió renovar el centro histórico, lo cual incluyó la restauración del monumento a Tomás Godoy Cruz, un grupo escultórico creado por David Godoy en 1924 como homenaje al patrono civil del departamento; y conectar el espacio público con los edificios históricos que lo rodean: el Concejo Deliberante, la Iglesia de San Vicente Ferrer, la ex-Comisaría 7ª, la Escuela Rawson de 1935 (ubicada en Azopardo 76) y el Teatro Plaza, inaugurado en 1946 (en Colón 23).</p>
    
    <p>A lo largo de los años se fueron mejorando y renovando el monumento, la reposición de elementos que faltaban, el cambio de pavimentos y la restauración de farolas, tanto en la plaza como en las aceras de las manzanas cercanas.</p>
    
    
    
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    
    <p><strong>Bibliografía:</strong></p>
    <ul>
      <li>Bórmida, E y Moretti,G. (2005). Guía de Arquitectura de Mendoza. Junta de Andalucía.</li>
      <li>Raffa, C. (s/f) La plaza: espacio simbólico y material de la ciudad. Material inédito.</li>
    </ul>
    <p>Para más información: 
    <p> <a href="https://museovirtual.godoycruz.gob.ar/centro-historico/">Museo Virtual Godoy Cruz - Centro Histórico</a></p>
    `,
    ["img.ext1.jpg", "img.ext2.jpg"], // Exterior
    ["interior3.jpg"],                // Interior
    0xffff00
  );

  createMarker(
    scene, 
    buttons, 
    new Vector3(-6, 0, 4),
    "Título 3",
    null,
    "Texto de ejemplo 3",
    ["exterior5.jpg", "exterior6.jpg", "exterior7.jpg"], // Exterior
    ["interior4.jpg", "interior5.jpg"],                  // Interior
    0xff0000
  );

   createMarker(
    scene, 
    buttons, 
    //x/y/z
    new Vector3(-6, 0, 7),
    "Título 2",
    null,
    "Texto de ejemplo 2",
    ["img.ext1.jpg", "img.ext2.jpg"], // Exterior
    ["interior3.jpg"],                // Interior
    0xffff00
  );
}

export function createMarker(scene, buttons, position, title, imageUrl, text, exteriorImages, interiorImages, color = 0xffff00) {
    const sphereGeometry = new SphereBufferGeometry(1.5, 32, 32);
    const customMaterial = new MeshStandardMaterial({
      color: color, // Utiliza el color proporcionado
      opacity: 0.7,
      transparent: true,
    });
  
    const marker = new Mesh(sphereGeometry, customMaterial);
    marker.position.copy(position);
    marker.scale.set(0.2, 0.2, 0.2);
    marker.userData.title = title;
    marker.userData.imageUrl = imageUrl;
    marker.userData.text = text;
    marker.userData.exteriorImages = exteriorImages;
    marker.userData.interiorImages = interiorImages;
    scene.add(marker);
    buttons.push(marker);
}