const navItems = [];

const heroBackgrounds = [
    'images/backgrounds/01.png',
    'images/backgrounds/02.png',
    'images/backgrounds/03.png',
    'images/backgrounds/04.png',
    'images/backgrounds/05.png',
    'images/backgrounds/06.png',
    'images/backgrounds/07.png'
];

const supportedLanguages = Object.keys(translations);
const storageKey = 'liveRiseLanguage';

function getInitialLanguage() {
    if (typeof window === 'undefined') {
        return 'zh-CN'; // Default for server-side or fallback
    }

    try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored && translations[stored]) {
            return stored;
        }
    } catch (error) {
        /* ignore storage issues */
    }

    const browserLang = (navigator.language || navigator.userLanguage || 'zh-CN').toLowerCase();

    // Check for specific matches first (e.g. zh-tw)
    const exactMatch = supportedLanguages.find(lang => browserLang === lang.toLowerCase());
    if (exactMatch) return exactMatch;

    // Check for prefix matches (e.g. zh matches zh-CN)
    // Preference: zh -> zh-CN
    if (browserLang.startsWith('zh')) {
        if (browserLang === 'zh-tw' || browserLang === 'zh-hk') return 'zh-TW';
        return 'zh-CN';
    }

    const prefixMatch = supportedLanguages.find((lang) => browserLang.startsWith(lang));
    return prefixMatch || 'zh-CN';
}

let currentLanguage = getInitialLanguage();
let navOpen = false;

function pickRandomHeroImage() {
    return heroBackgrounds[Math.floor(Math.random() * heroBackgrounds.length)];
}

function buildNavLinks(text) {
    return navItems
        .map(
            (item) => `
                <a class="nav-link" href="#${item.id}">${text.nav[item.key]}</a>
            `
        )
        .join('');
}

function buildLanguageDropdown(text) {
    let displayLabel = 'Language';
    switch (currentLanguage) {
        case 'en': displayLabel = 'English'; break;
        case 'zh-CN': displayLabel = '简体中文'; break;
        case 'zh-TW': displayLabel = '繁體中文'; break;
        case 'ja': displayLabel = '日本語'; break;
        case 'ko': displayLabel = '한국어'; break;
    }

    const options = supportedLanguages.map(lang => {
        let label = lang;
        switch (lang) {
            case 'en': label = 'English'; break;
            case 'zh-CN': label = '简体中文'; break;
            case 'zh-TW': label = '繁體中文'; break;
            case 'ja': label = '日本語'; break;
            case 'ko': label = '한국어'; break;
        }
        const isActive = lang === currentLanguage;
        return `
            <button 
                type="button" 
                class="lang-option ${isActive ? 'active' : ''}" 
                data-lang="${lang}"
                role="menuitem"
            >
                ${label}
            </button>
        `;
    }).join('');

    return `
        <div class="lang-dropdown">
            <button type="button" class="lang-toggle" aria-expanded="false" aria-haspopup="true">
                <span class="current-lang">${displayLabel}</span>
                <span class="chevron"></span>
            </button>
            <div class="lang-menu" role="menu">
                ${options}
            </div>
        </div>
    `;
}

function buildHeroChips(chips) {
    return chips.map((chip) => `<span class="chip">${chip}</span>`).join('');
}

const globalSocials = [
    { name: 'X', url: 'https://x.com/liverise4kfever', icon: 'x' },
    { name: 'YouTube', url: 'https://www.youtube.com/@live-rise', icon: 'youtube' },
    { name: 'Discord', url: 'https://discord.gg/3HjnvZD6kD', icon: 'discord' },
    { name: 'Bilibili', url: 'https://space.bilibili.com/606737512', icon: 'bilibili' }
];

function buildNavSocials() {
    const icons = {
        x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        youtube: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        discord: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
        bilibili: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.653-.373.906l-1.173 1.12zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773H5.333zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/></svg>'
    };

    return `
        <div class="nav-socials">
            ${globalSocials.map(social => `
                <a class="nav-social-link" href="${social.url}" target="_blank" rel="noopener" aria-label="${social.name}" title="${social.name}">
                    ${icons[social.icon] || ''}
                    <span class="social-name">${social.name}</span>
                </a>
            `).join('')}
        </div>
    `;
}
function setNavOpen(open) {
    navOpen = open;
    const root = document.getElementById('root');
    if (!root) {
        return;
    }

    const navLinks = root.querySelector('.nav-links');
    const navToggle = root.querySelector('.nav-toggle');
    const navBackdrop = root.querySelector('.nav-backdrop');

    if (navLinks) {
        navLinks.classList.toggle('open', navOpen);
        if (navOpen) {
            navLinks.scrollTop = 0;
        }
    }

    if (navToggle) {
        navToggle.classList.toggle('open', navOpen);
        navToggle.setAttribute('aria-expanded', String(navOpen));
    }

    if (navBackdrop) {
        navBackdrop.classList.toggle('active', navOpen);
    }

    document.body.classList.toggle('nav-locked', navOpen);
}

