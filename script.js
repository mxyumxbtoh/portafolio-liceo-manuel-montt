/* ==========================================================================
   PORTAFOLIO VIRTUAL - Liceo Bicentenario Manuel Montt
   script.js
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIGURACIÓN FIREBASE
   -------------------------------------------------------------------------- */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDMtNL6r8kULTLnvnTfyZydXhhWRScWcmQ",
  authDomain: "portafolio-lmm.firebaseapp.com",
  databaseURL: "https://portafolio-lmm-default-rtdb.firebaseio.com",
  projectId: "portafolio-lmm",
  storageBucket: "portafolio-lmm.firebasestorage.app",
  messagingSenderId: "973079046346",
  appId: "1:973079046346:web:0b45baad3cfe6f51ecac33"
};

let firebaseDb = null;
let firebaseReady = false;

function initFirebase() {
    const cfg = FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || !cfg.databaseURL) {
        console.warn("Firebase no configurado: comentarios solo locales.");
        return Promise.resolve(false);
    }
    return new Promise((resolve) => {
        if (window.firebase && window.firebase.apps && window.firebase.apps.length) {
            firebaseDb = firebase.database();
            firebaseReady = true;
            resolve(true);
            return;
        }
        const s1 = document.createElement("script");
        s1.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
        s1.onload = () => {
            const s2 = document.createElement("script");
            s2.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";
            s2.onload = () => {
                try {
                    firebase.initializeApp(cfg);
                    firebaseDb = firebase.database();
                    firebaseReady = true;
                    resolve(true);
                } catch (e) {
                    console.error("Firebase init error:", e);
                    resolve(false);
                }
            };
            s2.onerror = () => resolve(false);
            document.head.appendChild(s2);
        };
        s1.onerror = () => resolve(false);
        document.head.appendChild(s1);
    });
}



/* --------------------------------------------------------------------------
   CONFIG IA (Gemini gratis)
   1) Entra a https://aistudio.google.com/apikey
   2) Crea una API key
   3) Pégala entre las comillas de abajo
   -------------------------------------------------------------------------- */
const GEMINI_API_KEY = "AQ.Ab8RN6KpzaIOLNFPllziDIdqaUI7mxpHPSbfBNrXiMGj6EeNIw"; // <-- PEGA TU API KEY AQUÍ


/* --------------------------------------------------------------------------
   BASE DE CONOCIMIENTO JARVIE (institucional)
   -------------------------------------------------------------------------- */
