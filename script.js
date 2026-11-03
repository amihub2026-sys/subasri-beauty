'use strict';
const $ = (selector) => document.querySelector(selector);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.classList.add('js-ready');
$('#year').textContent = new Date().getFullYear();
// Reveal the actual logo centrally, then fly the same image to its navbar position.
async function playIntro() {
  const intro = $('.intro');
  if (reducedMotion) { intro.remove(); return; }
  const logo = $('#intro-logo');
  try { await logo.decode(); } catch (_) { /* Continue with the available image. */ }
  await new Promise(resolve => setTimeout(resolve, 850));
  const source = logo.getBoundingClientRect();
  const target = $('#nav-logo').getBoundingClientRect();
  const flying = logo.cloneNode();
  flying.removeAttribute('id');
  flying.className = 'flying-logo';
  Object.assign(flying.style, {left: source.left+'px', top: source.top+'px', width:source.width+'px', height:source.height+'px'});
  document.body.appendChild(flying);
  logo.style.visibility = 'hidden';
  intro.classList.add('leaving');
  if (typeof flying.animate === 'function') {
    const animation = flying.animate([
      {transform:'translate(0,0) scale(1)', transformOrigin:'top left'},
      {transform:`translate(${target.left-source.left}px,${target.top-source.top}px) scale(${target.width/source.width})`, transformOrigin:'top left'}
    ], {duration:950, easing:'cubic-bezier(.65,0,.2,1)', fill:'forwards'});
    await animation.finished;
  }
  flying.remove(); intro.remove();
}
playIntro().catch(() => $('.intro')?.remove());
// Never leave a loading screen over the page if an unexpected error occurs.
setTimeout(() => $('.intro')?.remove(), 3500);

/* Mobile navigation — slides from right to left */
const menu = document.querySelector(".menu-toggle");
const nav = document.getElementById("navigation");
const mobileMenuQuery = window.matchMedia("(max-width: 820px)");

const navPosition = document.createComment("Navigation position");
nav.before(navPosition);

const menuBackdrop = document.createElement("div");
menuBackdrop.className = "menu-backdrop";
menuBackdrop.setAttribute("aria-hidden", "true");
document.body.appendChild(menuBackdrop);

const drawerClose = document.createElement("button");
drawerClose.type = "button";
drawerClose.className = "drawer-close";
drawerClose.setAttribute("aria-label", "Close navigation");
drawerClose.textContent = "×";
nav.appendChild(drawerClose);

nav.querySelectorAll("a").forEach((link, index) => {
    link.style.setProperty(
        "--menu-delay",
        `${100 + index * 65}ms`
    );
});

function closeMenu(returnFocus = false) {
    nav.classList.remove("open");
    menuBackdrop.classList.remove("open");
    document.body.classList.remove("drawer-open");

    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");

    nav.inert = mobileMenuQuery.matches;

    if (returnFocus) {
        menu.focus({ preventScroll: true });
    }
}

function openMenu() {
    if (!mobileMenuQuery.matches) return;

    nav.inert = false;
    nav.classList.add("open");
    menuBackdrop.classList.add("open");
    document.body.classList.add("drawer-open");

    menu.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-label", "Close navigation");

    drawerClose.focus({ preventScroll: true });
}

function positionNavigation() {
    closeMenu();

    if (mobileMenuQuery.matches) {
        // Outside the blurred header so the drawer fills the screen.
        document.body.appendChild(nav);
        nav.classList.add("mobile-drawer");
        nav.inert = true;
    } else {
        navPosition.after(nav);
        nav.classList.remove("mobile-drawer");
        nav.inert = false;
    }
}

menu.addEventListener("click", () => {
    if (nav.classList.contains("open")) {
        closeMenu(true);
    } else {
        openMenu();
    }
});

drawerClose.addEventListener("click", () => closeMenu(true));
menuBackdrop.addEventListener("click", () => closeMenu(true));

nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu(true));
});

document.addEventListener("keydown", (event) => {
    if (!nav.classList.contains("open")) return;

    if (event.key === "Escape") {
        closeMenu(true);
        return;
    }

    // Keep keyboard focus inside the open drawer.
    if (event.key === "Tab") {
        const controls = [
            ...nav.querySelectorAll("a[href], button")
        ];

        const first = controls[0];
        const last = controls[controls.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        }
    }
});

mobileMenuQuery.addEventListener("change", positionNavigation);
positionNavigation();


