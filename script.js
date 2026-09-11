const navItems = [
    { key: 'features', id: 'features' },
    { key: 'media', id: 'media' },
    { key: 'news', id: 'news' }
];

const heroBackgrounds = [
    'images/backgrounds/01.png',
    'images/backgrounds/02.png',
    'images/backgrounds/03.png',
    'images/backgrounds/04.png',
    'images/backgrounds/05.png',
    'images/backgrounds/06.png',
    'images/backgrounds/07.png'
];

/* Media data sourced from the Steam store page (appdetails API) */
const steamVideos = [
    {
        name: 'Ring a bell_PV',
        thumb: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257339569/6d88e5905ef4552f5506b6ba0d44b2972498cb87/movie_600x337.jpg?t=1779215555',
        hls: 'https://video.akamai.steamstatic.com/store_trailers/4142580/1699002038/d2acd2c3efcf6b0abc3916689e6d99932634506a/1779212724/hls_264_master.m3u8?t=1779215555'
    },
    {
        name: '真夏のコンフォート_PV',
        thumb: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257341885/be631e35799815acc0474574204a630c20a02707/movie_600x337.jpg?t=1779532242',
        hls: 'https://video.akamai.steamstatic.com/store_trailers/4142580/490141337/29f6c54e78e9f4c0b8fccd65ac669a30eee8c8ac/1779530942/hls_264_master.m3u8?t=1779532242'
    },
    {
        name: 'Drive Me Crazy_PV',
        thumb: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257299287/d91fcf0dcb1460e8d1c0e18feb390f23f8b6826b/movie_600x337.jpg?t=1779215556',
        hls: 'https://video.akamai.steamstatic.com/store_trailers/4142580/742211079/d9bf4f5fd5b5af12c138f1d56beee0a1ba0cb930/1772866247/hls_264_master.m3u8?t=1779215556'
    },
    {
        name: 'Live Rise!! Auto Living Mode Demo 4',
        thumb: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257300684/22735a78554324dc78dc4264aa895b0c90f6009e/movie_600x337.jpg?t=1779215558',
        hls: 'https://video.akamai.steamstatic.com/store_trailers/4142580/1169501107/2a2bb6ce4fa891ade25315c4ff89e98caa1f7b9b/1773079605/hls_264_master.m3u8?t=1779215558'
    },
    {
        name: 'Live Rise!! Auto Living Mode Demo 5',
        thumb: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257375356/d8f30b699bf69094ee2ff3238fe43c1612e5c940/movie_600x337.jpg?t=1783847485',
        hls: 'https://video.akamai.steamstatic.com/store_trailers/4142580/543125318/14c8f2bf947d2585b7072b89f718d87ef99ba7ed/1783846918/hls_264_master.m3u8?t=1783847485'
    },
    {
        name: 'Live Rise!! Auto Living Mode Demo 6',
        thumb: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257375362/74e1d698294de41e40333fbd2add4fd6858f13aa/movie_600x337.jpg?t=1783848141',
        hls: 'https://video.akamai.steamstatic.com/store_trailers/4142580/1991174168/570350f2c339420841118221653138050419e9c3/1783847800/hls_264_master.m3u8?t=1783848141'
    },
    {
        name: 'Live Rise!! Auto Living Mode Demo',
        thumb: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257278407/b0e580b24cfbc1b869b5e016d8cb38e83ffdc8b8/movie_600x337.jpg?t=1772866008',
        hls: 'https://video.akamai.steamstatic.com/store_trailers/4142580/711312412/c4d7a9189ea38ff62dbce2d71055a5a56ec31f7b/1770118091/hls_264_master.m3u8?t=1772866008'
    }
];

const supportedLanguages = Object.keys(translations);
const storageKey = 'liveRiseLanguage';
const heroSlideInterval = 6500;
const heroVideoTimeout = 120000;
const heroVideoInterval = 15000;

/* The hero leads with the PV trailers shuffled on each page load — gameplay
   and demo videos stay out of the rotation. Background images keep their
   fixed order and follow after. */
