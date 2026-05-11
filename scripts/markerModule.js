//markerModule.js
import {
  ClampToEdgeWrapping,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  TextureLoader,
  Vector3,
} from "../vendor/three/build/three.module.js";
import { getSavedCameraView } from "./cameraViewStorage.js";

let buttons = [];
let legacyMarkerTitlesToSkip = new Set();

export function createMarkers(scene, buttons, options = {}) {
  legacyMarkerTitlesToSkip = options.skipTitles || new Set();
  // Crear marcadores



  //MANZANA 0--------------------------------------------------------

  createMarker(
    scene, 
    buttons, 
                 //x/z/y
    new Vector3(-50.551, 2, 56.5),

"Monumento a Tomás Godoy Cruz",

 "images/M-0/0.2.monumentoplazadepartamental/0.1.plazadepartamental.5.Archivo B+M Manuel Belgrano.jpg",
 
   `
 <p>En Mendoza, en 1909, se estableció por ley la construcción del monumento a Tomás Godoy Cruz, quien representó a la provincia en el juramento de la Independencia en el Congreso de Tucumán. El proyecto fue avanzando lentamente, así el 27 de mayo de 1910, durante el gobierno de Rufino Ortega, se colocó la piedra fundamental en la plaza departamental como parte de las celebraciones del centenario de mayo.</p>

 <p>Posteriormente, en enero de 1911, el escultor mendocino David Godoy, quien en ese momento residía en Francia, presentó una maqueta del monumento, en la que el prócer se encontraba de pie sobre un obelisco de estilo Luis XVI. La obra debía ser entregada en un plazo de tres años, pero debido al estallido de la Primera Guerra Mundial en 1914, el monumento llegará a nuestro país retrasando su concreción catorce años.</p>

 <p>En 1922, el gobierno nacional inició las acciones necesarias para recuperarlas. En 1924, con las piezas ya en la provincia, se aprovechó la celebración de julio para inaugurar la escultura. Ese año, la festividad no se llevó a cabo en la capital, como era tradición, sino en Godoy Cruz. Se realizó el tradicional Te Deum en el templo parroquial y luego se realizó la ceremonia de inauguración. Alrededor de la escultura se encontraban los líderes y personalidades destacadas de la administración pública y del ejército. Estudiantes de las escuelas provinciales entonaron el Himno Nacional y luego se procedió a descubrir la obra, que estaba envuelta en la bandera nacional.</p>

 <p>El monumento conmemorativo forma parte de un conjunto de elementos simbólicos, alegóricos y decorativos. La figura realista de Godoy Cruz se alza sobre una base de seis metros de altura. A los costados se encuentra una representación alegórica de la agricultura, la figura de un cóndor sobre el escudo de Mendoza, una placa conmemorativa de la inauguración y un sol sobre un pergamino que anuncia el nacimiento de la patria en 1816.</p>

<p>Bibliografía: <br>  Luis, N. (2021) Monumento a Tomás Godoy Cruz. Sitio Web: 
<a href="https://museovirtual.godoycruz.gob.ar/9555-2/">https://museovirtual.godoycruz.gob.ar/9555-2/
</a>
 </p>

 <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
 <p><strong>Fuentes:</strong></p>
 <p><strong>Imágenes</strong></p>


    <ul>
        <li>Img Base documental del Departamento de Patrimonio Cultural. Dirección de Planificación urbana y ambiente. 2007-2009. Equipo: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.</li>
        <li> Img Archivo fotográfico de la Biblioteca Medioteca Manuel Belgrano, Godoy Cruz.</li>
        
     
    </ul>
    <p>Para más información: 
    <p> <a href="https://museovirtual.godoycruz.gob.ar/9555-2/#tomas">Monumento a Tomás Godoy Cruz</a></p>
`,

    ["images/M-0/0.2.monumentoplazadepartamental/0.1.plazadepartamental.4.DPC_DPUyA_MGC.jpg", "images/M-0/0.2.monumentoplazadepartamental/0.1.plazadepartamental.5.Archivo B+M Manuel Belgrano.jpg"],
    [], // Exterior    
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-40.48, 2.38, 36.98],
      target: [-50.55, 1.00, 56.50]
    });



  createMarker(
    scene,
    buttons, 
                  //x/z/y
    new Vector3(-48.76, 0, 50),


    "Plaza de Godoy Cruz",

    "images/M-0/0.1.plazadepartamental/0.1.plazadepartamental.1.Revista Social quincena (1959).jpg ",

    `<p><i>"Las plazas son artefactos históricos en los que subyacen ideas, representaciones, proyectos culturales y políticos, claves de tradiciones técnicas e ideológicas y son al mismo tiempo, instrumentos de intervención urbanística".</i></p>
  
    <p>La plaza del casco histórico antiguo de San Vicente se originó alrededor del año 1820. Era una plaza seca, de dimensiones regulares y que se ajustaba a los diseños utilizados para la planificación urbana en América de raíz hispánica.</p>
    
    <p>A finales del siglo XIX, se fueron añadiendo gradualmente árboles y se abrieron canales de agua, adaptando el espacio a los nuevos conceptos de higiene y modernidad. Además, se sumaron diagonales y senderos alrededor de la plaza, cuyos bordes estaban decorados con setos vivos, lo que generó un espacio propicio para el paseo. A principios del siglo XX, la plaza contaba con pinos, cipreses y otras especies de árboles. En la década de 1920, se instalaron bancos y una fuente con la escultura de Tomas Godoy Cruz que miraba hacia la iglesia de San Vicente. En ese momento, los plátanos del borde fueron reemplazados por llamativos jacarandás que todavía se conservan en la actualidad.</p>
    
    <p>En el año 2001, el Municipio decidió renovar el centro histórico, lo cual incluyó la restauración del monumento a Tomás Godoy Cruz, un grupo escultórico creado por David Godoy en 1924 como homenaje al patrono civil del departamento; y conectar el espacio público con los edificios históricos que lo rodean: el Concejo Deliberante, la Iglesia de San Vicente Ferrer, la ex-Comisaría 7ª, la Escuela Rawson de 1935 (ubicada en Azopardo 76) y el Teatro Plaza, inaugurado en 1946 (en Colón 23).</p>
    
    <p>A lo largo de los años se fueron mejorando y renovando el monumento, la reposición de elementos que faltaban, el cambio de pavimentos y la restauración de farolas, tanto en la plaza como en las aceras de las manzanas cercanas.</p>
  
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Img (15 de septiembre 1959), Revista Social quincenal.  Nro 153. sin aclaraciones/li>
        <li>Img Base documental del Departamento de Patrimonio Cultural. Dirección de Planificación urbana y ambiente. 2007-2009. Equipo: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.</li>
        <li>Img  Archivo fotográfico de la Biblioteca Medioteca Manuel Belgrano, Godoy Cruz.</li>
        <li>Img  Blog MendozaAntigua</li>

        




    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
      <li>Bórmida, E y Moretti,G. (2005). Guía de Arquitectura de Mendoza. Junta de Andalucía.</li>
      <li>Raffa, C. (s/f) La plaza: espacio simbólico y material de la ciudad. Material inédito.</li>
    </ul>
    <p>Para más información: 
    <p> <a href="https://museovirtual.godoycruz.gob.ar/centro-historico/">Centro Histórico de Godoy </a></p>
    `,
    ["images/M-0/0.1.plazadepartamental/01.plazadepartamental.6.BlogMendozaAntigua.jpg", "images/M-0/0.1.plazadepartamental/0.1.plazadepartamental.5.BlogMendozaAntigua.jpg"], 
    ["images/M-0/0.1.plazadepartamental/0.1.plazadepartamental.2.DPC_DPUyA_MGC.jpg", "images/M-0/0.1.plazadepartamental/0.1.plazadepartamental.3.DPC_DPUyA_MGC.jpg"], 
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-19.11, 8.11, 33.75],
      target: [-41.41, -1.47, 50.22]
    });







  //MANZANA 1--------------------------------------------------------
   createMarker(
    scene, 
    buttons, 
                  //x/z/y
    new Vector3(-183, 0, 3),
    "Ferretería Panocchia",
    "images/M-1/1.21-22.ferreteríapanocchia/1.21-22.ferreteriapanocchia.1.Balmaceda, S (2007).jpg",

    `<p>La Ferretería Panocchia, ubicada en Rivadavia 851, era un comercio icónico en el departamento de Godoy Cruz. Fue fundada por Isidoro y Domingo Panocchia, dos italianos de origen toscano, que se establecieron en la provincia en 1880, y quienes se involucraron en varios rubros comerciales antes de instaurar su ferretería homónima en 1920. La fachada era simétrica, de ladrillo a la vista, de corte italianizante con aberturas enmarcadas y cornisamiento de ladrillo. Se sabe que tenía un sótano, algo propio de las casas de la época, y una galería con su tradicional cenefa de madera.</p> 
    <p>A través de documentación fotográfica, se puede apreciar cómo el edificio original sufrió alteraciones en su parte superior con el paso del tiempo, principalmente por los efectos de los frecuentes movimientos sísmicos de la región. En la actualidad, el edificio ha desaparecido, dejando un baldío en su ubicación anterior. Sin embargo, la ferretería persiste en el número 849 de la calle Rivadavia, en posesión de los descendientes.</p> 
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano.(2023) con aclaraciones</li>
        <li>(mayo 1924), Revista La Quincena Social. Nro 121</li>
        <li>Fotografía gentileza Marcelo Nardechia</li> 
    </ul>
    <p><strong>Bibliografía:</strong></p>
  <ul>
    <li>Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano.</li>
    <li>Base documental del Departamento de Patrimonio Cultural. Dirección de Planificación urbana y ambiente. 2007-2009. Equipo: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.</li>
  </ul>
`,
    ["images/M-1/1.21-22.ferreteríapanocchia/1.21-22.ferreteriapanocchia.2.Balmaceda, S (2007).jpg.png", "images/M-1/1.21-22.ferreteríapanocchia/1,21-22.ferreteríapanocchia.3. La Quincena Social (1924)..jpg"], 
    ["images/M-1/1.21-22.ferreteríapanocchia/1.21-22.ferreteríapanocchia.4. MUVI GC_DCeIC_MGC.jpg"],              
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-184.20, 5.34, 25.82],
      target: [-183.10, -0.70, 4.27]
    });







  //MANZANA 2--------------------------------------------------------

   createMarker(
    scene, 
    buttons, 
                  //x/z/y
    new Vector3(-126.2, 2, 11.1),
    "Bodega Tomba",
    "images/M-2/2.1.bodegatomba/2.1.bodegatomba.1. Caras y Caretas, 1910.jpg",

    `<p>Fue construda por Antonio Tomba  hacia 1885c., próxima al centro urbano de Godoy Cruz. Este primer galpón iba a convertirse en uno de los establecimientos vitivinícolas más importantes del mundo. Al fallecer su fundador en 1889, Domingo Tomba, hermano de Antonio, tomó las riendas de la empresa y el establecimiento alcanzó su mayor esplendor, tanto en superficie construida como en la producción que se generaba. </p> 
    <p>Morfológicamente, se resolvió como un conjunto de edificios independientes. Hacia 1910 contaba con un patio en el oeste donde se encontraba un jardín rodeado por una reja con un busto del fundador, obra del escultor Somadossi. También contaba con portería, salas de administración, laboratorios y enfermería, un cuerpo de conservación y tres de fermentación, cada uno con subsuelo para la conservación. Sumamos las habitaciones para el mecánico y otros empleados de jerarquía, el departamento de tonelería, distintos depósitos de materiales y maquinarias y un tanque para la dotación de agua. En esta época, se registró la ampliación en proceso de las naves de fermentación y conservación, con sus respectivos  sótanos, y aparecieron corrales donde se albergaban 160 carros y alrededor de 700 mulas. Una característica distintiva que puede apreciarse hasta la actualidad en algunos sectores que han perdurado en el tiempo, es el uso de ladrillo a la vista, con hermosos detalles ornamentales. Las vías que vinculaban al establecimiento con la estación Godoy Cruz ingresaban al predio por calle Monteagudo.   </p> 
    <p>Antonio y su esposa, Olaya Pescara, fueron activos vecinos del departamento y  colaboraron, entre otras obras, con  la construcción del hospital El Carmen. Posteriormente, se vendió a la firma El Globo S.A. En 1996 fue parcialmente demolida para dar lugar a la construcción de un Hipermercado. En la esquina de San Martín y Rivadavia, aún puede intuirse su esplendor a partir de los vestigios de muros con arcos de medio punto, los trabajos de rejería  y ladrillo que se conservan.  </p>
    <p><strong>Texto:</strong> Verónica Cremaschi (INCIHUSA CONICET)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
    <li>Img  Caras y Caretas, 1910</li>
    <li>Img  Centro vitivinícola Nacional, 1910.</li>
    <li>Img  Girini, Revista Universum, 1900</li>
    </ul>
    



    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Álbum Argentino Gloriandus. Provincia de Mendoza, su vida, su trabajo, su progreso, 1909.</li>
        <li>Caras Y Caretas (Buenos Aires) 21 5 1910, N º 607.</li>
        <li>Centro Vitivinícola Nacional (1910). La Vitivinicultura en 1910. Buenos Aires, Argentina: Emilio Coll e hijos Eds.</li>
    </ul>
    <p>Más información de : 
    </p> <a href="https://museovirtual.godoycruz.gob.ar/la-inmigracion/#antonio"  target="_blank">Antonio Tomba</a></p>
    `,
    ["images/M-2/2.1.bodegatomba/2.1.bodegatomba.2. Caras y Caretas, 1910.jpg", "images/M-2/2.1.bodegatomba/2.1.bodegatomba.3.Centro vitivinícola Nacional, 1910.jpg"], // Exterior
    ["images/M-2/2.1.bodegatomba/2.1.bodegatomba.4.Girini, Revista Universum, 1900.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-126.2, 14, 53.1],
      target: [-126.2, 8, 11.1]
    });


  createMarker(
    scene, 
    buttons, 
                  //x/z/y
    new Vector3(-68, 0, 27),
   /*5*/ "Farmacia San Vicente",
    "images/M-2/2.12.Farmacia San Vicente/2.12.farmaciasanvicente.1.Archivo B+M Manuel Belgrano.jpg",

    `<p>Fue fundada aproximadamente en la década de 1940, en la esquina de Rivadavia y Belgrano, frente a la plaza departamental de Godoy Cruz en el edificio que actualmente ocupa la farmacia Chester. La familia Mastrangelo dirigió este negocio durante varios años.<br>
    </p> 
    <p>Esta farmacia cumplió, como lo hacían también la Godoy Cruz y del Pueblo, con una actividad más amplia que la que hoy brindan estos establecimientos, como la colocación de inyecciones, realización de curaciones y la de suplir necesidades varias. Es interesante destacar que en este comercio, trabajó Roberto Bermejillo, quien, en la década de 1960, adquirió la farmacia Godoy Cruz. 
    </p>
    <p>Mediante fotografías de archivo se puede determinar que se inscribía dentro del estilo náutico que prioriza los ángulos redondeados, las fachadas limpias y  despojadas de decoración, los balcones curvos y con barandas metálicas, aspecto que puede apreciarse parcialmente hasta la actualidad por las marquesinas y cartelería.
    </p> 
    <p><strong>Texto:</strong> Virginia Goldar/Andrea Segura (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Archivo fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz</li>
        <li>Archivo MUVI GC<a href="https://museovirtual.godoycruz.gob.ar/edificios-fichas-1//DCeIC/MGCGC" target="_blank" > https://museovirtual.godoycruz.gob.ar/edificios-fichas-1//DCeIC/MGCGC</a></li>
        
    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano. </li>
    </ul>"
    `,

    ["images/M-2/2.12.Farmacia San Vicente/2.12.farmaciasanvicente.1.Archivo B+M Manuel Belgrano.jpg", "images/M-2/2.12.Farmacia San Vicente/2.12.farmaciasanvicente.2. MUVI GC_DCeIC_MGC.jpeg"], // Exterior
    [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-68, 14, 69],
      target: [-68, 6, 27]
    });