function updateHeader(){ $('#header').classList.toggle('scrolled', window.scrollY > 80); }
window.addEventListener('scroll',updateHeader,{passive:true});updateHeader();
if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('visible');reveal.unobserve(entry.target);}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
  const active = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) nav.querySelectorAll('a').forEach(a => a.classList.toggle('active',a.hash === '#'+entry.target.id)); }),{rootMargin:'-20% 0px -55% 0px'});
  document.querySelectorAll('main > section[id]').forEach(el => active.observe(el));
} else { document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')); }
document.querySelectorAll('[data-service]').forEach(a => a.addEventListener('click',() => {$('#service').value = a.dataset.service;}));
const lightbox = $('#lightbox');
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click',() => {
  $('#lightbox-image').src = button.dataset.image; $('#lightbox-image').alt = button.dataset.caption;
  $('#lightbox-caption').textContent = button.dataset.caption; lightbox.showModal(); document.body.classList.add('modal-open');
}));
$('#close-lightbox').addEventListener('click',() => lightbox.close());
lightbox.addEventListener('click',event => {if(event.target === lightbox){const r=lightbox.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) lightbox.close();}});
lightbox.addEventListener('close',() => document.body.classList.remove('modal-open'));
// This static website prepares a message only. No appointment or transmission is claimed.
$('#enquiry-form')?.addEventListener('submit',event => {
  event.preventDefault(); const data = new FormData(event.currentTarget);
  const message = `Hello Subasri Beauty Madurai,\nI would like to enquire about ${data.get('service')}.\nName: ${String(data.get('name')).trim()}\nPhone: ${String(data.get('phone')).trim()}${String(data.get('message')).trim() ? '\nMessage: '+String(data.get('message')).trim() : ''}`;
  $('#prepared-message').value=message; $('#enquiry-result').hidden=false;
  $('#form-status').textContent='Your enquiry is ready. Copy it and send it to the studio. It has not been sent.';
  $('#copy-enquiry').textContent='Copy Enquiry';
});
$('#copy-enquiry')?.addEventListener('click',async () => {
  const field=$('#prepared-message');
  try { await navigator.clipboard.writeText(field.value); $('#copy-enquiry').textContent='Copied ✓'; }
  catch (_) { field.focus();field.select();$('#form-status').textContent='Message selected. Use Ctrl+C (or Copy on mobile) to copy it.'; }
});
/* Gallery scroll reveal — corrected */
(() => {
    function setupGalleryReveal() {
        const items = [
            ...document.querySelectorAll("#gallery .gallery-item")
        ];

        if (!items.length) return;

        // Remove previous animation states.
        items.forEach((item) => {
            item.classList.remove(
                "reveal",
                "gallery-scroll-reveal",
                "is-revealed",
                "gallery-pending",
                "gallery-visible",
                "gallery-waiting",
                "gallery-entering"
            );
        });

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (
            reduceMotion ||
            !("IntersectionObserver" in window)
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            items.indexOf(a.target) -
                            items.indexOf(b.target)
                    );

                visible.forEach((entry, index) => {
                    const item = entry.target;

                    item.style.setProperty(
                        "--image-delay",
                        `${index * 150}ms`
                    );

                    item.classList.remove("gallery-waiting");
                    item.classList.add("gallery-entering");

                    observer.unobserve(item);

                    item.addEventListener(
                        "animationend",
                        () => {
                            item.classList.remove("gallery-entering");
                        },
                        { once: true }
                    );
                });
            },
            {
                threshold: 0,
                rootMargin: "0px 0px -20px 0px"
            }
        );

        items.forEach((item) => {
            item.classList.add("gallery-waiting");
            observer.observe(item);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            setupGalleryReveal,
            { once: true }
        );
    } else {
        setupGalleryReveal();
    }
})();
/* ==================================
   HOME — SCROLL BETWEEN FOUR CLIPS
================================== */