function shuffleVideos(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

const isPvVideo = (video) => video.name.endsWith('_PV');

let heroVideos = shuffleVideos(steamVideos.filter(isPvVideo)).slice(0, 3);

let heroSlideData = [
    ...heroVideos.map((video) => ({ type: 'video', ...video })),
    ...heroBackgrounds.map((src) => ({ type: 'image', src }))
];

/* Live media data (data/media-<lang>.json, refreshed daily by the update-news
   workflow). The baked lists above are the offline fallback — the store API
   sends no CORS headers, so the page can't fetch it directly. */
let liveMedia = null;
const getVideos = () => (liveMedia ? liveMedia.videos : steamVideos);
const getScreenshots = () => (liveMedia ? liveMedia.screenshots : steamScreenshots);

function rebuildMediaData() {
    heroVideos = shuffleVideos(getVideos().filter(isPvVideo)).slice(0, 3);
    heroSlideData = [
        ...heroVideos.map((video) => ({ type: 'video', ...video })),
        ...heroBackgrounds.map((src) => ({ type: 'image', src }))
    ];
    heroSlideIndex %= heroSlideData.length;
}

let heroMuted = true;

/* IconPark outline icons (https://iconpark.oceanengine.com), MIT, inlined.
   arrowUp / chevronLeft / chevronRight use the official upstream path data. */
const iconPark = (() => {
    const wrap = (inner) =>
        `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">` +
        inner
            .replaceAll('__S__', 'currentColor')
            .replaceAll('stroke-width="4"', 'stroke-width="3.5"') +
        `</svg>`;

    const stroke = (d) =>
        `<path d="${d}" stroke="__S__" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;

    return {
        music: wrap(
            '<path d="M30 34.5C30 32.567 31.567 31 33.5 31H41V34.4C41 36.3882 39.3882 38 37.4 38H33.5C31.567 38 30 36.433 30 34.5Z" fill="none" stroke="__S__" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M6 38.5C6 36.567 7.567 35 9.5 35H16V38.4C16 40.3882 14.3882 42 12.4 42H9.5C7.567 42 6 40.433 6 38.5Z" fill="none" stroke="__S__" stroke-width="4" stroke-linejoin="round"/>' +
            stroke('M16 18.044L41 12.125') +
            stroke('M16 38V10L41 4V33.6924')
        ),
        diamond: wrap(
            '<path fill-rule="evenodd" clip-rule="evenodd" d="M10.6364 5H37.3636L45 18.3L24 43L3 18.3L10.6364 5Z" stroke="__S__" stroke-width="4" stroke-linejoin="round"/>' +
            stroke('M10.6362 5L23.9999 43L37.3635 5') +
            stroke('M3 18.3H45') +
            stroke('M15.4092 18.3L24.0001 5L32.591 18.3')
        ),
        editing: wrap(
            stroke('M42 26V40C42 41.1046 41.1046 42 40 42H8C6.89543 42 6 41.1046 6 40V8C6 6.89543 6.89543 6 8 6L22 6') +
            '<path d="M14 26.7199V34H21.3172L42 13.3081L34.6951 6L14 26.7199Z" fill="none" stroke="__S__" stroke-width="4" stroke-linejoin="round"/>'
        ),
        share: wrap(
            '<path d="M35 16C37.7614 16 40 13.7614 40 11C40 8.23858 37.7614 6 35 6C32.2386 6 30 8.23858 30 11C30 13.7614 32.2386 16 35 16Z" fill="none" stroke="__S__" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M13 29C15.7614 29 18 26.7614 18 24C18 21.2386 15.7614 19 13 19C10.2386 19 8 21.2386 8 24C8 26.7614 10.2386 29 13 29Z" fill="none" stroke="__S__" stroke-width="4" stroke-linejoin="round"/>' +
            stroke('M30.0004 13.5745L17.3393 21.2454') +
            stroke('M17.3385 26.5639L30.6789 34.4469') +
            '<path d="M35 32C37.7614 32 40 34.2386 40 37C40 39.7614 37.7614 42 35 42C32.2386 42 30 39.7614 30 37C30 34.2386 32.2386 32 35 32Z" fill="none" stroke="__S__" stroke-width="4" stroke-linejoin="round"/>'
        ),
        earth: wrap(
            '<path fill-rule="evenodd" clip-rule="evenodd" d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="__S__" stroke-width="3.5" stroke-linejoin="round"/>' +
            stroke('M4 24H44') +
            '<path fill-rule="evenodd" clip-rule="evenodd" d="M24 44C28.4183 44 32 35.0457 32 24C32 12.9543 28.4183 4 24 4C19.5817 4 16 12.9543 16 24C16 35.0457 19.5817 44 24 44Z" stroke="__S__" stroke-width="3.5" stroke-linejoin="round"/>' +
            stroke('M9.85791 10.1421C13.4772 13.7614 18.4772 16 24 16C29.5229 16 34.5229 13.7614 38.1422 10.1421') +
            stroke('M38.1422 37.8579C34.5229 34.2386 29.5229 32 24 32C18.4772 32 13.4772 34.2386 9.85791 37.8579')
        ),
        playOne: wrap(
            '<path d="M15 24V11.8756L25.5 17.9378L36 24L25.5 30.0622L15 36.1244V24Z" fill="__S__" stroke="__S__" stroke-width="4" stroke-linejoin="round"/>'
        ),
        close: wrap(
            stroke('M8 8L40 40') +
            stroke('M8 40L40 8')
        ),
        chevronLeft: wrap(
            '<path d="M31 36L19 24L31 12" stroke="__S__" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
        ),
        chevronRight: wrap(
            '<path d="M19 12L31 24L19 36" stroke="__S__" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
        ),
        chevronDown: wrap(
            '<path d="M10 19l14 14 14-14" stroke="__S__" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
        ),
        doubleDown: wrap(
            '<path d="M10 13l14 14 14-14" stroke="__S__" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M10 21l14 14 14-14" stroke="__S__" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
        ),
        arrowUp: wrap(
            stroke('M24 6v36') +
            stroke('M12 18L24 6l12 12')
        ),
        volumeUp: wrap(
            '<path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.0108C4 15.9062 4.89543 15.0108 6 15.0108H11.7985C11.7985 15.0108 17 6 24 6Z" fill="none" stroke="__S__" stroke-width="4" stroke-linejoin="round"/>' +
            stroke('M32 15L32 15C32.6232 15.5565 33.1881 16.1797 33.6841 16.8588C35.1387 18.8504 36 21.3223 36 24C36 26.6545 35.1535 29.1067 33.7218 31.0893C33.2168 31.7885 32.6391 32.4293 32 33') +
            stroke('M34.2359 41.1857C40.0836 37.6953 44 31.305 44 24C44 16.8085 40.2043 10.5035 34.507 6.97906')
        ),
        volumeMute: wrap(
            '<mask id="iconpark-volume-mute" maskUnits="userSpaceOnUse" x="30" y="18" width="13" height="13" style="mask-type: alpha">' +
            '<rect x="30" y="18" width="13" height="13" fill="#fff"/>' +
            '</mask>' +
            '<g mask="url(#iconpark-volume-mute)">' +
            '<path d="M40.7348 20.2858L32.2495 28.7711" stroke="__S__" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M32.2496 20.2858L40.7349 28.7711" stroke="__S__" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</g>' +
            '<path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.0108C4 15.9062 4.89543 15.0108 6 15.0108H11.7985C11.7985 15.0108 17 6 24 6Z" fill="none" stroke="__S__" stroke-width="4" stroke-linejoin="round"/>'
        )
    };
})();

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
    const base = browserLang.split(/[-_]/)[0];

    // Exact tag match, then exact base-language match (e.g. pt-br -> pt-BR)
    let match = supportedLanguages.find((lang) => lang.toLowerCase() === browserLang)
        || supportedLanguages.find((lang) => lang.toLowerCase() === base);

    // Chinese variants: Hant/TW/HK/MO -> zh-TW, everything else -> zh-CN
    if (!match && browserLang.startsWith('zh')) {
        return /(^|-)(hant|tw|hk|mo)(-|$)/.test(browserLang) ? 'zh-TW' : 'zh-CN';
    }

    // Norwegian Bokmål/Nynorsk report nb/nn, not "no"
    if (!match && (base === 'nb' || base === 'nn')) {
        match = 'no';
    }

    // Latin-American Spanish variants -> es-419 (plain "es" falls through to es-ES)
    if (!match && base === 'es' && /^es-(419|ar|bo|cl|co|cr|do|ec|gt|hn|mx|ni|pa|pe|pr|py|sv|uy|us|ve)(-|$)/.test(browserLang)) {
        match = 'es-419';
    }

    // Base-language prefix (e.g. pt -> pt-BR, es -> es-ES, first key listed wins)
    if (!match) {
        match = supportedLanguages.find((lang) => lang.toLowerCase().startsWith(base));
    }
    return match || 'zh-CN';
}

let currentLanguage = getInitialLanguage();
let navOpen = false;
let heroSlideIndex = 0;
let heroSlideTimer = null;

function buildNavLinks(text) {
    return `
            <span class="nav-indicator" aria-hidden="true"></span>
            ${navItems
                .map(
                    (item) => `
                <a class="nav-link" href="#${item.id}">${text.nav[item.key]}</a>
            `
                )
                .join('')}
        `;
}

/* Native language names, as shown in the language dropdown */
const languageNames = {
    en: 'English',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    ja: '日本語',
    ko: '한국어',
    fr: 'Français',
    it: 'Italiano',
    de: 'Deutsch',
    'es-ES': 'Español (España)',
    da: 'Dansk',
    ru: 'Русский',
    tr: 'Türkçe',
    no: 'Norsk',
    pl: 'Polski',
    th: 'ไทย',
    sv: 'Svenska',
    fi: 'Suomi',
    nl: 'Nederlands',
    'pt-BR': 'Português (Brasil)',
    'pt-PT': 'Português (Portugal)',
    'es-419': 'Español (Latinoamérica)',
    uk: 'Українська',
    bg: 'Български',
    hu: 'Magyar',
    id: 'Bahasa Indonesia',
    el: 'Ελληνικά',
    cs: 'Čeština',
    ro: 'Română',
    vi: 'Tiếng Việt',
    ar: 'العربية'
};

function buildLanguageDropdown(text) {
    const options = supportedLanguages.map((lang, index) => {
        const label = languageNames[lang] || lang;
        const isActive = lang === currentLanguage;
        return `
            <button
                type="button"
                class="lang-option ${isActive ? 'active' : ''}"
                data-lang="${lang}"
                role="menuitem"
                style="--flyout-index:${index}"
            >
                ${label}
            </button>
        `;
    }).join('');

    return `
        <div class="lang-dropdown">
            <button type="button" class="lang-toggle nav-icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="${text.toolbar.language}" title="${text.toolbar.language}">
                ${iconPark.earth}
            </button>
            <div class="lang-menu" role="menu">
                <div class="lang-menu-scroll">${options}</div>
            </div>
        </div>
    `;
}

function buildNavToolbar(text) {
    return `
        <a class="btn-cta-pill" href="${text.hero.primaryHref}" target="_blank" rel="noopener">
            <span>${text.nav.cta}</span>
        </a>
    `;
}

function buildHeroChips(chips) {
    return chips.map((chip) => `<span class="chip">${chip}</span>`).join('');
}

function buildSectionHeading(section) {
    return `
        <div class="section-heading reveal">
            <h2>${section.heading}</h2>
            <span class="section-title-line" aria-hidden="true"></span>
            <p>${section.lead}</p>
        </div>
    `;
}

/* Media data sourced from the Steam store page (appdetails API) */
const steamScreenshots = [
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4142580/24b8d6ccdf0cf3824f1e349237472d81dc2ed0c1/ss_24b8d6ccdf0cf3824f1e349237472d81dc2ed0c1.1920x1080.jpg',
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4142580/d8f30b699bf69094ee2ff3238fe43c1612e5c940/ss_d8f30b699bf69094ee2ff3238fe43c1612e5c940.1920x1080.jpg',
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4142580/b1520bcdcd09f368b6c667baebcb84dedf93ea6a/ss_b1520bcdcd09f368b6c667baebcb84dedf93ea6a.1920x1080.jpg',
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4142580/a7789c56842ac71eb895f0d8712e955047c0b361/ss_a7789c56842ac71eb895f0d8712e955047c0b361.1920x1080.jpg',
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4142580/28cbe835ebdf2f346c69afbb840bb5e1ef4d1e65/ss_28cbe835ebdf2f346c69afbb840bb5e1ef4d1e65.1920x1080.jpg',
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4142580/542f7705937416f8fac58c5058424147719fcabe/ss_542f7705937416f8fac58c5058424147719fcabe.1920x1080.jpg',
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4142580/7f1861de3ae03e90a63524d3db7da9819c87854f/ss_7f1861de3ae03e90a63524d3db7da9819c87854f.1920x1080.jpg',
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4142580/afffc8ed6d9accd3240cfa201262c306643e2034/ss_afffc8ed6d9accd3240cfa201262c306643e2034.1920x1080.jpg'
];

const steamStoreUrl = 'https://store.steampowered.com/app/4142580/Live_Rise_4K_Fever/';
const steamNewsUrl = 'https://store.steampowered.com/news/app/4142580';

/* News data lives in data/news-<lang>.json (refreshed daily from the Steam API by
   the update-news workflow) so the page can fetch it same-origin: the Steam
   API itself sends no CORS headers. Card covers rotate through the Steam
   key visuals — the news feed API carries no images. */
const newsImages = steamScreenshots.map((src) => src.replace('.1920x1080.jpg', '.600x338.jpg'));
const newsCache = {};

const newsLocales = {
    en: 'en-US',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    ja: 'ja-JP',
    ko: 'ko-KR',
    fr: 'fr-FR',
    it: 'it-IT',
    de: 'de-DE',
    'es-ES': 'es-ES',
    da: 'da-DK',
    ru: 'ru-RU',
    tr: 'tr-TR',
    no: 'nb-NO',
    pl: 'pl-PL',
    th: 'th-TH',
    sv: 'sv-SE',
    fi: 'fi-FI',
    nl: 'nl-NL',
    'pt-BR': 'pt-BR',
    'pt-PT': 'pt-PT',
    'es-419': 'es-419',
    uk: 'uk-UA',
    bg: 'bg-BG',
    hu: 'hu-HU',
    id: 'id-ID',
    el: 'el-GR',
    cs: 'cs-CZ',
    ro: 'ro-RO',
    vi: 'vi-VN',
    ar: 'ar'
};

function escapeHtml(value) {
    return (value || '').replace(/[&<>"']/g, (ch) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
}

function buildNewsSection(text) {
    return `
        <section class="section section--news" id="news" aria-label="${text.sectionLabels.news}">
            <div class="section-inner">
                ${buildSectionHeading(text.news)}
                <div class="news-grid" id="news-grid"></div>
                <div class="media-foot">
                    <a class="btn-cta-pill" href="${steamNewsUrl}" target="_blank" rel="noopener">
                        <span>${text.news.viewAll}</span>
                    </a>
                </div>
            </div>
        </section>
    `;
}

function renderNewsCards(grid, items, text) {
    if (!items || !items.length) {
        grid.innerHTML = `
            <a class="news-card reveal in-view" href="${steamNewsUrl}" target="_blank" rel="noopener">
                <h3 class="news-title">${text.news.error}</h3>
            </a>
        `;
        return;
    }

    const locale = newsLocales[currentLanguage] || 'en-US';
    grid.innerHTML = items.map((item, index) => {
        const date = new Date(item.date * 1000).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
        const cover = item.image || newsImages[index % newsImages.length];
        return `
            <a class="news-card reveal" style="--reveal-delay:${(index * 0.15).toFixed(2)}s" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
                <img src="${escapeHtml(cover)}" alt="" loading="lazy" />
                <span class="news-date">${escapeHtml(date)}</span>
                <h3 class="news-title">${escapeHtml(item.title)}</h3>
            </a>
        `;
    }).join('');

    /* Cards render after the reveal observer was created — register them */
    grid.querySelectorAll('.reveal').forEach((el) => {
        if (window.__liveRiseRevealObserver) {
            window.__liveRiseRevealObserver.observe(el);
        } else {
            el.classList.add('in-view');
        }
    });
}

async function setupNews(root, text) {
    const grid = root.querySelector('#news-grid');
    if (!grid) {
        return;
    }

    let items = newsCache[currentLanguage];
    if (!items) {
        const files = currentLanguage === 'en' ? ['data/news-en.json'] : [`data/news-${currentLanguage}.json`, 'data/news-en.json'];
        for (const file of files) {
            try {
                const res = await fetch(file);
                if (!res.ok) {
                    continue;
                }
                const data = await res.json();
                items = (data.appnews ? data.appnews.newsitems : data.newsitems || []).slice(0, 6);
                newsCache[currentLanguage] = items;
                break;
            } catch (error) {
                /* try the next source */
            }
        }
    }
    renderNewsCards(grid, items, text);
}

const mediaCache = {};

function applyMedia(data) {
    mediaCache[currentLanguage] = data;
    const changed = JSON.stringify(data.videos) !== JSON.stringify(getVideos()) ||
        JSON.stringify(data.screenshots) !== JSON.stringify(getScreenshots());
    if (changed) {
        liveMedia = data;
        rebuildMediaData();
        renderApp();
    }
}

/* Pull the daily-refreshed media list; re-renders once only if it differs
   from what the page was rendered with. */
async function refreshMediaData() {
    if (mediaCache[currentLanguage]) {
        applyMedia(mediaCache[currentLanguage]);
        return;
    }
    const files = currentLanguage === 'en' ? ['data/media-en.json'] : [`data/media-${currentLanguage}.json`, 'data/media-en.json'];
    for (const file of files) {
        try {
            const res = await fetch(file);
            if (!res.ok) {
                continue;
            }
            const data = await res.json();
            if (!Array.isArray(data.videos) || !Array.isArray(data.screenshots)) {
                continue;
            }
            applyMedia(data);
            return;
        } catch (error) {
            /* try the fallback file */
        }
    }
}

function buildMediaCarousel(inner, aria) {
    return `
        <div class="media-carousel">
            ${inner}
            <div class="media-nav">
                <button type="button" class="media-arrow" data-dir="-1" aria-label="${aria} ‹">${iconPark.chevronLeft}</button>
                <div class="media-dots" role="tablist"></div>
                <button type="button" class="media-arrow" data-dir="1" aria-label="${aria} ›">${iconPark.chevronRight}</button>
            </div>
        </div>
    `;
}

function buildMedia(media) {
    const videoCards = getVideos().map((video, i) => `
        <button type="button" class="media-video-card reveal" data-video-index="${i}" aria-label="${media.videoAria}: ${video.name}" style="--card-img:url('${video.thumb}'); --reveal-delay:${(i * 0.15).toFixed(2)}s">
            <img src="${video.thumb}" alt="" loading="lazy" />
            <span class="media-play" aria-hidden="true">${iconPark.playOne}</span>
            <span class="media-video-name">${video.name}</span>
        </button>
    `).join('');

    const assetCards = getScreenshots().map((src, i) => `
        <button type="button" class="media-asset-card reveal" data-asset-index="${i}" aria-label="${media.thumbAria} ${i + 1}" style="--card-img:url('${src.replace('.1920x1080.jpg', '.600x338.jpg')}'); --reveal-delay:${(i * 0.15).toFixed(2)}s">
            <span class="media-badge">${media.visualBadge}</span>
            <img src="${src.replace('.1920x1080.jpg', '.600x338.jpg')}" alt="" loading="lazy" />
        </button>
    `).join('');

    return `
        ${buildMediaCarousel(`<div class="media-videos" data-carousel>${videoCards}</div>`, media.videoBadge)}
        ${buildMediaCarousel(`<div class="media-assets" data-carousel>${assetCards}</div>`, media.visualBadge)}
        <div class="media-foot reveal">
            <a class="btn-cta-pill" href="${steamStoreUrl}" target="_blank" rel="noopener">
                <span>${media.viewAll}</span>
            </a>
        </div>
    `;
}

function buildFeatureCards(features) {
    return features.items.map((item, index) => `
        <article class="feature-card reveal" style="--reveal-delay:${(index * 0.15).toFixed(2)}s">
            <span class="feature-card__icon">${iconPark[item.icon] || ''}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
        </article>
    `).join('');
}

const globalSocials = [
    { name: 'X', url: 'https://x.com/liverise4kfever', icon: 'x' },
    { name: 'YouTube', url: 'https://www.youtube.com/@live-rise', icon: 'youtube' },
    { name: 'Discord', url: 'https://discord.gg/3HjnvZD6kD', icon: 'discord' },
    { name: 'QQ', url: 'https://qm.qq.com/q/NBAMvm9Reg', icon: 'qq' },
    { name: 'Bilibili', url: 'https://space.bilibili.com/606737512', icon: 'bilibili' }
];

const socialIcons = {
    x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
    qq: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"/></svg>',
    bilibili: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.653-.373.906l-1.173 1.12zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773H5.333zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/></svg>'
};

function buildNavSocials() {
    return `
        <div class="nav-socials">
            ${globalSocials.map(social => `
                <a class="nav-social-link" href="${social.url}" target="_blank" rel="noopener" aria-label="${social.name}" title="${social.name}">
                    ${socialIcons[social.icon] || ''}
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
    refreshMediaData();
}

function stopHeroSlides() {
    if (heroSlideTimer) {
        clearTimeout(heroSlideTimer);
        heroSlideTimer = null;
    }
}

/* Videos advance themselves on 'ended'; images advance on a timer */
function scheduleNextSlide() {
    stopHeroSlides();
    const current = heroSlideData[heroSlideIndex];
    const activeVideo = document.querySelector('.hero-slide--video.active video[data-attached="1"]');
    const delay = current && current.type === 'video' && activeVideo ? heroVideoTimeout : heroSlideInterval;
    heroSlideTimer = setTimeout(() => {
        showHeroSlide(heroSlideIndex + 1);
    }, delay);
}

function attachHeroHls(video, src) {
    if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        window.__liveRiseHeroHls.push(hls);
        return true;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return true;
    }
    return false;
}

function syncHeroMedia() {
    document.querySelectorAll('.hero-slide--video').forEach((slide) => {
        const video = slide.querySelector('video');
        if (!video) {
            return;
        }
        const isActive = slide.classList.contains('active');
        if (isActive && !video.dataset.attached) {
            video.dataset.attached = '1';
            const data = heroSlideData[Number(slide.getAttribute('data-slide-index'))];
            video.muted = heroMuted;
            if (attachHeroHls(video, data.hls)) {
                video.addEventListener('ended', () => {
                    if (slide.classList.contains('active')) {
                        showHeroSlide(heroSlideIndex + 1);
                    }
                });
                video.play().catch(() => {});
            } else {
                video.dataset.attached = 'failed';
                scheduleNextSlide();
            }
        } else if (isActive) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    });
}

function applyHeroMuted() {
    document.querySelectorAll('.hero-slide--video video').forEach((video) => {
        video.muted = heroMuted;
    });
    const btn = document.querySelector('[data-volume]');
    if (btn) {
        btn.classList.toggle('playing', !heroMuted);
        btn.setAttribute('aria-pressed', String(!heroMuted));
    }
}

function showHeroSlide(index) {
    heroSlideIndex = (index + heroSlideData.length) % heroSlideData.length;
    document.querySelectorAll('.hero-slide').forEach((slide, i) => {
        slide.classList.toggle('active', i === heroSlideIndex);
    });
    document.querySelectorAll('.hero-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === heroSlideIndex);
        dot.setAttribute('aria-current', i === heroSlideIndex ? 'true' : 'false');
    });
    syncHeroMedia();
    scheduleNextSlide();
    heroAdaptiveInk.update();
}

/* iOS-style adaptive hero text: sample the average luminance of the active
   visual's central band (where the tagline and chips sit) and flip the hero
   ink between dark-on-light and light-on-dark, with a hysteresis band so
   borderline frames don't flicker. When pixels are unreadable (e.g. Safari's
   native HLS taints the canvas) the sampler stays silent and keeps the
   current color scheme. */
const heroAdaptiveInk = (() => {
    const SAMPLE_W = 32;
    const SAMPLE_H = 18;
    const LIGHT_INK_ABOVE = 0.62;
    const DARK_INK_BELOW = 0.47;
    const RECHECK_MS = 600;
    const posterCache = new Map();
    let canvas = null;
    let ctx = null;
    let tone = '';

    function ensureContext() {
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.width = SAMPLE_W;
            canvas.height = SAMPLE_H;
            ctx = canvas.getContext('2d', { willReadFrequently: true });
        }
        return Boolean(ctx);
    }

    function textZoneLuma(source) {
        const width = source.videoWidth || source.naturalWidth;
        const height = source.videoHeight || source.naturalHeight;
        const hero = document.querySelector('.hero');
        if (!width || !height || !hero || !ensureContext()) {
            return null;
        }
        /* Map the tagline+chips bounding box through the cover fit so the
           sample covers exactly the pixels the text sits on. */
        const scale = Math.max(hero.clientWidth / width, hero.clientHeight / height);
        const offsetX = (hero.clientWidth - width * scale) / 2;
        const offsetY = (hero.clientHeight - height * scale) / 2;
        let x1 = Infinity;
        let y1 = Infinity;
        let x2 = -Infinity;
        let y2 = -Infinity;
        document.querySelectorAll('.hero-tagline, .hero-chips').forEach((el) => {
            const box = el.getBoundingClientRect();
            x1 = Math.min(x1, box.left);
            y1 = Math.min(y1, box.top);
            x2 = Math.max(x2, box.right);
            y2 = Math.max(y2, box.bottom);
        });
        if (x2 <= x1 || y2 <= y1) {
            return null;
        }
        const sx = Math.max(0, (x1 - offsetX) / scale);
        const sy = Math.max(0, (y1 - offsetY) / scale);
        const sw = Math.min(width - sx, (x2 - x1) / scale);
        const sh = Math.min(height - sy, (y2 - y1) / scale);
        if (sw <= 0 || sh <= 0) {
            return null;
        }
        try {
            ctx.drawImage(source, sx, sy, sw, sh, 0, 0, SAMPLE_W, SAMPLE_H);
            const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
            let sum = 0;
            for (let i = 0; i < data.length; i += 4) {
                sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
            }
            return sum / (data.length / 4) / 255;
        } catch (error) {
            return null; /* cross-origin media taints the canvas */
        }
    }

    /* Poster fallback for sources whose frames can't be read directly. */
    function posterLuma(url) {
        let entry = posterCache.get(url);
        if (!entry) {
            const image = new Image();
            entry = { image, state: 'loading' };
            posterCache.set(url, entry);
            image.addEventListener('load', () => { entry.state = 'ready'; }, { once: true });
            image.addEventListener('error', () => { entry.state = 'failed'; }, { once: true });
            image.crossOrigin = 'anonymous';
            image.src = url;
            return null;
        }
        if (entry.state !== 'ready' || !entry.image.naturalWidth) {
            return null;
        }
        const luma = textZoneLuma(entry.image);
        if (luma === null) {
            entry.state = 'failed'; /* tainted: stop retrying this poster */
        }
        return luma;
    }

    function activeLuma() {
        const slide = heroSlideData[heroSlideIndex];
        if (!slide) {
            return null;
        }
        if (slide.type === 'image') {
            return posterLuma(slide.src);
        }
        const video = document.querySelector('.hero-slide--video.active video');
        if (!video || video.readyState < 2 || !video.videoWidth) {
            return null;
        }
        const luma = textZoneLuma(video);
        return luma === null ? posterLuma(slide.thumb) : luma;
    }

    function update() {
        if (document.hidden) {
            return;
        }
        const luma = activeLuma();
        if (luma === null) {
            return;
        }
        const next = luma >= LIGHT_INK_ABOVE ? 'hero-on-light'
            : luma <= DARK_INK_BELOW ? 'hero-on-dark'
                : tone;
        if (next === tone) {
            return;
        }
        tone = next;
        /* Body-level classes carry the ink beyond the hero: hero text and
           arrows flip with the active visual, and so do the paging buttons
           below the fold (media carousel arrows, back-to-top). */
        [document.body, document.querySelector('.hero')]
            .filter(Boolean)
            .forEach((el) => {
                el.classList.toggle('hero-on-light', tone === 'hero-on-light');
                el.classList.toggle('hero-on-dark', tone === 'hero-on-dark');
            });
    }

    setInterval(update, RECHECK_MS);
    return { update };
})();

/* Scroll-snap carousel: arrows page through, dots reflect scroll position */
function setupMediaCarousel(carousel) {
    const scroller = carousel.querySelector('[data-carousel]');
    const prevBtn = carousel.querySelector('.media-arrow[data-dir="-1"]');
    const nextBtn = carousel.querySelector('.media-arrow[data-dir="1"]');
    const dotsWrap = carousel.querySelector('.media-dots');

    if (!scroller) {
        return;
    }

    const update = () => {
        const pages = Math.max(1, Math.round(scroller.scrollWidth / scroller.clientWidth));
        const active = Math.min(pages - 1, Math.round(scroller.scrollLeft / scroller.clientWidth));

        if (dotsWrap.children.length !== pages) {
            dotsWrap.innerHTML = Array.from({ length: pages }, (_, i) =>
                `<span class="media-dot${i === active ? ' active' : ''}"></span>`
            ).join('');
        } else {
            [...dotsWrap.children].forEach((dot, i) => dot.classList.toggle('active', i === active));
        }

        const maxScroll = scroller.scrollWidth - scroller.clientWidth - 4;
        prevBtn.classList.toggle('is-disabled', scroller.scrollLeft <= 4);
        nextBtn.classList.toggle('is-disabled', scroller.scrollLeft >= maxScroll);

        /* Edge fade = affordance for "more cards beyond this edge": on while
           that side still hides content; CSS dissolves cards into the clip
           edge so a half-scrolled card never ends in a hard slice. */
        scroller.classList.toggle('edge-hidden-left', scroller.scrollLeft > 4);
        scroller.classList.toggle('edge-hidden-right', scroller.scrollLeft < maxScroll);

        /* In-card frost on top: the touching card blurs its own outer band
           while the scroller fade dissolves the cut line itself. */
        const scrollerRect = scroller.getBoundingClientRect();
        const edgeZone = 60;
        Array.from(scroller.children).forEach((card) => {
            const r = card.getBoundingClientRect();
            card.classList.toggle('edge-blur-left', scroller.scrollLeft > 4 && r.left <= scrollerRect.left + edgeZone && r.right > scrollerRect.left);
            card.classList.toggle('edge-blur-right', scroller.scrollLeft < maxScroll && r.right >= scrollerRect.right - edgeZone && r.left < scrollerRect.right);
        });
    };

    const pageBy = (dir) => {
        scroller.scrollBy({ left: dir * scroller.clientWidth * 0.92, behavior: 'smooth' });
    };

    prevBtn.addEventListener('click', () => pageBy(-1));
    nextBtn.addEventListener('click', () => pageBy(1));

    /* Cards beyond the current page stay unrevealed (clipped by the track).
       Once the user pages, drop their entrance stagger so paged-in cards
       show up right away instead of waiting on their index-based delay. */
    let revealDelaysCleared = false;
    scroller.addEventListener('scroll', () => {
        if (revealDelaysCleared) {
            return;
        }
        revealDelaysCleared = true;
        scroller.querySelectorAll('.reveal').forEach((card) => {
            card.style.setProperty('--reveal-delay', '0s');
        });
    }, { passive: true });

    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
}

/* Lightbox for videos (HLS via hls.js) and screenshots */
const lightboxState = { hls: null };

function closeLightbox() {
    const overlay = document.querySelector('.lightbox');
    if (!overlay) {
        return;
    }
    if (lightboxState.hls) {
        lightboxState.hls.destroy();
        lightboxState.hls = null;
    }
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 280);
    document.body.classList.remove('nav-locked');
}

function openVideoLightbox(video, label) {
    closeLightbox();
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <figure class="lightbox-body">
            <video class="lightbox-video" controls playsinline></video>
            <figcaption class="lightbox-caption">${label} · ${video.name}</figcaption>
            <button type="button" class="lightbox-close" aria-label="${translations[currentLanguage].media.closeAria}">${iconPark.close}</button>
        </figure>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('nav-locked');
    requestAnimationFrame(() => overlay.classList.add('open'));

    const videoEl = overlay.querySelector('video');
    if (window.Hls && window.Hls.isSupported()) {
        lightboxState.hls = new window.Hls();
        lightboxState.hls.loadSource(video.hls);
        lightboxState.hls.attachMedia(videoEl);
        lightboxState.hls.on(window.Hls.Events.MANIFEST_PARSED, () => videoEl.play().catch(() => {}));
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = video.hls;
        videoEl.play().catch(() => {});
    }

    overlay.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
}

function openImageLightbox(src, label) {
    closeLightbox();
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <figure class="lightbox-body">
            <img class="lightbox-img" src="${src}" alt="${label}" />
            <figcaption class="lightbox-caption">${label}</figcaption>
            <button type="button" class="lightbox-close" aria-label="${translations[currentLanguage].media.closeAria}">${iconPark.close}</button>
        </figure>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('nav-locked');
    requestAnimationFrame(() => overlay.classList.add('open'));

    overlay.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
}

function setupRevealAnimations(root) {
    const revealEls = root.querySelectorAll('.reveal');
    if (!revealEls.length) {
        return;
    }

    if (window.__liveRiseRevealObserver) {
        window.__liveRiseRevealObserver.disconnect();
        window.__liveRiseRevealObserver = undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || reducedMotion) {
        revealEls.forEach((el) => el.classList.add('in-view'));
        return;
    }

    /* Fire when the element's top edge crosses 85% of the viewport height,
       matching the benchmark motion's entry line */
    const makeObserver = (rootMargin) => {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin });
        return obs;
    };

    const observer = makeObserver('0px 0px -15% 0px');
    /* Page-end content (footer) sits inside the bottom 15% band at max
       scroll, where the entry line can never be crossed — reveal those as
       soon as they enter the viewport instead. */
    const earlyObserver = makeObserver('0px 0px');
    revealEls.forEach((el) => {
        (el.hasAttribute('data-reveal-early') ? earlyObserver : observer).observe(el);
    });
    window.__liveRiseRevealObserver = observer;
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

    document.documentElement.lang = currentLanguage;
    document.title = `${text.hero.title}丨${text.hero.subtitle}`;

    root.innerHTML = `
        <div class="page">
            <header class="top-nav">
                <a class="brand-mark" href="#hero" aria-label="${text.brandLabel}"></a>
                <div class="nav-container">
                    <nav class="nav-links" id="primary-nav">
                        ${buildNavLinks(text)}
                    </nav>
                    <div class="nav-actions">
                        ${buildNavSocials()}
                        <span class="nav-divider" aria-hidden="true"></span>
                        <button type="button" class="nav-icon-btn" data-volume aria-pressed="false" aria-label="${text.toolbar.sound}" title="${text.toolbar.sound}">
                            <span class="vol-icon vol-off">${iconPark.volumeMute}</span>
                            <span class="vol-icon vol-on">${iconPark.volumeUp}</span>
                        </button>
                        <div class="lang-switch">
                            ${buildLanguageDropdown(text)}
                        </div>
                        ${buildNavToolbar(text)}
                        <button type="button" class="nav-toggle" aria-label="${text.labels.toggleNav}" aria-controls="primary-nav" aria-expanded="false">
                            <span></span>
                        </button>
                    </div>
                </div>
            </header>
            <div class="nav-backdrop" aria-hidden="true"></div>

            <main>
                <section class="hero" id="hero" aria-label="${text.sectionLabels.hero}">
                    <div class="hero-slides" aria-hidden="true">
                        ${heroSlideData.map((slide, i) => slide.type === 'video'
                            ? `<div class="hero-slide hero-slide--video${i === heroSlideIndex ? ' active' : ''}" data-slide-index="${i}"><video muted playsinline preload="metadata" poster="${slide.thumb}"></video></div>`
                            : `<div class="hero-slide${i === heroSlideIndex ? ' active' : ''}" style="background-image:url('${slide.src}')"></div>`
                        ).join('')}
                    </div>

                    <div class="hero-overlay">
                        <h1 class="hero-title sr-only">${text.hero.title}</h1>
                        <div class="hero-id">
                            <div class="hero-logo">
                                <img src="images/Logo.png" alt="${text.hero.title}" />
                            </div>
                            <p class="hero-tagline">${text.hero.tagline}</p>
                        </div>
                        <div class="hero-chips">
                            ${buildHeroChips(text.hero.chips)}
                        </div>
                        <div class="hero-buttons">
                            <a class="btn btn-primary" href="${text.hero.primaryHref}" target="_blank" rel="noopener">${text.hero.primaryLabel}</a>
                            <button type="button" class="hero-scroll" data-scroll-to="features" aria-label="${text.hero.scrollAria}">
                                ${iconPark.doubleDown}
                            </button>
                        </div>
                    </div>

                    <div class="hero-pagination" role="tablist" aria-label="${text.media.visualLabel}">
                        ${heroSlideData.map((_, i) => `
                            <button
                                type="button"
                                class="hero-dot${i === heroSlideIndex ? ' active' : ''}"
                                data-hero-slide="${i}"
                                aria-label="${text.hero.slideAria} ${i + 1}"
                                aria-current="${i === heroSlideIndex}"
                            ></button>
                        `).join('')}
                    </div>

                    <button type="button" class="hero-arrow hero-arrow--prev" data-hero-dir="-1" aria-label="${text.hero.prevAria}">
                        ${iconPark.chevronLeft}
                    </button>
                    <button type="button" class="hero-arrow hero-arrow--next" data-hero-dir="1" aria-label="${text.hero.nextAria}">
                        ${iconPark.chevronRight}
                    </button>
                </section>

                <section class="section section--features" id="features" aria-label="${text.sectionLabels.features}">
                    <div class="section-inner">
                        ${buildSectionHeading(text.features)}
                        <div class="feature-grid">
                            ${buildFeatureCards(text.features)}
                        </div>
                    </div>
                </section>

                <section class="section section--media" id="media" aria-label="${text.sectionLabels.media}">
                    <div class="section-inner">
                        ${buildSectionHeading(text.media)}
                        ${buildMedia(text.media)}
                    </div>
                </section>

                ${buildNewsSection(text)}
            </main>

            <footer class="footer">
                <div class="footer-inner">
                    <div class="footer-brand reveal" data-reveal-early style="--reveal-delay:0s">
                        <img class="footer-logo" src="images/Logo.png" alt="${text.brandLabel}" />
                    </div>
                    <div class="footer-actions reveal" data-reveal-early style="--reveal-delay:0.15s">
                        ${buildNavSocials()}
                    </div>
                    <div class="footer-legal reveal" data-reveal-early style="--reveal-delay:0.3s">
                        <img class="footer-mark" src="images/SakusoraLogo.png" alt="SAKUSORA" />
                        <p class="footer-rights">${text.footer.rights}</p>
                    </div>
                </div>
            </footer>

            <button type="button" class="back-to-top" aria-label="${text.toolbar.backToTop}" title="${text.toolbar.backToTop}">
                ${iconPark.arrowUp}
            </button>
        </div>
    `;

    setNavOpen(navOpen);

    const topNav = root.querySelector('.top-nav');
    const heroSection = root.querySelector('.hero');

    cleanupHeroParallax();
    stopHeroSlides();
    if (window.__liveRiseHeroHls) {
        window.__liveRiseHeroHls.forEach((hls) => {
            try { hls.destroy(); } catch (error) { /* already destroyed */ }
        });
    }
    window.__liveRiseHeroHls = [];

    if (heroSection) {
        showHeroSlide(heroSlideIndex);

        root.querySelectorAll('.hero-dot').forEach((dot) => {
            dot.addEventListener('click', () => {
                showHeroSlide(Number(dot.getAttribute('data-hero-slide')));
            });
        });

        root.querySelectorAll('.hero-arrow').forEach((arrow) => {
            arrow.addEventListener('click', () => {
                const dir = Number(arrow.getAttribute('data-hero-dir'));
                showHeroSlide(heroSlideIndex + dir);
            });
        });

        const heroScrollBtn = root.querySelector('.hero-scroll');
        if (heroScrollBtn) {
            heroScrollBtn.addEventListener('click', () => {
                scrollToSection(heroScrollBtn.getAttribute('data-scroll-to'));
            });
        }

        const volumeBtn = root.querySelector('[data-volume]');
        if (volumeBtn) {
            volumeBtn.classList.toggle('playing', !heroMuted);
            volumeBtn.setAttribute('aria-pressed', String(!heroMuted));
            volumeBtn.addEventListener('click', () => {
                heroMuted = !heroMuted;
                applyHeroMuted();
            });
        }

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

    /* Back-to-top surfaces once scrolling crosses the hero's bottom edge —
       the point where the second screen takes over the viewport */
    const backToTopBtn = root.querySelector('.back-to-top');
    const updateBackToTop = () => {
        if (!backToTopBtn) {
            return;
        }
        const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
        backToTopBtn.classList.toggle('visible', window.scrollY >= heroHeight);
    };

    /* Scrollspy: highlight the nav link matching the section in view; the
       shared indicator slides between links on an eased, non-linear curve. */
    const navLinksWrap = root.querySelector('.nav-links');
    const navIndicator = navLinksWrap ? navLinksWrap.querySelector('.nav-indicator') : null;
    const spyLinks = navLinksWrap ? Array.from(navLinksWrap.querySelectorAll('.nav-link')) : [];
    const spySections = spyLinks
        .map((link) => document.getElementById((link.getAttribute('href') || '').slice(1)))
        .filter(Boolean);

    let activeNavId = null;

    const positionNavIndicator = (link, animate) => {
        if (!navIndicator || !link) {
            return;
        }
        if (!animate) {
            navIndicator.style.transition = 'none';
        }
        navIndicator.style.width = `${link.offsetWidth}px`;
        navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
        if (!animate) {
            void navIndicator.offsetWidth;
            navIndicator.style.transition = '';
        }
    };

    const setActiveNav = (id) => {
        if (id === activeNavId) {
            return;
        }
        /* First sync after a render must not animate from the default spot */
        const animate = activeNavId !== null;
        activeNavId = id;
        let activeLink = null;
        spyLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
                activeLink = link;
            }
        });
        if (navIndicator) {
            navIndicator.classList.toggle('visible', Boolean(activeLink));
            positionNavIndicator(activeLink, animate);
        }
    };

    const updateActiveNav = () => {
        if (!spySections.length) {
            return;
        }
        const navOffset = 120;
        let current = null;
        spySections.forEach((section) => {
            const top = section.getBoundingClientRect().top + window.scrollY;
            if (window.scrollY + navOffset >= top) {
                current = section.id;
            }
        });
        /* Pin the last section when the page bottom can't reach its top */
        if (!current && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
            current = spySections[spySections.length - 1].id;
        }
        setActiveNav(current);
    };

    /* Hover pulls the indicator to the pointer's target; leaving springs it
       back to the scrollspy-driven active link. */
    spyLinks.forEach((link) => {
        link.addEventListener('mouseenter', () => positionNavIndicator(link, true));
    });

    if (navLinksWrap) {
        navLinksWrap.addEventListener('mouseleave', () => {
            const activeLink = spyLinks.find((link) => link.classList.contains('active'));
            if (activeLink) {
                positionNavIndicator(activeLink, true);
            }
        });
    }

    /* Webfont load changes link metrics — re-sync the pinned indicator */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            const activeLink = spyLinks.find((link) => link.classList.contains('active'));
            if (activeLink) {
                positionNavIndicator(activeLink, false);
            }
        });
    }

    /* In-flight motion blur: while a nav-triggered jump scrolls the page,
       main/footer blur in proportion to the measured scroll velocity, then
       release as the scroll settles. Gated to programmatic scrolls so manual
       scrolling never blurs, and driven by actual speed so the blur ramps
       up mid-flight, peaks, and eases out on arrival. */
    const motionBlurTargets = [root.querySelector('main'), root.querySelector('.footer')].filter(Boolean);
    const motionBlurEnabled = motionBlurTargets.length > 0
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const MOTION_BLUR_MIN_V = 900;   /* px/s where the blur starts ramping */
    const MOTION_BLUR_FULL_V = 3800; /* px/s at full strength */
    const MOTION_BLUR_MAX = 10;
    let motionBlurLastY = window.scrollY;
    let motionBlurLastT = 0;
    let motionBlurVelocity = 0;
    let motionBlurLevel = 0;

    if (window.__liveRiseMotionBlurFrame) {
        cancelAnimationFrame(window.__liveRiseMotionBlurFrame);
        window.__liveRiseMotionBlurFrame = 0;
    }

    const applyMotionBlur = () => {
        const active = motionBlurLevel >= 0.05;
        motionBlurTargets.forEach((el) => {
            el.classList.toggle('is-motion-blur', active);
            el.style.setProperty('--scroll-blur', `${motionBlurLevel.toFixed(2)}px`);
        });
    };

    const motionBlurFrame = () => {
        window.__liveRiseMotionBlurFrame = 0;
        const now = performance.now();
        if (now - motionBlurLastT > 90) {
            /* Scroll events stopped (arrival or interruption) — bleed speed off */
            motionBlurVelocity *= 0.7;
        }
        const ramp = Math.min(Math.max((motionBlurVelocity - MOTION_BLUR_MIN_V) / (MOTION_BLUR_FULL_V - MOTION_BLUR_MIN_V), 0), 1);
        const target = now < window.__liveRiseAutoScrollUntil ? ramp * MOTION_BLUR_MAX : 0;
        motionBlurLevel += (target - motionBlurLevel) * (target > motionBlurLevel ? 0.42 : 0.16);
        if (target === 0 && motionBlurLevel < 0.05) {
            motionBlurLevel = 0;
            applyMotionBlur();
            return;
        }
        applyMotionBlur();
        window.__liveRiseMotionBlurFrame = requestAnimationFrame(motionBlurFrame);
    };

    const handleMotionBlurScroll = () => {
        if (!motionBlurEnabled) {
            return;
        }
        const now = performance.now();
        const y = window.scrollY;
        const dt = Math.max(now - (motionBlurLastT || now - 16), 1);
        const sample = Math.abs(y - motionBlurLastY) / dt * 1000;
        motionBlurLastY = y;
        motionBlurLastT = now;
        motionBlurVelocity = motionBlurVelocity * 0.6 + sample * 0.4;
        if (!window.__liveRiseMotionBlurFrame) {
            window.__liveRiseMotionBlurFrame = requestAnimationFrame(motionBlurFrame);
        }
    };

    const handleNavScroll = () => {
        updateNavAppearance();
        updateBackToTop();
        updateActiveNav();
        handleMotionBlurScroll();
    };

    if (window.__liveRiseNavHandler) {
        window.removeEventListener('scroll', window.__liveRiseNavHandler);
    }
    window.__liveRiseNavHandler = handleNavScroll;
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    const navToggle = root.querySelector('.nav-toggle');
    const navLinks = root.querySelectorAll('.nav-links a');

    const scrollToSection = (id) => {
        /* Arm the motion-blur gate: only this programmatic transit may blur */
        window.__liveRiseAutoScrollUntil = performance.now() + 2500;
        if (!id || id === 'hero') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const target = document.getElementById(id);
        if (!target) {
            return;
        }
        const top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    };

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

    root.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSection(link.getAttribute('href').slice(1));
            if (link.closest('.nav-links')) {
                setNavOpen(false);
            }
        });
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => scrollToSection('hero'));
    }

    const langToggle = root.querySelector('.lang-toggle');
    const langMenu = root.querySelector('.lang-menu');
    const langOptions = root.querySelectorAll('.lang-option');

    /* Single switch for the dropdown; the body class drives the page-blur
       curtain (body::before) that frosts everything but the nav and the menu */
    const setLangMenuOpen = (open) => {
        if (!langToggle || !langMenu) {
            return;
        }
        langToggle.setAttribute('aria-expanded', String(open));
        langMenu.classList.toggle('open', open);
        langToggle.classList.toggle('open', open);
        document.body.classList.toggle('lang-menu-open', open);
    };

    if (langToggle && langMenu) {
        // The nav's own backdrop-filter forms a backdrop root that stops any
        // descendant's backdrop blur from sampling the page behind it, so the
        // menu is portaled to <body> and pinned under the toggle (fixed).
        document.body.querySelectorAll(':scope > .lang-menu').forEach((stale) => stale.remove());
        document.body.appendChild(langMenu);
        document.body.classList.remove('lang-menu-open');
        const langMenuScroll = langMenu.querySelector('.lang-menu-scroll');
        // Enable each edge fade only while that side still hides scrolled-out
        // options; re-evaluated every frame while the menu is open
        const updateLangMenuFades = () => {
            if (!langMenuScroll) {
                return;
            }
            langMenuScroll.classList.toggle('fade-top', langMenuScroll.scrollTop > 2);
            langMenuScroll.classList.toggle('fade-bottom',
                langMenuScroll.scrollTop + langMenuScroll.clientHeight < langMenuScroll.scrollHeight - 2);
        };
        let langMenuSyncFrame = 0;
        const positionLangMenu = () => {
            const rect = langToggle.getBoundingClientRect();
            langMenu.style.top = Math.round(rect.bottom + 12) + 'px';
            langMenu.style.right = Math.round(window.innerWidth - rect.right) + 'px';
        };
        const syncLangMenuPosition = () => {
            if (!langMenu.classList.contains('open') || !langToggle.isConnected) {
                langMenuSyncFrame = 0;
                return;
            }
            positionLangMenu();
            updateLangMenuFades();
            langMenuSyncFrame = requestAnimationFrame(syncLangMenuPosition);
        };
        const openLangMenu = () => {
            positionLangMenu();
            // Compute the initial fades synchronously: background tabs get
            // their rAF deeply throttled, so the first loop frame may be
            // seconds away
            updateLangMenuFades();
            if (!langMenuSyncFrame) {
                langMenuSyncFrame = requestAnimationFrame(syncLangMenuPosition);
            }
        };
        // Scroll events refresh the edge fades immediately, independent of rAF
        if (langMenuScroll) {
            langMenuScroll.addEventListener('scroll', updateLangMenuFades, { passive: true });
        }

        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = langToggle.getAttribute('aria-expanded') === 'true';
            if (!expanded) {
                openLangMenu();
            }
            setLangMenuOpen(!expanded);
        });

        // Close dropdown when clicking outside (single global listener, re-registered per render)
        if (window.__liveRiseLangOutsideHandler) {
            document.removeEventListener('click', window.__liveRiseLangOutsideHandler);
        }
        const handleLangOutside = (e) => {
            if (!langToggle.isConnected) {
                document.removeEventListener('click', handleLangOutside);
                return;
            }
            if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
                setLangMenuOpen(false);
            }
        };
        window.__liveRiseLangOutsideHandler = handleLangOutside;
        document.addEventListener('click', handleLangOutside);
    }

    langOptions.forEach((button) => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            if (lang && lang !== currentLanguage) {
                setLanguage(lang);
            } else {
                // Just close if same language
                setLangMenuOpen(false);
            }
        });
    });

    root.querySelectorAll('.media-carousel').forEach(setupMediaCarousel);

    root.querySelectorAll('.media-video-card').forEach((card) => {
        card.addEventListener('click', () => {
            const video = getVideos()[Number(card.getAttribute('data-video-index'))];
            if (video) {
                openVideoLightbox(video, translations[currentLanguage].media.videoBadge);
            }
        });
    });

    root.querySelectorAll('.media-asset-card').forEach((card) => {
        card.addEventListener('click', () => {
            const index = Number(card.getAttribute('data-asset-index'));
            const src = getScreenshots()[index];
            if (src) {
                const media = translations[currentLanguage].media;
                openImageLightbox(src, `${media.visualLabel} ${String(index + 1).padStart(2, '0')}`);
            }
        });
    });

    setupRevealAnimations(root);
    setupNews(root, text);

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
        const activeSpyLink = root.querySelector('.nav-link.active');
        if (activeSpyLink) {
            positionNavIndicator(activeSpyLink, false);
        }
        if (typeof window.__liveRiseHeroParallaxResize === 'function') {
            window.__liveRiseHeroParallaxResize();
        }
    };
    window.addEventListener('resize', window.__liveRiseResizeHandler);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeLightbox();
        setNavOpen(false);
    }
});

renderApp();
refreshMediaData();

if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
}