/*
 {
      position: [-68, 14, 69],
      target: [-68, 6, 27]
    });
*/





//MANZANA 3--------------------------------------------------------

  createMarker(
    scene, 
    buttons, 
                  //x/z/y
    new Vector3(-17.6, 1, -17.7),

    /*6*/"Club Sirio Libanes",
    "images/M-3/3.4.clubsiriolibanes/3.4.clubsiriolibanes.3.DPC_DPUyA_MGC.jpg",

    ` <p>A fines del siglo XIX y principios del XX (1891 a 1920) se produjo una llegada masiva de inmigrantes del cercano oriente al territorio argentino, fundamentalmente árabes de origen sirio-libanes. Esta ola inmigratoria fue el resultado de múltiples causas socio-políticas, caracterizada por la persecución por parte de los turcos otomanos, la guerra italo-turca, y el crecimiento acelerado de la demografía en el Líbano, entre otros. 
    </p> 
      <p>Una vez establecidos en el país, como comunidad extranjera, se nuclearon en numerosas entidades, instituciones, clubes y asociaciones con el fin de establecer vínculos de pertenencia basados en sus orígenes culturales, nacionales y religiosos.
      </p>
      <p>La provincia de Mendoza, no fue ajena a dicho fenómeno, y en la década del 1920, un gran número de sirio-libaneses, nacidos en Hainturat El Maten, se asentaron en la región. Específicamente, en el departamento de Godoy Cruz, adquirieron los terrenos ubicados en la calle Antonio Tomba al 142, donde en el año 1928 construyeron su característico edificio. Este espacio funcionó, en sus comienzos, como Sociedad de Beneficencia, centro social-cultural y biblioteca.
      </p> 
      <p>Estilísticamente, la edificación es ecléctica dado que posee elementos academicistas, árabes y componentes modernistas combinados en una versión personal por los constructores Rivas y Navarro. Son de inspiración árabe las barandas caladas, las mayólicas de revestimiento y las alhambrillas del solado de ingreso; mientras que los arcos de la galería y la ornamentación de pilares, cornisas y esquinas, combinan elementos académicos con otros modernistas.
      </p> 
      <p>El edificio fue declarado Patrimonio Cultural y Arquitectónico de Godoy Cruz en el año 2016 bajo la ordenanza Nº 6.579/16.</p>
  
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
 
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>
        Base documental del Departamento de Patrimonio Cultural. Dirección de Planificación urbana y ambiente. 2007-2009. Equipo: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.
        </li>
        <li>Página oficial de maronitas en Mendoza: <a href="https://juanmaron.org/" target="_blank">https://juanmaron.org/</a>
        </li>
        <li>Expte de declaratoria municipal Nº4234-H-11</li>
    </ul>
    `,

    ["images/M-3/3.4.clubsiriolibanes/3.4.clubsiriolibanes.1.DPC_DPUyA_MGC.jpg", "images/M-3/3.4.clubsiriolibanes/3.4.clubsiriolibanes.2.DPC_DPUyA_MGC.jpg"], // Exterior
    ["images/M-3/3.4.clubsiriolibanes/3.4.clubsiriolibanes.3.DPC_DPUyA_MGC.jpg", "images/M-3/3.4.clubsiriolibanes/3.4.clubsiriolibanes.4.DPC_DPUyA_MGC.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-17.6, 14, 24.3],
      target: [-17.6, 7, -17.7]
    });





  
  //MANZANA 4--------------------------------------------------------

  createMarker(
    scene, 
    buttons, 
                  //x/z/y
    new Vector3(-28.6, 1, 35),
    "La Rosarina",
    "images/M-4/4.12.la rosarina/4.12.larosarina.3.Blog MendozaAntigua.jpg",

    `
    <p>La Rosarina fue un destacado comercio en la esquina de calles Rivadavia y Antonio Tomba que funcionó como despensa y fiambrería, a cargo de la familia Gobbi. En las fotos de la época se puede observar que la fachada del edificio era almohadillada y remataba en una cornisa que se interrumpía en la entrada del almacén. El ingreso se realizaba por una puerta situada en ochava que presentaba la cartelería, al igual que los grandes ventanales con arcos de medio punto. Hoy el terreno de este memorable negocio está ocupado por el Banco Galicia.</p> 
    <p><strong>Texto:</strong> Virginia Goldar/ (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Img 1Archivo fotográfico Instituto San Vicente Ferrer.</li>
        <li>Img 2Archivo fotográfico Instituto San Vicente Ferrer.</li>
        <li>Img 3Archivo fotográfico Blog Mendoza Antigua.</li>  

    </ul>
    `,

    ["images/M-4/4.12.la rosarina/4.12.larosarina.1. Archivo Instituto San Vicente Ferrer.jpg", "images/M-4/4.12.la rosarina/4.12.larosarina.2.Archivo Instituto San Vicente Ferrer.jpg"], // Exterior
    ["images/M-4/4.12.la rosarina/4.12.larosarina.3.Blog MendozaAntigua.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-28.6, 14, 77],
      target: [-28.6, 7, 35]
    });

  createMarker(
    scene, 
    buttons, 
                  //x/z/y
    new Vector3(-36, 1, 28.3),
    "Casa Olaya",
    "images/M-4/4.14.casaolaya/4.14.casaolaya.1.La Vitivinicultura argentina en 1910.jpeg",

    ` <p>Sobre calle Rivadavia, frente a la plaza departamental, se ubicaba el Almacén de Antonio Tomba, el primer negocio con el cual comenzaría el desarrollo financiero la familia Tomba. Luego de la muerte del patriarca en 1899, Olaya Pescara, junto a su hijo Luis, decidió erigir, en 1907, una monumental mansión que funcionó como residencia, centro social, y espacio filantrópico. </p> 
      <p>El chalet, conocido como el Palacio de la Caridad, fue un espacio que albergó, en momentos  vulnerables, a todo aquel que necesitara cobijo, tanto a enfermos y mendigos como a viajeros. Allí, diariamente la señora Pescara de Tomba ofrecía un plato de comida para quienes se acercaran a su casa.
      </p>
      <p>Se sabe que la proyección de la vivienda estuvo a cargo de un arquitecto italiano y que abarcaba una cuarta parte de la manzana, sin embargo, los planos de dicha construcción, se perdieron en el tiempo. Por testimonios de la época y algunos registros fotográficos ha sido posible rescatar distintos datos de la casa y su interior. Es así que sabemos que la residencia contaba con un frente cercado de rejas verdes artesanales en hierro fundido con las iniciales de Olaya Pescara, un espacioso jardín inglés y un frente majestuoso en cuya fachada es posible observar la existencia de un pórtico de columnas neoclásicas con acceso vehicular. A partir de la fotografía,  ha quedado registro del lateral izquierdo del chalet donde es posible vislumbrar el torreón- mirador octogonal, marca indiscutible de la casona, cuyas columnas de corte clásico rematan en un pequeño balcón. Distintos testimonios mencionan un majestuoso interior, nombrando, por ejemplo, pisos de parquet y zócalos de pinotea que cubrían aproximadamente un metro cincuenta de la pared, decoraciones escultóricas procedentes de Italia, lujoso mobiliario y suntuosas cortinas bordadas.
      </p> 
      <p>El Banco Nación Argentina adquirió dicha casa en 1961, para, finalmente años después, ser demolida con el fin de construir el actual edificio bancario.</p> 
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>La Vitivinicultura argentina en 1910. Centro Vitivinícola Nacional.</li>
        <li> Archivo Fotográfico Biblioteca General Belgrano, Godoy Cruz.</li>

    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Base documental del Departamento de Patrimonio Cultural. Dirección de Planificación urbana y ambiente. 2007-2009. Equipo: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.

        </li>
    </ul>
    <p>Más información de : 
    </p> <a href="https://museovirtual.godoycruz.gob.ar/la-inmigracion/#antonio"  target="_blank">Antonio Tomba</a></p>
    </p> <a href="https://museovirtual.godoycruz.gob.ar/personajes/#olaya"  target="_blank">Olaya Pescara de Tomba</a></p>

    `,

    ["images/M-4/4.14.casaolaya/4.14.casaolaya.2.Archivo B+M Manuel Belgrano.jpeg", "images/M-4/4.14.casaolaya/4.14.casaolaya.3. La Vitivinicultura argentina en 1910.jpeg"], // Exterior
    ["images/M-4/4.14.casaolaya/4.14.casaolaya.4.La Vitivinicultura argentina en 1910.jpeg", "images/M-4/4.14.casaolaya/4.14.casaolaya.5. La Vitivinicultura argentina en 1910.jpeg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-36, 14, 70.3],
      target: [-36, 7, 28.3]
    });





