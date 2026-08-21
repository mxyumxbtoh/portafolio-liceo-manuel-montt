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

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initThemeToggle();
    initCounters();
    initSearch();
    initComments();
    initModals();
    initScrollTop();
    initChatbot();
    initFadeInAnimations();
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
            const isOpen = navMenu.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            navMenu?.classList.remove("active");
            hamburger?.setAttribute("aria-expanded", "false");
        });
    });
}

/* 2. TEMA */
function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    const html = document.documentElement;
    if (!toggleBtn) return;

    // Restaurar preferencia guardada
    const saved = localStorage.getItem("lm_theme");
    if (saved === "light" || saved === "dark") {
        html.setAttribute("data-theme", saved);
        toggleBtn.innerHTML = saved === "light"
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    }

    toggleBtn.addEventListener("click", () => {
        const isDark = html.getAttribute("data-theme") === "dark";
        const next = isDark ? "light" : "dark";
        html.setAttribute("data-theme", next);
        localStorage.setItem("lm_theme", next);
        toggleBtn.innerHTML = isDark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    });
}

/* 3. CONTADORES */
function initCounters() {
    const counters = document.querySelectorAll(".stat-number");
    let animated = false;

    const startCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute("data-target");
            if (target === 0) return;
            let count = 0;
            const step = Math.ceil(target / 50);
            const timer = setInterval(() => {
                count += step;
                if (count >= target) {
                    counter.innerText = target;
                    clearInterval(timer);
                } else {
                    counter.innerText = count;
                }
            }, 20);
        });
    };

    window.addEventListener("scroll", () => {
        const section = document.getElementById("estadisticas");
        if (section && section.getBoundingClientRect().top < window.innerHeight && !animated) {
            startCounters();
            animated = true;
        }
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
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No se encontraron proyectos.</p>`;
        return;
    }

    projects.forEach((p, idx) => {
        const card = document.createElement("div");
        card.className = "project-card fade-in";
        card.style.setProperty("--i", idx);
        card.innerHTML = `
            <div class="project-img-wrapper">
                <img src="${p.image}" alt="Proyecto ${p.title} - ${p.specialty}" loading="lazy">
                <span class="project-badge">${p.specialty}</span>
            </div>
            <div class="project-info">
                <h3>${p.title}</h3>
                <p class="project-author"><i class="fa-solid fa-user" aria-hidden="true"></i> ${p.student}</p>
                <p class="project-desc">${p.description}</p>
                ${p.year ? `<p class="project-year"><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${p.year}</p>` : ""}
                <button class="btn-secondary view-project-btn" style="width:100%; margin-top:0.8rem;" data-id="${p.id}" aria-label="Ver detalles del proyecto ${p.title}">
                    Ver detalles
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Activar fade-in inmediatamente después de insertar
    requestAnimationFrame(() => {
        grid.querySelectorAll(".fade-in").forEach(el => el.classList.add("visible"));
    });

    document.querySelectorAll(".view-project-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.getAttribute("data-id"));
            openProjectModal(id);
        });
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
            list.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Sin comentarios aún.</p>`;
            return;
        }

        comments.forEach(c => {
            const item = document.createElement("div");
            item.className = "comment-item";
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.3rem;">
                    <strong style="color: var(--color-primary-blue);">${escapeHTML(c.author)}</strong>
                    <span style="color: var(--text-muted);">${c.date}</span>
                </div>
                <p style="font-size: 0.88rem;">${escapeHTML(c.body)}</p>
            `;
            list.appendChild(item);
        });
    };

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const author = document.getElementById("comment-author").value.trim();
        const body = document.getElementById("comment-body").value.trim();

        if (author && body) {
            const comments = getComments();
            comments.unshift({
                author,
                body,
                date: new Date().toLocaleDateString("es-CL")
            });
            localStorage.setItem("lm_comments", JSON.stringify(comments));
            document.getElementById("comment-author").value = "";
            document.getElementById("comment-body").value = "";
            render();
        }
    });

    render();
}

function escapeHTML(str) {
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
    };
    if (closeBtn) closeBtn.onclick = closeModal;
    if (overlay) overlay.onclick = closeModal;

    // Cerrar con Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal?.classList.contains("active")) {
            closeModal();
        }
    });

    // Activar lectura completa de especialidades
    document.querySelectorAll(".btn-read-more").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".specialty-card");
            if (!card) return;

            const titleEl = card.querySelector("h3");
            const textEl = card.querySelector("p");
            const tagsEl = card.querySelector(".tags");

            if (!titleEl || !textEl) return;

            const title = titleEl.innerText;
            const fullText = textEl.innerText;
            const tags = tagsEl ? tagsEl.innerHTML : "";

            const modalBody = document.getElementById("modal-body");
            if (!modalBody || !modal) return;

            modalBody.innerHTML = `
                <h2 style="margin-bottom: 1rem; color: var(--color-primary-blue);" id="modal-title">${title}</h2>
                <p style="font-size: 0.95rem; line-height: 1.7; color: var(--text-main); margin-bottom: 1.5rem;">${fullText}</p>
                <div class="tags">${tags}</div>
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
        <img src="${p.image}" alt="Imagen del proyecto ${p.title}" style="width:100%; border-radius:8px; height:180px; object-fit:cover; margin-bottom:1rem;">
        <span class="badge">${p.specialty}</span>
        <h2 style="margin: 0.5rem 0;" id="modal-title">${p.title}</h2>
        <p style="color: var(--color-primary-blue); font-weight: 600;"><i class="fa-solid fa-user" aria-hidden="true"></i> Autor: ${p.student}</p>
        ${p.year ? `<p style="color: var(--text-muted); font-size:0.85rem;"><i class="fa-regular fa-calendar" aria-hidden="true"></i> Año: ${p.year}</p>` : ""}
        <p style="color: var(--text-muted); margin: 0.8rem 0;">${p.description}</p>
        <div class="tags">${p.techs.map(t => `<span>${t}</span>`).join('')}</div>
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
    });
    btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================================================
   7. CHATBOT ASÍNCRONO - JARVIE
   Liceo Bicentenario Manuel Montt
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

    if (chatMessages && chatMessages.children.length === 0) {
        appendMessage("¡Hola! 👋 Soy **JARVIE**, asistente de soporte virtual. ¿Qué te gustaría saber hoy?", "bot");
    }
}

async function sendMessage() {
    const chatInput = document.getElementById("chat-input");
    if (!chatInput) return;
    const userText = chatInput.value.trim();
    if (!userText) return;

    // Mostrar mensaje del usuario
    appendMessage(userText, "user");
    chatInput.value = "";

    // Mensaje de carga provisional
    const loadingElem = appendMessage("Pensando...", "bot");

    try {
        const respuesta = await fetch("http://localhost:8000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ mensaje: userText })
        });

        const data = await respuesta.json();

        if (data.ok) {
            loadingElem.innerHTML = formatMessageText(data.respuesta);
        } else {
            loadingElem.innerHTML = formatMessageText("Error: " + (data.error || "No se obtuvo respuesta"));
        }
    } catch (error) {
        // En caso de fallo de red o servidor caído
        loadingElem.innerHTML = formatMessageText("Error al conectar con el servidor.");
    }

    const chatMessages = document.getElementById("chat-messages");
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
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
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
}
/* ==========================================================================
   8. ANIMACIONES FADE-IN (Intersection Observer)
   ========================================================================== */
function initFadeInAnimations() {
    const elements = document.querySelectorAll(
        ".stat-card, .specialty-card, .contact-card, .credits-box, .section-header, .search-box"
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