const JARVIE_KB = {
  personalidad: {
    rol: "Asistente virtual del Portafolio del Liceo Bicentenario Manuel Montt (San Javier).",
    estilo: "Carismático, seguro, humor ácido ocasional, puede admitir que es un bot. Nunca cruel. En temas serios prioriza información clara."
  },
  plataformas: {
    notas: "https://calificando.cl/",
    justificar: "https://justificar.lmmsys.cl/",
    notas_msg: "Puedes revisar tus **notas** en **Calificando**: https://calificando.cl/ . Yo no puedo entrar ni cambiar calificaciones; solo te oriento.",
    justificar_msg: "Puedes **justificar inasistencias** en la plataforma oficial: **https://justificar.lmmsys.cl/** . Yo no justifico por ti; el trámite lo haces ahí o según indique el liceo."
  },
  sueldos: "Rango **referencial** de sueldos de profesores: entre **$800.000 y $1.300.000** CLP. No es un monto fijo: varía por experiencia, horas, asignaciones y funciones.",
  jefes: {
    "programacion": "German Villar Martinez",
    "programación": "German Villar Martinez",
    "electricidad": "Hans Saavedra",
    "contabilidad": "Delia Sepúlveda",
    "administracion": "Patricia Fuentes Meriño",
    "administración": "Patricia Fuentes Meriño",
    "rrhh": "Patricia Fuentes Meriño",
    "construcciones metalicas": "Elvis Luna",
    "construcciones metálicas": "Elvis Luna",
    "metalicas": "Elvis Luna",
    "atencion de parvulos": "María Alejandra Inostroza",
    "atención de párvulos": "María Alejandra Inostroza",
    "parvulos": "María Alejandra Inostroza",
    "agropecuaria": "Sandra Norambuena",
    "gastronomia": "Camila Cruz",
    "gastronomía": "Camila Cruz",
    "cocina": "Camila Cruz"
  },
  jefesLista: "**Jefes de carrera (no son profesor jefe ni director):**\\n\\n• **Programación:** German Villar Martinez\\n• **Electricidad:** Hans Saavedra\\n• **Contabilidad:** Delia Sepúlveda\\n• **Administración (RRHH):** Patricia Fuentes Meriño\\n• **Construcciones Metálicas:** Elvis Luna\\n• **Atención de Párvulos:** María Alejandra Inostroza\\n• **Agropecuaria:** Sandra Norambuena\\n• **Gastronomía (Cocina):** Camila Cruz",
  rice: "**RICE (resumen):**\\n\\n• **Sellos:** Respeto, Responsabilidad y Tolerancia.\\n• **Jornada:** lunes a viernes desde **08:15**, carga ~**42 horas**.\\n• **Uniforme** obligatorio; en talleres TP vestimenta técnica (overol, calzado de seguridad, etc.).\\n• Convivencia **formativa** (diálogo, mediación, negociación).\\n• **Conducto regular:** Profesor Jefe/Asignatura → UTP / Convivencia Escolar / Inspectoría → Dirección.\\n• Organismos: CGA, CGPA, Consejo de Profesores, Consejo Escolar.\\n• Protocolos: atrasos/inasistencias, bullying, drogas, accidentes, salidas pedagógicas, Aula Segura (Ley 21.128), entre otros.\\n\\nAnte un caso concreto, acude a la autoridad correspondiente; yo doy orientación general.",
  historia: "El **Liceo Bicentenario Manuel Montt** de San Javier (**RBD 3479**) es un liceo público del Maule (HC y TP, laico, municipal/DAEM). Se fundó hacia mediados de los **1940**. En **octubre 2023** recibió el sello **Liceo Bicentenario de Excelencia**. Director actual: **Aquiles Mauricio Vásquez Castillo** (PME y proyecto Bicentenario).",
  logros: "Logros destacados: sello **Liceo Bicentenario de Excelencia (2023)**; avances en **SIMCE** Lectura y Matemática; articulación para **continuidad de estudios**; reconocimiento de la **Municipalidad de San Javier**.",
  destacados: {
    aaron: "**Aaron Cancino** — estudiante de **4°F Programación**. Participó en **Eco-Red**, proyecto que obtuvo el **1er lugar** en el concurso *Pensando las Tecnologías del Futuro*.",
    cristobal: "**Cristóbal Soto** — estudiante de **4°F Programación**. Integrante del equipo **Eco-Red**, **1er lugar** en *Pensando las Tecnologías del Futuro*.",
    ecored: "**Eco-Red** fue desarrollado por estudiantes de Programación (**Aaron Cancino** y **Cristóbal Soto**, 4°F) y obtuvo el **primer lugar** en el concurso regional *Pensando las Tecnologías del Futuro*. Está en la sección **Proyectos** del portafolio."
  },
  especialidades: "El liceo ofrece **Humanístico-Científica** y **8 especialidades TP**: Administración, Agropecuaria, Atención de Párvulos, Construcciones Metálicas, Contabilidad, Electricidad, Gastronomía y Programación."
};

const JARVIE_SYSTEM = `Eres JARVIE, asistente virtual del Portafolio del Liceo Bicentenario Manuel Montt (San Javier, Chile, RBD 3479).

PERSONALIDAD: Sabes que eres un bot/IA; humor ácido ocasional y carisma; nunca cruel. En temas institucionales prioriza datos correctos sobre el humor. Responde en español de Chile, breve y claro. Usa **negritas** en datos clave.

REGLA: NO inventes. Si no está en tu conocimiento, dilo y orienta al liceo.

PLATAFORMAS:
- Notas: https://calificando.cl/
- Justificar inasistencias: https://justificar.lmmsys.cl/
No puedes modificar notas ni justificar faltas tú mismo.

SUELDOS DOCENTES (referencial): $800.000 a $1.300.000 CLP; varía por experiencia, horas y asignaciones.

JEFES DE CARRERA (no confundir con profesor jefe ni director):
Programación: German Villar Martinez | Electricidad: Hans Saavedra | Contabilidad: Delia Sepúlveda | Administración RRHH: Patricia Fuentes Meriño | Construcciones Metálicas: Elvis Luna | Atención de Párvulos: María Alejandra Inostroza | Agropecuaria: Sandra Norambuena | Gastronomía: Camila Cruz

RICE: sellos Respeto/Responsabilidad/Tolerancia; jornada 08:15 ~42 hrs; uniforme; convivencia formativa; conducto regular Profesor→UTP/Convivencia/Inspectoría→Dirección; protocolos (inasistencias, bullying, Aula Segura, etc.).

HISTORIA: fundado ~1940; Bicentenario de Excelencia oct 2023; director Aquiles Mauricio Vásquez Castillo; HC + 8 especialidades TP.

ALUMNOS DESTACADOS: Aaron Cancino y Cristóbal Soto (4°F Programación), proyecto Eco-Red, 1er lugar Pensando las Tecnologías del Futuro.`;