(() => {
    function setupBeautyStory() {
        const section = document.querySelector(
            "#home.beauty-story"
        );

        if (!section) return;

        const screen = section.querySelector(".story-screen");
        const videos = [...section.querySelectorAll(".story-video")];
        const stages = [...section.querySelectorAll(".story-stages span")];

        const copy = document.getElementById("story-copy");
        const step = document.getElementById("story-step");
        const title = document.getElementById("story-title");
        const description = document.getElementById(
            "story-description"
        );
        const progressFill = document.getElementById(
            "story-progress-fill"
        );

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const scenes = [
            {
                step: "01 / THE HAIR",
                title: "A fresh start.<br><em>A beautiful shape.</em>",
                description: "A little trim. A new feeling."
            },
            {
                step: "02 / THE SPA",
                title: "Slow down.<br><em>Find your glow.</em>",
                description: "A moment of calm. Care made for you."
            },
            {
                step: "03 / THE MAKEUP",
                title: "A little artistry.<br><em>Your signature look.</em>",
                description: "Thoughtful details for your special moments."
            },
            {
                step: "04 / THE REVEAL",
                title: "Beautifully styled.<br><em>Confidently you.</em>",
                description: "Your hair. Your glow. Your beautiful finish."
            }
        ];

        let activeIndex = -1;
        let framePending = false;
        let wasVisible = false;

        videos.forEach((video) => {
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
        });

        function playActiveVideo() {
            const video = videos[activeIndex];

            if (!video || reducedMotion || !video.paused) return;

            const playback = video.play();

            if (playback) {
                playback.catch(() => {
                    // Browser may require a user gesture.
                    // The visitor's next interaction retries playback.
                });
            }
        }

        function changeScene(index) {
            if (index === activeIndex) return;

            activeIndex = index;

            videos.forEach((video, videoIndex) => {
                const active = videoIndex === index;

                video.classList.toggle("is-active", active);

                if (!active) {
                    video.pause();
                }
            });

            stages.forEach((stage, stageIndex) => {
                const active = stageIndex === index;

                stage.classList.toggle("is-active", active);

                if (active) {
                    stage.setAttribute("aria-current", "step");
                } else {
                    stage.removeAttribute("aria-current");
                }
            });

            const scene = scenes[index];

            step.textContent = scene.step;
            title.innerHTML = scene.title;
            description.textContent = scene.description;

            if (!reducedMotion) {
                copy.classList.remove("copy-entering");
                void copy.offsetWidth;
                copy.classList.add("copy-entering");
            }
        }

        function updateStory() {
            framePending = false;

            const bounds = section.getBoundingClientRect();
            const screenHeight = screen.clientHeight;

            const visible =
                bounds.bottom > 0 &&
                bounds.top < window.innerHeight;

            const scrollDistance = Math.max(
                section.offsetHeight - screenHeight,
                1
            );

            const progress = Math.min(
                Math.max(-bounds.top / scrollDistance, 0),
                1
            );

            const index = reducedMotion
                ? 3
                : Math.min(
                    Math.floor(progress * scenes.length),
                    scenes.length - 1
                );

            const sceneChanged = index !== activeIndex;

            changeScene(index);

            progressFill.style.transform =
                `scaleX(${reducedMotion ? 1 : progress})`;

            if (!visible || document.hidden) {
                videos.forEach((video) => video.pause());
            } else if (sceneChanged || !wasVisible) {
                playActiveVideo();
            }

            wasVisible = visible;
        }

        function requestUpdate() {
            if (framePending) return;

            framePending = true;
            requestAnimationFrame(updateStory);
        }

        window.addEventListener(
            "scroll",
            requestUpdate,
            { passive: true }
        );

        window.addEventListener("resize", requestUpdate);

        document.addEventListener("visibilitychange", () => {
            wasVisible = false;
            requestUpdate();
        });

        function retryPlayback() {
            const bounds = section.getBoundingClientRect();

            if (
                bounds.bottom > 0 &&
                bounds.top < window.innerHeight &&
                !document.hidden
            ) {
                playActiveVideo();
            }
        }

        document.addEventListener(
            "pointerdown",
            retryPlayback,
            { passive: true }
        );

        document.addEventListener("keydown", retryPlayback);

        updateStory();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            setupBeautyStory,
            { once: true }
        );
    } else {
        setupBeautyStory();
    }
})();
/* ABOUT — reveal elements when they enter the screen */
(() => {
    function animateAbout() {
        const section = document.getElementById("about");

        if (!section) return;

        // Prevent the general reveal from hiding parent containers.
        section.querySelectorAll(".reveal").forEach((element) => {
            element.classList.remove("reveal");
            element.classList.add("visible");
        });

        if (
            !("IntersectionObserver" in window) ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        const elements = [
            ...section.querySelectorAll(`
                :scope > .about-photo,
                .about-copy > .eyebrow,
                .about-copy > h2,
                .about-copy > p:not(.eyebrow),
                .about-care-item,
                .about-values,
                .about-actions,
                .about-copy > .text-link,
                .about-journey-heading,
                .about-journey-step
            `)
        ];

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            elements.indexOf(a.target) -
                            elements.indexOf(b.target)
                    );

                visible.forEach((entry, index) => {
                    entry.target.style.setProperty(
                        "--about-delay",
                        `${Math.min(index, 5) * 100}ms`
                    );

                    entry.target.classList.add("about-in");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -20px 0px"
            }
        );

        section.classList.add("about-motion-ready");

        elements.forEach((element) => {
            element.classList.add("about-motion");
            observer.observe(element);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            animateAbout,
            { once: true }
        );
    } else {
        animateAbout();
    }
})();
/* SERVICES — build two seamless moving rows */
(() => {
    function setupMovingServices() {
        const firstTrack = document.getElementById(
            "service-track-one"
        );

        const secondTrack = document.getElementById(
            "service-track-two"
        );

        if (!firstTrack || !secondTrack) return;

        const services = [
            {
                title: "Makeup Artistry",
                category: "MAKEUP",
                image: "assets/s2.jpg",
                description:
                    "A personalised makeup look that complements your features and suits your occasion."
            },
            {
                title: "Skin Therapy",
                category: "SKIN",
                image: "assets/s1.jpg",
                description:
                    "Refreshing facials and thoughtful skin care for a relaxing beauty experience."
            },
            {
                title: "Bridal Makeup",
                category: "BRIDAL",
                image: "assets/s3.jpg",
                description:
                    "A bridal look shaped around your style, outfit and wedding-day vision."
            },
            {
                title: "Occasion Makeup",
                category: "OCCASION",
                image: "assets/g6.jpg",
                description:
                    "Soft glam or a statement finish for celebrations and special events."
            },
            {
                title: "Nail Art",
                category: "NAILS",
                image: "assets/g5.jpg",
                description:
                    "Express your style through beautiful colours, delicate details and creative nail designs."
            },
            {
                title: "Hair Therapy",
                category: "HAIR",
                image: "assets/g6.jpg",
                description:
                    "Give your hair some attention with care tailored to your hair needs."
            },
            {
                title: "Hair Styling",
                category: "STYLING",
                image: "assets/s4.jpg",
                description:
                    "Elegant updos, soft waves and occasion hairstyles to complete your look."
            },
            {
                title: "Body Spa",
                category: "BODY",
                image: "assets/s6.jpg",
                description:
                    "Take a peaceful pause with a relaxing body-care experience and time for yourself."
            },
            {
    title: "Saree Draping",
    category: "DRAPING",
    image: "assets/s5.jpg",
    description:
        "Neat pleats, graceful draping and a comfortable finish for weddings, celebrations and special occasions."
},
            {
                title: "Foot Care",
                category: "FOOT",
                image: "assets/s7.jpg",
                description:
                    "Give your feet some attention with a refreshing pedicure and careful grooming."
            }
        ];

        function createCard(service, index) {
            const card = document.createElement("article");
            card.className = "service-card";

            const image = document.createElement("img");
            image.src = service.image;
            image.alt = service.title;
            image.decoding = "async";

            const overlay = document.createElement("div");
            overlay.className = "service-overlay";

            const number = document.createElement("span");
            number.className = "service-number";
            number.textContent =
                `${String(index + 1).padStart(2, "0")} / ` +
                service.category;

            const heading = document.createElement("h3");
            heading.textContent = service.title;

            const description = document.createElement("p");
            description.textContent = service.description;

            const link = document.createElement("a");
            link.href = "#contact";
            link.dataset.service = service.title;
            link.textContent = "↗";
            link.setAttribute(
                "aria-label",
                `Enquire about ${service.title.toLowerCase()}`
            );

            overlay.append(
                number,
                heading,
                description,
                link
            );

            card.append(image, overlay);

            return card;
        }
function fillTrack(track, rowServices, startIndex) {
    const group = document.createElement("div");
    group.className = "service-group";

    function appendCards() {
        rowServices.forEach((service, index) => {
            group.appendChild(
                createCard(service, startIndex + index)
            );
        });
    }

    appendCards();
    track.replaceChildren(group);

    // Fill wide screens before creating the seamless duplicate.
    const viewportWidth = track.parentElement.clientWidth;

    while (
        group.getBoundingClientRect().width < viewportWidth &&
        rowServices.length > 0
    ) {
        appendCards();
    }

    const duplicate = group.cloneNode(true);

    duplicate.setAttribute("aria-hidden", "true");

    // Allow mouse hover on duplicated cards.
    // Keep duplicate links out of keyboard navigation.
    duplicate.querySelectorAll("a").forEach((link) => {
        link.tabIndex = -1;
    });

    track.appendChild(duplicate);
}

      fillTrack(firstTrack, services.slice(0, 5), 0);
fillTrack(secondTrack, services.slice(5), 5);

        // Include the extra services in the contact dropdown.
        const serviceSelect = document.getElementById("service");

        if (serviceSelect) {
            services.forEach((service) => {
                const exists = [...serviceSelect.options].some(
                    (option) => option.value === service.title
                );

                if (!exists) {
                    serviceSelect.add(
                        new Option(service.title, service.title)
                    );
                }
            });
        }

        // Delegated handler also supports dynamically created cards.
        document.querySelector(".service-marquees")
            .addEventListener("click", (event) => {
                const link = event.target.closest(
                    "a[data-service]"
                );

                if (link && serviceSelect) {
                    serviceSelect.value = link.dataset.service;
                }
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            setupMovingServices,
            { once: true }
        );
    } else {
        setupMovingServices();
    }
})();
/* Home text changes every 5 seconds — video stays unchanged */
(() => {
    function setupHomeText() {
        const container = document.getElementById("home-text");
        const step = document.getElementById("home-step");
        const title = document.getElementById("story-title");
        const description = document.getElementById(
            "home-description"
        );

        if (!container || !step || !title || !description) return;

        const slides = [
            {
                step: "01 / HAIR CARE",
                title: "Beautiful hair.<br><em>A fresh feeling.</em>",
                description:
                    "Haircuts, styling and personal hair care."
            },
            {
                step: "02 / FACE SPA",
                title: "Take a pause.<br><em>Find your glow.</em>",
                description:
                    "Relaxing facials and a little time for yourself."
            },
            {
                step: "03 / MAKEUP",
                title: "A little artistry.<br><em>Your signature look.</em>",
                description:
                    "Personalised makeup for your special moments."
            },
            {
                step: "04 / YOUR BEAUTY",
                title: "Beautifully styled.<br><em>Confidently you.</em>",
                description:
                    "Your hair. Your glow. Your beautiful finish."
            }
        ];

        let index = 0;

        setInterval(() => {
            if (document.hidden) return;

            index = (index + 1) % slides.length;

            const slide = slides[index];

            step.textContent = slide.step;
            title.innerHTML = slide.title;
            description.textContent = slide.description;

            container.classList.remove("home-text-enter");
            void container.offsetWidth;
            container.classList.add("home-text-enter");
        }, 10300);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            setupHomeText,
            { once: true }
        );
    } else {
        setupHomeText();
    }
})();
(() => {
    function setupBeautyComparisons() {
        document.querySelectorAll(
            "#before-after .beauty-comparison"
        ).forEach(comparison => {
            const slider = comparison.querySelector(".comparison-slider");

            if (!slider || comparison.dataset.sliderReady) return;
            comparison.dataset.sliderReady = "true";

            function updateComparison() {
                comparison.style.setProperty(
                    "--position",
                    `${slider.value}%`
                );

                slider.setAttribute(
                    "aria-valuetext",
                    `${slider.value} percent after`
                );
            }

            slider.addEventListener("input", updateComparison);
            updateComparison();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            setupBeautyComparisons,
            { once: true }
        );
    } else {
        setupBeautyComparisons();
    }
})();
(() => {
    function setupContactFloat() {
        const widget = document.getElementById("contact-float");
        if (!widget || widget.dataset.ready) return;

        widget.dataset.ready = "true";

        const toggle = widget.querySelector(".contact-toggle");
        const actions = widget.querySelector(".contact-actions");
        const mouseDevice = window.matchMedia("(hover: hover)");

        function setOpen(open) {
            widget.classList.toggle("is-open", open);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute(
                "aria-label",
                open ? "Close contact options" : "Open contact options"
            );
            actions.inert = !open;
        }

        toggle.addEventListener("click", () => {
            setOpen(!widget.classList.contains("is-open"));
        });

        widget.addEventListener("mouseenter", () => {
            if (mouseDevice.matches) setOpen(true);
        });

        widget.addEventListener("mouseleave", () => {
            if (
                mouseDevice.matches &&
                !widget.contains(document.activeElement)
            ) {
                setOpen(false);
            }
        });

        widget.addEventListener("focusout", event => {
            if (!widget.contains(event.relatedTarget)) setOpen(false);
        });

        document.addEventListener("click", event => {
            if (!widget.contains(event.target)) setOpen(false);
        });

        document.addEventListener("keydown", event => {
            if (
                event.key === "Escape" &&
                widget.classList.contains("is-open")
            ) {
                if (widget.contains(document.activeElement)) {
                    toggle.focus();
                }
                setOpen(false);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupContactFloat);
    } else {
        setupContactFloat();
    }
})();