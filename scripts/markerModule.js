//markerModule.js
import {Sprite, SpriteMaterial, TextureLoader, Vector3  } from 'https://unpkg.com/three@0.127.0/build/three.module.js';

let buttons = [];

export function createMarkers(scene, buttons) {
  // Crear marcadores



  //MANZANA 0--------------------------------------------------------
   createMarker(
    scene, 
    buttons, 
    new Vector3(-6, 0, 6),

    "Monumento a Tomás Godoy Cruz",

    "images/M-0/0.2.monumentoplazadepartamental/0.2.monumentoplazadepartamental.2.jpg",
    `  
    <p>En Mendoza, en 1909, se estableció por ley la construcción del monumento a Tomás Godoy Cruz, quien representó a la provincia en el juramento de la Independencia en el Congreso de Tucumán. El proyecto fue avanzando lentamente, así el 27 de mayo de 1910, durante el gobierno de Rufino Ortega, se colocó la piedra fundamental en la plaza departamental como parte de las celebraciones del centenario de mayo.</p>

    <p>Posteriormente, en enero de 1911, el escultor mendocino David Godoy, quien en ese momento residía en Francia, presentó una maqueta del monumento, en la que el prócer se encontraba de pie sobre un obelisco de estilo Luis XVI. La obra debía ser entregada en un plazo de tres años, pero debido al estallido de la Primera Guerra Mundial en 1914, el monumento llegara a nuestro país retrasando su concreción catorce años.</p>

    <p>En 1922, el gobierno nacional inició las acciones necesarias para recuperarlas. En 1924, con las piezas ya en la provincia, se aprovechó la celebración de julio para inaugurar la escultura. Ese año, la festividad no se llevó a cabo en la capital, como era tradición, sino en Godoy Cruz. Se realizó el tradicional Te Deum en el templo parroquial y luego se realizó la ceremonia de inauguración. Alrededor de la escultura se encontraban los líderes y personalidades destacadas de la administración pública y del ejército. Estudiantes de las escuelas provinciales entonaron el Himno Nacional y luego se procedió a descubrir la obra, que estaba envuelta en la bandera nacional.</p>

    <p>El monumento conmemorativo forma parte de un conjunto de elementos simbólicos, alegóricos y decorativos. La figura realista de Godoy Cruz se alza sobre una base de seis metros de altura. A los costados se encuentra una representación alegórica de la agricultura, la figura de un cóndor sobre el escudo de Mendoza, una placa conmemorativa de la inauguración y un sol sobre un pergamino que anuncia el nacimiento de la patria en 1816.</p>

    <p>Bibliografía: <br>
        Luis, N. (2021) Monumento a Tomás Godoy Cruz. Sitio Web: <a href="https://museovirtual.godoycruz.gob.ar/9555-2/">https://museovirtual.godoycruz.gob.ar/9555-2/</a>
    </p>,

    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Base documental proyecto Centro Histórico de Godoy Cruz (2023) con aclaraciones</li>
        <li>(15 de septiembre 19259), Revista Social quincenal.  Nro 153. sin aclaraciones</li>
        <li>Base documental equipo de investigación años 2006-2010: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.</li>
        <li>Archivo fotográfico de la Biblioteca Medioteca Manuel Belgrano, Godoy Cruz.</li>
    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
      <li>Bórmida, E y Moretti,G. (2005). Guía de Arquitectura de Mendoza. Junta de Andalucía.</li>
      <li>Raffa, C. (s/f) La plaza: espacio simbólico y material de la ciudad. Material inédito.</li>
    </ul>
    <p>Para más información: 
    <p> <a href="https://museovirtual.godoycruz.gob.ar/9555-2/#tomas">Monumento a Tomás Godoy Cruz</a></p>
    `,

    ["images/M-0/0.2.monumentoplazadepartamental/0.2.monumentoplazadepartamental.1.jpg", "images/M-0/0.2.monumentoplazadepartamental/0.2.monumentoplazadepartamental.2.jpg"],
    [], // Exterior    
   
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
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Base documental proyecto Centro Histórico de Godoy Cruz (2023) con aclaraciones</li>
        <li>(15 de septiembre 19259), Revista Social quincenal.  Nro 153. sin aclaraciones</li>
        <li>Base documental equipo de investigación años 2006-2010: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.</li>
        <li>Archivo fotográfico de la Biblioteca Medioteca Manuel Belgrano, Godoy Cruz.</li>
    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
      <li>Bórmida, E y Moretti,G. (2005). Guía de Arquitectura de Mendoza. Junta de Andalucía.</li>
      <li>Raffa, C. (s/f) La plaza: espacio simbólico y material de la ciudad. Material inédito.</li>
    </ul>
    <p>Para más información: 
    <p> <a href="https://museovirtual.godoycruz.gob.ar/centro-historico/">Centro Histórico de Godoy </a></p>
    `,
    ["images/M-0/0.1.plazadepartamental/0.1.plazadepartamental.4.jpg", "images/M-0/0.1.plazadepartamental/0.1.plazadepartamental.5.jpg"], 
    ["images/M-0/0.1.plazadepartamental/0.1.plazadepartamental.2.jpg", "images/M-0/0.1.plazadepartamental/0.1.plazadepartamental.3.jpg"], 
   
  );







  //MANZANA 1--------------------------------------------------------
   createMarker(
    scene, 
    buttons, 
    //x/y/z
    new Vector3(-6, 0, 11),
    "Ferretería Panocchia",
    "images/M-1/1.21-22.ferreteríapanocchia/1.21-22.ferreteriapanocchia.1.jpg",

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
    <li>Base documental de investigación Centro - Histórico.</li>
  </ul>
`,
    ["images/M-1/1.21-22.ferreteríapanocchia/1.21-22.ferreteriapanocchia.2.jpg.png", "images/M-1/1.21-22.ferreteríapanocchia/1,21-22.ferreteríapanocchia.3.jpg"], 
    ["images/M-1/1.21-22.ferreteríapanocchia/1.21-22.ferreteríapanocchia.4.jpg"],              
    
  );







  //MANZANA 2--------------------------------------------------------
   createMarker(
    scene, 
    buttons, 
    //x/y/z
    new Vector3(-6, 0, 13),
    "Bodega Tombra",
    "images/M-2/2.1.bodegatomba/2.1.bodegatomba.1.jpg",

    `<p>Fue construida por Antonio Tomba  hacia 1885c., próxima al centro urbano de Godoy Cruz. Este primer galpón iba a convertirse en uno de los establecimientos vitivinícolas más importantes del mundo. Al fallecer su fundador en 1889, Domingo Tomba, hermano de Antonio, tomó las riendas de la empresa y el establecimiento alcanzó su mayor esplendor, tanto en superficie construida como en la producción que se generaba. </p> 
    <p>Morfológicamente, se resolvió como un conjunto de edificios independientes. Hacia 1910 contaba con un patio en el oeste donde se encontraba un jardín rodeado por una reja con un busto del fundador, obra del escultor Somadossi. También contaba con portería, salas de administración, laboratorios y enfermería, un cuerpo de conservación y tres de fermentación, cada uno con subsuelo para la conservación. Sumamos las habitaciones para el mecánico y otros empleados de jerarquía, el departamento de tonelería, distintos depósitos de materiales y maquinarias y un tanque para la dotación de agua. En esta época, se registró la ampliación en proceso de las naves de fermentación y conservación, con sus respectivos  sótanos, y aparecieron corrales donde se albergaban 160 carros y alrededor de 700 mulas. Una característica distintiva que puede apreciarse hasta la actualidad en algunos sectores que han perdurado en el tiempo, es el uso de ladrillo a la vista, con hermosos detalles ornamentales. Las vías que vinculaban al establecimiento con la estación Godoy Cruz ingresaban al predio por calle Monteagudo.   </p> 
    <p>Antonio y su esposa, Olaya Pescara, fueron activos vecinos del departamento y  colaboraron, entre otras obras, con  la construcción del hospital El Carmen. Posteriormente, se vendió a la firma El Globo S.A. En 1996 fue parcialmente demolida para dar lugar a la construcción de un Hipermercado. En la esquina de San Martín y Rivadavia, aún puede intuirse su esplendor a partir de los vestigios de muros con arcos de medio punto, los trabajos de rejería  y ladrillo que se conservan.  </p>
    <p><strong>Texto:</strong> Verónica Cremaschi (INCIHUSA CONICET)</p>
    <p><strong>Fuentes:</strong></p>
   
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Álbum Argentino Gloriandus. Provincia de Mendoza, su vida, su trabajo, su progreso, 1909.</li>
        <li>Caras Y Caretas (Buenos Aires) 21 5 1910, N º 607.</li>
        <li>Centro Vitivinícola Nacional (1910). La Vitivinicultura en 1910. Buenos Aires, Argentina: Emilio Coll e hijos Eds.</li>
    </ul>
    <p>Más información de : 
    </p> <a href="https://museovirtual.godoycruz.gob.ar/la-inmigracion/#antonio"  target="_blank">Antonio Tomba</a></p>
    `,

    ["images/M-2/2.1.bodegatomba/2.1.bodegatomba.2.jpg", "images/M-2/2.1.bodegatomba/2.1.bodegatomba.3.jpg"], // Exterior
    ["images/M-2/2.1.bodegatomba/2.1.bodegatomba.4.jpg"],  // Interior
    
  );


  createMarker(
    scene, 
    buttons, 
    //x/y/z
    new Vector3(-6, 0, 15),
    "Farmacia San Vicente",
    "images/M-2/2.12.Farmacia San Vicente/2.12.farmaciasanvicente.1.jpg",

    `<p>Fue fundada en 1920 por la familia Mastrángelo en la esquina de Rivadavia y Belgrano, frente a la plaza departamental de Godoy Cruz en el edificio que actualmente ocupa la farmacia Chester.<br>
    Esta farmacia cumplió, como lo hacían también la Godoy Cruz y del Pueblo, con una actividad más amplia que la que hoy brindan estos establecimientos, como la colocación de inyecciones, realización de curaciones y la de suplir necesidades varias. Es interesante destacar que en este comercio, trabajó Roberto Bermejillo, quien, en la década de 1960, adquirió la farmacia Godoy Cruz.
     </p> 
    <p>Mediante fotografías de archivo se puede determinar que se inscribía dentro del estilo náutico que prioriza los ángulos redondeados, las fachadas limpias y  despojadas de decoración, los balcones curvos y con barandas metálicas, aspecto que puede apreciarse parcialmente hasta la actualidad por las marquesinas y cartelería.
    </p> 
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Archivo fotográfico Biblioteca-Mediateca Manuel Belgrano, Godoy Cruz</li>
        <li>Archivo fotográfico Equipo Muvi GC</li>
        
    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano. </li>
    </ul>
    `,

    ["images/M-2/2.12.Farmacia San Vicente/2.12.FarmaciaSanVicente.1.jpg", "images/M-2/2.12.Farmacia San Vicente/2.12.farmaciasanvicente.2.jpeg"], // Exterior
    [],  // Interior
    
  );








//MANZANA 3--------------------------------------------------------

  createMarker(
    scene, 
    buttons, 
    //x/y/z
    new Vector3(-6, 0, 17),
    "Casa Olaya",
    "images/M-3/3.4.clubsiriolibanes/3.4.clubsiriolibanes.3.jpg",

    ` <p>Sobre calle Rivadavia, frente a la plaza departamental, se ubicaba el Almacén de Antonio Tomba, el primer negocio con el cual comenzaría el desarrollo financiero la familia Tomba. Luego de la muerte del patriarca en 1899, Olaya Pescara, junto a su hijo Luis, decidió erigir, en 1907, una monumental mansión que funcionó como residencia, centro social, y espacio filantrópico. 
    </p> 
      <p>El chalet, conocido como el Palacio de la Caridad, fue un espacio que albergó, en momentos  vulnerables, a todo aquel que necesitara cobijo, tanto a enfermos y mendigos como a viajeros. Allí, diariamente la señora Pescara de Tomba ofrecía un plato de comida para quienes se acercaran a su casa.
      </p>
      <p>Se sabe que la proyección de la vivienda estuvo a cargo de un arquitecto italiano y que abarcaba una cuarta parte de la manzana, sin embargo, los planos de dicha construcción, se perdieron en el tiempo. Por testimonios de la época y algunos registros fotográficos ha sido posible rescatar distintos datos de la casa y su interior. Es así que sabemos que la residencia contaba con un frente cercado de rejas verdes artesanales en hierro fundido con las iniciales de Olaya Pescara, un espacioso jardín inglés y un frente majestuoso en cuya fachada es posible observar la existencia de un pórtico de columnas neoclásicas con acceso vehicular. A partir de la fotografía,  ha quedado registro del lateral izquierdo del chalet donde es posible vislumbrar el torreón- mirador octogonal, marca indiscutible de la casona, cuyas columnas de corte clásico rematan en un pequeño balcón. Distintos testimonios mencionan un majestuoso interior, nombrando, por ejemplo, pisos de parquet y zócalos de pinotea que cubrían aproximadamente un metro cincuenta de la pared, decoraciones escultóricas procedentes de Italia, lujoso mobiliario y suntuosas cortinas bordadas.
      </p> 
      <p>El Banco Nación Argentina adquirió dicha casa en 1961, para, finalmente años después, ser demolida con el fin de construir el actual edificio bancario.</p> 

  
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
 
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>
        Base documental Base documental equipo de investigación años 2006-2010: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.
        </li>
    </ul>
    `,

    ["images/M-3/3.4.clubsiriolibanes/3.4.clubsiriolibanes.1.jpg", "images/M-3/3.4.clubsiriolibanes/3.4.clubsiriolibanes.2.jpg"], // Exterior
    ["images/M-3/3.4.clubsiriolibanes/3.4.clubsiriolibanes.3.jpg", "images/M-3/3.4.clubsiriolibanes/3.4.clubsiriolibanes.4.jpg"],  // Interior
    
  );





  
  //MANZANA 4--------------------------------------------------------

  createMarker(
    scene, 
    buttons, 
    //x/y/z
    new Vector3(-6, 0, 19),
    "La Rosarina",
    "images/M-4/4.12.la rosarina/4.12.larosarina.3.jpg",

    `
    <p>La Rosarina fue un destacado comercio en la esquina de calles Rivadavia y Antonio Tomba que funcionó como despensa y fiambrería, a cargo de la familia Gobbi. En las fotos de la época se puede observar que la fachada del edificio era almohadillada y remataba en una cornisa que se interrumpía en la entrada del almacén. El ingreso se realizaba por una puerta situada en ochava que presentaba la cartelería, al igual que los grandes ventanales con arcos de medio punto. Hoy el terreno de este memorable negocio está ocupado por el Banco Galicia.</p> 
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Archivo fotográfico Instituto San Vicente Ferrer.</li>
        <li>Archivo fotográfico Blog Mendoza Antigua.</li>    
    </ul>
    `,

    ["images/M-4/4.12.la rosarina/4.12.larosarina.1.jpg", "images/M-4/4.12.la rosarina/4.12.larosarina.2.jpg"], // Exterior
    ["images/M-4/4.12.la rosarina/4.12.larosarina.3.jpg"],  // Interior
   
  );

  createMarker(
    scene, 
    buttons, 
    //x/y/z
    new Vector3(-6, 0, 21),
    "Casa Olaya",
    "images/M-4/4.14.casaolaya/4.14.casaolaya.1.jpeg",

    ` <p>A fines del siglo XIX y principios del XX (1891 a 1920) se produjo una llegada masiva de inmigrantes de cercano oriente al territorio argentino, fundamentalmente árabes de origen sirio-libanes. Esta ola inmigratoria fue el resultado de múltiples causas socio-políticas, caracterizada por la persecución por parte de los turcos otomanos, la guerra italo-turca, y el crecimiento acelerado de la demografía en el Líbano, entre otros.</p> 
      <p>Una vez establecidos en el país, como comunidad extranjera, se nuclearon en numerosas entidades, instituciones, clubes y asociaciones con el fin de establecer vínculos de pertenencia basados en sus orígenes culturales, nacionales y religiosos.</p>
      <p>La provincia de Mendoza, no fue ajena a dicho fenómeno, y en la década del 1920, un gran número de sirio-libaneses, nacidos en Hainturat El Maten, se asentaron en la región. Específicamente, en el departamento de Godoy Cruz, adquirieron los terrenos ubicados en la calle Antonio Tomba al 142, donde en el año 1928 construyeron su característico edificio. Este espacio funcionó, en sus comienzos, como Sociedad de Beneficencia, centro social-cultural y biblioteca.</p> 
      <p>El edificio fue declarado Patrimonio Cultural y Arquitectónico de Godoy Cruz en el año 2016 bajo la ordenanza Nº 6.579/16</p> 
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>La Vitivinicultura argentina en 1910. Centro Vitivinícola Nacional.</li>
        <li> Archivo Fotográfico Biblioteca General Belgrano, Godoy Cruz.</li>

    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Base documental Base documental equipo de investigación años 2006-2010: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa.
        </li>
    </ul>
    <p>Más información de : 
    </p> <a href="https://museovirtual.godoycruz.gob.ar/la-inmigracion/#antonio"  target="_blank">Antonio Tomba</a></p>
    </p> <a href="https://museovirtual.godoycruz.gob.ar/personajes/#olaya"  target="_blank">Olaya Pescara de Tomba</a></p>

    `,

    ["images/M-4/4.14.casaolaya/4.14.casaolaya.2.jpeg", "images/M-4/4.14.casaolaya/4.14.casaolaya.3.jpeg"], // Exterior
    ["images/M-4/4.14.casaolaya/4.14.casaolaya.4.jpeg", "images/M-4/4.14.casaolaya/4.14.casaolaya.5.jpeg"],  // Interior
    
  );





//MANZANA 6--------------------------------------------------------

 createMarker(
    scene, 
    buttons, 
    //x/y/z
    new Vector3(-6, 0, 23),
    "Farmacia Godoy Cruz",
    "images/M-6/6.12.farmaciagodoycruz/6.12.farmaciagpodoycruz.1.jpeg",

    ` <p>Fundada en el año 1908, es una de las farmacias más antiguas de Godoy Cruz y parte del conjunto de farmacias que rodean la Plaza departamental. Estos edificios son considerados de gran valor cultural ya que desarrollan su función comercial y social con continuidad desde antaño. Ubicada en la esquina de las actuales calles Antonio Tomba y Rivadavia, nació como botica, lugar donde se preparaban y expendían medicamentos. Asimismo funcionaba como centro neurálgico donde los viajeros podían parar para abastecerse, ya que se encontraban productos diversos para satisfacer sus necesidades. Hay testimonios que aseguran que también servía como lugar para asistir los partos de las vecinas de la zona.</p> 
      <p>El establecimiento tuvo distintos nombres y dueños a lo largo de estos años. Comenzó llamándose Farmacia San Martín, y estaba a cargo del propietario y farmacéutico Amelio Pazzolo. Otros nombres con los que se la conoció fueron “Barnabó” hacia el año 1931, “Pinazo”· en el 1935 y ya, a partir de 1937, comenzó a llamarse Farmacia Godoy Cruz. En el año 1965 fue adquirida por Ricardo Bermejillo y desde entonces es esta familia quien dirige el negocio, con Roberto Bermejillo como farmacéutico a cargo.
      </p>
      <p>Estilísticamente, el lenguaje arquitectónico y ornamental remite a influencias clásicas. Se puede observar que el edificio posee su fachada principal en forma de ochava, que jerarquiza la esquina y el ingreso al local. Ésta se encuentra enmarcada por pilastras adosadas, pintadas de azul y en su coronamiento es ovoidal se inscribe, en relieve, el nombre del comercio y su año de fundación, acompañados por una moldura ornamental con grecas. El alzado del conjunto está conformado por un zócalo azul y un muro resuelto con ligero almohadillado, rematando en un paramento liso. En el interior aún se puede observar mobiliario original, como los mostradores de madera y estanterías. Además la familia conserva objetos propios de las tareas que se realizaban  en las farmacias de esa época, tales como morteros, frascos de vidrio y balancines. </p> 
       
    <p><strong>Texto:</strong> Andrea Segura/Virginia Goldar (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Entrevista con Roberto Bermejillo.</li>
        <li>Folleto Farmacia Godoy Cruz, proporcionado por sus propietarios.</li>
        <li> Base documental equipo de investigación años 2006-2010: Laura Copia, Rosana Aguerregaray, Alejandra Crescentino. Coordinado por Cecilia Raffa</li>
    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <li>Archivo fotográfico Equipo Muvi GC</li>
        <li>Balmaceda, S. (2007). Godoy Cruz, memoria de todos. Álbum homenaje al 150 aniversario del departamento de Godoy Cruz: fotografías desde 1880 a 1950. Mendoza, Biblioteca Belgrano. </li>
   </ul>

    <p>Más información de : 
    </p> <a href="https://museovirtual.godoycruz.gob.ar/la-inmigracion/#antonio"  target="_blank">Antonio Tomba</a></p>
    </p> <a href="https://museovirtual.godoycruz.gob.ar/personajes/#olaya"  target="_blank">Olaya Pescara de Tomba</a></p>

    `,

    ["images/M-6/6.12.farmaciagodoycruz/6.12.farmaciagodoycruz.2.jpg", "images/M-6/6.12.farmaciagodoycruz/6.12.farmaciagodoycruz.4.jpg"], // Exterior
    ["images/M-6/6.12.farmaciagodoycruz/6.12.farmaciagodoycruz.3.jpg", "images/M-6/6.12.farmaciagodoycruz/6.12.farmaciagodoycruz.5.jpg"],  // Interior
    
  );


  createMarker(
    scene, 
    buttons, 
    //x/y/z
    new Vector3(-6, 0, 25),
    "El Oratorio de San Vicente Siglo XVIII",

    "images/M-6/6._.oratoriosanvicente/6..oratoriosanvicente.1.jpg",

    ` <p>A mediados del siglo XVIII, en la antesala de la actual parroquia de San Vicente en la calle Lavalle, floreció el Oratorio de San Vicente, un espacio de devoción concebido por Don Tomás de Coria. Este santuario estaba situado en lo que hoy conocemos como el Espacio Verde Luis Minetti Pescarmona.</p> 
      <p>En el año 1741, Tomás de Coria y Bohórquez heredó los terrenos que abarcan la plaza departamental actual y unas tres o cuatro manzanas circundantes. También recibió extensiones hacia el oeste (la actual calle Paso de los Andes), dando origen al área denominada "la nueva Coria". El nombre de Don Tomás de Coria emerge en el antiguo Libro de Matrículas del curato de San Vicente, fechado en aquellos años, mencionando noventa y una familias con un total de trescientos veintiocho vecinos, cuarenta y ocho criados y siete agregados, constituyendo los "habitantes comarcales" de la capilla.</p>
      <p>Posteriormente, el presbítero José de Coria, sobrino de Tomás de Coria, impulsó significativamente el desarrollo de la capilla, respaldado por la devoción de los habitantes de la región. El terreno era atravesado por una vía que llevaba al norte directamente a la ciudad de Mendoza, hoy conocida como la calle Belgrano. Al sur, se extendía una callejuela que conectaba con las tierras ancestrales, las Chacras de Coria, alcanzando el río Mendoza y conectando con el Valle de Uco. Además, sus tierras eran atravesadas por el "callejón de las haciendas", cruzando el Zanjón y dirigiéndose hacia Luján por el lado este (posiblemente la actual calle Rivadavia).</p> 
      <p>En consecuencia, al noreste de la actual plaza de Godoy Cruz, se formaba un cruce de caminos, donde Tomás de Coria decidió erigir el mencionado oratorio. A lo largo del tiempo, los vecinos colaboraron para consolidar el oratorio original y establecer una capilla. </p>
    <p><strong>Texto:</strong>  Pablo Bianchi / María Laura Copia / Cecilia Raffa (INCIHUSA / PR2021-21- UNCUYO)
    Colaboración: Paula Martedí (INCIHUSA)
    </p>

    <p>Más información de : 
    </p> <a href="https://museovirtual.godoycruz.gob.ar/centro-historico/#siglo18"  target="_blank">SIGLO XVIII</a></p>
  

    `,

    ["images/M-6/6._.oratoriosanvicente/6..oratoriosanvicente.1.jpg"], // Exterior
    [],  // Interior
    
  );



  //MANZANA 7--------------------------------------------------------
  createMarker(
    scene, 
    buttons, 
    //x/y/z
    new Vector3(-6, 0, 27),
    "Ferrocarril",
    "images/M-7/7.1.ferrocarril/7.1.ferrocarril.1.jpg",

    ` <p>El departamento tuvo dos importantes estaciones. La llamada Godoy Cruz, antes San Vicente, inaugurada el 25 de abril de 1885; y la estación Benegas, que estaba ubicada cerca de la finca y bodega El Trapiche. Arquitectónicamente, estas terminales responden a las características de la arquitectura inglesa, marcada por el uso de ladrillo a la vista, techumbres inclinadas con tejas, la carpintería en madera con puertas y ventanas de dos hojas, en general con postigos,  y las galerías que cubrían y protegían el sector del andén.</p> 
      <p>El tren posibilitó la distribución, a partir del año 1885, de distintos productos manufacturados y materias primas. También facilitó la llegada masiva de inmigrantes que desembarcaban en Buenos Aires y utilizaron el ferrocarril para arribar a la provincia y al departamento de Godoy Cruz. Entre quienes se instalaron en este suelo se encontraban ingenieros hidráulicos y agricultores que propiciaron el desarrollo de importantes industrias, especialmente bodegas, que caracterizaron la actividad del departamento.</p>
      <p>La actividad de los trenes locales fue decreciendo paulatinamente a medida que el vehículo motorizado iba en aumento, situación que se agudizó a partir de 1930, con el plan de pavimentación de caminos del gobierno provincial. Los servicios locales cesaron definitivamente en 1938. Si bien, para esos años, la estación de Godoy Cruz perdió relevancia en el transporte de pasajeros, continuó prestando servicios en el transporte de cargas. Es interesante destacar que, por ejemplo en la estación Godoy Cruz, había ramales que se desprendían hacia la bodega Arizu, Escorihuela. Sumamos otros desvíos que servían a la bodega Tomba, a la fábrica de conservas Arcanco y al frigorífico Aconcagua.</p> 
       
    <p><strong>Texto:</strong> Pablo Bianchi (INCIHUSA / PR2021-21- UNCUYO)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
    <ul>
        <li>Archivo fotográfico Muvi GC</li>
        <li>fotográfico Muvi GC</li>
    </ul>
    <p><strong>Bibliografía:</strong></p>
    <ul>
        <liDelgado, G. (1996). Transporte Ferroviario. En Lacoste. P. (comp.) Godoy Cruz historia y perspectivas, pp. 96-101. Diario UNO.</li>
        <li>Nardechia, Marcelo y Raffa, Cecilia. Guía del Patrimonio Cultural de Godoy Cruz, Godoy Cruz, 2 ediciones, 2007 y 2013.</li>
   </ul>

    <p>Más información de : 
    </p> <a href="https://museovirtual.godoycruz.gob.ar/estaciones-de-ferrocarril/"  target="_blank">Estaciones de ferrocarril</a></p>


    `,

    ["images/M-7/7.1.ferrocarril/7.1.ferrocarril.1.jpg", "images/M-7/7.1.ferrocarril/7.1.ferrocarril.2.jpg", "images/M-7/7.1.ferrocarril/Vista Aérea del Centro de la Ciudad,del departamento de Godoy Cruz. (año 1933).JPG"], // Exterior
    ["images/M-7/7.1.ferrocarril/7.1.ferrocarril.3.jpeg", "images/M-7/7.1.ferrocarril/7.1.ferrocarril.4.jpeg"],  // Interior
    
  );







  //MANZANA 18--------------------------------------------------------
  createMarker(
    scene, // Cambiado a 'scene' como objeto de referencia
    buttons,
    new Vector3(-6, 0, 33),

    "Compañia de María",

    "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.3.jpg",

    `
    <p>Este colegio estaba ubicado originalmente en la calle Rivadavia y Sargento Cabral en terrenos donados por la Sra Olaya Pescara de Tomba. Actualmente se encuentra en Azopardo 206. Es uno de los centros educativos más antiguos del departamento de Godoy Cruz, fue la primera escuela de gestión privada de la zona. Se fundó en el año 1905 como colegio de instrucción primaria de niñas.</p>

    <p>El antiguo Colegio de la Compañía de María de Godoy Cruz, antes de ser afectado por el terremoto de 1985, tenía un terreno más extenso que el actual y distinta disposición de sus dependencias. El ingreso se realizaba por calle Rivadavia. Detrás del muro de rejas y pilastras que circundaba toda la propiedad, se visualizaba un jardín externo por el cual se accedía al colegio, la capilla y distintos ambientes.</p>

    <p>En el interior de la edificación, estaba organizado con galerías que se abrían a patios internos a modo de claustros donde funcionaban las aulas. En uno de estos patios internos, se encontraba la escultura del Sagrado Corazón de Jesús sobre un gran pedestal -que hoy en día se sigue apreciando en la institución-. Sobre la misma línea de la calle Rivadavia, se observaba también el ingreso a la capilla. La edificación del templo era de planta basilical con una sola nave y techo a dos aguas. Su exterior destacaba por la fachada con un gran portal de ingreso resuelto con un arco de medio punto. El conjunto remataba con un frontón triangular, ornamentado con arcos de medio punto que circundaban todo el perímetro de la construcción. Dicha capilla ya no existe en la actualidad.</p>

    <p><strong>Texto:</strong> María Virginia Goldar/ Andrea Segura. (Equipo MUVI GC)</p>
    <p><strong>Fuentes:</strong></p>
    <p><strong>Imágenes</strong></p>
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
    ["images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.3.jpg", "images/M-18/18.1.Compañiademaria/18.1.colegiocompañiademaria.4.jpg"],  // Interior
    
  );






}



export function createMarker(scene, buttons, position, title, imageUrl, text, exteriorImages, interiorImages,) {
  const texture = new TextureLoader().load("images/marcador-de-alfiler.png"); // Carga la textura para el sprite desde la imagen proporcionada
  const material = new SpriteMaterial({ map: texture });

  const sprite = new Sprite(material);
  sprite.position.copy(position);
  sprite.scale.set(2, 3, 3); // Ajusta el tamaño del sprite según sea necesario
  sprite.userData.title = title;
  sprite.userData.imageUrl = imageUrl;
  sprite.userData.text = text;
  sprite.userData.exteriorImages = exteriorImages;
  sprite.userData.interiorImages = interiorImages;
  scene.add(sprite);
  buttons.push(sprite);
}