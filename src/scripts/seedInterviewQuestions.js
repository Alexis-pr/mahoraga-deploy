import dotenv from "dotenv";
import { pool } from "../config/db.config.js";

dotenv.config();

const LANGUAGE_IDS = {
  es: 1,
  en: 2,
};

const LEVELS = [1, 2, 3, 4, 5, 6, 7];

const QUESTION_BANK = {
  Python: {
    1: [
      ["que son las variables y como se declaran en Python", "what are variables and how are they declared in Python"],
      ["que diferencia hay entre lista, tupla y diccionario", "what is the difference between a list, tuple, and dictionary"],
      ["como funciona un if y cuando usarias elif", "how does an if statement work and when would you use elif"],
      ["que hace un bucle for en Python", "what does a for loop do in Python"],
      ["cuando usarias una funcion en lugar de repetir codigo", "when would you use a function instead of repeating code"],
    ],
    2: [
      ["como manejarias errores con try, except y finally", "how would you handle errors with try, except, and finally"],
      ["que ventajas tiene usar comprensiones de listas", "what advantages does using list comprehensions have"],
      ["como leerias un archivo json en Python", "how would you read a json file in Python"],
      ["que significa que una funcion reciba *args y **kwargs", "what does it mean for a function to receive *args and **kwargs"],
      ["como organizarias un proyecto usando modulos y paquetes", "how would you organize a project using modules and packages"],
    ],
    3: [
      ["como explicarias la diferencia entre clase, objeto y metodo", "how would you explain the difference between a class, object, and method"],
      ["cuando elegirias herencia y cuando composicion", "when would you choose inheritance and when composition"],
      ["como implementarias un decorador sencillo y para que sirve", "how would you implement a simple decorator and what is it for"],
      ["que problema resuelven los generadores en Python", "what problem do generators solve in Python"],
      ["como trabajarias con pruebas unitarias usando pytest", "how would you work with unit tests using pytest"],
    ],
    4: [
      ["como diseñarias una api REST con Flask o FastAPI", "how would you design a REST API with Flask or FastAPI"],
      ["como estructurarias capas de servicio y repositorio en Python", "how would you structure service and repository layers in Python"],
      ["que consideraciones tendrias al trabajar con asincronia", "what considerations would you have when working with async code"],
      ["como versionarias dependencias y entornos virtuales en un equipo", "how would you version dependencies and virtual environments in a team"],
      ["como optimizarias una consulta pesada usando Python y una base de datos", "how would you optimize a heavy query using Python and a database"],
    ],
    5: [
      ["como revisarías performance y profiling en una aplicacion Python", "how would you review performance and profiling in a Python application"],
      ["como asegurarias observabilidad y logging estructurado", "how would you ensure observability and structured logging"],
      ["como plantearias una estrategia de testing en varios niveles", "how would you design a multi-level testing strategy"],
      ["como manejarias concurrencia en procesos de background", "how would you handle concurrency in background jobs"],
      ["como reducirias deuda tecnica en un backend Python heredado", "how would you reduce technical debt in a legacy Python backend"],
    ],
    6: [
      ["como liderarias una migracion de monolito a servicios en Python", "how would you lead a migration from a monolith to services in Python"],
      ["como definirias estandares de codigo y arquitectura para el equipo", "how would you define code and architecture standards for the team"],
      ["como balancearias velocidad de entrega y calidad tecnica", "how would you balance delivery speed and technical quality"],
      ["como decidirias entre tareas sincronas y asincronas a nivel de plataforma", "how would you decide between synchronous and asynchronous workloads at platform level"],
      ["como guiarias revisiones tecnicas complejas en backend Python", "how would you guide complex technical reviews in a Python backend"],
    ],
    7: [
      ["como definirias una arquitectura escalable para una plataforma Python", "how would you define a scalable architecture for a Python platform"],
      ["como segmentarias dominios y bounded contexts en un sistema grande", "how would you split domains and bounded contexts in a large system"],
      ["como escogerias estrategias de resiliencia y tolerancia a fallos", "how would you choose resilience and fault tolerance strategies"],
      ["como decidirias entre eventos, colas y llamadas directas entre servicios", "how would you choose between events, queues, and direct service calls"],
      ["como evaluarías tradeoffs de costo, mantenimiento y escalabilidad", "how would you evaluate tradeoffs between cost, maintainability, and scalability"],
    ],
  },
  HTML: {
    1: [
      ["que es la estructura basica de un documento HTML", "what is the basic structure of an HTML document"],
      ["para que sirven las etiquetas h1, p y a", "what are the h1, p, and a tags used for"],
      ["cuando usarias una lista ordenada y una desordenada", "when would you use an ordered list and an unordered list"],
      ["como insertas una imagen con texto alternativo", "how do you insert an image with alternative text"],
      ["que diferencia hay entre un div y un span", "what is the difference between a div and a span"],
    ],
    2: [
      ["que son las etiquetas semanticas y por que importan", "what are semantic tags and why do they matter"],
      ["como construirias un formulario accesible", "how would you build an accessible form"],
      ["que atributos globales sueles usar en HTML", "which global attributes do you commonly use in HTML"],
      ["como mejorarías el SEO basico solo con HTML", "how would you improve basic SEO using only HTML"],
      ["como relacionas labels con inputs correctamente", "how do you correctly relate labels to inputs"],
    ],
    3: [
      ["como estructurarias el layout de una pagina profesional con HTML semantico", "how would you structure a professional page layout with semantic HTML"],
      ["que problemas resuelve ARIA y cuando lo usarías", "what problems does ARIA solve and when would you use it"],
      ["como validarías formularios del lado del navegador", "how would you validate forms on the browser side"],
      ["como manejarias contenido multimedia de forma accesible", "how would you handle multimedia content accessibly"],
      ["como auditarias la semantica de una landing page existente", "how would you audit the semantics of an existing landing page"],
    ],
    4: [
      ["como prepararías HTML para componentes reutilizables en un design system", "how would you prepare HTML for reusable components in a design system"],
      ["como optimizarias carga percibida con lazy loading y estructura HTML", "how would you optimize perceived loading with lazy loading and HTML structure"],
      ["como plantearías una estrategia de metadatos para redes y buscadores", "how would you design a metadata strategy for social sharing and search engines"],
      ["que criterios seguirias para internacionalizacion en markup", "which criteria would you follow for internationalization in markup"],
      ["como documentarias convenciones HTML para un equipo", "how would you document HTML conventions for a team"],
    ],
    5: [
      ["como establecerias estandares de accesibilidad en todo un producto", "how would you establish accessibility standards across a product"],
      ["como revisarías calidad de markup en un code review senior", "how would you review markup quality in a senior code review"],
      ["como reducirías deuda semantica en un proyecto grande", "how would you reduce semantic debt in a large project"],
      ["como integrarías HTML con analitica y experimentacion sin degradar calidad", "how would you integrate HTML with analytics and experimentation without degrading quality"],
      ["como tomarías decisiones entre flexibilidad de componentes y semantica estricta", "how would you decide between component flexibility and strict semantics"],
    ],
    6: [
      ["como liderarias una guia de accesibilidad y markup para varios equipos", "how would you lead an accessibility and markup guide for multiple teams"],
      ["como definirias criterios de calidad HTML medibles", "how would you define measurable HTML quality criteria"],
      ["como alinearías SEO, accesibilidad y negocio en decisiones de interfaz", "how would you align SEO, accessibility, and business in interface decisions"],
      ["como escalarías una libreria de componentes a nivel organizacional", "how would you scale a component library at organizational level"],
      ["como manejarías revisiones transversales de semantica y usabilidad", "how would you handle cross-team reviews of semantics and usability"],
    ],
    7: [
      ["como diseñarias la estrategia de frontend semantico para una plataforma grande", "how would you design the semantic frontend strategy for a large platform"],
      ["como estandarizarias accesibilidad como constraint de arquitectura", "how would you standardize accessibility as an architecture constraint"],
      ["como decidirias entre server rendering, static generation y client rendering segun markup", "how would you decide between server rendering, static generation, and client rendering based on markup"],
      ["como construirías lineamientos de gobernanza para calidad HTML", "how would you build governance guidelines for HTML quality"],
      ["como evaluarías riesgo tecnico y regulatorio en accesibilidad web", "how would you evaluate technical and regulatory risk in web accessibility"],
    ],
  },
  CSS: {
    1: [
      ["que es el box model y que partes lo componen", "what is the box model and which parts compose it"],
      ["cuando usarías class y cuando id en estilos", "when would you use class and when id in styling"],
      ["que diferencia hay entre margin y padding", "what is the difference between margin and padding"],
      ["como aplicarías colores y unidades de forma correcta", "how would you apply colors and units correctly"],
      ["para que sirve display flex en un caso simple", "what is display flex used for in a simple case"],
    ],
    2: [
      ["como construirías un layout responsive basico con media queries", "how would you build a basic responsive layout with media queries"],
      ["que ventajas ofrece flexbox frente a floats", "what advantages does flexbox offer over floats"],
      ["como funciona specificity y como evitarías conflictos de estilos", "how does specificity work and how would you avoid style conflicts"],
      ["cuando usarías position relative y absolute", "when would you use position relative and absolute"],
      ["como aplicarías transiciones sencillas para mejorar la interfaz", "how would you apply simple transitions to improve the interface"],
    ],
    3: [
      ["cuando elegirías grid en lugar de flexbox", "when would you choose grid instead of flexbox"],
      ["como estructurarías variables CSS para un proyecto mediano", "how would you structure CSS variables for a medium-sized project"],
      ["como manejarías estados hover, focus y active accesibles", "how would you handle accessible hover, focus, and active states"],
      ["como organizarías un archivo de estilos para evitar deuda tecnica", "how would you organize a stylesheet to avoid technical debt"],
      ["que criterios usarías para naming de clases a escala", "which criteria would you use for naming classes at scale"],
    ],
    4: [
      ["como diseñarias un sistema de theming con custom properties", "how would you design a theming system with custom properties"],
      ["como combinarias grid, flexbox y tokens de diseño en una app", "how would you combine grid, flexbox, and design tokens in an app"],
      ["como optimizarías rendimiento de rendering relacionado con CSS", "how would you optimize rendering performance related to CSS"],
      ["como plantearías arquitectura CSS en un equipo grande", "how would you propose CSS architecture in a large team"],
      ["como documentarías patrones visuales reutilizables", "how would you document reusable visual patterns"],
    ],
    5: [
      ["como auditarías consistencia visual y escalabilidad de estilos", "how would you audit visual consistency and style scalability"],
      ["como resolverías deuda tecnica por hojas de estilo heredadas", "how would you resolve technical debt from legacy stylesheets"],
      ["como evitarías regresiones visuales en un proyecto con muchos cambios", "how would you avoid visual regressions in a project with many changes"],
      ["como balancearias libertad de equipo con coherencia del design system", "how would you balance team freedom with design system coherence"],
      ["como decidirías entre CSS nativo y soluciones de styling mas complejas", "how would you decide between native CSS and more complex styling solutions"],
    ],
    6: [
      ["como liderarias la evolucion de un design system a nivel organizacional", "how would you lead the evolution of a design system at organizational level"],
      ["como definirias estandares de rendimiento y accesibilidad visual", "how would you define performance and visual accessibility standards"],
      ["como alinearías frontend platform y equipos de producto en estilos compartidos", "how would you align frontend platform and product teams on shared styling"],
      ["como priorizarías refactors de CSS en una hoja enorme y critica", "how would you prioritize CSS refactors in a huge critical stylesheet"],
      ["como gestionarías decisiones entre branding, mantenibilidad y velocidad", "how would you manage decisions between branding, maintainability, and speed"],
    ],
    7: [
      ["como diseñarias una estrategia de plataforma visual para multiples productos", "how would you design a visual platform strategy for multiple products"],
      ["como gobernarías tokens, componentes y estilos globales a escala", "how would you govern tokens, components, and global styles at scale"],
      ["como evaluarías tradeoffs entre diferentes aproximaciones de styling enterprise", "how would you evaluate tradeoffs between enterprise styling approaches"],
      ["como estructurarías lineamientos de compatibilidad y evolucion visual", "how would you structure compatibility and visual evolution guidelines"],
      ["como asegurarías que la capa visual soporte crecimiento de negocio y tecnologia", "how would you ensure the visual layer supports business and technology growth"],
    ],
  },
  JavaScript: {
    1: [
      ["que diferencia hay entre let, const y var", "what is the difference between let, const, and var"],
      ["como funciona una funcion en JavaScript", "how does a function work in JavaScript"],
      ["que es el DOM y como accedes a un elemento", "what is the DOM and how do you access an element"],
      ["cuando usarías un array en lugar de un objeto", "when would you use an array instead of an object"],
      ["como funciona un evento click en el navegador", "how does a click event work in the browser"],
    ],
    2: [
      ["que diferencia hay entre == y ===", "what is the difference between == and ==="],
      ["como recorrerías una lista de elementos y transformarías sus datos", "how would you iterate through a list of elements and transform their data"],
      ["que problema resuelve addEventListener", "what problem does addEventListener solve"],
      ["como funciona fetch para consumir una api", "how does fetch work to consume an api"],
      ["que es una promesa y en que caso la usarías", "what is a promise and when would you use it"],
    ],
    3: [
      ["como explicarías closures con un ejemplo practico", "how would you explain closures with a practical example"],
      ["que ventajas tiene async await frente a then catch", "what advantages does async await have over then catch"],
      ["como modularizarías codigo JavaScript en un proyecto mediano", "how would you modularize JavaScript code in a medium-sized project"],
      ["como manejarías estado simple en una aplicacion del navegador", "how would you handle simple state in a browser application"],
      ["como evitarías memory leaks por eventos o referencias colgantes", "how would you avoid memory leaks caused by events or dangling references"],
    ],
    4: [
      ["como diseñarias una capa de servicios para llamadas HTTP en frontend", "how would you design a service layer for HTTP calls on the frontend"],
      ["como estructurarías componentes y responsabilidades en una app compleja", "how would you structure components and responsibilities in a complex app"],
      ["como plantearías manejo de errores y retries en una interfaz", "how would you approach error handling and retries in an interface"],
      ["como optimizarías performance de renderizado y carga de datos", "how would you optimize rendering performance and data loading"],
      ["como organizarías pruebas para logica JavaScript crítica", "how would you organize tests for critical JavaScript logic"],
    ],
    5: [
      ["como revisarías arquitectura frontend en un proyecto grande de JavaScript", "how would you review frontend architecture in a large JavaScript project"],
      ["como reducirías complejidad ciclomática en modulos muy acoplados", "how would you reduce cyclomatic complexity in heavily coupled modules"],
      ["como decidirías entre distintas estrategias de estado global", "how would you decide between different global state strategies"],
      ["como mejorarías observabilidad y debugging en producción", "how would you improve observability and debugging in production"],
      ["como gestionarías deuda tecnica en una base de codigo legacy", "how would you manage technical debt in a legacy codebase"],
    ],
    6: [
      ["como liderarias decisiones de arquitectura frontend para varios equipos", "how would you lead frontend architecture decisions for multiple teams"],
      ["como estandarizarias practicas de calidad en JavaScript dentro de la organizacion", "how would you standardize JavaScript quality practices across the organization"],
      ["como balancearias experiencia de desarrollo y performance de usuario", "how would you balance developer experience and user performance"],
      ["como priorizarias una migracion tecnica de alto impacto", "how would you prioritize a high-impact technical migration"],
      ["como guiarias revisiones de diseño tecnico entre equipos frontend", "how would you guide technical design reviews across frontend teams"],
    ],
    7: [
      ["como diseñarias la estrategia de plataforma frontend para multiples productos", "how would you design the frontend platform strategy for multiple products"],
      ["como estructurarías fronteras entre microfrontends o dominios de UI", "how would you structure boundaries between microfrontends or UI domains"],
      ["como decidirías estandares de interoperabilidad y evolucion tecnica", "how would you decide on interoperability and technical evolution standards"],
      ["como evaluarías costo y beneficio de nuevas tecnologias frontend", "how would you evaluate the cost and benefit of new frontend technologies"],
      ["como alinearías roadmap tecnico con objetivos de negocio en frontend", "how would you align the technical roadmap with business goals on the frontend"],
    ],
  },
  "data base": {
    1: [
      ["que es una tabla y para que sirve una clave primaria", "what is a table and what is a primary key used for"],
      ["que diferencia hay entre insertar, actualizar y borrar datos", "what is the difference between inserting, updating, and deleting data"],
      ["como harías un select simple con filtro", "how would you write a simple select with a filter"],
      ["que es una relacion uno a muchos", "what is a one-to-many relationship"],
      ["por que es importante normalizar datos basicos", "why is basic data normalization important"],
    ],
    2: [
      ["que diferencia hay entre inner join y left join", "what is the difference between an inner join and a left join"],
      ["como usarías group by y funciones de agregacion", "how would you use group by and aggregation functions"],
      ["que problema resuelven los indices", "what problem do indexes solve"],
      ["como asegurarías integridad referencial entre tablas", "how would you ensure referential integrity between tables"],
      ["cuando usarías transacciones en una operacion de negocio", "when would you use transactions in a business operation"],
    ],
    3: [
      ["como analizarías una consulta lenta en SQL", "how would you analyze a slow SQL query"],
      ["que tradeoffs ves entre normalizacion y performance", "what tradeoffs do you see between normalization and performance"],
      ["como modelarías tablas para auditoria basica", "how would you model tables for basic auditing"],
      ["como evitarías inconsistencias en escrituras concurrentes", "how would you avoid inconsistencies in concurrent writes"],
      ["como decidirías entre vistas, funciones o consultas directas", "how would you decide between views, functions, or direct queries"],
    ],
    4: [
      ["como diseñarias una estrategia de particionamiento o archivo de datos", "how would you design a partitioning or data archiving strategy"],
      ["como optimizarías consultas sobre relaciones complejas", "how would you optimize queries over complex relationships"],
      ["como gestionarías migraciones de esquema sin detener el sistema", "how would you manage schema migrations without stopping the system"],
      ["como estructurarías permisos y roles en PostgreSQL", "how would you structure permissions and roles in PostgreSQL"],
      ["como evaluarías el impacto de un cambio de indice en producción", "how would you evaluate the impact of an index change in production"],
    ],
    5: [
      ["como balancearias consistencia, disponibilidad y rendimiento en la base", "how would you balance consistency, availability, and performance in the database"],
      ["como revisarías diseño de datos en un sistema ya escalado", "how would you review data design in an already scaled system"],
      ["como priorizarías deuda tecnica de consultas y modelo", "how would you prioritize technical debt in queries and schema"],
      ["como establecerías observabilidad para bases de datos criticas", "how would you establish observability for critical databases"],
      ["como definirías convenciones SQL y de modelado para el equipo", "how would you define SQL and modeling conventions for the team"],
    ],
    6: [
      ["como liderarias estrategia de datos para varios servicios conectados", "how would you lead a data strategy for multiple connected services"],
      ["como coordinarias cambios de esquema entre varios equipos", "how would you coordinate schema changes across multiple teams"],
      ["como decidirías ownership de datos y limites de integracion", "how would you decide data ownership and integration boundaries"],
      ["como alinearías seguridad, cumplimiento y velocidad de desarrollo", "how would you align security, compliance, and development speed"],
      ["como guiarias decisiones entre base relacional y otras tecnologias de almacenamiento", "how would you guide decisions between relational databases and other storage technologies"],
    ],
    7: [
      ["como diseñarias arquitectura de datos para una plataforma en crecimiento", "how would you design data architecture for a growing platform"],
      ["como elegirías estrategias de replicacion, backup y recovery", "how would you choose replication, backup, and recovery strategies"],
      ["como estructurarías dominios de datos y gobernanza a gran escala", "how would you structure data domains and governance at scale"],
      ["como evaluarías riesgo, costo y resiliencia de la capa de datos", "how would you evaluate risk, cost, and resilience of the data layer"],
      ["como decidirías evolucion de modelo y compatibilidad con consumidores", "how would you decide model evolution and compatibility with consumers"],
    ],
  },
};

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const topicIdMap = await ensureTopics(client);
    let insertedQuestions = 0;

    for (const [topicName, levels] of Object.entries(QUESTION_BANK)) {
      const topicId = getTopicId(topicIdMap, topicName);

      if (!topicId) {
        throw new Error(`Missing topic id for ${topicName}`);
      }

      for (const levelId of LEVELS) {
        const questions = levels[levelId] || [];

        for (const [spanishText, englishText] of questions) {
          const exists = await client.query(
            `
            SELECT 1
            FROM question q
            INNER JOIN question_translation qt ON qt.id_question = q.id_question
            WHERE q.id_topic = $1
              AND q.id_level = $2
              AND qt.id_language = $3
              AND LOWER(qt.question_text) = LOWER($4)
            LIMIT 1
            `,
            [topicId, levelId, LANGUAGE_IDS.es, spanishText]
          );

          if (exists.rowCount) {
            continue;
          }

          const questionInsert = await client.query(
            `
            INSERT INTO question (id_topic, id_level)
            VALUES ($1, $2)
            RETURNING id_question
            `,
            [topicId, levelId]
          );

          const questionId = questionInsert.rows[0].id_question;

          await client.query(
            `
            INSERT INTO question_translation (id_question, id_language, question_text)
            VALUES
              ($1, $2, $3),
              ($1, $4, $5)
            `,
            [questionId, LANGUAGE_IDS.es, spanishText, LANGUAGE_IDS.en, englishText]
          );

          insertedQuestions += 1;
        }
      }
    }

    await client.query("COMMIT");
    console.log(`Seed complete. Inserted ${insertedQuestions} new questions.`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Interview seed failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

async function ensureTopics(client) {
  const requiredTopics = ["Python", "HTML", "CSS", "JavaScrip", "data base"];

  for (const topicName of requiredTopics) {
    await client.query(
      `
      INSERT INTO topic (topic)
      SELECT CAST($1 AS varchar)
      WHERE NOT EXISTS (
        SELECT 1
        FROM topic
        WHERE LOWER(TRIM(topic::text)) = LOWER(TRIM(CAST($1 AS text)))
      )
      `,
      [topicName]
    );
  }

  const topicRows = await client.query("SELECT id_topic, topic FROM topic");
  return new Map(topicRows.rows.map((row) => [String(row.topic).toLowerCase(), row.id_topic]));
}

function getTopicId(topicIdMap, topicName) {
  const aliases = {
    javascript: ["javascript", "javascrip"],
    "data base": ["data base", "database", "sql"],
  };

  const normalizedName = topicName.toLowerCase();
  const candidates = aliases[normalizedName] || [normalizedName];

  for (const candidate of candidates) {
    const topicId = topicIdMap.get(candidate);

    if (topicId) {
      return topicId;
    }
  }

  return null;
}

main();
