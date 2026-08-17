 /* ============================================================
   THE MUSEUM OF MY JAAN — JAVASCRIPT
   Vanilla JS. No dependencies. No build system.
   ============================================================ */

(function () {
    'use strict';

    /* ========================================================
       CONFIG: CHAPTERS
       The titles here drive the museum index navigation.
       Change the titles to match your chapters.
       ======================================================== */
    const CHAPTERS = [
        { id: 'chapter-1',      num: '01', title: 'The First Impression' },
        { id: 'chapter-2',      num: '02', title: "The Things You Don't Realize I Love" },
        { id: 'chapter-3',      num: '03', title: 'Why I Choose You' },
        { id: 'chapter-4',      num: '04', title: 'What I Need You to Know' },
        { id: 'chapter-5',      num: '05', title: 'The Things I Never Know How to Say' },
        { id: 'chapter-6',      num: '06', title: 'Why I Still Choose You' },
        { id: 'chapter-archive', num: 'A', title: 'The Archive' }
    ];

    /* ========================================================
       CONFIG: ARCHIVE PHOTOS
       This is where you add photos to the Archive gallery.
       Just list the filenames — they can be any aspect ratio,
       any resolution. The masonry layout handles it.

       To add photos:
       1. Drop your image files into:  images/archive/
       2. Add the filename to the array below.

       Example:
       "images/archive/our_photo_01.jpg"
       ======================================================== */
    const ARCHIVE_PHOTOS = [
        // "images/archive/photo_001.jpg",
        // "images/archive/photo_002.jpg",
        // "images/archive/photo_003.jpg",
        // ...add as many as you like. 50, 100, 200+ all work.
    ];


    /* ========================================================
       UTILITIES
       ======================================================== */
    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ========================================================
       INTRO / ENTRANCE
       ======================================================== */
    function initIntro() {
        const intro = $('#intro');
        const museum = $('#museum');
        const enterBtn = $('#enterBtn');

        if (!intro || !museum || !enterBtn) return;

        enterBtn.addEventListener('click', function () {
            intro.classList.add('is-hidden');
            museum.setAttribute('aria-hidden', 'false');
            // Slight delay so the fade overlaps
            setTimeout(function () {
                museum.classList.add('is-visible');
                document.body.style.overflow = '';
                // Scroll to top of first chapter
                window.scrollTo(0, 0);
                // Trigger initial reveals
                revealInViewport();
            }, 600);
        });

        // Lock scroll while intro is showing
        document.body.style.overflow = 'hidden';
    }


    /* ========================================================
       MUSEUM INDEX (side panel)
       ======================================================== */
    function initIndex() {
        const menuBtn = $('#menuBtn');
        const indexPanel = $('#indexPanel');
        const indexClose = $('#indexClose');
        const indexList = $('#indexList');
        const bottomIndexBtn = $('#bottomIndexBtn');

        if (!indexList) return;

        // Build the index list from CHAPTERS config
        CHAPTERS.forEach(function (ch) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + ch.id;
            a.dataset.target = ch.id;
            a.innerHTML = '<span class="index-panel__num">' + ch.num + '</span>' +
                          '<span class="index-panel__name">' + ch.title + '</span>';
            a.addEventListener('click', function (e) {
                e.preventDefault();
                closeIndex();
                scrollToChapter(ch.id);
            });
            li.appendChild(a);
            indexList.appendChild(li);
        });

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'index-backdrop';
        backdrop.id = 'indexBackdrop';
        document.body.appendChild(backdrop);

        function openIndex() {
            indexPanel.classList.add('is-open');
            backdrop.classList.add('is-open');
        }

        function closeIndex() {
            indexPanel.classList.remove('is-open');
            backdrop.classList.remove('is-open');
        }

        if (menuBtn) menuBtn.addEventListener('click', openIndex);
        if (indexClose) indexClose.addEventListener('click', closeIndex);
        if (bottomIndexBtn) bottomIndexBtn.addEventListener('click', openIndex);
        backdrop.addEventListener('click', closeIndex);
    }


    /* ========================================================
       CHAPTER NAVIGATION
       ======================================================== */
    function scrollToChapter(id) {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
    }

    function initContinueButtons() {
        $$('.continue-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const target = btn.dataset.goto;
                if (target) {
                    scrollToChapter('chapter-' + target);
                }
            });
        });
    }

    function initBottomNav() {
        const prevBtn = $('#prevBtn');
        const nextBtn = $('#nextBtn');

        if (!prevBtn || !nextBtn) return;

        prevBtn.addEventListener('click', function () {
            const current = getCurrentChapterIndex();
            if (current > 0) {
                scrollToChapter(CHAPTERS[current - 1].id);
            }
        });

        nextBtn.addEventListener('click', function () {
            const current = getCurrentChapterIndex();
            if (current < CHAPTERS.length - 1) {
                scrollToChapter(CHAPTERS[current + 1].id);
            }
        });
    }

    function getCurrentChapterIndex() {
        const scrollPos = window.scrollY + window.innerHeight / 3;
        let current = 0;
        CHAPTERS.forEach(function (ch, i) {
            const el = document.getElementById(ch.id);
            if (el) {
                const top = el.offsetTop;
                if (scrollPos >= top) {
                    current = i;
                }
            }
        });
        return current;
    }

    function updateActiveChapter() {
        const current = getCurrentChapterIndex();
        $$('#indexList a').forEach(function (a, i) {
            a.classList.toggle('is-current', i === current);
        });

        // Update bottom nav button states
        const prevBtn = $('#prevBtn');
        const nextBtn = $('#nextBtn');
        if (prevBtn) prevBtn.style.opacity = current === 0 ? '0.3' : '1';
        if (nextBtn) nextBtn.style.opacity = current === CHAPTERS.length - 1 ? '0.3' : '1';
    }


    /* ========================================================
       SCROLL REVEAL — IntersectionObserver
       ======================================================== */
    let revealObserver = null;

    function initReveal() {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            // Show everything immediately
            $$('.reveal').forEach(function (el) { el.classList.add('is-revealed'); });
            return;
        }

        revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -60px 0px'
        });

        $$('.reveal').forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    function revealInViewport() {
        // Manually trigger reveal for elements already in viewport
        // (used after intro fade)
        if (!revealObserver) {
            $$('.reveal').forEach(function (el) { el.classList.add('is-revealed'); });
            return;
        }
        $$('.reveal').forEach(function (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('is-revealed');
                revealObserver.unobserve(el);
            }
        });
    }


    /* ========================================================
       LIGHTBOX / FULLSCREEN PHOTO VIEWER
       ======================================================== */
    let lightbox = null;
    let lightboxImg = null;
    let lightboxCaption = null;
    let currentLightboxGallery = [];
    let currentLightboxIndex = 0;

    function initLightbox() {
        lightbox = $('#lightbox');
        lightboxImg = $('#lightboxImg');
        lightboxCaption = $('#lightboxCaption');
        const closeBtn = $('#lightboxClose');
        const prevBtn = $('#lightboxPrev');
        const nextBtn = $('#lightboxNext');

        if (!lightbox || !lightboxImg) return;

        // Collect all lightbox-enabled images on the page
        const allLightboxImages = $$('[data-lightbox]');

        allLightboxImages.forEach(function (img, index) {
            img.addEventListener('click', function () {
                // Build a gallery from all images in the same chapter/section
                const chapter = img.closest('.chapter');
                const gallery = chapter ? $$('[data-lightbox]', chapter) : [img];
                currentLightboxGallery = gallery.map(function (g) {
                    return {
                        src: g.src,
                        caption: g.dataset.caption || '',
                        alt: g.alt || ''
                    };
                });
                currentLightboxIndex = gallery.indexOf(img);
                openLightbox();
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); navLightbox(-1); });
        if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); navLightbox(1); });

        // Click on background closes
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard navigation (desktop)
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navLightbox(-1);
            if (e.key === 'ArrowRight') navLightbox(1);
        });

        // Touch swipe for iPad
        let touchStartX = 0;
        let touchEndX = 0;

        lightbox.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleLightboxSwipe();
        }, { passive: true });

        function handleLightboxSwipe() {
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) < 50) return; // ignore small swipes
            if (diff > 0) navLightbox(1);  // swipe left = next
            else navLightbox(-1);          // swipe right = prev
        }
    }

    function openLightbox() {
        if (!currentLightboxGallery.length) return;
        const item = currentLightboxGallery[currentLightboxIndex];
        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt;
        lightboxCaption.textContent = item.caption;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function navLightbox(dir) {
        currentLightboxIndex += dir;
        if (currentLightboxIndex < 0) currentLightboxIndex = currentLightboxGallery.length - 1;
        if (currentLightboxIndex >= currentLightboxGallery.length) currentLightboxIndex = 0;

        const item = currentLightboxGallery[currentLightboxIndex];
        // Fade transition
        lightboxImg.style.opacity = '0';
        setTimeout(function () {
            lightboxImg.src = item.src;
            lightboxImg.alt = item.alt;
            lightboxCaption.textContent = item.caption;
            lightboxImg.style.opacity = '1';
        }, 200);
    }


    /* ========================================================
       PHOTO ARCHIVE — builds the masonry gallery
       ======================================================== */
    function initArchive() {
        const gallery = $('#archiveGallery');
        if (!gallery) return;

        if (!ARCHIVE_PHOTOS.length) {
            // Show a gentle placeholder
            const note = document.createElement('p');
            note.className = 'archive-empty';
            note.style.cssText = 'text-align:center;color:var(--ivory-faint);font-family:var(--serif);font-style:italic;font-size:1.1rem;padding:var(--s6) var(--s4);';
            note.textContent = 'The archive awaits its first photograph.';
            gallery.appendChild(note);
            return;
        }

        ARCHIVE_PHOTOS.forEach(function (src, i) {
            const figure = document.createElement('figure');
            const img = document.createElement('img');

            img.src = src;
            img.alt = 'Archive photograph ' + (i + 1);
            img.loading = 'lazy';
            img.decoding = 'async';
            img.dataset.lightbox = '';
            img.dataset.caption = 'Archive &middot; ' + String(i + 1).padStart(3, '0');

            figure.appendChild(img);

            // Click to open in lightbox
            img.addEventListener('click', function () {
                currentLightboxGallery = ARCHIVE_PHOTOS.map(function (s, idx) {
                    return {
                        src: s,
                        caption: 'Archive &middot; ' + String(idx + 1).padStart(3, '0'),
                        alt: 'Archive photograph ' + (idx + 1)
                    };
                });
                currentLightboxIndex = i;
                openLightbox();
            });

            gallery.appendChild(figure);
        });

        // Observe archive figures for reveal
        if (!prefersReducedMotion && 'IntersectionObserver' in window) {
            const archiveObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry, idx) {
                    if (entry.isIntersecting) {
                        setTimeout(function () {
                            entry.target.classList.add('is-revealed');
                        }, idx * 60);
                        archiveObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

            $$('#archiveGallery figure').forEach(function (f) {
                archiveObserver.observe(f);
            });
        } else {
            $$('#archiveGallery figure').forEach(function (f) {
                f.classList.add('is-revealed');
            });
        }
    }


    /* ========================================================
       DUST PARTICLES — lightweight canvas
       Performance-conscious: few particles, simple drawing.
       ======================================================== */
    function initDust() {
        const canvas = $('#dustCanvas');
        if (!canvas) return;
        if (prefersReducedMotion) {
            canvas.style.display = 'none';
            return;
        }

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId = null;
        let isVisible = true;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Create a modest number of particles
        const PARTICLE_COUNT = window.innerWidth < 600 ? 20 : 35;

        function createParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 1.5 + 0.3,
                    vx: (Math.random() - 0.5) * 0.15,
                    vy: (Math.random() - 0.5) * 0.1 - 0.05,
                    opacity: Math.random() * 0.4 + 0.1,
                    pulse: Math.random() * Math.PI * 2
                });
            }
        }
        createParticles();

        function animate() {
            if (!isVisible) {
                animationId = null;
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(function (p) {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += 0.01;

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                const flicker = Math.sin(p.pulse) * 0.15 + 0.85;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(201, 169, 106, ' + (p.opacity * flicker) + ')';
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        }

        animate();

        // Pause when tab is not visible (battery saving)
        document.addEventListener('visibilitychange', function () {
            isVisible = !document.hidden;
            if (isVisible && !animationId) {
                animate();
            }
        });
    }


    /* ========================================================
       AMBIENT MUSIC — optional, user-initiated
       ======================================================== */
    function initMusic() {
        const musicBtn = $('#musicBtn');
        const audio = $('#ambientAudio');
        if (!musicBtn || !audio) return;

        let isPlaying = false;

        musicBtn.addEventListener('click', function () {
            if (isPlaying) {
                audio.pause();
                musicBtn.classList.remove('is-playing');
                musicBtn.setAttribute('aria-pressed', 'false');
                isPlaying = false;
            } else {
                // Only play if there's a source
                if (audio.querySelector('source')) {
                    audio.play().then(function () {
                        musicBtn.classList.add('is-playing');
                        musicBtn.setAttribute('aria-pressed', 'true');
                        isPlaying = true;
                    }).catch(function () {
                        // Autoplay restrictions — ignore silently
                    });
                }
            }
        });
    }


    /* ========================================================
       IMAGE ERROR HANDLING
       Shows an elegant fallback if a photo is missing.
       ======================================================== */
    function initImageFallbacks() {
        $$('img').forEach(function (img) {
            img.addEventListener('error', function () {
                if (img.dataset.fallback) return; // already handled
                img.dataset.fallback = '1';

                const figure = img.closest('figure');
                if (figure) {
                    const frame = img.closest('.exhibit__frame');
                    if (frame) {
                        frame.style.background = 'linear-gradient(135deg, #14110f 0%, #1a1612 100%)';
                        frame.style.minHeight = '200px';
                        frame.style.display = 'flex';
                        frame.style.alignItems = 'center';
                        frame.style.justifyContent = 'center';
                    }
                    img.style.display = 'none';

                    // Show a subtle placeholder
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = 'color:var(--ivory-faint);font-family:var(--serif);font-style:italic;font-size:0.9rem;text-align:center;padding:var(--s4);';
                    placeholder.textContent = 'awaiting photograph';
                    if (frame) frame.appendChild(placeholder);
                }
            });
        });
    }


    /* ========================================================
       SCROLL HANDLING — active chapter tracking
       ======================================================== */
    function initScrollTracking() {
        let ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    updateActiveChapter();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }


    /* ========================================================
       INIT
       ======================================================== */
    function init() {
        initIntro();
        initIndex();
        initContinueButtons();
        initBottomNav();
        initScrollTracking();
        initReveal();
        initLightbox();
        initArchive();
        initDust();
        initMusic();
        initImageFallbacks();
        updateActiveChapter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
