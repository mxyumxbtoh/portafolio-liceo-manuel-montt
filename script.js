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

const JARVIE_SYSTEM = `Eres JARVIE, asistente virtual del Portafolio del Liceo Bicentenario Manuel Montt (San Javier, Chile, RBD 3479).

PERSONALIDAD:
- Sabes que eres un bot/IA y puedes romper la cuarta pared: bromea sobre algoritmos, tokens o tus limitaciones, sin perder el rol de asistente.
- Humor ácido, ironía y sarcasmo inteligente; nunca cruel.
- Segura/o y carismática/o; no pierdes la calma.
- Ante problemas serios razonas con lógica clara (tipo análisis estructurado).
- Mezclas español chileno cotidiano con algo de jerga formal cuando conviene.
- Responde en español de Chile, clara y breve (máx. 2-4 párrafos cortos). Usa **negritas** para datos clave.

DATOS DEL LICEO:
- Director actual: Aquiles Mauricio Vásquez Castillo.
- Fundado ~mediados de 1940; ~80 años; sello Liceo Bicentenario de Excelencia (oct 2023).
- Oferta: HC (Humanístico-Científica) y 8 especialidades TP: Programación, Electricidad, Contabilidad, Administración (RRHH), Construcciones Metálicas, Atención de Párvulos, Agropecuaria, Gastronomía (Cocina).
- Jornada: lunes a viernes desde 8:15; ~42 horas semanales.
- Sellos educativos: Respeto, Responsabilidad y Tolerancia.
- Sueldo referencial docentes: entre $800.000 y $1.300.000 (varía por cargo/experiencia).
- Notas: https://calificando.cl/
- Justificar inasistencias: https://justificar.lmmsys.cl/
- Asistencia: se consulta en los sistemas del liceo / plataforma institucional; justificar en justificar.lmmsys.cl

JEFES DE CARRERA:
- Programación: German Villar Martinez
- Electricidad: Hans Saavedra
- Contabilidad: Delia Sepúlveda
- Administración (RRHH): Patricia Fuentes Meriño
- Construcciones Metálicas: Elvis Luna
- Atención de Párvulos: María Alejandra Inostroza
- Agropecuaria: Sandra Norambuena
- Gastronomía (Cocina): Camila Cruz

ALUMNOS DESTACADOS:
- Aaron Cancino y Cristóbal Soto (4°F Programación): proyecto Eco-Red, 1er lugar concurso Pensando las Tecnologías del Futuro.

RICE (resumen): convivencia formativa, mediación, conducto regular (Profesor → UTP/Convivencia/Inspectoría → Dirección), uniformes, PISE, protocolos (atrasos, bullying, accidentes, Aula Segura, etc.). Organismos: CGA, CGPA, Consejo de Profesores, Consejo Escolar.

Si no sabes un dato fino del liceo, dilo y orienta a Contacto o a la jefatura de especialidad.`

/* ==========================================================================
   DATOS DE PROYECTOS
   ========================================================================== */
const projectsData = [
    {
        id: 1,
        title: "Eco-Red",
        student: "Aaron Cancino y Cristóbal Soto",
        specialty: "Programación",
        techs: ["Innovación tecnológica", "Programación", "Eco-Red", "Sostenibilidad"],
        image: "aaron_tristobal.jpg",
        year: "2025",
        description: "Proyecto tecnológico ganador del concurso Pensando las Tecnologías del Futuro, desarrollado por estudiantes de Programación del Liceo Bicentenario Manuel Montt."
    },
    {
        id: 2,
        title: "Drones Agrícolas en Educación",
        student: "Dronespray · DJI Agriculture",
        specialty: "Agropecuaria",
        techs: ["Drones", "DJI Agras", "Monitoreo", "Agricultura Tecnificada"],
        image: "drones-educacion.jpg",
        year: "2025",
        description: "Experiencias reales con drones agrícolas en liceos en convenio: servicio técnico, reparación, charla multiespectral y vuelo del DJI Agras T100. Integración a la malla para monitorear, mapear y tratar cultivos, formando competencias laborales en el agro."
    }
];

