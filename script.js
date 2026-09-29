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

// Variable global para rastrear el elemento que abrió un modal (Accesibilidad Focus)
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

    // Skeleton breve + render de proyectos
    showProjectSkeletons();
    setTimeout(() => renderProjects(projectsData), 450);
});

/* 1. NAVBAR */
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

/* 2. TEMA */
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

/* 3. CONTADORES (Optimizado con IntersectionObserver) */
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
    const counters = document.querySelectorAll(".stat-number");
    counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        if (target === 0) return;
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

/* 4. PROYECTOS Y BUSCADOR */
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

    if (projects.length === 0) {
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

// Delegación de eventos para los botones del grid de proyectos
function initProjectGridEvents() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    grid.addEventListener("click", (e) => {
        const btn = e.target.closest(".view-project-btn");
        if (btn) {
            lastFocusedElement = btn;
            const id = parseInt(btn.getAttribute("data-id"), 10);
            openProjectModal(id);
        }
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

/* 5. COMENTARIOS */
function initComments() {
    const form = document.getElementById("comment-form");
    const list = document.getElementById("comments-list");
    const count = document.getElementById("comment-count");
    if (!form || !list) return;

    const getComments = () => JSON.parse(localStorage.getItem("lm_comments")) || [];

    const render = () => {
        const comments = getComments();
        list.innerHTML = "";
        if (count) count.innerText = comments.length;

        if (comments.length === 0) {
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

        if (author && body) {
            const comments = getComments();
            comments.unshift({
                author,
                body,
                date: new Date().toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
            });
            localStorage.setItem("lm_comments", JSON.stringify(comments));
            authorInput.value = "";
            bodyInput.value = "";
            render();
        }
    });

    render();
}

function escapeHTML(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

/* 6. MODALES Y SCROLL */
function initModals() {
    const modal = document.getElementById("project-modal");
    const closeBtn = document.getElementById("modal-close");
    const overlay = document.getElementById("modal-overlay");

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (overlay) overlay.onclick = closeModal;

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal?.classList.contains("active")) {
            closeModal();
        }
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
        <div class="tags">${p.techs.map(t => `<span>${escapeHTML(t)}</span>`).join('')}</div>
    `;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("modal-close")?.focus();
}

function initScrollTop() {
    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) btn.classList.add("visible");
        else btn.classList.remove("visible");
    }, { passive: true });

    btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================================================
   7. CHATBOT ASÍNCRONO - JARVIE
   ========================================================================== */
function initChatbot() {
    const chatToggle = document.getElementById("chat-toggle");
    const chatWindow = document.getElementById("chat-window");
    const chatClose = document.getElementById("chat-close");
    const chatForm = document.getElementById("chat-form");
    const chatMessages = document.getElementById("chat-messages");
    if (!chatToggle || !chatWindow) return;

    chatToggle.onclick = () => {
        const isOpen = chatWindow.classList.toggle("active");
        chatToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        chatWindow.setAttribute("aria-hidden", isOpen ? "false" : "true");
        if (isOpen) {
            document.getElementById("chat-input")?.focus();
        }
    };

    if (chatClose) {
        chatClose.onclick = () => {
            chatWindow.classList.remove("active");
            chatToggle.setAttribute("aria-expanded", "false");
            chatWindow.setAttribute("aria-hidden", "true");
            chatToggle.focus();
        };
    }

    if (chatForm) {
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            sendMessage();
        });
    }

    // Mensaje de bienvenida JARVIE
    if (chatMessages) {
        chatMessages.innerHTML = "";
        appendMessage("¡Hola! 👋 Soy **JARVIE**, asistente de soporte virtual. ¿Qué te gustaría saber hoy?", "bot");
    }
}

function getJarvieReply(text) {
    const q = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (/^(hola|ola|buenas|hey|hi|hello|que tal|que onda)\b/.test(q) || (q.length < 4 && /hola|ola|hi/.test(q))) {
        return "¡Hola! 👋 Soy **JARVIE**, asistente del Portafolio Virtual del Liceo Bicentenario Manuel Montt (San Javier). Puedo contarte sobre las **especialidades**, proyectos, contacto o cómo navegar el sitio. ¿Qué necesitas?";
    }
    if (/especialidad|especialidades|que enseñan|que carreras|que oficios|que tecnicos/.test(q)) {
        return "El liceo ofrece **8 especialidades** técnico-profesionales:\n\n1. **Programación**\n2. **Electricidad**\n3. **Contabilidad**\n4. **Administración (RRHH)**\n5. **Construcciones Metálicas**\n6. **Atención de Párvulos**\n7. **Agropecuaria**\n8. **Gastronomía (Cocina)**\n\nEscribe el nombre de una para ver más detalles, o ve a la sección **Especialidades** y pulsa *Ver más*.";
    }
    if (/programac|software|codigo|web|python|javascript|informatica/.test(q)) {
        return "**Programación**: forma técnicos en desarrollo de software, páginas web, bases de datos, soporte y automatización (Arduino). Alta demanda laboral.\n\n👉 Más info: página **Programación** (botón Ver más).";
    }
    if (/electric|instalacion|tablero|fotovolta|plc/.test(q)) {
        return "**Electricidad**: instalaciones residenciales/comerciales, mantenimiento industrial, tableros, automatización y energías renovables.\n\n👉 Página: **Electricidad**.";
    }
    if (/contabil|tributar|impuesto|erp|balance|finanza/.test(q)) {
        return "**Contabilidad**: registro contable, tributaria, remuneraciones, ERP y finanzas.\n\n👉 Página: **Contabilidad**.";
    }
    if (/administr|rrhh|recursos humanos|remuneracion|contrato|finiquito|reclut/.test(q)) {
        return "**Administración (RRHH)**: contratos, liquidaciones, finiquitos, reclutamiento y legislación laboral.\n\n👉 Página: **Administración**.";
    }
    if (/metal|soldadur|mig|tig|estructura metal|cerrajer/.test(q)) {
        return "**Construcciones Metálicas**: soldadura (MIG/TIG/MAG), planos CAD, montaje estructural y metalmecánica.\n\n👉 Página: **Construcciones Metálicas**.";
    }
    if (/parvulo|jardin|infantil|ninos|ninas|estimulacion|sala cuna/.test(q)) {
        return "**Atención de Párvulos**: cuidado y estimulación de niños/as de 0 a 6 años, material didáctico y trabajo con familias.\n\n👉 Página: **Atención de Párvulos**.";
    }
    if (/agro|agricol|ganad|riego|cultivo|campo|pecuaria/.test(q)) {
        return "**Agropecuaria**: producción agrícola, manejo pecuario, maquinaria, riego y suelos.\n\n👉 Página: **Agropecuaria**.";
    }
    if (/gastro|cocina|chef|culinari|banquete|restaurant|comida|alimento/.test(q)) {
        return "**Gastronomía (Cocina)**: técnicas culinarias, inocuidad (BPM), cocina nacional e internacional y banquetería.\n\n👉 Página: **Gastronomía**.";
    }
    if (/contacto|correo|email|telefono|donde|ubicacion|direccion|san javier/.test(q)) {
        return "📍 **Liceo Bicentenario Manuel Montt** — San Javier.\n\nRevisa la sección **Contacto** del menú para web oficial, correo y teléfono.";
    }
    if (/proyecto|portafolio|trabajos de alumnos|ver proyecto/.test(q)) {
        return "En **Proyectos** verás trabajos reales de estudiantes. Usa el buscador o el botón *Ver proyectos*.";
    }
    if (/sueldo|salario|plata|gana|empleo|trabajo|campo laboral/.test(q)) {
        return "Cada especialidad tiene su campo laboral y rangos de ingreso. Entra a la página de la especialidad (botón **Ver más**) y revisa *Campo laboral* y *Sueldos*.";
    }
    if (/universidad|estudiar despues|continuar|ingenier|pedagogia|carrera superior/.test(q)) {
        return "Todas las especialidades permiten continuidad de estudios. En cada página dedicada está la lista de **Continuidad de estudios**.";
    }
    if (/quien eres|que eres|ayuda|help|que puedes|para que sirves/.test(q)) {
        return "Soy **JARVIE**, asistente del portafolio del Liceo Manuel Montt. Pregunta por especialidades, proyectos o contacto. Ejemplo: *especialidades* o *¿qué es programación?*";
    }
    if (/gracias|thanks|chao|adios|bye|nos vemos/.test(q)) {
        return "¡De nada! Si necesitas algo más, aquí estaré. 😊";
    }
    return "No estoy seguro de eso 🤔 Prueba con **especialidades**, el nombre de una especialidad, **proyectos** o **contacto**.";
}

function sendMessage() {
    const chatInput = document.getElementById("chat-input");
    if (!chatInput) return;
    const userText = chatInput.value.trim();
    if (!userText) return;

    appendMessage(userText, "user");
    chatInput.value = "";

    const loadingElem = appendMessage("Pensando...", "bot");

    setTimeout(() => {
        const reply = getJarvieReply(userText);
        loadingElem.innerHTML = formatMessageText(reply);
        const chatMessages = document.getElementById("chat-messages");
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 350);
}

function appendMessage(text, type) {
    const chatMessages = document.getElementById("chat-messages");
    if (!chatMessages) return null;

    const div = document.createElement("div");
    div.id = "msg-" + Date.now();
    div.className = `chat-message ${type}`;
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
   8. ANIMACIONES FADE-IN (Intersection Observer)
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

    elements.forEach((el) => observer.observe(el));
}