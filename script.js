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
   -------------------------------------------------------------------------- */
const GEMINI_API_KEY = "AQ.Ab8RN6KpzaIOLNFPllziDIdqaUI7mxpHPSbfBNrXiMGj6EeNIw";

/* --------------------------------------------------------------------------
   BASE DE CONOCIMIENTO JARVIE
   -------------------------------------------------------------------------- */
const JARVIE_KB = {
  plataformas: {
    notas: "https://calificando.cl/",
    justificar: "https://justificar.lmmsys.cl/",
    notas_msg: "Puedes revisar tus **notas** en **Calificando**: https://calificando.cl/ . Yo no puedo entrar ni cambiar calificaciones; solo te oriento.",
    justificar_msg: "Puedes **justificar inasistencias** en la plataforma oficial: **https://justificar.lmmsys.cl/** . Yo no justifico por ti; el trámite lo haces ahí."
  },
  sueldos: "Rango **referencial** de sueldos de profesores: entre **$800.000 y $1.300.000** CLP. No es un monto fijo: varía por experiencia, horas, asignaciones y funciones.",
  directivos: "**Equipo directivo y de gestión — Liceo Bicentenario Manuel Montt:**\n\n• **Aquiles Vásquez** — Director LMM\n• **Eduardo Molina** — Subdirector\n• **Augusto Astudillo** — Inspector General\n• **Bessy Rodríguez** — Inspectoría General\n• **José Pinto** — Inspectoría General\n• **Francisco Quiroz** — Inspectoría General\n• **Fernanda Bravo** — Jefa U.T.P. (Unidad Técnico Pedagógica)\n• **Sandra Andaur** — Jefa U.T.P.\n• **Gregorio Sepúlveda** — Coordinador Téc. Profesional\n• **Hans Saavedra** — Coordinador Área Industrial (también jefe de carrera de **Electricidad**)\n• **Luis González** — Departamento Orientación\n• **Ricardo Ríos** — Convivencia Escolar\n• **Soledad López** — Jefa Psicosocial LMM\n• **María Inés Sepúlveda** — Evaluadora",
  jefesLista: "**Jefes de carrera (no son profesor jefe ni director):**\n\n• **Programación:** German Villar Martínez\n• **Electricidad:** Hans Saavedra\n• **Contabilidad:** Delia Sepúlveda\n• **Administración (RRHH):** Patricia Fuentes Meriño\n• **Construcciones Metálicas:** Elvis Luna\n• **Atención de Párvulos:** María Alejandra Inostroza\n• **Agropecuaria:** Sandra Norambuena\n• **Gastronomía (Cocina):** Karina Soto",
  rice: "**RICE (resumen):**\n\n• **Sellos:** Respeto, Responsabilidad y Tolerancia.\n• **Jornada:** lunes a viernes desde **08:15**, carga ~**42 horas**.\n• **Uniforme** obligatorio; en talleres TP vestimenta técnica.\n• Convivencia **formativa** (diálogo, mediación).\n• **Conducto regular:** Profesor Jefe/Asignatura → UTP / Convivencia / Inspectoría → Dirección.\n• Protocolos: atrasos, bullying, accidentes, Aula Segura (Ley 21.128), etc.\n\nAnte un caso concreto, acude a la autoridad correspondiente.",
  historia: "El **Liceo Bicentenario Manuel Montt** de San Javier (**RBD 3479**) es un liceo público del Maule (HC y TP). Se fundó hacia mediados de los **1940**. En **octubre 2023** recibió el sello **Liceo Bicentenario de Excelencia**. Director actual: **Aquiles Mauricio Vásquez Castillo**.",
  logros: "Logros: sello **Liceo Bicentenario de Excelencia (2023)**; avances en **SIMCE**; articulación para continuidad de estudios; reconocimiento comunal de San Javier.",
  destacados: {
    aaron: "**Aaron Cancino** — estudiante de **4°F Programación**. Participó en **Eco-Red**, **1er lugar** en *Pensando las Tecnologías del Futuro*.",
    cristobal: "**Cristóbal Soto** — estudiante de **4°F Programación**. Integrante de **Eco-Red**, **1er lugar** en *Pensando las Tecnologías del Futuro*.",
    ecored: "**Eco-Red** (Aaron Cancino y Cristóbal Soto, 4°F Programación) obtuvo el **1er lugar** en *Pensando las Tecnologías del Futuro*. Está en **Proyectos**."
  },
  especialidades: "El liceo ofrece **Humanístico-Científica** y **8 especialidades TP**: Administración, Agropecuaria, Atención de Párvulos, Construcciones Metálicas, Contabilidad, Electricidad, Gastronomía y Programación."
};