let lastFocusedElement = null;

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initThemeToggle();
    initCountersObserver();
    initSearch();
    initComments();
    initModals();
    initScrollTop();
    initChatbot();
    initFadeInAnimations();
    initProjectGridEvents();

    showProjectSkeletons();
    setTimeout(() => renderProjects(projectsData), 450);
});

/* ==========================================================================
   1. NAVBAR
   ========================================================================== */
function initNavbar() {
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("open");
            hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            navMenu?.classList.remove("open");
            hamburger?.setAttribute("aria-expanded", "false");
        });
    });
}

/* ==========================================================================
   2. TEMA CLARO / OSCURO
   ========================================================================== */
function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    const html = document.documentElement;
    if (!toggleBtn) return;

    const saved = localStorage.getItem("lm_theme");
    if (saved === "light" || saved === "dark") {
        html.setAttribute("data-theme", saved);
        toggleBtn.innerHTML = saved === "light"
            ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
    }

    toggleBtn.addEventListener("click", () => {
        const isDark = html.getAttribute("data-theme") === "dark";
        const next = isDark ? "light" : "dark";
        html.setAttribute("data-theme", next);
        localStorage.setItem("lm_theme", next);
        toggleBtn.innerHTML = isDark
            ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
    });
}

/* ==========================================================================
   3. CONTADORES
   ========================================================================== */
function initCountersObserver() {
    const section = document.getElementById("estadisticas");
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(section);
}

function startCounters() {
    document.querySelectorAll(".stat-number").forEach(counter => {
        const target = +counter.getAttribute("data-target");
        if (!target) return;
        let count = 0;
        const step = Math.ceil(target / 50) || 1;
        const timer = setInterval(() => {
            count += step;
            if (count >= target) {
                counter.innerText = target.toLocaleString("es-CL");
                clearInterval(timer);
            } else {
                counter.innerText = count.toLocaleString("es-CL");
            }
        }, 20);
    });
}

/* ==========================================================================
   4. PROYECTOS Y BUSCADOR
   ========================================================================== */
function showProjectSkeletons() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;
    grid.innerHTML = "";
    for (let i = 0; i < 2; i++) {
        const sk = document.createElement("div");
        sk.className = "skeleton-card";
        sk.setAttribute("aria-hidden", "true");
        sk.innerHTML = `
            <div class="skeleton-img"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
        `;
        grid.appendChild(sk);
    }
}