function matchJefeCarrera(q) {
    const pairs = [
        [/programac/, "Programación", "German Villar Martinez"],
        [/electric/, "Electricidad", "Hans Saavedra"],
        [/contabil/, "Contabilidad", "Delia Sepúlveda"],
        [/administr|rrhh|recursos humanos/, "Administración (RRHH)", "Patricia Fuentes Meriño"],
        [/metal|soldadur/, "Construcciones Metálicas", "Elvis Luna"],
        [/parvulo|jardin infantil/, "Atención de Párvulos", "María Alejandra Inostroza"],
        [/agro|pecuaria|agricol/, "Agropecuaria", "Sandra Norambuena"],
        [/gastro|cocina/, "Gastronomía (Cocina)", "Camila Cruz"]
    ];
    for (const [re, esp, nombre] of pairs) {
        if (re.test(q)) {
            return "El jefe/a de carrera de **" + esp + "** es **" + nombre + "**.";
        }
    }
    return null;
}

function getJarvieReplyLocal(text) {
    const q = normalizeText(text);

    // Saludos
    if (/^(hola|ola|buenas|hey|hi|hello|oye|que tal|que onda)\b/.test(q) || (q.length < 6 && /hola|ola|hi|oye/.test(q))) {
        return "¡Hola! Soy **JARVIE**, el bot del Liceo Manuel Montt. Pregúntame por **notas**, **justificar inasistencias**, **jefes de carrera**, **RICE**, **historia**, **especialidades** o **proyectos**.";
    }
    if (/quien eres|que eres|eres un bot|inteligencia artificial|\bia\b|robot/.test(q)) {
        return "Sí, soy un **asistente virtual** del portafolio. Puedo orientarte con info del liceo; no reemplazo a Inspectoría ni a UTP.";
    }

    // Plataformas: notas
    if (/nota|notas|calificacion|calificaciones|calificando|donde veo mis|revisar mis calif/.test(q)) {
        return JARVIE_KB.plataformas.notas_msg;
    }

    // Justificar / asistencia
    if (/justific|justifico|justificar|inasistencia|falte a clases|falta justif|donde justific/.test(q)) {
        return JARVIE_KB.plataformas.justificar_msg;
    }
    if (/asistencia|porcentaje de asistencia|como veo la asistencia|donde veo (la )?asistencia/.test(q)) {
        return "La **asistencia** se registra en los sistemas del liceo. Para **justificar** una inasistencia usa **https://justificar.lmmsys.cl/** . Las **notas** están en **https://calificando.cl/** .";
    }

    // Sueldos
    if (/sueldo|salario|cuanto ganan|ganan los profe|plata.*profe|remuneracion.*docente/.test(q)) {
        return JARVIE_KB.sueldos + " Si preguntas por una persona en particular, el monto exacto puede cambiar según contrato y funciones.";
    }

    // Jefes
    if (/jefe de carrera|jefa de carrera|jefatura de|quien esta a cargo|quién está a cargo|quien es el jefe|quien es la jefa/.test(q)) {
        const uno = matchJefeCarrera(q);
        if (uno) return uno;
        return JARVIE_KB.jefesLista;
    }
    if (/german villar|villar martinez/.test(q)) return "**German Villar Martinez** es jefe de carrera de **Programación**.";
    if (/hans saavedra/.test(q)) return "**Hans Saavedra** es jefe de carrera de **Electricidad**.";
    if (/delia sepulveda/.test(q)) return "**Delia Sepúlveda** es jefa de carrera de **Contabilidad**.";
    if (/patricia fuentes|fuentes merino/.test(q)) return "**Patricia Fuentes Meriño** es jefa de carrera de **Administración (RRHH)**.";
    if (/elvis luna/.test(q)) return "**Elvis Luna** es jefe de carrera de **Construcciones Metálicas**.";
    if (/inostroza|maria alejandra/.test(q)) return "**María Alejandra Inostroza** es jefa de carrera de **Atención de Párvulos**.";
    if (/norambuena|sandra norambuena/.test(q)) return "**Sandra Norambuena** es jefa de carrera de **Agropecuaria**.";
    if (/camila cruz/.test(q)) return "**Camila Cruz** es jefa de carrera de **Gastronomía (Cocina)**.";

    // RICE / convivencia
    if (/rice|reglamento|convivencia|uniforme|conducto regular|aula segura|mediacion|sello educativo|bullying|ciberbullying|pise/.test(q)) {
        return JARVIE_KB.rice;
    }

    // Historia / director / logros
    if (/historia|fundacion|cuando se fundo|bicentenario|rbd|director|aquiles|vasquez|vásquez/.test(q)) {
        return JARVIE_KB.historia;
    }
    if (/simce|logro|reconocimiento|excelencia/.test(q)) {
        return JARVIE_KB.logros;
    }

    // Alumnos destacados / Eco-Red
    if (/aaron|cancino/.test(q)) return JARVIE_KB.destacados.aaron;
    if (/cristobal soto|cristóbal soto/.test(q)) return JARVIE_KB.destacados.cristobal;
    if (/eco-red|eco red|ecoreed|destacado|alumno destacado/.test(q)) return JARVIE_KB.destacados.ecored;

    // Especialidades
    if (/especialidad|especialidades|que enseñan|que carreras|oferta academica|oferta académica/.test(q)) {
        return JARVIE_KB.especialidades + " Escribe el nombre de una o ve a **Especialidades** → Ver más.";
    }
    if (/programac|software|python|javascript|informatica/.test(q)) {
        return "**Programación** (jefe: **German Villar Martinez**): software, web, bases de datos y soporte. Página **Programación**.";
    }
    if (/electric|tablero|fotovolta|plc/.test(q)) {
        return "**Electricidad** (jefe: **Hans Saavedra**): instalaciones, mantenimiento y renovables. Página **Electricidad**.";
    }
    if (/contabil|tributar|erp/.test(q)) {
        return "**Contabilidad** (jefa: **Delia Sepúlveda**). Página **Contabilidad**.";
    }
    if (/administr|rrhh|recursos humanos/.test(q)) {
        return "**Administración RRHH** (jefa: **Patricia Fuentes Meriño**). Página **Administración**.";
    }
    if (/metal|soldadur|mig|tig/.test(q)) {
        return "**Construcciones Metálicas** (jefe: **Elvis Luna**). Página **Construcciones Metálicas**.";
    }
    if (/parvulo|estimulacion|sala cuna/.test(q)) {
        return "**Atención de Párvulos** (jefa: **María Alejandra Inostroza**). Página **Atención de Párvulos**.";
    }
    if (/agro|agricol|pecuaria|riego/.test(q)) {
        return "**Agropecuaria** (jefa: **Sandra Norambuena**). Página **Agropecuaria**.";
    }
    if (/gastro|cocina|banquete/.test(q)) {
        return "**Gastronomía** (jefa: **Camila Cruz**). Página **Gastronomía**.";
    }

    if (/contacto|correo|telefono|ubicacion|san javier/.test(q)) {
        return "📍 **Liceo Bicentenario Manuel Montt** — San Javier. Revisa **Contacto** en el menú. Conducto regular: Profesor → UTP/Convivencia/Inspectoría → Dirección.";
    }
    if (/proyecto|portafolio/.test(q)) {
        return "En **Proyectos** están trabajos reales, entre ellos **Eco-Red** (Aaron Cancino y Cristóbal Soto).";
    }
    if (/gracias|chao|adios|bye/.test(q)) {
        return "De nada. Si necesitas otra cosa del liceo, aquí estoy.";
    }

    return null; // sin match local → puede ir a IA
}