//MANZANA 6--------------------------------------------------------

 createMarker(
    scene, 
    buttons, 
                  //x/z/y
    new Vector3(-21, 1, 37.1),
     "Farmacia Godoy Cruz",
    "images/M-6/6.12.farmaciagodoycruz/6.12.farmaciagodoycruz.1.MUVI GC_DCeIC_MGC.jpeg",

    ` <p>Fundada en el año 1908, es una de las farmacias más antiguas de Godoy Cruz y parte del conjunto de farmacias que rodean la Plaza departamental. Estos edificios son considerados de gran valor cultural ya que desarrollan su función comercial y social con continuidad desde antaño. Ubicada en la esquina de las actuales calles Antonio Tomba y Rivadavia, nació como botica, lugar donde se preparaban y expendían medicamentos. Asimismo funcionaba como centro neurálgico donde los viajeros podían parar para abastecerse, ya que se encontraban productos diversos para satisfacer sus necesidades. Hay testimonios que aseguran que también servía como lugar para asistir los partos de las vecinas de la zona.</p> 
      <p>El establecimiento tuvo distintos nombres y dueños a lo largo de estos años. Comenzó llamándose Farmacia San Martín, y estaba a cargo del propietario y farmacéutico Amelio Pazzolo. Otros nombres con los que se la conoció fueron “Barnabó” hacia el año 1931, “Pinazo”· en el 1935 y ya, a partir de 1937, comenzó a llamarse Farmacia Godoy Cruz. En el año 1965 fue adquirida por Ricardo Bermejillo y desde entonces es esta familia quien dirige el negocio, con Roberto Bermejillo como farmacéutico a cargo.
      </p>
      <p>Estilísticamente, el lenguaje arquitectónico y ornamental remite a influencias clásicas. Se puede observar que el edificio posee su fachada principal en forma de ochava, que jerarquiza la esquina y el ingreso al local. Ésta se encuentra enmarcada por pilastras adosadas, pintadas de azul y en su coronamiento es ovoidal se inscribe, en relieve, el nombre del comercio y su año de fundación, acompañados por una moldura ornamental con grecas. El alzado del conjunto está conformado por un zócalo azul y un muro resuelto con ligero almohadillado, rematando en un paramento liso. En el interior aún se puede observar mobiliario original, como los mostradores de madera y estanterías. Además la familia conserva objetos propios de las tareas que se realizaban  en las farmacias de esa época, tales como morteros, frascos de vidrio y balancines. </p> 
       
    <p><strong>Texto:</strong> Virginia Goldar/Andrea Segura(Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
    <li>Archivo fotográfico Equipo Muvi GC</li>
    <li>Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano. </li>
    <li>Base documental del Departamento de Patrimonio Cultural. Dirección de Planificación urbana y ambiente. 2007-2009. Equipo: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.</li>
    
    </ul>
    <p><strong>Fuentes:</strong></p>
    <ul>
    <li>Entrevista con Roberto Bermejillo.</li>
    <li>Folleto Farmacia Godoy Cruz, proporcionado por sus propietarios.</li>
    <li> Base documental equipo de investigación años 2006-2010: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa</li>
   </ul>

    `,

    ["images/M-6/6.12.farmaciagodoycruz/6.12.farmaciagodoycruz.2.Balmaceda, S. (2007).jpg", "images/M-6/6.12.farmaciagodoycruz/6.12.farmaciagodoycruz.4.DPC_DPUyA_MGC.jpg"], // Exterior
    ["images/M-6/6.12.farmaciagodoycruz/6.12.farmaciagodoycruz.3.DPC_DPUyA_MGC.jpg", "images/M-6/6.12.farmaciagodoycruz/6.12.farmaciagodoycruz.5.DPC_DPUyA_MGC.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-21, 14, 79.1],
      target: [-21, 7, 37.1]
    });





  //MANZANA 7--------------------------------------------------------
  createMarker(
    scene, 
    buttons, 
                  //x/z/y
    new Vector3(23, 2, 12),
   "Ferrocarril",
    "images/M-7/7.1.ferrocarril/7.1.ferrocarril.1.MUVI GC_DCeIC_MGC.jpg",

    ` <p>El departamento tuvo dos importantes estaciones. La llamada Godoy Cruz, antes San Vicente, inaugurada el 25 de abril de 1885; y la estación Benegas, que estaba ubicada cerca de la finca y bodega El Trapiche. Arquitectónicamente, estas terminales responden a las características de la arquitectura inglesa, marcada por el uso de ladrillo a la vista, techumbres inclinadas con tejas, la carpintería en madera con puertas y ventanas de dos hojas, en general con postigos,  y las galerías que cubrían y protegían el sector del andén.</p> 
      <p>El tren posibilitó la distribución, a partir del año 1885, de distintos productos manufacturados y materias primas. También facilitó la llegada masiva de inmigrantes que desembarcaban en Buenos Aires y utilizaron el ferrocarril para arribar a la provincia y al departamento de Godoy Cruz. Entre quienes se instalaron en este suelo se encontraban ingenieros hidráulicos y agricultores que propiciaron el desarrollo de importantes industrias, especialmente bodegas, que caracterizaron la actividad del departamento.</p>
      <p>La actividad de los trenes locales fue decreciendo paulatinamente a medida que el vehículo motorizado iba en aumento, situación que se agudizó a partir de 1930, con el plan de pavimentación de caminos del gobierno provincial. Los servicios locales cesaron definitivamente en 1938. Si bien, para esos años, la estación de Godoy Cruz perdió relevancia en el transporte de pasajeros, continuó prestando servicios en el transporte de cargas. Es interesante destacar que, por ejemplo en la estación Godoy Cruz, había ramales que se desprendían hacia la bodega Arizu, Escorihuela. Sumamos otros desvíos que servían a la bodega Tomba, a la fábrica de conservas Arcanco y al frigorífico Aconcagua.</p> 
       
    <p><strong>Texto:</strong> Pablo Bianchi (INCIHUSA / PR2021-21- UNCUYO)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Archivo fotográfico Muvi GC</li>
        <li>Archivo fotográfico Museo Nacional Ferroviario "Raúl Scalabrini Ortiz", Buenos Aires.</li>
    </ul>
    <p><strong>Bibliografía/Fuentes:</strong></p>
    <ul>
        <li>Delgado, G. (1996). Transporte Ferroviario. En Lacoste. P. (comp.) Godoy Cruz historia y perspectivas, pp. 96-101. Diario UNO.</li>
        <li>Nardechia, Marcelo y Raffa, Cecilia. Guía del Patrimonio Cultural de Godoy Cruz, Godoy Cruz, 2 ediciones, 2007 y 2013.</li>
   </ul>

    <p>Más información de : 
    </p> <a href="https://museovirtual.godoycruz.gob.ar/estaciones-de-ferrocarril/"  target="_blank">Estaciones de ferrocarril</a></p>


    `,

    ["images/M-7/7.1.ferrocarril/7.1.ferrocarril.1.MUVI GC_DCeIC_MGC.jpg", "images/M-7/7.1.ferrocarril/7.1.ferrocarril.2.MUVI GC_DCeIC_MGC.jpg", "images/M-7/7.1.ferrocarril/7.1.ferrocaril.3.MUVI GC_DCeIC_MGC.jpg"], // Exterior
    ["images/M-7/7.1.ferrocarril/7.1.ferrocarril.3.jpeg", "images/M-7/7.1.ferrocarril/7.1.ferrocarril.4.jpeg ",  "images/M-7/7.1.ferrocarril/7.1.ferrocarril.5.MUVI GC_DCeIC_MGC.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [23, 14, 54],
      target: [23, 8, 12]
    });

   //MANZANA 8--------------------------------------------------------
   createMarker(
    scene, 
    buttons, 
                  //x/z/y
    new Vector3(88, 2, 30.8),
    /*11*/"Barrio Pouget",
   null,

    ` <p>El conjunto habitacional que conforma el Barrio Pouget linda con el espacio verde Luis Menotti Pescarmona y está a metros de la plaza departamental de Godoy Cruz, hacia el este su límite es el canal Cacique Guaymallén. El nombre del conglomerado se debe a que algunos terrenos del área y un molino harinero, que estaba al final de la calle Monteagudo junto al canal zanjón Guaymallén, pertenecían a la familia Pouget.</p> 
      <p>El barrio se conforma por seis manzanas, donde residen aproximadamente 360 familias. El ferrocarril, que con diferentes instalaciones funcionaba en el espacio Menotti-Pescarmona, debe vincularse a la radicación de los primeros habitantes y casas, a principios de la centuria pasada. Algunas referencias indiscutibles de este barrio son: la esquina de Mitre y Monteagudo donde tiene sede la Asociación Mendocina de Sordomudos de Mendoza, entidad creada en 1940; el solar fue sede de una antigua casona que perteneció a María Pulenta. La fábrica de conservas Arcanco, que se instaló  en 1936 y  funcionó aproximadamente hasta 2001. Asimismo existen familias tradicionales de la zona como los Moricci, dedicados a fabricar inicialmente carruajes y luego a carrozar camiones y furgones. También se puede mencionar a las familias Firpo y Goudaillez, que comenzaron a gestionar los servicios que faltaban, como las cloacas y Chaves, Moiso y Moricci que concretaron el servicio de gas y en 1994 el alumbrado público.
      </p> 
       
   
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>9-  Calle Rivadavia y Vaquié.MUVI GC/DCeIC/MGC</li>
        <li>25- Sobre Calle Vaquié y Monteagudo. MUVI GC/DCeIC/MGC</li>
        <li>26- Sobre calle Vaquié.MUVI GC/DCeIC/MGC </li>
        <li>50- Sobre Calle Garibaldi. MUVI GC/DCeIC/MGC</li>
        <li>53- Calle Monteagudo entre Garibaldi y Vaquié. MUVI GC/DCeIC/MGC</li>
        <li>57- Calle Mitre y Monteagudo. MUVI GC/DCeIC/MGC </li>
        <li>68- Calle Mitre y Newbery. MUVI GC/DCeIC/MGC</li>
    </ul>
    <p><strong>Fuentes</strong></p>
    <ul>
        <li>Títiro, M. (16 de marzo de 2015). Barrio Pouget: la zona del molino, el tren y las fábricas. LosAndes. <a href="https://www.losandes.com.ar/barrio-pouget-la-zona-del-molino-el-tren-y-las-fabricas/"  target="_blank">https://www.losandes.com.ar/barrio-pouget-la-zona-del-molino-el-tren-y-las-fabricas/</a></li>
   </ul>



    `,

    ["images/M-8/8.barriopouget/8.1.barriopouget.9.MUVI GC_DCeIC_MGC.jpg", "images/M-8/8.barriopouget/8.1.barriopouget.25.MUVI GC_DCeIC_MGC.jpg", "images/M-8/8.barriopouget/8.1.barriopouget.26.MUVI GC_DCeIC_MGC.jpg"], // Exterior
    ["images/M-8/8.barriopouget/8.1.barriopouget.50.MUVI GC_DCeIC_MGC.jpg", "images/M-8/8.barriopouget/8.1.barriopouget.53.MUVI GC_DCeIC_MGC.jpg",  "images/M-8/8.barriopouget/8.1.barriopouget.57.MUVI GC_DCeIC_MGC.jpg" ,  "images/M-8/8.barriopouget/8.1.barriopouget.68.MUVI GC_DCeIC_MGC.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [88, 14, 72.8],
      target: [88, 8, 30.8]
    });

  //MANZANA 9--------------------------------------------------------     
  createMarker(
    scene, 
    buttons,
                  //x/z/y
    new Vector3(114, 3, -9),
    "Arcanco",
    "images/M-9/9.1.arcanco/arcanco_Casa Flichman (1936). Guía Anual de Turismo Cóndor (1936-1937).jpg",
    ` <p>En el departamento de Godoy Cruz se encontraba Arcanco S. A. (Corporación Envasadora Argentina/Argentina Canning Corporation), fundada en 1932-1933 por la familia Von der Heyde. La misma se ubicaba en la calle J. Newbery, entre Monteagudo y Vaquié, donde hoy se encuentra Tienda en Seco.  Con inversiones en vitivinicultura y fruticultura en el este provincial, y dirigida por Federico Howards Mathews, tenía un capital de 450 mil pesos moneda nacional, y elaboraba 1600 t de tomate y 600 t de durazno por temporada.</p>

    <p>Por testimonios de los vecinos, el barrio Pouget, ubicado entre las calles  J. Newbery y Rivadavia, al sur de la fábrica ARCANCO, fue el espacio elegido por los trabajadores de la industria para asentar sus vidas familiares.</p>

    
        <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Rodriguez, F. (3 de mayo 2017) 1920-1930: la precariedad de las trabajadoras. Agroindustrias y diversificación en Mendoza.INCIHUSA. Sitio web: <a href="https://www.mendoza.conicet.gov.ar/incihusa/2017/05/03/1920-1930-la-precariedad-de-las-trabajadoras/"  target="_blank">https://www.mendoza.conicet.gov.ar/incihusa/2017/05/03/1920-1930-la-precariedad-de-las-trabajadoras/</a></li>
        <li>arcanco_Casa Flichman (1936). Guía Anual de Turismo Cóndor (1936-1937)</a></li>
        <li>Fotografías Equipo de Arquitectura MUVI GC: Clara Urrutia.</li>

    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Rodríguez F.; Barrios P. (sep./dic. 2018) Diversificación agroproductiva en Mendoza, Argentina. El tomate fresco y procesado en la década de 1930.Región y sociedad vol.30 no.73. Sitio web: <a href="https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S1870-39252018000300009"  target="_blank">https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S1870-39252018000300009</a></li>

    </ul>
    <p>Más información de : 
    <p><strong>Fuentes de la Guía Anual de Turismo Cóndor</strong>
    Casa Flichman (1936). Guía Anual de Turismo Cóndor (1936-1937). Mendoza, San Juan, San Luis, Chile. s.d.

    `,

    ["images/M-9/9.1.arcanco/9.1.arcanco.7.MUVI GC_DCeIC_MGC.jpg", "images/M-9/9.1.arcanco/9.1.arcanco.1.MUVI GC_DCeIC_MGC.jpg"], // Exterior


    ["images/M-9/9.1.arcanco/empleadas arcanco_Casa Flichman (1936). Guía Anual de Turismo Cóndor (1936-1937).jpg", "images/M-9/9.1.arcanco/9.1.arcanco.3. Rodriguez, F (2017).jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [114, 14, 33],
      target: [114, 9, -9]
    });



 createMarker(
    scene, 
    buttons,
                  //x/z/y
    new Vector3(100, 2, -12),

    "Molino Pouget",

    "images/M-9/9.2.molinopouget (final calle Monteagudo y zanjón)/8.2.molinodelpilaropouget.2.Album argentino Gloriandus.jpg",

    `
    <p>Era propiedad del francés Gustavo Dionisio Pouget y tomaba las aguas de una acequia designada hacia 1912 como acequia de Pouget. El molino estaba ubicado en la margen este del canal Cacique Guaymallén, en proximidad al Dique del Pilar. El conjunto industrial se componía del edificio de molienda, que contenía las maquinarias, los depósitos de cereales y patio de maniobras para la carga y descarga de la materia prima y la producción. A ello se sumaba la ventaja de estar bien vinculado mediante caminos con la ciudad de Mendoza, como principal centro consumidor.</p>

    
        <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Album argentino Gloriandus</li>
    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
    <li>Figueroa, Paola. <strong>Los molinos hidráulicos</strong>, en <i>Ponte, J. R. De los Caciques del agua a la Mendoza de las Acequias. Cinco siglos de historia de acequias, zanjones y molinos</i>, pp. 221-296. Ediciones Ciudad y Territorio, INCIHUSA, CONICET, Mendoza, 2005.</li>
    </ul>
    

    `,

    ["images/M-9/9.2.molinopouget (final calle Monteagudo y zanjón)/8.2.molinodelpilaropouget.1.Album Argentino Gloriandus.jpg", "images/M-9/9.2.molinopouget (final calle Monteagudo y zanjón)/8.2.molinodelpilaropouget.2.Album argentino Gloriandus.jpg"], // Exterior


    [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [100, 14, 30],
      target: [100, 8, -12]
    });