function setLanguage(lang) {
    if (!translations[lang]) {
        return;
    }

    currentLanguage = lang;

    try {
        window.localStorage.setItem(storageKey, lang);
    } catch (error) {
        /* ignore storage issues */
    }

    navOpen = false;
    renderApp();
}

function renderApp() {
    const root = document.getElementById('root');
    if (!root) {
        return;
    }

    const cleanupHeroParallax = () => {
        if (window.__liveRisePointerHandler) {
            window.removeEventListener('pointermove', window.__liveRisePointerHandler);
            window.__liveRisePointerHandler = undefined;
        }
        if (window.__liveRiseParallaxBlurHandler) {
            window.removeEventListener('blur', window.__liveRiseParallaxBlurHandler);
            window.__liveRiseParallaxBlurHandler = undefined;
        }
        if (window.__liveRiseParallaxMotionQuery && window.__liveRiseParallaxMotionHandler) {
            const mediaQuery = window.__liveRiseParallaxMotionQuery;
            const handler = window.__liveRiseParallaxMotionHandler;
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handler);
            } else if (mediaQuery.removeListener) {
                mediaQuery.removeListener(handler);
            }
            window.__liveRiseParallaxMotionQuery = undefined;
            window.__liveRiseParallaxMotionHandler = undefined;
        }
        if (window.__liveRiseHeroParallaxFrame) {
            cancelAnimationFrame(window.__liveRiseHeroParallaxFrame);
            window.__liveRiseHeroParallaxFrame = undefined;
        }
        window.__liveRiseHeroParallaxReset = undefined;
        window.__liveRiseHeroParallaxResize = undefined;
    };

    const text = translations[currentLanguage] || translations.en;
    const heroImage = pickRandomHeroImage();

    document.documentElement.lang = currentLanguage;
    document.title = 'Live Rise!!: 4K Fever';

    root.innerHTML = `
        <div class="page">
            <header class="top-nav">
                <a class="brand-mark" href="#hero" aria-label="${text.brandLabel}"></a>
                <div class="nav-container">
                    ${buildNavSocials()}
                    <nav class="nav-links" id="primary-nav">
                        ${buildNavLinks(text)}
                    </nav>
                    <div class="lang-switch">
                        ${buildLanguageDropdown(text)}
                    </div>
                    <button type="button" class="nav-toggle" aria-label="${text.labels.toggleNav}" aria-controls="primary-nav" aria-expanded="false">
                        <span></span>
                    </button>
                </div>
            </header>
            <div class="nav-backdrop" aria-hidden="true"></div>

            <main>
                <section class="hero" id="hero" aria-label="${text.sectionLabels.hero}">
                    <div class="hero-overlay">
                        <h1 class="hero-title sr-only">${text.hero.title}</h1>
                        <div class="hero-logo">
                            <img src="images/logo.png" alt="${text.hero.title}" />
                        </div>
                        <p class="hero-tagline">${text.hero.tagline}</p>
                        <div class="hero-buttons">
                            <a class="btn btn-primary" href="${text.hero.primaryHref}" target="_blank" rel="noopener">${text.hero.primaryLabel}</a>
                        </div>
                        <div class="hero-chips">
                            ${buildHeroChips(text.hero.chips)}
                        </div>
                    </div>
                </section>

            </main>

            <footer class="footer" aria-hidden="true"></footer>
        </div>
    `;

    setNavOpen(navOpen);

    const topNav = root.querySelector('.top-nav');
    const heroSection = root.querySelector('.hero');

    cleanupHeroParallax();

    if (heroSection) {
        heroSection.style.setProperty('--hero-image', `url('${heroImage}')`);

        const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let heroParallaxFrame = null;

        const applyHeroParallax = (overlayX, overlayY, bgX, bgY) => {
            heroSection.style.setProperty('--hero-parallax-x', `${overlayX.toFixed(2)}px`);
            heroSection.style.setProperty('--hero-parallax-y', `${overlayY.toFixed(2)}px`);
            heroSection.style.setProperty('--hero-bg-shift-x', `${bgX.toFixed(2)}px`);
            heroSection.style.setProperty('--hero-bg-shift-y', `${bgY.toFixed(2)}px`);
        };

        const queueHeroParallax = (overlayX, overlayY, bgX, bgY) => {
            if (heroParallaxFrame) {
                cancelAnimationFrame(heroParallaxFrame);
            }
            heroParallaxFrame = requestAnimationFrame(() => {
                applyHeroParallax(overlayX, overlayY, bgX, bgY);
            });
            window.__liveRiseHeroParallaxFrame = heroParallaxFrame;
        };

        const resetHeroParallax = () => {
            queueHeroParallax(0, 0, 0, 0);
        };

        const handleHeroPointerMove = (event) => {
            if (!heroSection) {
                return;
            }
            if (prefersReducedMotionQuery.matches || window.innerWidth <= 768) {
                resetHeroParallax();
                return;
            }
            if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
                return;
            }
            const { innerWidth, innerHeight } = window;
            const pointerX = typeof event.clientX === 'number' ? event.clientX : innerWidth / 2;
            const pointerY = typeof event.clientY === 'number' ? event.clientY : innerHeight / 2;
            const xRatio = pointerX / innerWidth - 0.5;
            const yRatio = pointerY / innerHeight - 0.5;
            const overlayX = xRatio * 18;
            const overlayY = yRatio * 14;
            const bgX = xRatio * -26;
            const bgY = yRatio * -18;
            queueHeroParallax(overlayX, overlayY, bgX, bgY);
        };

        const handleHeroPointerLeave = () => {
            resetHeroParallax();
        };

        const handleHeroPointerBlur = () => {
            resetHeroParallax();
        };

        const handleMotionPreferenceChange = () => {
            if (prefersReducedMotionQuery.matches) {
                resetHeroParallax();
            }
        };

        heroSection.addEventListener('pointerleave', handleHeroPointerLeave);
        heroSection.addEventListener('pointerup', handleHeroPointerLeave);
        heroSection.addEventListener('pointercancel', handleHeroPointerLeave);

        window.__liveRisePointerHandler = handleHeroPointerMove;
        window.__liveRiseParallaxBlurHandler = handleHeroPointerBlur;
        window.__liveRiseParallaxMotionHandler = handleMotionPreferenceChange;
        window.__liveRiseParallaxMotionQuery = prefersReducedMotionQuery;
        window.__liveRiseHeroParallaxReset = resetHeroParallax;
        window.__liveRiseHeroParallaxResize = () => {
            if (prefersReducedMotionQuery.matches || window.innerWidth <= 768) {
                resetHeroParallax();
            }
        };

        window.addEventListener('pointermove', handleHeroPointerMove, { passive: true });
        window.addEventListener('blur', handleHeroPointerBlur);
        if (prefersReducedMotionQuery.addEventListener) {
            prefersReducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
        } else if (prefersReducedMotionQuery.addListener) {
            prefersReducedMotionQuery.addListener(handleMotionPreferenceChange);
        }

        resetHeroParallax();
    }

    const updateNavAppearance = () => {
        if (!topNav) {
            return;
        }
        const heroHeight = heroSection ? heroSection.offsetHeight : 0;
        const threshold = heroHeight > 0 ? heroHeight * 0.5 : 220;
        const shouldFloat = window.scrollY > threshold;
        topNav.classList.toggle('top-nav--floating', shouldFloat);
    };

    if (window.__liveRiseNavHandler) {
        window.removeEventListener('scroll', window.__liveRiseNavHandler);
    }
    window.__liveRiseNavHandler = updateNavAppearance;
    window.addEventListener('scroll', updateNavAppearance, { passive: true });
    updateNavAppearance();

    const navToggle = root.querySelector('.nav-toggle');
    const navLinks = root.querySelectorAll('.nav-links a');

    const navBackdrop = root.querySelector('.nav-backdrop');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            setNavOpen(!navOpen);
        });
    }

    if (navBackdrop) {
        navBackdrop.addEventListener('click', () => {
            setNavOpen(false);
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            setNavOpen(false);
        });
    });

    const langToggle = root.querySelector('.lang-toggle');
    const langMenu = root.querySelector('.lang-menu');
    const langOptions = root.querySelectorAll('.lang-option');

    if (langToggle && langMenu) {
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = langToggle.getAttribute('aria-expanded') === 'true';
            langToggle.setAttribute('aria-expanded', !expanded);
            langMenu.classList.toggle('open', !expanded);
            langToggle.classList.toggle('open', !expanded);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
                langToggle.setAttribute('aria-expanded', 'false');
                langMenu.classList.remove('open');
                langToggle.classList.remove('open');
            }
        });
    }

    langOptions.forEach((button) => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            if (lang && lang !== currentLanguage) {
                setLanguage(lang);
            } else {
                // Just close if same language
                if (langToggle) {
                    langToggle.setAttribute('aria-expanded', 'false');
                    langMenu.classList.remove('open');
                    langToggle.classList.remove('open');
                }
            }
        });
    });

    if (window.__liveRiseResizeHandler) {
        window.removeEventListener('resize', window.__liveRiseResizeHandler);
    }
    window.__liveRiseResizeHandler = () => {
        if (window.innerWidth > 980 && navOpen) {
            setNavOpen(false);
        }
        if (typeof window.__liveRiseNavHandler === 'function') {
            window.__liveRiseNavHandler();
        }
        if (typeof window.__liveRiseHeroParallaxResize === 'function') {
            window.__liveRiseHeroParallaxResize();
        }
    };
    window.addEventListener('resize', window.__liveRiseResizeHandler);


}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setNavOpen(false);
    }
});

renderApp();