function isInstitutionalQuery(text) {
    const q = normalizeText(text);
    return /nota|calific|calificando|justific|asistencia|inasistencia|sueldo|salario|jefe de carrera|jefa de carrera|jefatura|rice|reglamento|convivencia|uniforme|conducto|aula segura|historia|fundacion|bicentenario|director|aquiles|aaron|cancino|cristobal|eco-red|eco red|especialidad|programac|electric|contabil|administr|parvulo|agro|gastro|metal|simce|rbd|manuel montt/.test(q);
}

async function getJarvieReplyAI(userText) {
    const models = [
        "gemini-3.5-flash-lite",
        "gemini-3.6-flash",
        "gemini-flash-lite-latest",
        "gemini-3.5-flash",
        "gemini-3.8-flash"
    ];

    let lastError = null;
    for (const model of models) {
        const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(GEMINI_API_KEY);
        const body = {
            system_instruction: { parts: [{ text: JARVIE_SYSTEM }] },
            contents: [{ role: "user", parts: [{ text: userText }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        };
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.status === 503 || res.status === 429) {
                lastError = new Error(model + " ocupado (" + res.status + ")");
                continue;
            }
            if (!res.ok) {
                const errText = await res.text().catch(() => "");
                lastError = new Error(model + " HTTP " + res.status + " " + errText.slice(0, 120));
                if (res.status === 400 || res.status === 401 || res.status === 403) break;
                continue;
            }
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                lastError = new Error(model + " respuesta vacía");
                continue;
            }
            return text.trim();
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError || new Error("Ningún modelo disponible");
}

async function sendMessage() {
    const chatInput = document.getElementById("chat-input");
    if (!chatInput) return;
    const userText = chatInput.value.trim();
    if (!userText) return;

    appendMessage(userText, "user");
    chatInput.value = "";

    const loadingElem = appendMessage("Pensando...", "bot");

    try {
        let reply = getJarvieReplyLocal(userText);
        // Temas del liceo: siempre prioridad a la base local
        if (reply) {
            loadingElem.innerHTML = formatMessageText(reply);
        } else if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10 && !isInstitutionalQuery(userText)) {
            reply = await getJarvieReplyAI(userText);
            loadingElem.innerHTML = formatMessageText(reply);
        } else if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
            // institucional sin match exacto: aún así intenta IA con system prompt fuerte
            try {
                reply = await getJarvieReplyAI(userText);
                loadingElem.innerHTML = formatMessageText(reply);
            } catch (e) {
                loadingElem.innerHTML = formatMessageText("No tengo ese dato exacto en mi base. Prueba con **notas**, **justificar inasistencia**, **jefe de carrera**, **RICE** o **historia del liceo**.");
            }
        } else {
            loadingElem.innerHTML = formatMessageText("Prueba con **notas**, **justificar inasistencia**, **jefes de carrera**, **RICE**, **especialidades** o **Eco-Red**.");
        }
    } catch (err) {
        console.error("JARVIE error:", err);
        const fallback = getJarvieReplyLocal(userText);
        loadingElem.innerHTML = formatMessageText(
            fallback || "No pude responder ahora. Revisa **https://calificando.cl/** (notas) o **https://justificar.lmmsys.cl/** (justificaciones)."
        );
    }

    const chatMessages = document.getElementById("chat-messages");
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMessage(text, type) {
    const chatMessages = document.getElementById("chat-messages");
    if (!chatMessages) return null;

    const div = document.createElement("div");
    div.className = "chat-message " + type;
    div.innerHTML = formatMessageText(text);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

function formatMessageText(text) {
    if (typeof text !== "string") return "";
    return escapeHTML(text)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
}

/* ==========================================================================
   8. ANIMACIONES FADE-IN
   ========================================================================== */
function initFadeInAnimations() {
    const elements = document.querySelectorAll(
        ".specialty-card, .contact-card, .credits-box, .section-header, .search-box, .stat-item"
    );
    elements.forEach((el, i) => {
        el.classList.add("fade-in");
        el.style.setProperty("--i", i % 8);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach(el => observer.observe(el));
}