//MANZANA 16--------------------------------------------------------      

createMarker(
  scene, 
  buttons,
                //x/z/y
  new Vector3(-72, 3, 45.6 ),
  "Cine Plaza",
  "images/M-16/16.4.cineplaza/16.4.cineplaza.1. Archivo B+M Manuel Belgrano.jpg",
  ` <p>El Cine Teatro Plaza, ubicado en Colón 27, fue inaugurado el 16 de octubre de 1946. Su edificación estuvo a cargo de la constructora Rives, Indivieri & Cia. En aquella época contaba con una capacidad para 1300 personas, su sala recibía al espectador con un alto nivel de confort, reflejado en sus butacas tapizadas en cuero, refrigeración y calefacción central, sistema contra incendios, proyectores al nivel de las grandes salas Nacionales, iluminación fluorescente, implementos y maquinarias eléctricas y  excelentes decorados y  cortinados.</p>
    <p>Con el correr de los años el cine pasó por diversas administraciones y concesiones que llevaron al declive de sus actividades, hasta que, en la década del 80, cerró sus puertas. En el año 1988 la Municipalidad de Godoy Cruz adquirió la concesión del edificio y comenzó a realizar nuevamente actividades culturales. El Honorable Concejo Deliberante decidió declarar de interés cultural al Cine Teatro Plaza el 5 de octubre de 1998, por su prolífica trayectoria en favor de la cultura, recreación y servicios a la comunidad. Asimismo, el Gobierno provincial resolvió declararlo, en el año 1999, Patrimonio Cultural de la Provincia de Mendoza, según Resolución Nº 577/98.</p>
    <p>El edificio presenta influencia del Art Decó, que se caracteriza por las grandes fachadas de monumentalidad y gran rigor geométrico. En el Cine Plaza destaca el remate donde se observan líneas quebradas y escalonadas, típicas de esta arquitectura. Tanto la tipografía del cartel luminoso de la entrada, como la iluminación cenital ascendente forman parte del vocabulario formal del estilo y su voluntad de sofisticación, elegancia y decorativismo.
    </p>
  
      <p><strong>Fuentes:</strong></p>
  <p><strong>Imágenes</strong></p>
  <ul>
      <li>img 1 Archivo fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz.</li>
      <li>ima 2 Archivo fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz.</li>

  </ul>
  <p><strong>Bibliografía:</strong></p>
  <ul>
      <li>-Base documental del Departamento de Patrimonio Cultural. Dirección de Planificación urbana y ambiente. 2007-2009. Equipo: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.</li>

  </ul>
  `,

  ["images/M-16/16.4.cineplaza/16.4.cineplaza.1. Archivo B+M Manuel Belgrano.jpg", "images/M-16/16.4.cineplaza//16.4.cineplaza.2.Archivo B+M Manuel Belgrano.jpg"], // Exterior
  [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-72, 14, 87.6],
      target: [-72, 9, 45.6]
    });

createMarker(
  scene, 
  buttons,
                //x/z/y
  new Vector3(-75.2, 1, 57.6),
  "Cine Coliseo",
  "images/M-16/16.6.cinecoliseo/16.6.cinecoliseo.1. Archivo B+M Manuel Belgrano.jpg",
  `<p>El Cine Coliseo funcionó desde el año 1926 frente a la plaza departamental, sobre la calle Colón. Proyectaba en horario de matiné y nocturno y era, además, cine al aire libre con techo corredizo. Su propietario era Francisco Castillo quien tenía la casa familiar en el mismo edificio.</p>

  <p><strong>Fuentes:</strong></p>
  <p><strong>Imágenes</strong></p>
  <ul>
      <li>img 1 Archivo fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz</li>
      <li>img 2 Archivo fotográfico Blog Mendoza Antigua</li>

  </ul>
  <p><strong>Bibliografía:</strong></p>
  <ul>
      <li>-Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano.
      </li>
      <li>Blog Mendoza Antigua</li>

  </ul>
  

  `,

  ["images/M-16/16.6.cinecoliseo/16.6.cinecoliseo.1. Archivo B+M Manuel Belgrano.jpg", "images/M-16/16.6.cinecoliseo//16.6.cinecoliseo.2.Blog MendozaAntigua.jpg"], // Exterior


  [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-75.2, 14, 99.6],
      target: [-75.2, 7, 57.6]
    });



createMarker(
  scene, 
  buttons,
                //x/z/y
  new Vector3(-78.3, 1, 68.6),
  "Terreno Cremaschi",
  "images/M-16/16.8.terrenocremaschi/16.8.LaParrala.1.Balmaceda, S. (2007).jpg",
  ` <p>De acuerdo a información obtenida en catastro, se puede afirmar que el predio de la esquina de calles Lavalle y Colón -donde hoy se encuentra la Farmacia Nazca y el restaurante La Parrala- pertenecía a Guillermo Cremaschi, aproximadamente desde la década del 1930. No se conoce con certeza qué función tenía la propiedad. Por testimonios de vecinos godoycruceños, se ha podido determinar que el bar y restaurante La Parrala, que ocupaba parte de la parcela, se instaló allí en la década del 50, con sus primeros dueños Sillas y Zabal. Ya en 1955 compró el fondo de comercio la familia Matesanz, oriunda de Madrid quien lo mantuvo hasta 1964, cuando se lo vendió a los Rodríguez, dueños actuales del negocio.</p>
  <p>Respecto del local de la esquina, donde hoy está instalada la Farmacia Nazca, es posible que allí funcionara un almacén llamado “Don Mario”, que, hacia la década del 1964, continuaba abierto. Asimismo, en este predio se instaló el local de indumentaria “Casa Pintos” -cuya ubicación previa, en el año 1942, era la calle Rivadavia al 500-. La familia Pintos compró este terreno y construyó el edificio que se aprecia actualmente, donde funcionaba su negocio de ropa para damas y caballeros. </p>
  <p>En la actualidad el predio originario de la familia Cremaschi está ocupado por la Farmacia Nazca, en la esquina de Colón y Lavalle, que es la más reciente del conjunto de farmacias que circundan la plaza departamental en sus cuatro esquinas; y en el terreno contiguo, sobre calle Colón, sigue existiendo el emblemático  restaurante La Parrala. </p>
  <p><strong>Texto:</strong>  María Virginia Goldar/Andrea Segura</p>
      <p><strong>Fuentes:</strong></p>
  <p><strong>Imágenes</strong></p>
  <ul>
      <li>img1 Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano. </li>


      <li>imag 2 Archivo fotográfico MUVI GC/DCeIC/MGC      </li>

  </ul>
  <p><strong>Fuente:</strong></p>
  <ul>
      <li>Planos de catastro.</li>
      <li>Entrevista con los dueños de Zapatería Ebro, Librería Rivadavia, Farmacia Godoy Cruz.</li>
      <li>Entrevista a María Rosa Cremaschi, Marisa Matesanz, Enedina Rodriguez.</li>
 </ul>
 

  `,

  ["images/M-16/16.8.terrenocremaschi/16.8.LaParrala.1.Balmaceda, S. (2007).jpg", "images/M-16/16.8.terrenocremaschi/16.8.terrenocremaschi.2.MUVI GC_DCeIC_MGC.jpg"], // Exterior


  [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-78.3, 14, 110.6],
      target: [-78.3, 7, 68.6]
    });

//MANZANA 17--------------------------------------------------------      