function renderProjects(projects) {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;
    grid.innerHTML = "";

    if (!projects.length) {
        grid.innerHTML = `<p class="no-projects-msg">No se encontraron proyectos.</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    projects.forEach((p, idx) => {
        const card = document.createElement("article");
        card.className = "project-card fade-in";
        card.style.setProperty("--i", idx);
        card.innerHTML = `
            <div class="project-img-wrapper">
                <img src="${p.image}" alt="Proyecto ${escapeHTML(p.title)} - ${escapeHTML(p.specialty)}" loading="lazy" onerror="this.parentElement.classList.add('no-img')">
                <span class="project-badge">${escapeHTML(p.specialty)}</span>
            </div>
            <div class="project-info">
                <h3>${escapeHTML(p.title)}</h3>
                <p class="project-author">${escapeHTML(p.student)}</p>
                <p class="project-desc">${escapeHTML(p.description)}</p>
                ${p.year ? `<p class="project-year">${escapeHTML(p.year)}</p>` : ""}
                <button class="btn-secondary view-project-btn" data-id="${p.id}" aria-label="Ver detalles del proyecto ${escapeHTML(p.title)}">
                    Ver detalles
                </button>
            </div>
        `;
        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
    requestAnimationFrame(() => {
        grid.querySelectorAll(".fade-in").forEach(el => el.classList.add("visible"));
    });
}

function initProjectGridEvents() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    grid.addEventListener("click", (e) => {
        const btn = e.target.closest(".view-project-btn");
        if (!btn) return;
        lastFocusedElement = btn;
        openProjectModal(parseInt(btn.getAttribute("data-id"), 10));
    });
}

function initSearch() {
    const input = document.getElementById("search-input");
    const clearBtn = document.getElementById("clear-search");
    if (!input) return;

    input.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (clearBtn) clearBtn.style.display = q ? "block" : "none";

        const filtered = projectsData.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.student.toLowerCase().includes(q) ||
            p.specialty.toLowerCase().includes(q) ||
            p.techs.some(t => t.toLowerCase().includes(q))
        );
        renderProjects(filtered);
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            input.value = "";
            clearBtn.style.display = "none";
            renderProjects(projectsData);
            input.focus();
        });
    }
}

/* ==========================================================================
   5. COMENTARIOS
   ========================================================================== */
function initComments() {
    const form = document.getElementById("comment-form");
    const list = document.getElementById("comments-list");
    const count = document.getElementById("comment-count");
    if (!form || !list) return;

    const LOCAL_KEY = "lm_comments";

    const getLocal = () => {
        try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); }
        catch (e) { return []; }
    };
    const setLocal = (arr) => localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));

    const render = (comments) => {
        list.innerHTML = "";
        if (count) count.innerText = String(comments.length);
        if (!comments.length) {
            list.innerHTML = '<p class="no-comments-msg">Sin comentarios aún. Sé el primero.</p>';
            return;
        }
        const fragment = document.createDocumentFragment();
        comments.forEach(c => {
            const item = document.createElement("div");
            item.className = "comment-item";
            item.innerHTML =
                '<div class="comment-header">' +
                '<strong class="comment-author">' + escapeHTML(c.author) + '</strong>' +
                '<span class="comment-date">' + escapeHTML(c.date || "") + '</span>' +
                '</div>' +
                '<p class="comment-body">' + escapeHTML(c.body) + '</p>';
            fragment.appendChild(item);
        });
        list.appendChild(fragment);
    };

    initFirebase().then((ok) => {
        if (ok && firebaseDb) {
            const ref = firebaseDb.ref("comments");
            ref.limitToLast(100).on("value", (snap) => {
                const data = snap.val() || {};
                const comments = Object.keys(data)
                    .map(k => Object.assign({ id: k }, data[k]))
                    .sort((a, b) => (b.ts || 0) - (a.ts || 0));
                render(comments);
            }, (err) => {
                console.error("Firebase read error:", err);
                render(getLocal());
            });
        } else {
            render(getLocal());
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const authorInput = document.getElementById("comment-author");
        const bodyInput = document.getElementById("comment-body");
        const author = (authorInput.value || "").trim();
        const body = (bodyInput.value || "").trim();
        if (!author || !body) return;

        const entry = {
            author: author,
            body: body,
            date: new Date().toLocaleDateString("es-CL", {
                day: "numeric", month: "short", year: "numeric"
            }),
            ts: Date.now()
        };

        const local = getLocal();
        local.unshift(entry);
        setLocal(local.slice(0, 100));

        if (firebaseReady && firebaseDb) {
            try {
                await firebaseDb.ref("comments").push(entry);
            } catch (err) {
                console.error("Firebase write error:", err);
                render(local);
            }
        } else {
            render(local);
        }

        authorInput.value = "";
        bodyInput.value = "";
    });
}


function escapeHTML(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>'"]/g, tag => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[tag] || tag));
}

/* ==========================================================================
   6. MODALES Y SCROLL TOP
   ========================================================================== */
function initModals() {
    const modal = document.getElementById("project-modal");
    const closeBtn = document.getElementById("modal-close");
    const overlay = document.getElementById("modal-overlay");

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        if (lastFocusedElement) lastFocusedElement.focus();
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (overlay) overlay.onclick = closeModal;

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal?.classList.contains("active")) closeModal();
    });

    // Solo botones (no <a href="..."> de especialidades)
    document.querySelectorAll(".btn-read-more").forEach(btn => {
        btn.addEventListener("click", (e) => {
            if (btn.tagName === "A" && btn.getAttribute("href") && btn.getAttribute("href") !== "#") {
                return;
            }
            e.preventDefault();
            const card = e.target.closest(".specialty-card");
            if (!card) return;
            const titleEl = card.querySelector("h3");
            const textEl = card.querySelector("p");
            const tagsEl = card.querySelector(".tags");
            if (!titleEl || !textEl) return;

            const modalBody = document.getElementById("modal-body");
            if (!modalBody || !modal) return;

            modalBody.innerHTML = `
                <h2 class="modal-title" id="modal-title">${escapeHTML(titleEl.innerText)}</h2>
                <p class="modal-text">${escapeHTML(textEl.innerText)}</p>
                <div class="tags">${tagsEl ? tagsEl.innerHTML : ""}</div>
            `;
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
            closeBtn?.focus();
        });
    });
}

function openProjectModal(id) {
    const p = projectsData.find(item => item.id === id);
    if (!p) return;

    const modalBody = document.getElementById("modal-body");
    const modal = document.getElementById("project-modal");
    if (!modalBody || !modal) return;

    modalBody.innerHTML = `
        <img src="${p.image}" alt="Imagen del proyecto ${escapeHTML(p.title)}" class="modal-img" onerror="this.style.display='none'">
        <span class="modal-badge">${escapeHTML(p.specialty)}</span>
        <h2 class="modal-title" id="modal-title">${escapeHTML(p.title)}</h2>
        <p class="modal-author">Autor: ${escapeHTML(p.student)}</p>
        ${p.year ? `<p class="modal-year">Año: ${escapeHTML(p.year)}</p>` : ""}
        <p class="modal-text">${escapeHTML(p.description)}</p>
        <div class="tags">${p.techs.map(t => `<span>${escapeHTML(t)}</span>`).join("")}</div>
    `;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("modal-close")?.focus();
}

function initScrollTop() {
    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        btn.classList.toggle("visible", window.scrollY > 300);
    }, { passive: true });

    btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================================================
   7. CHATBOT JARVIE — IA (Gemini) + respaldo local
   ========================================================================== */
function initChatbot() {
    const chatToggle = document.getElementById("chat-toggle");
    const chatWindow = document.getElementById("chat-window");
    const chatClose = document.getElementById("chat-close");
    const chatForm = document.getElementById("chat-form");
    const chatMessages = document.getElementById("chat-messages");
    if (!chatToggle || !chatWindow) return;

    const openChat = () => {
        chatWindow.classList.add("active");
        chatWindow.setAttribute("aria-hidden", "false");
        chatWindow.style.display = "flex";
        chatToggle.setAttribute("aria-expanded", "true");
        document.getElementById("chat-input")?.focus();
    };

    const closeChat = () => {
        chatWindow.classList.remove("active");
        chatWindow.setAttribute("aria-hidden", "true");
        chatWindow.style.display = "none";
        chatToggle.setAttribute("aria-expanded", "false");
        chatToggle.focus();
    };

    chatToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = chatWindow.classList.contains("active") ||
            chatWindow.getAttribute("aria-hidden") === "false";
        if (isOpen) closeChat();
        else openChat();
    });

    if (chatClose) {
        chatClose.addEventListener("click", (e) => {
            e.preventDefault();
            closeChat();
        });
    }

    if (chatForm) {
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            sendMessage();
        });
    }

    if (chatMessages) {
        chatMessages.innerHTML = "";
        appendMessage("¡Hola! 👋 Soy **JARVIE**, el bot del Liceo Manuel Montt. Especialidades, jefes de carrera, notas, asistencia, RICE o historia del liceo: pregunta nomás.", "bot");
    }
}

function normalizeText(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getJarvieReplyLocal(text) {
    const q = normalizeText(text);

    if (/^(hola|ola|buenas|hey|hi|hello|oye|que tal|que onda)/.test(q) || (q.length < 5 && /hola|ola|hi|oye/.test(q))) {
        return "¡Hola! 👋 Soy **JARVIE**, el bot del Liceo Manuel Montt (sí, un montón de código y café virtual). Puedo hablar de **especialidades**, **jefes de carrera**, **notas**, **asistencia**, **RICE**, historia del liceo o proyectos. ¿Qué necesitas?";
    }
    if (/quien eres|que eres|eres un bot|inteligencia artificial|ia|robot/.test(q)) {
        return "Sí: soy un **asistente virtual** del portafolio. No tengo casillero en el liceo, pero sí respuestas sobre especialidades, RICE, notas y más. Pregunta nomás.";
    }
    if (/sueldo|salario|cuanto ganan|plata.*profe|profe.*sueldo|remuneracion.*docente|docente.*sueldo/.test(q)) {
        return "Referencia de **sueldos de profesores**: entre **$800.000 y $1.300.000** aprox. Varía según cargo, horas y experiencia. Es orientativo, no una liquidación oficial.";
    }
    if (/nota|notas|calificacion|calificaciones|informe|calificando/.test(q)) {
        return "Las **notas** se revisan en **https://calificando.cl/** . Entra con tu usuario institucional. Si no carga, prueba otro navegador o consulta a UTP.";
    }
    if (/justific|inasistencia|falte|permiso.*ausencia/.test(q)) {
        return "Para **justificar inasistencias** usa **https://justificar.lmmsys.cl/** . La asistencia se consulta en los sistemas del liceo; el justificativo va por esa plataforma.";
    }
    if (/asistencia|asistio|porcentaje de asistencia/.test(q)) {
        return "La **asistencia** se ve en los sistemas del liceo. Para **justificar** una inasistencia: **https://justificar.lmmsys.cl/** . Notas: **https://calificando.cl/** .";
    }
    if (/jefe de carrera|jefa de carrera|quien es el jefe|jefatura/.test(q)) {
        return "**Jefes de carrera:**\n\n• **Programación:** German Villar Martinez\n• **Electricidad:** Hans Saavedra\n• **Contabilidad:** Delia Sepúlveda\n• **Administración (RRHH):** Patricia Fuentes Meriño\n• **Construcciones Metálicas:** Elvis Luna\n• **Atención de Párvulos:** María Alejandra Inostroza\n• **Agropecuaria:** Sandra Norambuena\n• **Gastronomía:** Camila Cruz";
    }
    if (/german villar|villar martinez/.test(q)) {
        return "**German Villar Martinez** es jefe de carrera de **Programación**.";
    }
    if (/hans saavedra/.test(q)) {
        return "**Hans Saavedra** es jefe de carrera de **Electricidad**.";
    }
    if (/delia sepulveda/.test(q)) {
        return "**Delia Sepúlveda** es jefa de carrera de **Contabilidad**.";
    }
    if (/patricia fuentes|fuentes merino|fuentes merino/.test(q)) {
        return "**Patricia Fuentes Meriño** es jefa de carrera de **Administración (RRHH)**.";
    }
    if (/elvis luna/.test(q)) {
        return "**Elvis Luna** es jefe de carrera de **Construcciones Metálicas**.";
    }
    if (/maria alejandra|inostroza/.test(q)) {
        return "**María Alejandra Inostroza** es jefa de carrera de **Atención de Párvulos**.";
    }
    if (/sandra norambuena|norambuena/.test(q)) {
        return "**Sandra Norambuena** es jefa de carrera de **Agropecuaria**.";
    }
    if (/camila cruz/.test(q)) {
        return "**Camila Cruz** es jefa de carrera de **Gastronomía (Cocina)**.";
    }
    if (/rice|reglamento|convivencia|uniforme|falta grave|aula segura|mediacion|conducto regular|sello educativo/.test(q)) {
        return "**RICE / convivencia (resumen):**\n\n• Sellos: Respeto, Responsabilidad y Tolerancia.\n• Jornada: lun-vie desde 8:15 (~42 hrs).\n• Uniforme obligatorio; talleres TP con vestimenta técnica.\n• Convivencia formativa (diálogo y mediación).\n• Conducto regular: Profesor → UTP/Convivencia/Inspectoría → Dirección.\n• Protocolos: atrasos, bullying, accidentes, Aula Segura, etc.";
    }
    if (/historia|fundacion|cuando se fundo|bicentenario|director|aquiles|rbd/.test(q)) {
        return "El **Liceo Bicentenario Manuel Montt** (San Javier, **RBD 3479**) nació hacia mediados de los **1940**. Ofrece **HC** y **TP**. En **octubre 2023** recibió el sello de **Liceo Bicentenario de Excelencia**. Director actual: **Aquiles Mauricio Vásquez Castillo**.";
    }
    if (/aaron|cancino|cristobal soto|eco-red|eco red|destacado|alumno destacado/.test(q)) {
        return "**Alumnos destacados (4°F Programación):**\n\n• **Aaron Cancino** y **Cristóbal Soto** — proyecto **Eco-Red**, 1er lugar en Pensando las Tecnologías del Futuro.\n\nTambién en la sección **Proyectos**.";
    }
    if (/especialidad|especialidades|que enseñan|que carreras|oficios|tecnicos/.test(q)) {
        return "Hay **8 especialidades TP**: Programación, Electricidad, Contabilidad, Administración (RRHH), Construcciones Metálicas, Atención de Párvulos, Agropecuaria y Gastronomía. También **Humanístico-Científica**. Escribe el nombre de una o ve a **Especialidades**.";
    }
    if (/programac|software|codigo|python|javascript|informatica/.test(q)) {
        return "**Programación** (jefe: **German Villar Martinez**): software, web, bases de datos, soporte y automatización. Página **Programación**.";
    }
    if (/electric|instalacion|tablero|fotovolta|plc/.test(q)) {
        return "**Electricidad** (jefe: **Hans Saavedra**): instalaciones, mantenimiento, tableros, automatización y renovables. Página **Electricidad**.";
    }
    if (/contabil|tributar|impuesto|erp|balance|finanza/.test(q)) {
        return "**Contabilidad** (jefa: **Delia Sepúlveda**): registro contable, tributaria, remuneraciones y ERP. Página **Contabilidad**.";
    }
    if (/administr|rrhh|recursos humanos|contrato|finiquito|reclut/.test(q)) {
        return "**Administración RRHH** (jefa: **Patricia Fuentes Meriño**): contratos, liquidaciones y reclutamiento. Página **Administración**.";
    }
    if (/metal|soldadur|mig|tig|cerrajer/.test(q)) {
        return "**Construcciones Metálicas** (jefe: **Elvis Luna**): soldadura, planos y montaje. Página **Construcciones Metálicas**.";
    }
    if (/parvulo|jardin|infantil|estimulacion|sala cuna/.test(q)) {
        return "**Atención de Párvulos** (jefa: **María Alejandra Inostroza**): cuidado y estimulación 0-6 años. Página **Atención de Párvulos**.";
    }
    if (/agro|agricol|ganad|riego|cultivo|pecuaria/.test(q)) {
        return "**Agropecuaria** (jefa: **Sandra Norambuena**): agrícola, pecuaria, maquinaria y riego. Página **Agropecuaria**.";
    }
    if (/gastro|cocina|chef|culinari|banquete|restaurant/.test(q)) {
        return "**Gastronomía** (jefa: **Camila Cruz**): cocina, inocuidad y banquetería. Página **Gastronomía**.";
    }
    if (/contacto|correo|telefono|ubicacion|san javier/.test(q)) {
        return "📍 **Liceo Bicentenario Manuel Montt** — San Javier. Revisa **Contacto** en el menú. Conducto regular: profesor → UTP/Convivencia/Inspectoría → Dirección.";
    }
    if (/proyecto|portafolio/.test(q)) {
        return "En **Proyectos** hay trabajos reales. Destaca **Eco-Red** (Aaron Cancino y Cristóbal Soto). Usa el buscador del portafolio.";
    }
    if (/gracias|chao|adios|bye/.test(q)) {
        return "De nada. Si se te prende otra duda, aquí estaré. 😊";
    }
    return "Puedo ayudar con **especialidades**, **jefes de carrera**, **notas** (calificando.cl), **justificar inasistencias** (justificar.lmmsys.cl), **RICE**, **historia** o **proyectos**. ¿Qué buscas?";
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
        let reply;
        if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
            reply = await getJarvieReplyAI(userText);
        } else {
            reply = getJarvieReplyLocal(userText);
        }
        loadingElem.innerHTML = formatMessageText(reply);
    } catch (err) {
        console.error("JARVIE error:", err);
        loadingElem.innerHTML = formatMessageText(
            getJarvieReplyLocal(userText) + "\n\n_(IA no disponible; modo local.)_"
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
