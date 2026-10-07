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

/* --------------------------------------------------------------------------
   CONFIG IA (Gemini gratis)
   1) Entra a https://aistudio.google.com/apikey
   2) Crea una API key
   3) Pégala entre las comillas de abajo
   -------------------------------------------------------------------------- */
const GEMINI_API_KEY = "AQ.Ab8RN6KpzaIOLNFPllziDIdqaUI7mxpHPSbfBNrXiMGj6EeNIw"; // <-- PEGA TU API KEY AQUÍ

const JARVIE_SYSTEM = `Eres JARVIE, asistente virtual del Portafolio del Liceo Bicentenario Manuel Montt (San Javier, Chile).
Responde en español de Chile, claro, amable y breve (máximo 2-3 párrafos cortos).
Especialidades del liceo: Programación, Electricidad, Contabilidad, Administración (RRHH), Construcciones Metálicas, Atención de Párvulos, Agropecuaria y Gastronomía (Cocina).
Puedes hablar de especialidades, campo laboral, continuidad de estudios, proyectos de estudiantes y navegación del sitio.
Si no sabes un dato interno del liceo, dilo y orienta a la sección Contacto o Especialidades.`;

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

    const getComments = () => JSON.parse(localStorage.getItem("lm_comments") || "[]");

    const render = () => {
        const comments = getComments();
        list.innerHTML = "";
        if (count) count.innerText = comments.length;

        if (!comments.length) {
            list.innerHTML = `<p class="no-comments-msg">Sin comentarios aún. Sé el primero.</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        comments.forEach(c => {
            const item = document.createElement("div");
            item.className = "comment-item";
            item.innerHTML = `
                <div class="comment-header">
                    <strong class="comment-author">${escapeHTML(c.author)}</strong>
                    <span class="comment-date">${escapeHTML(c.date)}</span>
                </div>
                <p class="comment-body">${escapeHTML(c.body)}</p>
            `;
            fragment.appendChild(item);
        });
        list.appendChild(fragment);
    };

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const authorInput = document.getElementById("comment-author");
        const bodyInput = document.getElementById("comment-body");
        const author = authorInput.value.trim();
        const body = bodyInput.value.trim();
        if (!author || !body) return;

        const comments = getComments();
        comments.unshift({
            author,
            body,
            date: new Date().toLocaleDateString("es-CL", {
                day: "numeric", month: "short", year: "numeric"
            })
        });
        localStorage.setItem("lm_comments", JSON.stringify(comments));
        authorInput.value = "";
        bodyInput.value = "";
        render();
    });

    render();
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
        appendMessage("¡Hola! 👋 Soy **JARVIE**, asistente del Liceo Manuel Montt. Pregúntame por especialidades, proyectos o lo que necesites.", "bot");
    }
}

function normalizeText(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getJarvieReplyLocal(text) {
    const q = normalizeText(text);

    if (/^(hola|ola|buenas|hey|hi|hello|oye|que tal|que onda)\b/.test(q) || (q.length < 5 && /hola|ola|hi|oye/.test(q))) {
        return "¡Hola! 👋 Soy **JARVIE**. Puedo hablar de las **especialidades**, proyectos, contacto o casi cualquier tema si la IA está activa. ¿Qué necesitas?";
    }
    if (/especialidad|especialidades|que enseñan|que carreras|oficios|tecnicos/.test(q)) {
        return "El liceo tiene **8 especialidades**:\n\n1. Programación\n2. Electricidad\n3. Contabilidad\n4. Administración (RRHH)\n5. Construcciones Metálicas\n6. Atención de Párvulos\n7. Agropecuaria\n8. Gastronomía (Cocina)\n\nEscribe el nombre de una o ve a **Especialidades** → *Ver más*.";
    }
    if (/programac|software|codigo|python|javascript|informatica/.test(q)) {
        return "**Programación**: software, web, bases de datos, soporte y automatización. 👉 Página **Programación**.";
    }
    if (/electric|instalacion|tablero|fotovolta|plc/.test(q)) {
        return "**Electricidad**: instalaciones, mantenimiento, tableros, automatización y renovables. 👉 Página **Electricidad**.";
    }
    if (/contabil|tributar|impuesto|erp|balance|finanza/.test(q)) {
        return "**Contabilidad**: registro contable, tributaria, remuneraciones y ERP. 👉 Página **Contabilidad**.";
    }
    if (/administr|rrhh|recursos humanos|contrato|finiquito|reclut/.test(q)) {
        return "**Administración (RRHH)**: contratos, liquidaciones, reclutamiento y legislación laboral. 👉 Página **Administración**.";
    }
    if (/metal|soldadur|mig|tig|cerrajer/.test(q)) {
        return "**Construcciones Metálicas**: soldadura MIG/TIG/MAG, planos CAD y montaje. 👉 Página **Construcciones Metálicas**.";
    }
    if (/parvulo|jardin|infantil|estimulacion|sala cuna/.test(q)) {
        return "**Atención de Párvulos**: cuidado y estimulación 0-6 años. 👉 Página **Atención de Párvulos**.";
    }
    if (/agro|agricol|ganad|riego|cultivo|pecuaria/.test(q)) {
        return "**Agropecuaria**: producción agrícola, pecuaria, maquinaria y riego. 👉 Página **Agropecuaria**.";
    }
    if (/gastro|cocina|chef|culinari|banquete|restaurant/.test(q)) {
        return "**Gastronomía**: técnicas culinarias, inocuidad, cocina internacional y banquetería. 👉 Página **Gastronomía**.";
    }
    if (/contacto|correo|telefono|ubicacion|san javier/.test(q)) {
        return "📍 **Liceo Bicentenario Manuel Montt** — San Javier. Revisa la sección **Contacto**.";
    }
    if (/proyecto|portafolio/.test(q)) {
        return "En **Proyectos** verás trabajos reales de estudiantes. Usa el buscador o *Ver proyectos*.";
    }
    if (/gracias|chao|adios|bye/.test(q)) {
        return "¡De nada! Aquí estaré si necesitas algo más. 😊";
    }
    return "Prueba con **especialidades**, el nombre de una especialidad, **proyectos** o **contacto**. Si configuraste la API de Gemini, también respondo preguntas generales.";
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