createMarker(
  scene, 
  buttons,
                //x/z/y
  new Vector3(-16.31, 2, 51.8 ),
  "Casa Municipal (Honorable concejo deliberante )",
  "images/M-17/17.1.edificioconsejodeliberante/17.1.edificioconsejodeliberante.2.Archivo  B+M Manuel Belgrano.jpg",
  ` <p>Considerado como uno de los edificios más antiguos de la villa cabecera de Godoy Cruz, fue sede de la Subdelegación departamental desde su creación en 1887. La obra se inició durante el gobierno municipal de Agustín Vaquié y Antonio Ortíz (1887 - 1889) y su ejecución estuvo a cargo de la empresa constructora Knoll Estrella Carreras, quienes la culminaron dos años después, para que finalmente su ocupación fuese efectiva en el año 1891. En la actualidad, sigue cumpliendo las funciones administrativas para la que fue creado.
  </p>
    <p>El edificio fue diseñado con una gran influencia y referencia a la cultura europea. Con una planta octogonal de traza simétrica, se despliegan desde un gran salón central 4 bloques diagonales. Su acceso principal es una puerta de dos hojas de doble altura con vista al oeste, enmarcada por columnas dóricas con basamento de cuerpo liso. Sobre éstas se apoya el dintel que sostiene el frontis triangular. Presenta dos entradas secundarias en los laterales norte y sur, a las que se accede por sus escalinatas y galería semi-cubiertas.</p>
    <p>Su apariencia externa se caracteriza por un marcado almohadillado cuyos colores, a partir de la restauración de 1990, son el rojo veneciano con alternancia de blancos, que remiten a sus  orígenes constructivos.</p>
    <p>El Gobierno Municipal declaró al edificio como Patrimonio Cultural en 2006, para finalmente, durante el gobierno de Tadeo Garcia Zalazar en el año 2017, realizar una segunda serie de tareas de restauración y conservación.</p>
    <p>Dato interesante: en la actualidad, el edificio conserva carpinterías, solados y ornamentación originales en un buen estado general.
    </p>
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
      <p><strong>Fuentes:</strong></p>
  <p><strong>Imágenes</strong></p>
  <ul>
      <li>img 1 Archivo fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz.</li>
      <li>ima 2 Archivo fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz.</li>
      <li>ima 3 Archivo fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz.</li>
  </ul>
  <p><strong>Bibliografía:</strong></p>
  <ul>
      <li>(2005) Material por los 150 Aniversario de Godoy Cruz, patrimonio cultural.</li>
      <li>(23 de junio 2007) El edificio público más antiguo de la provincia fue restaurado por el municipio. Sitio web: <a href="https://www.godoycruz.gob.ar/el-edificio-publico-mas-antiguo-de-la-provincia-fue-remodelado-por-el-municipio/"  target="_blank">https://www.godoycruz.gob.ar/el-edificio-publico-mas-antiguo-de-la-provincia-fue-remodelado-por-el-municipio/</a></li>
      <li>Agustín Merino (2014) Concejo Deliberante de Godoy Cruz. Arquitectura de Mendoza: Pasado , Presente y Futuro. Sitio Web:https://arquitecturamendoza.wordpress.com/2014/11/06/concejo-deliberante-godoy-cruz/
      </li>
</ul>

  `,

  ["images/M-17/17.1.edificioconsejodeliberante/17.1.edificioconsejodeliberante.2.Archivo  B+M Manuel Belgrano.jpg", "images/M-17/17.1.edificioconsejodeliberante/17.1.edificioconsejodeliberante.3.Archivo  B+M Manuel Belgrano.jpg"], // Exterior
  ["images/M-17/17.1.edificioconsejodeliberante/17.1.edificioconsejodeliberante.1.Archivo  B+M Manuel Belgrano.jpg", ],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-16.31, 14, 93.8],
      target: [-16.31, 8, 51.8]
    });

createMarker(
  scene, 
  buttons,
                //x/z/y
  new Vector3(-5.58, 2, 82.5 ),
  "Escuela Rawson",
  "images/M-17/17.6.escuelarawson/17.6.escuelarawson.1.DPC_DPUyA_MGC.jpg",
  `<p>Considerada como el primer colegio público del departamento, fue fundada el 14 de marzo de  1863. A lo largo de los años tuvo una sucesión de denominaciones y ubicaciones que culminaron con el nombre de Colegio Dr. Guillermo Rawson, en 1922 y el emplazamiento definitivo en calle Azopardo en 1934</p>
  <p>Al igual que otras instituciones departamentales, el colegio fue un punto de encuentro vecinal que brindaba no sólo enseñanza sino también  apoyo a personas carenciadas. Es por ello que, durante la dirección de Blanca Garay de Morales (1912-1914), se gestionó e instaló un teléfono para el uso del colegio y los vecinos, la organización del botiquín escolar y numerosas  acciones solidarias como el reparto de abrigo, vestimenta y el desayuno a los niños necesitados del turno mañana.
  </p>
  <p>En el colegio en la actualidad funciona, en el turno mañana la escuela primaria y, por la tarde, comparten edificio la Escuela Aguirre (Artística Vocacional) y las Niñas de Ayohuma (Centro de Capacitación).
  </p>
  <p></p>Arquitectónicamente pertenece al lenguaje clásico-académico, muy frecuente en la década del 20 y 30 en nuestro país, sobre todo en la arquitectura oficial. Su fachada es simétrica, coincidiendo su eje central con la entrada al edificio, resuelta con un pórtico de triple arcada. En su interior posee una galería central que comunica a un espacioso salón de actos y a dos patios rodeados por las aulas con galerías abiertas.
  </p>
  <p>El edificio cuenta con protección patrimonial establecida por la Ley Nº 7.161, del Senado y Cámara de Diputados de la Provincia de Mendoza, donde se lo declaró bien de valor histórico y cultural de la provincia. </p>
  <p><strong>Texto:</strong> Andrea Segura / Virginia Goldar</p>

  <p><strong>Fuentes:</strong></p>
  <p><strong>Imágenes</strong></p>
  <ul>
      <li>img 1 Archivo fotográfico Equipo Muvi GC</li>
      <li> img 2 Archivo fotográfico Escuela Dr. Guillermo Rawson</li>
      <li> img 3 Archivo fotográfico Escuela Dr. Guillermo Rawson</li>
 </ul>
  <p><strong>Bibliografía/Fuente</strong></p>
  <ul>
      <li><a href="https://escuelarawsonmendoza.wordpress.com"  target="_blank">https://escuelarawsonmendoza.wordpress.com</a></li>
       <li>Archivo fotográfico Colegio Rawson.</li>
       <li>Mastrangelo, F (2016). Godoy Cruz, una historia: Del barrio de San Vicente a la ciudad de hoy (1° ed.). Municipalidad de Godoy Cruz: Victorioso Ediciones.</li>
       <li>Nardechia, Marcelo y Raffa, Cecilia. Guía del Patrimonio Cultural de Godoy Cruz, Godoy Cruz, 2 ediciones, 2007 y 2013.Dirección de Planificación Urbana y Ambiente, Municipalidad de Godoy Cruz.</li>

       <p>Más información de : 
       </p> <a href="https://museovirtual.godoycruz.gob.ar/instituciones/#rawson"  target="_blank">Rawson</a></p>
       




  </ul>
  

  `,

  ["images/M-17/17.6.escuelarawson/17.6.escuelarawson.1.DPC_DPUyA_MGC.jpg","images/M-17/17.6.escuelarawson/17.6.escuelarawson.2.Archivo Rawson.jpg"], // Exterior


  ["images/M-17/17.6.escuelarawson/17.6.escuelarawson.3.Archivo Rawson.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-5.58, 14, 124.5],
      target: [-5.58, 8, 82.5]
    });