const JARVIE_SYSTEM = `Eres JARVIE, asistente virtual del Portafolio del Liceo Bicentenario Manuel Montt (San Javier, Chile, RBD 3479).
Sabes que eres un bot; humor ocasional, nunca cruel. Prioriza datos correctos. Español de Chile, breve. Usa **negritas**.
NO inventes. Notas: https://calificando.cl/ | Justificar: https://justificar.lmmsys.cl/
Sueldos docentes referencial: $800.000-$1.300.000.
Jefes: Programación German Villar Martínez; Electricidad Hans Saavedra; Contabilidad Delia Sepúlveda; Administración Patricia Fuentes Meriño; Construcciones Metálicas Elvis Luna; Párvulos María Alejandra Inostroza; Agropecuaria Sandra Norambuena; Gastronomía Karina Soto.
RICE: sellos Respeto/Responsabilidad/Tolerancia; jornada 08:15; conducto Profesor→UTP/Convivencia/Inspectoría→Dirección.
Historia: ~1940; Bicentenario Excelencia 2023; director Aquiles Vásquez. Equipo: Subdirector Eduardo Molina; Inspectoría (Astudillo, Rodríguez, Pinto, Quiroz); UTP Fernanda Bravo y Sandra Andaur; Coord. TP Gregorio Sepúlveda; Coord. Industrial / jefe Electricidad Hans Saavedra; Orientación Luis González; Convivencia Ricardo Ríos; Psicosocial Soledad López; Evaluadora María Inés Sepúlveda.
Destacados: Aaron Cancino y Cristóbal Soto (Eco-Red, 1er lugar).`;

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
        description: "Experiencias reales con drones agrícolas en liceos en convenio: servicio técnico, reparación, charla multiespectral y vuelo del DJI Agras T100."
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
    const toggle = document.getElementById("menu-toggle") || document.getElementById("hamburger");
    const panel = document.getElementById("menu-panel") || document.getElementById("side-drawer");
    const backdrop = document.getElementById("menu-backdrop") || document.getElementById("drawer-overlay");
    const closeBtn = document.getElementById("menu-close") || document.getElementById("drawer-close");

    if (!toggle || !panel) return;

    let lastFocus = null;

    const isOpen = () => panel.classList.contains("is-open") || panel.classList.contains("open");

    const openMenu = () => {
        lastFocus = document.activeElement;
        panel.classList.add("is-open", "open");
        panel.setAttribute("aria-hidden", "false");
        toggle.setAttribute("aria-expanded", "true");
        if (backdrop) {
            backdrop.hidden = false;
            backdrop.classList.add("is-open", "open");
        }
        document.body.classList.add("menu-open", "drawer-open");
        const focusable = panel.querySelector("button, a");
        if (focusable) focusable.focus({ preventScroll: true });
    };

    const closeMenu = () => {
        panel.classList.remove("is-open", "open");
        panel.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
        if (backdrop) {
            backdrop.classList.remove("is-open", "open");
            setTimeout(() => { backdrop.hidden = true; }, 300);
        }
        document.body.classList.remove("menu-open", "drawer-open");
        if (lastFocus && typeof lastFocus.focus === "function") {
            try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
        }
    };

    toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOpen()) closeMenu();
        else openMenu();
    });

    if (closeBtn) closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
    });

    if (backdrop) backdrop.addEventListener("click", closeMenu);

    panel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen()) {
            e.preventDefault();
            closeMenu();
        }
    });

    // Active link on scroll (index sections)
    const sectionIds = ["inicio", "especialidades", "proyectos", "comentarios", "creditos", "contacto"];
    const links = document.querySelectorAll(".nav-link");
    if (links.length && "IntersectionObserver" in window) {
        const map = {};
        links.forEach((a) => {
            const href = a.getAttribute("href") || "";
            const id = href.replace(/^.*#/, "");
            if (id) map[id] = a;
        });
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                links.forEach((l) => l.classList.remove("active"));
                if (map[id]) map[id].classList.add("active");
            });
        }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) obs.observe(el);
        });
    }
}

