const CURRENT_VERSION = 1;
const PRECACHE = 'precache-v' + CURRENT_VERSION;

const PRECACHE_URLS = [
    '/SKUs/peoplebar-callout.png',
    '/SKUs/peoplebar-classic.png',
    '/SKUs/peoplebar-giant.png',

    '/images/Back.svg',
    '/images/Back_hover.svg',
    '/images/Back_press.svg',
    '/images/Close.png',
    '/images/Close_hover.png',
    '/images/Data.svg',
    '/images/Data_hover.svg',
    '/images/Data_press.svg',
    '/images/Setting.svg',
    '/images/Setting_hover.svg',
    '/images/Setting_press.svg',

    '/content/en-us/Office.css',
    '/content/en-us/PeopleGraph.css',

    '/shapes/box.png',
    '/shapes/chi-pao.png',
    '/shapes/clock.png',
    '/shapes/cloth.png',
    '/shapes/dance-people.png',
    '/shapes/diamond.png',
    '/shapes/dolphin.png',
    '/shapes/dress.png',
    '/shapes/heart.png',
    '/shapes/laptop.png',
    '/shapes/moneybag.png',
    '/shapes/muscle-people.png',
    '/shapes/shapes.json',
    '/shapes/smile-people.png',
    '/shapes/stand-people.png',
    '/shapes/star.png',
    '/shapes/watch.png',

    '/themes/callout-blackgrey.png',
    '/themes/callout-blackgreyred.png',
    '/themes/callout-blackyellow.png',
    '/themes/callout-blueblack.png',
    '/themes/callout-greengrey.png',
    '/themes/callout-roseblue.png',
    '/themes/callout-whitered.png',
    '/themes/classic-blackyellow.png',
    '/themes/classic-bluegrey.png',
    '/themes/classic-bluewhite.png',
    '/themes/classic-greengrey.png',
    '/themes/classic-redwhite.png',
    '/themes/classic-rosewhite.png',
    '/themes/classic-whitered.png',
    '/themes/giant-greengrey.png',
    '/themes/giant-redwhite.png',
    '/themes/giant-redwhiteblack.png',
    '/themes/giant-roseblue.png',
    '/themes/giant-rosewhite.png',
    '/themes/giant-whiterose.png',
    '/themes/giant-yellowblue.png',

    '/themes/callout-blackgrey.css',
    '/themes/callout-blackgreyred.css',
    '/themes/callout-blackyellow.css',
    '/themes/callout-blueblack.css',
    '/themes/callout-greengrey.css',
    '/themes/callout-roseblue.css',
    '/themes/callout-whitered.css',
    '/themes/classic-blackyellow.css',
    '/themes/classic-bluegrey.css',
    '/themes/classic-bluewhite.css',
    '/themes/classic-greengrey.css',
    '/themes/classic-redwhite.css',
    '/themes/classic-rosewhite.css',
    '/themes/classic-whitered.css',
    '/themes/giant-greengrey.css',
    '/themes/giant-redwhite.css',
    '/themes/giant-redwhiteblack.css',
    '/themes/giant-roseblue.css',
    '/themes/giant-rosewhite.css',
    '/themes/giant-whiterose.css',
    '/themes/giant-yellowblue.css',
    '/themes/themes.json',

    '/scripts/PeopleGraph.js',

    '/resources/en-us/resources.js',
    '/pages/PeopleGraph.html',
    '/layouts/layouts.json',

    'https://ajax.aspnetcdn.com/ajax/jQuery/jquery-2.1.0.min.js',
    'https://appsforoffice.microsoft.com/lib/1.1/hosted/ariatelemetry/aria-web-telemetry.js',
    'https://appsforoffice.microsoft.com/lib/1.1/hosted/en-us/office_strings.js',
    'https://appsforoffice.microsoft.com/lib/1.1/hosted/telemetry/oteljs_agave.js',
    'https://appsforoffice.microsoft.com/lib/1.1/hosted/excel-web-16.00.js',
    'https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js',
    'https://appsforoffice.microsoft.com/telemetry/lib/1.0/hosted/appstelemetry.js?v=5'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => PRECACHE != cacheName);
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method != 'POST') {
        event.respondWith(
            caches.match(event.request.url, { ignoreSearch: true })
        );
    }
});