createMarker(
  scene, 
  buttons,
                //x/z/y
  new Vector3(-31.5, 1,  76.57),
  "Farmacia del Pueblo",
  "images/M-17/17.9.farmaciadelpueblo/17.9.farmaciadelpueblo.1.Balmaceda, S (2007).jpg",
  ` <p>Fundada a principios de la década de 1910 por la familia Llano, la Farmacia del Pueblo se ubicaba en la esquina de las actuales calle Azopardo y Perito Moreno, frente a la plaza departamental de Godoy Cruz. El tradicional comercio comprendía originalmente la farmacia en la esquina y una óptica contigua, sobre Perito Moreno, que tenía entrada independiente.</p>
  <p>A través de una fotografía de archivo, fechada en 1914, se aprecia que el edificio poseía una fachada en ochava, donde estaba inscripto el nombre de Joaquin Llano acompañado por los títulos de “Químico y Farmacéutico”. El alzado de la construcción estaba resuelto con un zócalo con basamentos donde se apoyaban pilastras adosadas al muro. El conjunto remataba con un paramento liso donde aparecía, en diversos ángulos, el nombre “Farmacia del Pueblo”. La foto también aporta el dato que la entrada al local se realizaba por la calle Azopardo.
  </p>
  <p>En la actualidad, el edificio es parte de la cadena de farmacias Del Plata y en el local lindante, donde estaba la óptica, funciona un kiosco. La construcción no ha sido modificada sustancialmente. Se observan, no obstante, algunas intervenciones como el ingreso al local, que se realiza por la ochava que destaca por una marquesina de hierro. Asimismo sus muros laterales presentan almohadillado y en ellos se observan grandes vidrieras enmarcadas por molduras con ornamentos.
  </p>
 
  <p><strong>Texto:</strong>  María Virginia Goldar/Andrea Segura</p>
      <p><strong>Fuentes:</strong></p>
  <p><strong>Imágenes</strong></p>
  <ul>
      <li>img 1 Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano. </li>
      <li>img 2 Archivo fotográfico Equipo Muvi GC</li>

      </ul>
      <p><strong>Bibliografía:</strong></p>
      <ul>
          <li>Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano.</li>
          <li>Nardechia, M. y Raffa, C. (dirs) (2023) en Prensa. Arquitectura, sitios y paisajes de Godoy Cruz. Guía de Patrimonio cultural 2023. Godoy Cruz, Municipalidad de Godoy Cruz.</li>
      </ul>
 

  `,

  ["images/M-17/17.9.farmaciadelpueblo/17.9.farmaciadelpueblo.1.Balmaceda, S (2007).jpg","images/M-17/17.9.farmaciadelpueblo/17.9.farmaciadelpueblo.2.MUVI GC_DCeIC_MGC.jpg"], // Exterior


  [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-31.5, 14, 118.57],
      target: [-31.5, 7, 76.57]
    });





  //MANZANA 18--------------------------------------------------------
  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(29.95, 3,  59.1),

    "Compañia de María",

    "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.3.Girini (2014).jpg",

    `
    <p>Este colegio estaba ubicado originalmente en la calle Rivadavia y Sargento Cabral en terrenos donados por la Sra Olaya Pescara de Tomba. Actualmente se encuentra en Azopardo 206. Es uno de los centros educativos más antiguos del departamento de Godoy Cruz, fue la primera escuela de gestión privada de la zona. Se fundó en el año 1905 como colegio de instrucción primaria de niñas.</p>

    <p>El antiguo Colegio de la Compañía de María de Godoy Cruz, antes de ser afectado por el terremoto de 1985, tenía un terreno más extenso que el actual y distinta disposición de sus dependencias. El ingreso se realizaba por calle Rivadavia. Detrás del muro de rejas y pilastras que circundaba toda la propiedad, se visualizaba un jardín externo por el cual se accedía al colegio, la capilla y distintos ambientes.</p>

    <p>En el interior de la edificación, estaba organizado con galerías que se abrían a patios internos a modo de claustros donde funcionaban las aulas. En uno de estos patios internos, se encontraba la escultura del Sagrado Corazón de Jesús sobre un gran pedestal -que hoy en día se sigue apreciando en la institución-. Sobre la misma línea de la calle Rivadavia, se observaba también el ingreso a la capilla. La edificación del templo era de planta basilical con una sola nave y techo a dos aguas. Su exterior destacaba por la fachada con un gran portal de ingreso resuelto con un arco de medio punto. El conjunto remataba con un frontón triangular, ornamentado con arcos de medio punto que circundaban todo el perímetro de la construcción. Dicha capilla ya no existe en la actualidad.</p>

    <p><strong>Texto:</strong> María Virginia Goldar/ Andrea Segura.</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        
        <li> img 1 Archivo fotográfico Colegio Compañía de María </li>
        <li> img 2 Archivo fotográfico Colegio Compañía de María </li>
        <li> img 3 Girini, L. (2014). La revolución vitivinícola en Mendoza 1985-1910: las transformaciones en el territorio, el paisaje y la arquitectura. Idearium. Fondo de la Cultura de Mendoza. </li>
        <li> img 4 Archivo fotográfico Colegio Compañía de María </li>
        <li> img 5 Archivo fotográfico Colegio Compañía de María </li>
        
    </ul>
    <p><strong>Bibliografía/Fuentes:</strong></p>
    <ul>
        <li>Archivo fotográfico del Colegio Compañia de María de Godoy Cruz</li>
        <li>Testimonios de personal del Colegio: Alicia Rey, Laura Deloche</li>
        <li>Mastrangelo, F. (2016). <i>Godoy Cruz, una historia: del barrio de San Vicente a la ciudad de hoy</i>. Victorioso Ediciones.</li>
    </ul>
    <p>Más información de : 
    </p> <a href="https://museovirtual.godoycruz.gob.ar/instituciones/#maria"  target="_blank">Compañia de maria</a></p>
    </p> <a href="https://museovirtual.godoycruz.gob.ar/personajes/#olaya"  target="_blank">Olaya Pescara de Tomba</a></p>
    `,

    ["images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.1.Archivo fotográfico Colegio Compañía de María.jpg", "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.2.Archivo fotográfico Colegio Compañía de María.jpg"], // Exterior
    ["images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.3.Girini (2014).jpg", "images/M-18/18.1.Compañiademaria/18.1.compañiademaria.4.Archivo fotográfico Colegio Compañía de María.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [29.95, 14, 101.1],
      target: [29.95, 9, 59.1]
    });


    //MANZANA 19--------------------------------------------------------
    createMarker(
      scene, // Cambiado a 'scene' como objeto de referencia
      buttons,
      new Vector3(66, 0,  82.5),
  
      "Club Olimpia",
  
      "images/M-19/19.7.clubolimpia.1.Alicia Viotti.jpg",
  
      `
      <p>Fue fundado el 4 de octubre de 1933, por iniciativa de un grupo de jóvenes godoycruceños con el propósito de practicar básquetbol. En 1934 se incorporó a la Federación mendocina de dicho deporte.</p>
  
      <p><strong>Texto:</strong> Verónica Cremaschi (INCIHUSA-CONICET)</p>
      <p><strong>Fuentes:</strong></p>
      <p><strong>Imágenes</strong></p>
      <ul>
          <li>Centro Cultural y Deportivo Olimpia, calle Figueroa Alcorta 60. Departamento de Godoy Cruz. año aprox de la foto 1933. Provincia de Mendoza (Gentileza de Alicia Viotti)</li>
      </ul>
      <p><strong>Bibliografía:</strong></p>
      <ul>
          <li>Guía General de Mendoza 1940</li>
      </ul>
      `,
  
      ["images/M-19/19.7.clubolimpia.1.Alicia Viotti.jpg"], // Exterior
      [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [66, 14, 124.5],
      target: [66, 6, 82.5]
    });

  //MANZANA 23--------------------------------------------------------
  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-157, 0, 95),

    "Bodega Cremaschi",

    "images/M-23/23.20.bodegacremaschi/23.20.bodegacremaschi.2.Album Los Argentinos (1924).jpg",

    `
    <p>Luis, nacido en Italia, llegó a Mendoza en 1886, era artesano especializado en la fabricación de toneles y se dedicó a ello cuando se radicó en la provincia. En 1895 adquirió su bodega en Godoy Cruz, en proximidad a la plaza departamental, y se introdujo en el negocio de la elaboración de vinos. Tiempo después, con el crecimiento de su empresa, sus hijos se asociaron y Luis Segundo asumió la gerencia. Además de la bodega de Godoy Cruz, pronto compraron una finca en Jocolí, Lavalle. Sus vinos recibieron medallas en distintos certámenes europeos. También incursionaron en la fabricación de alcoholes derivados de la vid. La bodega contaba con dos naves paralelas con techumbre a dos aguas y amplias galerías cubiertas integradas al patio. En el mismo predio se encontraba la casa patronal, el único edificio que aún se conserva parcialmente en la intersección de calles Las Heras y Urquiza. Luis fue vecino activo del departamento y, como tal, formó  parte de la comitiva de recepción del Príncipe de Piamonte que visitó estas tierras en 1924.</p>
   
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
       <li>Album Los Argentinos (1924)</li>    
       <li>DPC_DPUyA_MGC(1924)</li>  
    </ul>

    <p><strong>Bibliografía/Fuente:</strong></p>
    <ul>
        <li>Álbum Los Argentinos a SAR el príncipe de Piamonte Don Umberto de Savoia, en ocasión de su visita a Mendoza, 1924.</li>
    </ul>
    `,

    ["images/M-23/23.20.bodegacremaschi/23.20.bodegacremaschi.2.Album Los Argentinos (1924).jpg", "images/M-23/23.20.bodegacremaschi/23.20.bodegacremaschi.1.Album Los Argentinos (1924).jpg"], // Exterior
    ["images/M-23/23.20.bodegacremaschi/23.20.bodegacremaschi.3.DPC_DPUyA_MGC.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-157, 14, 137],
      target: [-157, 6, 95]
    });



   //MANZANA 25--------------------------------------------------------

   createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-71.2, 8, 79.4),

    "Comisaria Septima",

    "images/M-25/25.1.comisariaseptima/25.1.comisaria7ma.1. Web Municipalidad GC.jpg",

    `
    <p>Este edificio, hoy Casa de la Cultura y la Memoria, fue inaugurado en el año 1928. Ubicado en la esquina de Colón y Lavalle, fue proyectado por el arquitecto mendocino Raúl J. Álvarez y la construcción la llevó a cabo Rafael Amadei. Inicialmente se pensó como casa departamental, donde se prestarían servicios municipales y policiales; sin embargo la mayor parte del siglo XX y hasta el año 2019 fue sede de la comisaría 7ma -hasta que ésta fue trasladada a su nueva base, en un sector de recuperación urbana, en la esquina suroeste del parque San Vicente-. 
    </p>

    <p>Estilísticamente el lenguaje ecléctico es el que predomina, ya que se combinan libremente distintos elementos de la tradición clásica. El edificio está totalmente revestido con un almohadillado rústico, en la zona inferior, y un almohadillado sutil en su parte superior. Su fachada principal, sobre calle Lavalle, destaca por su pórtico de ingreso con triple arquería, al que se accede por una escalinata de mármol blanco. Sobre esta entrada, descansa un balcón con balaustrada y cuatro columnas. En el ángulo derecho de la fachada, sobresale una torre rematada con cúpula que alberga un reloj. Por la calle Colón, se observa otro ingreso al edificio que presenta un frontis triangular con un escudo en el tímpano. Todo el conjunto se encuentra ornamentado con diversos elementos como: ménsulas, guirnaldas, cornisas y balaustradas. 
    </p>

    <p>En 2003 el edificio fue declarado bien patrimonial de Mendoza, en tanto que en 2007, se lo declaró como parte del Patrimonio Cultural de Godoy Cruz. 
    Es menester señalar que durante la última dictadura militar (1976-1983), la comisaria 7ma funcionó como centro clandestino de detención, tortura y exterminio. Por ello hoy en día funciona como Espacio de la Memoria.
    </p>
    <p>Actualmente la construcción alberga oficinas dependientes de la Dirección de Cultura e Industrias Creativas, Dirección de Tránsito, Apoderados y la Dirección de Relaciones con la Comunidad.</p>

    <p><strong>Texto:</strong> María Virginia Goldar/Andrea Segura</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        

        <li> Img: Comisaría 7° en página oficial de la Municipalidad de Godoy Cruz. sitio Web: <a href="https://www.godoycruz.gob.ar/sitio2/?attachment_id=28427"  target="_blank">https://www.godoycruz.gob.ar/sitio2/?attachment_id=28427</a></li>
        <li> Img 2: Archivo fotográfico cedido por la Casa de la Memoria, ex Comisaría 7ma. </li>
        <li> Img 3: Archivo fotográfico Biblioteca- Mediateca Manuel Belgrano, Godoy Cruz. </li>
        <li> Img 4: Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano. </li>
        <li> Img 5: Archivo Equipo fotográfico Equipo MUVI GC (noviembre 2023) </li>
    </ul>
    <p><strong>Bibliografía/Fuente:</strong></p>
    <ul>
         <li>-(24 de marzo de 2021). La comisaría séptima de Godoy Cruz, un nuevo espacio de la Memoria. Los Andes. <a href="https://www.losandes.com.ar/sociedad/la-comisaria-septima-de-godoy-cruz-un-nuevo-espacio-de-la-memoria/"  target="_blank">https://www.losandes.com.ar/sociedad/la-comisaria-septima-de-godoy-cruz-un-nuevo-espacio-de-la-memoria/</a>
        </li>
        <li>Mastrangelo,F. (2016). Godoy Cruz, una historia. Del barrio de San Vicente a la ciudad de hoy. Victorioso Ediciones y Municipalidad de Godoy Cruz.</li>
    </ul>
    `,
 
    [ "images/M-25/25.1.comisariaseptima/25.1.comisaria7ma.1. Web Municipalidad GC.jpg",  "images/M-25/25.1.comisariaseptima/25.1.comisaria7ma.4.Balmaceda, S (2007).jpg",  "images/M-25/25.1.comisariaseptima/25.1.comisaria7ma.2.Archivo Casa de la Memoria.jpg"], // Exterior
    [ "images/M-25/25.1.comisariaseptima/25.1.comisaria7ma.3.Archivo B+M Manuel Belgrano.jpg",  "images/M-25/25.1.comisariaseptima/25.1.comisariaseptima.5.MUVI GC_DCeIC_MGC.jpg",  "images/M-25/25.1.comisariaseptima/25.1.comisariaseptima.6.MUVI GC_DCeIC_MGC.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-71.2, 14, 121.4],
      target: [-71.2, 14, 79.4]
    });



   createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-60.7, 12, 84.93),

    "Parroquia San Vicente Ferrer",

    "images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.1.MUVI GC_DCeIC_MGC.jpg",

    `
    <p>De todos los templos religiosos que tiene Godoy Cruz, sin duda, uno de los más representativos es la parroquia San Vicente Ferrer, ubicada, en la actualidad, en calle Lavalle al 60. 
    </p>

    <p>En el año 1753, Don Tomás de Coria estableció en sus terrenos un oratorio erigido en honor a San Vicente Ferrer, religioso español miembro de la orden dominicana. Este sitio, venía a satisfacer las necesidades religiosas de los habitantes de la región, quienes concurrían allí a celebrar bautismos, casamientos, novenas, etc. En 1804 se elevó al rango de parroquia alrededor de la cual se estableció un poblado llamado Villa de San Vicente.
    </p>

    <p>Esta parroquia estuvo situada en el terreno frente al ángulo noreste de la plaza actual de Godoy Cruz, entre las calles Antonio Tomba, Rivadavia y Balcarce, hasta el actual Espacio Verde Luis Menotti Pescarmona. Sin embargo, el terremoto acaecido el 20 de marzo de 1861 en toda la zona de Cuyo, destruyó parcialmente el templo lo que condicionó su traslado.</p>

    <p>A raíz de esta pérdida, los vecinos e integrantes de la comisión pro-templo, como Balbino Arizu (1858-1936), decidieron edificar una nueva iglesia en la cuadra sur, frente a la plaza departamental. Los esfuerzos dieron sus frutos y en 1906 se comenzó a erigir. La inauguración se produjo en 1912 y fue consagrada por el obispo José Américo Orzali. La ornamentación y decoración quedaron a cargo del Padre Celestino Arce, quien con el esfuerzo conjunto de la comunidad, logró levantar los retablos mayores y menores junto a la imaginería religiosa que en la actualidad sigue presente. Sin embargo, desde 1979, se realizaron constantes obras de remodelación, como las del solar de la Virgen de Lourdes y la incorporación del monumento al Tropero Sosa, ubicado al costado oeste de la parroquia.
    </p>

    <p>Desde el año 2023, gracias a las gestiones del párroco Horacio Day, el Vaticano la declaró como Basílica, y a que cuenta con los requisitos históricos, arquitectónicos  y pastorales.</p>

A
    <p><strong>Texto:</strong> Andrea Segura/ Gutierrez Camila, equipo MUVI GC.</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li> Img 1: Archivo Fotográfico Equipo MUVI GC.</li>
        <li> Img 2: Archivo Fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz </li>
        <li> Img 3: Archivo Fotográfico Instituto San Vicente Ferrer.</li>
        <li> Img 4: Archivo Fotográfico Instituto San Vicente Ferrer.</li>
        <li> Img 5: Archivo Fotográfico Instituto San Vicente Ferrer.</li>
    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Braverman A. Girini, L. (2007)  SAN VICENTE FERRER. Patrimonio Arquitectónico y Urbano de Godoy Cruz.</li> 
       <li> Mastrangelo, F. (2016) Godoy Cruz, una historia, Del barrio de San Vicente a la ciudad de hoy. Municipalidad de Godoy Cruz: Bicentenario de la Independencia.</li> 
       <li> Arguello, E. (4 de Diciembre 2023) La parroquia San Vicente Ferrer fue nombrada "basílica" por el Vaticano. MendozaPost: <a href="https://www.mendozapost.com/sociedad/la-parroquia-san-vicente-ferrer-fue-nombrada-basilica-por-el-vaticano/"  target="_blank">https://www.mendozapost.com/sociedad/la-parroquia-san-vicente-ferrer-fue-nombrada-basilica-por-el-vaticano//</a>   
        </li>
    </ul>
    <p>Más información de : 
    </p> <a href=" https://museovirtual.godoycruz.gob.ar/iglesia-san-vicente/"  target="_blank">Iglesia San Vicente</a></p>
    </p> <a href="https://museovirtual.godoycruz.gob.ar/centro-historico/"  target="_blank">Centro Historico</a></p>
    </p> <a href="https://museovirtual.godoycruz.gob.ar/personajes/#arce"  target="_blank">Arce</a></p>

    `,

    ["images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.1.MUVI GC_DCeIC_MGC.jpg", "images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.2.Archivo B+M Manuel Belgrano.jpg"], // Exterior
    ["images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.3.Archivo Instituto San Vicente Ferrer.jpg", "images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.4.Archivo Instituto San Vicente Ferrer.jpg", "images/M-25/25.2.parroquiasanvicenteferrer/25.2.parroquiasanvicenteferrer.5.Archivo Instituto San Vicente Ferrer.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-60.7, 14, 126.93],
      target: [-60.7, 18, 84.93]
    });

  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-45, 1, 82.5),

    "La Perla",

    "images/M-25/25.3.laperla/25.3.la perla.1.Archivo Instituto San Vicente Ferrer.jpg",

    `
    <p>La Perla fue un restaurante ubicado en el predio contiguo a la parroquia San Vicente Ferrer hacia el este. Según relatos de vecinos el dueño era de apellido Babillon y preparaba, entre otros platos, comidas típicas francesas.
    </p>

    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li> img 1 Archivo fotográfico Instituto San Vicente Ferrer</li>
        <li> img2 Archivo fotográfico Instituto San Vicente Ferrer</li>
        <li> img3 Archivo fotográfico Instituto San Vicente Ferrer</li>
    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>-Balmaceda, S. (2010). Godoy Cruz. Historias barriales contadas por sus protagonistas. Municipalidad de Godoy Cruz.
        </li>
    </ul>

    `,

    ["images/M-25/25.3.laperla/25.3.la perla.1.Archivo Instituto San Vicente Ferrer.jpg", "images/M-25/25.3.laperla/25.3.laperla.2.Archivo Instituto San Vicente Ferrer.jpg"], // Exterior
    ["images/M-25/25.3.laperla/25.3.laperla.3.Archivo Instituto San Vicente Ferrer.jpg"],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-45, 14, 124.5],
      target: [-45, 7, 82.5]
    });


  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-51, 1, 114),

    "Casa de Música Benito",

    "images/M-25/25.11.casabenito/25.11.casabenito.1.jpg",

    `
    <p>Hasta el año 2016, en la intersección de Perito Moreno y Urquiza, se encontraba la antigua residencia de  Casa Benito. Sin embargo, debido a los estragos causados por las persistentes lluvias de ese año, la estructura de adobe cedió, obligando al municipio a tomar la decisión de demolerla por motivos de seguridad.</p>

    <p>De acuerdo con los relatos de los residentes locales, este establecimiento desempeñó el papel de una disquería a lo largo del siglo XX, siendo uno de los escasos comercios dedicados a la música de esa época.</p>

    <p><strong>Texto:</strong> Andrea Segura, Virginia Goldar (MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Google Map</li>
       
    </ul>
    <p><strong>Fuente:</strong></p>
    <ul>
        <li>(19 de mayo de 2016)Se derrumbó la “Casa Benito Música” de Godoy Cruz por las lluvias. Los Andes. sitio web: 
        <a href="https://www.losandes.com.ar/se-derrumbo-la-casa-benito-musica-de-godoy-cruz-por-las-lluvias/"  target="_blank">https://www.losandes.com.ar/se-derrumbo-la-casa-benito-musica-de-godoy-cruz-por-las-lluvias/</a>
        </li>
    </ul>
 `,

    ["images/M-25/25.11.casabenito/25.11.casabenito.1.jpg", "images/M-25/25.11.casabenito/25.11.casabenito.2.jpg"], // Exterior
    [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-51, 14, 156],
      target: [-51, 7, 114]
    });

  //MANZANA 26--------------------------------------------------------
  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-33, 3, 85),

    "Banco Mendoza",

    "images/M-26/26.1.exbancomendoza/26.1.bancomendoza.1.Blog MendozaAntigua.jpg",

    `
    <p>Esta entidad de origen mixto, construyó hacia fines de la década de 1940, 15 sucursales en distintos lugares de la Provincia. Si bien tienen características particulares, todos los edificios fueron dispuestos en una planta en esquina conformando una ochava y desplegándose a ambas calles.</p>

    <p>Específicamente este edificio fue inaugurado el 28 de agosto de 1948. Estilísticamente está resuelto con una estética geometrizante cercana al Art Decó, muy de moda por entonces, en que las líneas rectas preponderaban en la decoración. El Art Decó fue un movimiento que surgió en los años 1920 y cuya influencia se extendió hasta la década de 1950. Se plasmó en distintas expresiones como arquitectura, diseño interior y diseño gráfico e industrial. Así en la fachada del edificio del Banco podemos observar la economía decorativa característica de este estilo, en que resaltan las formas geométricas. Por ejemplo observamos un fuerte zócalo inferior y molduras en cornisas rectas que recorren todo el edificio y refuerzan el carácter compacto y volumétrico del edificio.
    </p>

    <p>Un elemento destacado y muy frecuente en otras entidades bancarias, era el reloj que se encontraba sobre la puerta y que daba cuenta de la importancia que había adquirido el tiempo en relación con el mundo moderno de los negocios. En 2018 fue parte de una polémica debido a que fue puesto a la venta en un portal de internet por un particular lo que desencadenó la intervención del Estado provincial.
    </p>

    <p><strong>Texto:</strong>  Verónica Cremaschi (INCIHUSA CONICET)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>img 1 Archivo fotográfico Blog Mendoza Antigua</li>
   </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Info fuente</li>
    </ul>

    `,

    ["images/M-26/26.1.exbancomendoza/26.1.bancomendoza.1.Blog MendozaAntigua.jpg",], // Exterior
    [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-33, 14, 127],
      target: [-33, 9, 85]
    });

  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-34, 1, 91),

    "Ferreteria Suarez",

    "images/M-26/26.32.ferreteriasuarez/26.32.ferreteríasuarez.1.Balmaceda, S. (2007).jpg.png",

    `
    <p>Iniciada en 1920 por sus dueños, la Ferretería Suarez se ubicaba originalmente en Perito Moreno 122. En la actualidad se encuentra por la misma calle al 257 con una artística fachada que remite a sus orígenes. Marcial, su fundador dejó la empresa a su hijo José Marcial convirtiéndolo en su socio a la edad de 13 años.</p>

    
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Img 1: Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano.</li>
        <li>Img 2: Archivo fotográfico Biblioteca Medioteca Manuel Belgrano, Godoy Cruz.</li>

   </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano.
        </li>
    </ul>
    `,

    ["images/M-26/26.32.ferreteriasuarez/26.32.ferreteríasuarez.2. Archivo fotográfico B+M Manuel Belgrano.jpg"], // Exterior
    [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-34, 14, 133],
      target: [-34, 7, 91]
    });