function initThemeToggle() {
    const html = document.documentElement;
    const KEY = "lm_theme";

    const buttons = () =>
        Array.from(document.querySelectorAll("#theme-toggle, #theme-toggle-spec, .theme-toggle, .theme-toggle-spec"));

    const iconFor = (theme) =>
        theme === "light"
            ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';

    const current = () => {
        const t = html.getAttribute("data-theme");
        return t === "light" ? "light" : "dark";
    };

    const apply = (theme) => {
        html.setAttribute("data-theme", theme);
        try { localStorage.setItem(KEY, theme); } catch (e) {}
        buttons().forEach((btn) => {
            btn.innerHTML = iconFor(theme);
            btn.setAttribute("aria-label", theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
            btn.title = theme === "light" ? "Modo noche" : "Modo día";
        });
    };

    // Cargar preferencia guardada
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === "light" || saved === "dark") {
        apply(saved);
    } else {
        apply(current());
    }

    // Un solo handler delegado (funciona aunque se clonene botones)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("#theme-toggle, #theme-toggle-spec, .theme-toggle, .theme-toggle-spec");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        apply(current() === "light" ? "dark" : "light");
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
        grid.innerHTML = `<p class="no-projects-msg">No hay proyectos que coincidan con tu búsqueda. Prueba con otra palabra (ej. Programación, Eco-Red, drones).</p>`;
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

    let statusEl = document.getElementById("search-status");
    if (!statusEl) {
        statusEl = document.createElement("p");
        statusEl.id = "search-status";
        statusEl.className = "search-status";
        statusEl.setAttribute("aria-live", "polite");
        statusEl.style.cssText = "text-align:center;margin:0.75rem auto 0;max-width:520px;font-size:0.9rem;color:var(--text-muted,#94a3b8);min-height:1.25em;";
        const box = input.closest(".search-box") || input.parentElement;
        if (box && box.parentElement) {
            box.parentElement.insertBefore(statusEl, box.nextSibling);
        }
    }

    const normalize = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filterSpecialtyCards = (q) => {
        const cards = document.querySelectorAll(".specialty-card");
        let visible = 0;
        cards.forEach((card) => {
            const hay = normalize(card.innerText);
            const match = !q || hay.includes(q);
            card.style.display = match ? "" : "none";
            if (match) visible++;
        });
        return visible;
    };

    const runSearch = () => {
        const raw = input.value.trim();
        const q = normalize(raw);

        if (clearBtn) clearBtn.style.display = raw ? "block" : "none";

        const filteredProjects = !q
            ? projectsData
            : projectsData.filter((p) => {
                const blob = normalize(
                    [p.title, p.student, p.specialty, p.description, (p.techs || []).join(" "), p.year || ""].join(" ")
                );
                return blob.includes(q);
            });
        renderProjects(filteredProjects);

        const specsVisible = filterSpecialtyCards(q);

        if (!q) {
            statusEl.textContent = "";
            return;
        }

        const pLabel = filteredProjects.length === 1 ? " proyecto" : " proyectos";
        const sLabel = specsVisible === 1 ? " especialidad" : " especialidades";
        statusEl.textContent = "Resultados: " + filteredProjects.length + pLabel + " · " + specsVisible + sLabel;

        if (filteredProjects.length > 0) {
            document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (specsVisible > 0) {
            document.getElementById("especialidades")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    let timer = null;
    input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(runSearch, 180);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            clearTimeout(timer);
            runSearch();
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            input.value = "";
            clearBtn.style.display = "none";
            statusEl.textContent = "";
            filterSpecialtyCards("");
            renderProjects(projectsData);
            input.focus();
        });
    }
}


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

    let commentsExpanded = false;
    let lastComments = [];

    const buildItem = (c) => {
        const item = document.createElement("div");
        item.className = "comment-item";
        item.innerHTML =
            '<div class="comment-header">' +
            '<strong class="comment-author">' + escapeHTML(c.author) + '</strong>' +
            '<span class="comment-date">' + escapeHTML(c.date || "") + '</span>' +
            '</div>' +
            '<p class="comment-body">' + escapeHTML(c.body) + '</p>';
        return item;
    };

    const render = (comments) => {
        lastComments = Array.isArray(comments) ? comments : [];
        list.innerHTML = "";
        if (count) count.innerText = String(lastComments.length);
        if (!lastComments.length) {
            list.innerHTML = '<p class="no-comments-msg">Sin comentarios aún. Sé el primero.</p>';
            return;
        }

        const LIMIT = 3;
        const showAll = commentsExpanded || lastComments.length <= LIMIT;
        const visible = showAll ? lastComments : lastComments.slice(0, LIMIT);

        const fragment = document.createDocumentFragment();
        visible.forEach((c) => fragment.appendChild(buildItem(c)));
        list.appendChild(fragment);

        if (lastComments.length > LIMIT) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "comments-toggle-btn";
            btn.setAttribute("aria-expanded", showAll ? "true" : "false");
            if (showAll) {
                btn.innerHTML = '<i class="fa-solid fa-chevron-up" aria-hidden="true"></i> Ver menos';
            } else {
                const rest = lastComments.length - LIMIT;
                btn.innerHTML = '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i> Ver más... (' + rest + ')';
            }
            btn.addEventListener("click", () => {
                commentsExpanded = !commentsExpanded;
                render(lastComments);
            });
            list.appendChild(btn);
        }
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
   7. CHATBOT JARVIE
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
        appendMessage("¡Hola! Soy **JARVIE**. Notas (calificando.cl), justificar faltas (justificar.lmmsys.cl), jefes de carrera, RICE o proyectos: pregunta nomás.", "bot");
    }
}

