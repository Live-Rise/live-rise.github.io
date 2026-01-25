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