//MANZANA 32--------------------------------------------------------
  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-157, 0, 170),

    "Club Sportivo Godoy Cruz",

    "images/M-32-33/33.1.clubsportivogodoycruz.1.Página oficial del Club Antonio Tomba Godoy Cruz.jpg",

    `
    <p>El Club Sportivo Godoy Cruz tuvo su fundación en 1921 como una iniciativa gestada entre un grupo de amigos congregados en el "Bar Victoria". Movidos por el floreciente ambiente de la época, decidieron fundar un club deportivo. El 1 de junio de 1921 marcó el nacimiento oficial del Club Sportivo Godoy Cruz, bajo la presidencia inicial de Don Romero Garay.
    </p>

   <p>Para establecer su presencia, la "Bodega Antonio Tomba" generosamente cedió terrenos inicialmente destinados a establos para sus caballos y carretas. Así, en 1923, Godoy Cruz inauguró su primera cancha oficial en la intersección de las calles Las Heras y Juan José Castelli, ubicadas en el propio departamento. La inauguración oficial tuvo lugar el 1 de noviembre en un evento memorable que enfrentó al equipo contra el Atlético Palmira, resultando en un emocionante empate 4-4. Este partido inaugural marcó el inicio de una rica historia para el Club Sportivo Godoy Cruz, arraigándose como una entidad fundamental en el ámbito deportivo local.</p>
   <p>En 1930, se materializó la fusión entre el Club Sportivo Godoy Cruz y el Club de la Bodega Antonio Tomba. Esta unión surgió como respuesta a la necesidad de amalgamar los esfuerzos de dos instituciones arraigadas en el departamento, combinandose para dar vida a un club más robusto y con mayores perspectivas: el Club Deportivo Godoy Cruz Antonio Tomba, liderado en su primera comisión por Dardo García.</p>
   <p>Resultado de esta fusión, el crecimiento del club continuó de manera constante, tanto que la entidad se integró a la Federación Mendocina de Básquet. Feliciano Gambarte asumió la presidencia, marcando el inicio de emocionantes enfrentamientos en las canchas de fútbol contra sus vecinos de Andes Talleres Sport Club. Este periodo marcó una etapa significativa en la evolución y consolidación del Club Deportivo Godoy Cruz Antonio Tomba.
   </p>

    <p><strong>Texto:</strong>  Verónica Cremaschi (INCIHUSA CONICET)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Img 1 y 2: Página oficial del Club Antonio Tomba Godoy Cruz https://clubgodoycruz.com.ar/linea-de-tiempo</li>
        
   </ul>
    <p><strong>Texto:</strong></p>
    <ul>
        <li>Página oficial del Club Godoy Cruz Antonio Tomba. Sitio Web: <a href="https://clubgodoycruz.com.ar/linea-de-tiempo/"  target="_blank">https://clubgodoycruz.com.ar/linea-de-tiempo/</a>
        </li>
    </ul>
 
    `,

    ["images/M-32-33/33.1.clubsportivogodoycruz.1.Página oficial del Club Antonio Tomba Godoy Cruz.jpg", "images/M-32-33/33.1.clubsportivogodoycruz.2.Página oficial del Club Antonio Tomba Godoy Cruz.jpg"], // Exterior
    [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-157, 14, 212],
      target: [-157, 6, 170]
    });

    //MANZANA 35--------------------------------------------------------
  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-98, 0, 170),

    "Sociedad “Belgrano” Cosmopolita de Socorros Mutuos y Biblioteca Popular Godoy Cruz",

    null,

    `
    <p>Alguna vez ubicada en la calle Colón al 348, la Sociedad “Belgrano”, fue una entidad de carácter mutual fundada en 1906 por un núcleo de vecinos. Por una cuota mensual el socio tenía derecho a servicios médicos, farmacia y hospital. Consiguieron un amplio terreno en el que se levantaría hacia 1940 un edificio. Sostenía una biblioteca popular que contaba con 3000 volúmenes.</p>


    <p><strong>Texto:</strong>  Verónica Cremaschi (INCIHUSA CONICET)</p>
  

    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Guía General de Mendoza 1940</li>
    </ul>
 
    `,

    [], // Exterior
    [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-98, 14, 212],
      target: [-98, 6, 170]
    });

    //MANZANA 53--------------------------------------------------------
 
    createMarker(
      scene, 
      buttons, 
                    //x/z/y
      new Vector3(-11.3, 3, -51),
  
      "Sociedad italiana Cristóforo Colombo",
      "images/M-53/53.11.cristoforocolombo/53.11.cristoforocolombo.1.Balmaceda, S. (2007).jpg",
  
      ` 
      <p>En el año 1900 se creó la primera asociación italiana de Godoy Cruz, llamada Sociedad de Mutuo Socorro de Belgrano -denominación ésta última del actual departamento de Godoy Cruz- que en el año 1949 cambió su nombre por ”Sociedad italiana Cristóforo Colombo cultural y de beneficencia”. Dicha institución tenía como principal meta asistir y acompañar a los inmigrantes en su llegada al país. Con el paso del tiempo se dedicó a preservar la cultura de origen mediante la realización de actividades culturales, sociales y de recreación.
      </p>
      <p>En el año 1904 algunos socios -entre los que figuran las familias Tomba, Filippini, Giol, Gargantini- adquirieron el terreno, que se encuentra en la calle Antonio Tomba 246, para construir el edificio que albergaría a la comunidad. Esta sede,que fue inaugurada en 1913, había sido proyectada por el arquitecto Alfredo Nenciolini. Durante los años venideros esta entidad cumplió con funciones sociales y culturales, hasta el año 1998 cuando la edificación fue abandonada y se sumió en un estado de deterioro. 
      </p>
      <p>En 2006 la Municipalidad de Godoy Cruz inició gestiones para su rescate y puesta en valor. En este sentido cabe destacar que se sancionó por parte del municipio de Godoy, en 2008, la ordenanza Nº 5649/08, que declaró de utilidad pública el bien; asimismo la ordenanza Nº 5.745/09, en el año 2009, que proclamó al edificio como Patrimonio Cultural. Además, en 2008, la Provincia dictó la Ley N° 8004 estableciendo de utilidad pública y sujeto a expropiación el inmueble, posibilitando finalmente la titularidad al municipio de Godoy Cruz. Las obras de restauración comenzaron en 2017 y el 11 de mayo del 2018, en ocasión del 163º aniversario de la creación del Departamento de Godoy Cruz, se inauguró como Centro Patrimonial Artístico Cristóforo Colombo.</p>
      <p>El centro recibe al visitante con un amplio patio delantero donde se observa una doble hilera de habitaciones que se adelantan y forman logia central por la cual se accede. Destaca en el coronamiento del frente, una escultura que representa a la Patria italiana con el escudo de la Casa de Savoia y dos águilas imperiales a sus costados que fueron donadas por el rey Víctor Manuel III. En su interior cuenta con una gran sala de exposiciones donde se presentan muestras temporales, oficinas administrativas y otras dependencias. Además, hay un Museo de la Inmigración que contiene fotografías y pertenencias personales de inmigrantes italianos como libros, valijas, joyas, muebles y accesorios. </p>
    
      <p><strong>Texto:</strong> María Virginia Goldar/Andrea Segura
      <p><strong>Fuentes:</strong></p>
   <ul>
   <li> img 1 Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano.</li>
   <li>img2 Archivo fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz</li>
   <li>img3Archivo fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz</li>
   <li>img 4 Base documental del Departamento de Patrimonio Cultural. Dirección de Planificación urbana y ambiente. 2007-2009. Equipo: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.</li>
   <li>imag 5 Base documental del Departamento de Patrimonio Cultural. Dirección de Planificación urbana y ambiente. 2007-2009. Equipo: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.</li>

   </ul>
      <p><strong>Bibliografía/Fuentes:</strong></p>
      <ul>
        <li>-Textos curatoriales del Centro Patrimonial Artístico Cristóforo Colombo.</li>
        <li>NARDECHIA, Marcelo (2009). “Informe del plan de gestión para la restauración y puesta en valor,  del edificio de la ex Sociedad Italiana De Socorros Mutuos Cristóforo Colombo”. Departamento de Patrimonio Cultural, DPUyA. Mimeo.</li>
        <li>NARDECHIA, Marcelo y RAFFA, Cecilia (2007). Guía del Patrimonio Cultural de Godoy Cruz, Mendoza, Municipalidad de Godoy Cruz (2° edición 2013).
        </li>
      </ul>
      `,
  
      ["images/M-53/53.11.cristoforocolombo/53.11.cristoforocolombo.1.Balmaceda, S. (2007).jpg", "images/M-53/53.11.cristoforocolombo/53.11.cristoforocolombo.2.Archivo B+M Manuel Belgrano.jpg"], // Exterior
      ["images/M-53/53.11.cristoforocolombo/53.11.cristoforocolombo.3.Archivo B+M Manuel Belgrano.jpg", "images/M-53/53.11.cristoforocolombo/53.11.CristóforoColombo.4.DPC_DPUyA_MGC.jpg","images/M-53/53.11.cristoforocolombo/53.11.cristóforoColombo.5.DPC_DPUyA_MGC.jpg" ],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [-11.3, 14, -9],
      target: [-11.3, 9, -51]
    });
  

        //MANZANA 54--------------------------------------------------------
  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(10, 3, -74),

    "Iglesia San Juan Marón",

    "images/M-54/54.1.iglesiasanjuanmaron/54.1.iglesiasanjuanmaron.2.Archivo B+M Manuel Belgrano.jpg",

    `
   <p>Perteneciente a la Misión Libanesa Maronita, la parroquia San Juan Marón, ubicada en calle Antonio Tomba 365 de Godoy Cruz, comenzó su proceso de asentamiento en el departamento poco antes de mediados del siglo XX con el propósito de preservar las tradiciones orientales y creencias religiosas propias de los maronitas.
   </p>
   <p>Los maronitas son originarios de la Antigua Fenicia,y le deben su nombre a San Marón (siglo V),quien estableció una escuela espiritual monástica eremítica, presente en las prácticas de hoy. San Pedro fundó la sede patriarcal de Antioquía y los patriarcas maronitas se consideraban así mismo como sus sucesores. Su tierra natal, el Líbano, sede de su patriarca, forma parte de la Tierra Santa. 
   </p>
   <p>La presencia de la comunidad maronita en Godoy Cruz data de 1911, cuando el Padre Juan Aoun fundó esta comunidad. En 1920, adquirió los terrenos en la calle Antonio Tomba donde se encuentra actualmente la parroquia San Juan Marón. También creó un colegio del mismo nombre en 1920, que lamentablemente debió cerrar sus puertas en 1938 pero que se encargó de educar a jóvenes descendientes de libaneses que luego destacaron en diferentes profesiones y ocuparon cargos relevantes en la Justicia y la Legislatura.</p>
   <p>
   La creación de la parroquia de San Juan Marón en Godoy Cruz ocurrió en 1961, aunque se estableció como una Misión en 1957. Es importante destacar que la presencia maronita en Argentina fue posible gracias a la gestión del Obispo maronita Chucralla Khoury y la intervención del Cardenal Antonio Caggiano, Arzobispo de Buenos Aires, quienes obtuvieron el permiso de Roma para la existencia de la parroquia maronita en territorio argentino en 1930. Aunque hay discrepancias sobre la fecha exacta, ya que algunos documentos sugieren que se estableció en 1925.
   </p>

    <p><strong>Texto:</strong>  Andrea Segura/Virginia Goldar (Equipo MUVI GC)
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Img 1: Archivo fotográfico de la Biblioteca Mediateca Manuel Belgrano, Godoy Cruz.</li>
        <li>Img 2: Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano.</li>
        
   </ul>
    <p><strong>Fuente :</strong></p>
    <ul>
       
<li>Base documental del Departamento de Patrimonio Cultural. Dirección de planificación Urbana y Ambiente 2006-2023. Equipo de investigación: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.
</li>
<li>(10 de marzo, 2015) La comunidad maronita de Mendoza celebra San Juan Maron. AICA Sitio Web:   https://aica.org/noticia-la-comunidad-maronita-de-mendoza-celebra-san-juan-marn
</li>
<li>Misión Libanesa Maronita, página oficial. Sitio web: https://juanmaron.org/

</li>
  

    </ul>
 
    `,

    [ "images/M-54/54.1.iglesiasanjuanmaron/54.1.iglesiasanjuanmaron.2.Archivo B+M Manuel Belgrano.jpg",  "images/M-54/54.1.iglesiasanjuanmaron/54.1.iglesiasanjuanmaron.1. Balmaceda, S. (2007).jpg"], // Exterior
    [],  // Interior
    // Vista de camara editable: ajusta position para poner la camara frente a la fachada.
    {
      position: [10, 14, -32],
      target: [10, 9, -74]
    });

}
// Vista de camara opcional para cada marcador:
//
// 1) Forma recomendada para corregir una fachada exacta:
//    { position: [camaraX, camaraY, camaraZ], target: [edificioX, edificioY, edificioZ] }
//
//    position = desde donde mira la camara.
//    target = punto exacto del edificio/fachada que queda en el centro de la vista.
//
// 2) Forma rapida usando direccion:
//    { direction: [x, z], distance: 42, height: 18, targetHeight: 0 }
//
//    direction = hacia que lado se ubica la camara desde el marcador.
//    distance = distancia de la camara al edificio.
//    height = altura de la camara.
//    targetHeight = altura del punto mirado sobre el marcador.
//
// Ejemplo de uso como ultimo parametro de createMarker:
// createMarker(
//   scene,
//   buttons,
//   new Vector3(-183, 0, 3),
//   "Ferreteria Panocchia",
//   "images/imagen.jpg",
//   "<p>Texto</p>",
//   [],
//   [],
//   { position: [-183, 14, 45], target: [-183, 6, 3] }
// );
export function createMarkersFromPlaces(scene, buttons, places) {
  places.forEach((place) => {
    createMarker(
      scene,
      buttons,
      new Vector3(...place.position),
      place.title,
      place.imageUrl,
      place.text,
      place.exteriorImages || [],
      place.interiorImages || [],
      place.cameraView,
      {
        placeId: place.id,
        slug: place.slug,
        source: "database",
      }
    );
  });
}