function normalizeText(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchJefeCarrera(q) {
    const pairs = [
        [/programac/, "Programación", "German Villar Martínez"],
        [/electric/, "Electricidad", "Hans Saavedra"],
        [/contabil/, "Contabilidad", "Delia Sepúlveda"],
        [/administr|rrhh|recursos humanos/, "Administración (RRHH)", "Patricia Fuentes Meriño"],
        [/metal|soldadur/, "Construcciones Metálicas", "Elvis Luna"],
        [/parvulo|jardin infantil/, "Atención de Párvulos", "María Alejandra Inostroza"],
        [/agro|pecuaria|agricol/, "Agropecuaria", "Sandra Norambuena"],
        [/gastro|cocina/, "Gastronomía (Cocina)", "Karina Soto"]
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

    if (/^(hola|ola|buenas|hey|hi|hello|oye|que tal|que onda)\b/.test(q) || (q.length < 6 && /hola|ola|hi|oye/.test(q))) {
        return "¡Hola! Soy **JARVIE**, el bot del Liceo Manuel Montt. Pregúntame por **notas**, **justificar inasistencias**, **jefes de carrera**, **RICE**, **historia** o **proyectos**.";
    }
    if (/quien eres|que eres|eres un bot|inteligencia artificial|\bia\b|robot/.test(q)) {
        return "Sí, soy un **asistente virtual** del portafolio. Puedo orientarte con info del liceo; no reemplazo a Inspectoría ni a UTP.";
    }
    if (/nota|notas|calificacion|calificaciones|calificando|donde veo mis|revisar mis calif/.test(q)) {
        return JARVIE_KB.plataformas.notas_msg;
    }
    if (/justific|justifico|justificar|inasistencia|falte a clases|falta justif|donde justific/.test(q)) {
        return JARVIE_KB.plataformas.justificar_msg;
    }
    if (/asistencia|porcentaje de asistencia|como veo la asistencia|donde veo (la )?asistencia/.test(q)) {
        return "La **asistencia** se registra en los sistemas del liceo. Para **justificar** una inasistencia usa **https://justificar.lmmsys.cl/** . Las **notas** están en **https://calificando.cl/** .";
    }
    if (/sueldo|salario|cuanto ganan|ganan los profe|plata.*profe|remuneracion.*docente/.test(q)) {
        return JARVIE_KB.sueldos + " Si preguntas por una persona en particular, el monto exacto puede cambiar según contrato y funciones.";
    }
    if (/jefe de carrera|jefa de carrera|jefatura de|quien esta a cargo|quien es el jefe|quien es la jefa/.test(q)) {
        const uno = matchJefeCarrera(q);
        if (uno) return uno;
        return JARVIE_KB.jefesLista;
    }
    if (/german villar|villar martinez/.test(q)) return "**German Villar Martínez** es jefe de carrera de **Programación**.";
    if (/hans saavedra/.test(q)) return "**Hans Saavedra** es **jefe de carrera de Electricidad** y también **Coordinador del Área Industrial** del liceo.";
    if (/aquiles|vasquez|vásquez/.test(q) && /director|quien/.test(q) || /^quien es el director|director del liceo|director lmm/.test(q))
        return "**Aquiles Vásquez** es el **Director** del Liceo Bicentenario Manuel Montt (LMM).";
    if (/eduardo molina|subdirector/.test(q)) return "**Eduardo Molina** es el **Subdirector** del LMM.";
    if (/augusto astudillo/.test(q)) return "**Augusto Astudillo** integra **Inspectoría General**.";
    if (/bessy rodriguez|bessy rodríguez/.test(q)) return "**Bessy Rodríguez** integra **Inspectoría General**.";
    if (/jose pinto|josé pinto/.test(q)) return "**José Pinto** integra **Inspectoría General**.";
    if (/francisco quiroz/.test(q)) return "**Francisco Quiroz** integra **Inspectoría General**.";
    if (/fernanda bravo/.test(q)) return "**Fernanda Bravo** es **Jefa de U.T.P.** (Unidad Técnico Pedagógica).";
    if (/sandra andaur/.test(q)) return "**Sandra Andaur** es **Jefa de U.T.P.**";
    if (/gregorio sepulveda|gregorio sepúlveda|coordinador tec|coordinador téc/.test(q)) return "**Gregorio Sepúlveda** es **Coordinador Técnico Profesional**.";
    if (/luis gonzalez|luis gonzález|orientacion|orientación/.test(q) && !/parvulo|párvulo/.test(q)) return "**Luis González** está en el **Departamento de Orientación**.";
    if (/ricardo rios|ricardo ríos|convivencia escolar/.test(q)) return "**Ricardo Ríos** está a cargo de **Convivencia Escolar**.";
    if (/soledad lopez|soledad lópez|psicosocial/.test(q)) return "**Soledad López** es **Jefa Psicosocial LMM**.";
    if (/maria ines sepulveda|maría inés sepúlveda|evaluadora/.test(q)) return "**María Inés Sepúlveda** es **Evaluadora** del liceo.";
    if (/equipo directivo|directivos|inspector general|inspectoría general|utp|unidad tecnico|unidad técnico/.test(q))
        return JARVIE_KB.directivos;
    if (/delia sepulveda/.test(q)) return "**Delia Sepúlveda** es jefa de carrera de **Contabilidad**.";
    if (/patricia fuentes|fuentes merino/.test(q)) return "**Patricia Fuentes Meriño** es jefa de carrera de **Administración (RRHH)**.";
    if (/elvis luna/.test(q)) return "**Elvis Luna** es jefe de carrera de **Construcciones Metálicas**.";
    if (/inostroza|maria alejandra/.test(q)) return "**María Alejandra Inostroza** es jefa de carrera de **Atención de Párvulos**.";
    if (/norambuena|sandra norambuena/.test(q)) return "**Sandra Norambuena** es jefa de carrera de **Agropecuaria**.";
    if (/karina soto/.test(q)) return "**Karina Soto** es jefa de carrera de **Gastronomía (Cocina)**.";
    if (/rice|reglamento|convivencia|uniforme|conducto regular|aula segura|mediacion|sello educativo|bullying|ciberbullying|pise/.test(q)) {
        return JARVIE_KB.rice;
    }
    if (/historia|fundacion|cuando se fundo|bicentenario|rbd|director|aquiles|vasquez/.test(q)) {
        return JARVIE_KB.historia;
    }
    if (/simce|logro|reconocimiento|excelencia/.test(q)) {
        return JARVIE_KB.logros;
    }
    if (/aaron|cancino/.test(q)) return JARVIE_KB.destacados.aaron;
    if (/cristobal soto/.test(q)) return JARVIE_KB.destacados.cristobal;
    if (/eco-red|eco red|ecoreed|destacado|alumno destacado/.test(q)) return JARVIE_KB.destacados.ecored;
    if (/especialidad|especialidades|que enseñan|que carreras|oferta academica/.test(q)) {
        return JARVIE_KB.especialidades + " Escribe el nombre de una o ve a **Especialidades** → Ver más.";
    }
    if (/programac|software|python|javascript|informatica/.test(q)) {
        return "**Programación** (jefe: **German Villar Martínez**): software, web, bases de datos y soporte. Página **Programación**.";
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
        return "**Gastronomía** (jefa: **Karina Soto**). Página **Gastronomía**.";
    }
    if (/contacto|correo|telefono|ubicacion|san javier/.test(q)) {
        return "📍 **Liceo Bicentenario Manuel Montt** — San Javier. Revisa **Contacto** en el menú.";
    }
    if (/proyecto|portafolio/.test(q)) {
        return "En **Proyectos** están trabajos reales, entre ellos **Eco-Red** (Aaron Cancino y Cristóbal Soto).";
    }
    if (/gracias|chao|adios|bye/.test(q)) {
        return "De nada. Si necesitas otra cosa del liceo, aquí estoy.";
    }
    return null;
}

function isInstitutionalQuery(text) {
    const q = normalizeText(text);
    return /nota|calific|calificando|justific|asistencia|inasistencia|sueldo|salario|jefe de carrera|jefa de carrera|jefatura|rice|reglamento|convivencia|uniforme|conducto|aula segura|historia|fundacion|bicentenario|director|aquiles|subdirector|inspector|utp|directivo|orientacion|psicosocial|evaluadora|aaron|cancino|cristobal|eco-red|eco red|especialidad|programac|electric|contabil|administr|parvulo|agro|gastro|metal|simce|rbd|manuel montt/.test(q);
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
        if (reply) {
            loadingElem.innerHTML = formatMessageText(reply);
        } else if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10 && !isInstitutionalQuery(userText)) {
            reply = await getJarvieReplyAI(userText);
            loadingElem.innerHTML = formatMessageText(reply);
        } else if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
            try {
                reply = await getJarvieReplyAI(userText);
                loadingElem.innerHTML = formatMessageText(reply);
            } catch (e) {
                loadingElem.innerHTML = formatMessageText("No tengo ese dato exacto. Prueba con **notas**, **justificar inasistencia**, **jefe de carrera**, **RICE** o **historia del liceo**.");
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