export function createMarker(scene, buttons, position, title, imageUrl, text, exteriorImages, interiorImages, cameraView, metadata = {}) {
  if (legacyMarkerTitlesToSkip.has(title) && metadata.source !== "database") return;

  const savedCameraView = getSavedCameraView(title);
  const texture = new TextureLoader().load("images/marcador-de-alfiler-01.png");
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.offset.set(0.025, 0.025);
  texture.repeat.set(0.95, 0.95);
  const material = new SpriteMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.08,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });

  const sprite = new Sprite(material);
  sprite.center.set(0.5, 0);
  sprite.renderOrder = 999;
  sprite.frustumCulled = false;
  sprite.position.copy(position);
  sprite.scale.set(2, 2, 2);
  sprite.userData.markerScreenScale = 0.032;
  sprite.userData.markerMinScale = 1.1;
  sprite.userData.markerMaxScale = 11;
  sprite.userData.isHovered = false;
  sprite.userData.title = title;
  sprite.userData.imageUrl = imageUrl;
  sprite.userData.text = text;
  sprite.userData.exteriorImages = exteriorImages;
  sprite.userData.interiorImages = interiorImages;
  sprite.userData.cameraView = savedCameraView || cameraView;
  sprite.userData.placeId = metadata.placeId || null;
  sprite.userData.slug = metadata.slug || null;
  scene.add(sprite);
  buttons.push(sprite);
}
