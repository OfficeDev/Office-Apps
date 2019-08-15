// Version of the NECESSARY_FILES cache
// Update the version number whenever the precached files are changed on the server
const CURRENT_VERSION = 1;
// Name of the cache which stores files which the user needs to initially launch the Add-in
const NECESSARY_FILES = 'necessary-files-v' + CURRENT_VERSION;

// Name of cache which stores files the user fetches while using the Add-in
const RUNTIME = 'runtime';

// Maximum number of pages to precache when storing pages from links in an article
const MAX_PRECACHE_PAGES = 1000;

// Wikipedia API urls for that match what sandbox.js sends when asking for certain elements
const WAPI_URL = 'https://en.wikipedia.org/w/api.php?format=json&origin=*&';
const WAPI_SECTION_URL = WAPI_URL + 'action=parse&redirects&prop=text&mobileformat=html&page=';
const WAPI_TOC_URL = WAPI_URL + 'action=mobileview&redirects&prop=sections|normalizedtitle&sectionprop=toclevel|line|index&page=';
const WAPI_ALL_URL = WAPI_URL + 'action=mobileview&prop=text&sections=all&redirect=yes&page=';
const WAPI_REF_URL = WAPI_URL + 'action=mobileview&prop=text&redirect=yes&page=';
const WAPI_LINKS_URL = WAPI_URL + 'action=parse&redirects=1&page=';
const WAPI_PAGE_RX = /action=parse&redirects&prop=text&mobileformat=html&page=(.*)&section=0/;


// Stores the controllers to cancel precaching fetches
var currentPageCachings = [];

// Caches that this service worker will keep track of
const CURRENT_CACHES = [NECESSARY_FILES, RUNTIME];

const NECESSARY_FILES_URLS = [
    'wikipedia_dev.html',
    'styles/oxgagavestyle.css',
    'styles/app.css',
    'styles/oxgnavigationstyle.css',
    'scripts/en-us/strings.js',
    'scripts/wikipedia_dev.js',

    'images/logo.png',
    'images/searchmagnifyingglass_20x20x32.png',
    'images/options.png',
    'images/checkmarkchecked_16x.png',
    'images/insettodoc_24x.png',
    'images/closepaneglyphserverwhite_16x.png',
    'images/backbuttonhover_24x.png',
    'images/backbutton_24x.png',
    'images/expandtable.png',
    'images/optionswordfmtspaces_16x16x32.png',

    'sandbox/sandbox.html',
    'sandbox/scripts/en-us/sandbox_strings.js',
    'sandbox/scripts/sandbox.js',

    'https://ajax.aspnetcdn.com/ajax/jquery/jquery-1.9.1.js',
    'https://appsforoffice.microsoft.com/lib/1.0/hosted/en-us/office_strings.js',
    'https://appsforoffice.microsoft.com/lib/1.0/hosted/telemetry/oteljs_agave.js',
    'https://appsforoffice.microsoft.com/lib/1.0/hosted/excel-win32-16.01.js',
    'https://appsforoffice.microsoft.com/lib/1.0/hosted/office.js'
];

// Installs the service worker into the browser when registered
// Only executes when service worker isn't already installed
self.addEventListener('install', function (event) {
    console.log("Installing Service Worker...");
    event.waitUntil(
        caches.open(NECESSARY_FILES)
            .then(cache => {
                return cache.addAll(NECESSARY_FILES_URLS);
            }).then(self.skipWaiting())
    );
});

// Deletes caches from previous version of the service worker
function removeOldCaches(safeCache = "") {
    return caches.keys().then(cacheNames => {
        return cacheNames.filter(cacheName =>
            !CURRENT_CACHES.includes(cacheName) && safeCache != cacheName);
    }).then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
        }));
    });
}

// Removes caches that are not listed in CURRENT_CACHES then activates the service worker
// Called after install, regardless of whether install executes
self.addEventListener('activate', function (event) {
    return removeOldCaches().then(self.clients.claim());
});

function fetchAndCache(request, requestURL, pageName) {
    // Stops the background caching of the previous page to prevent slowdown
    if (pageName) {
        currentPageCachings.forEach(controller => controller.abort());
        currentPageCachings.length = 0;
    }

    // This prevent images from being cached and handles their fetches separately
    if (request.destination == "image") {
        return fetch(request).catch(response => {
            return response;
        });
    }

    return caches.open(RUNTIME).then(cache => {
        return fetch(request).then(response => {
            // Check if response is valid and put a copy of the response in the runtime cache.
            if (response.ok || response.type == "opaque") {
                return cache.put(requestURL, response.clone()).then(() => {
                    return response;
                });
            }
        }).catch(response => {
            // Sends a message to the add-in it cannot connect to the file and will start
            // pulling from cache
            return clients.matchAll().then(clientList => {
                clientList.forEach(client => {
                    client.postMessage("pullingFromCache");
                });

                return response;
            })
        });
    });
}

// Wrapper function for request originating from the service worker
function fetchAndCacheNoRequest(url) {
    return fetchAndCache(url, url, null);
}

// Caches all the links of pages within a specific cache
// and fetches them in a way that allows them to be canceled
// if higher priority pages need to be loaded
function precacheLinks(links, pageName) {
    let controller = new AbortController();
    let signal = controller.signal;

    // Adds the controller to a global list so it can be used later
    currentPageCachings.push(controller);

    // Caches all the pages with the same controller so they can all be
    // stopped at once
    return caches.open(pageName).then(async (cache) => {
        // Loops through the first 1000 the article names
        for (linkNum in links) {
            if (signal.aborted || linkNum > MAX_PRECACHE_PAGES) {
                break;
            }

            // Converts page names into the link needed for it's start page
            let requestURL = WAPI_SECTION_URL + links[linkNum]['*'].toLowerCase() + "&section=0";
            let response = await fetch(requestURL, { signal })
                .catch(error => Promise.reject(error));
            if (response.ok && !signal.aborted) {
                cache.put(requestURL, response);
            }
        }

        return Promise.resolve();
    });
}

// Checks if a url has been cached already
// Returns the cached version if it has or fetches for the file if not
function checkCache(url) {
    return caches.match(url).then(cachedResponse => {
        return cachedResponse || fetchAndCacheNoRequest(url);
    });
}

// Grabs the JSON info from a network response and returns an error
// if the network request failed
function responseToJSON(response) {
    return response.ok ? response.json() : Promise.reject("Cannot precache links on this page.");
}

// Retrieves a list of all the pages linked to within an article and
// sends them to be cached
function cacheOtherPageLinks(pageName) {
    return checkCache(WAPI_LINKS_URL + pageName + "&prop=links")
        .then(response => {
            return responseToJSON(response);
        })
        .then(linkList => {
            return precacheLinks(linkList.parse.links, pageName);
        })
}

// Caches all of the article's sections and the entire article as one page
function cachePageSections(pageName) {
    // Fetches and parses table of contents to make sure there is a network connection
    // and retrieve all the sections
    return checkCache(WAPI_TOC_URL + pageName)
        .then(response => {
            return responseToJSON(response);
        }).then(contents => {
            // Loops through all of the sections in the TOC to choose which sections to cache
            return Promise.all(contents.mobileview.sections.map(prop => {
                // The references section is referred to differently in sandbox.js, so the url
                // must match that style
                if (prop.line == "References") {
                    return checkCache(WAPI_REF_URL + pageName + "&sections=" + prop.id);
                }
                // Only caches the main sections as those are the only ones the user can navigate to
                if (prop.toclevel == 1) {
                    return checkCache(WAPI_SECTION_URL + pageName + "&section=" + prop.id);
                }
                return Promise.resolve();
            }));
        }).then(() => {
            // Caches the entire article as one page
            return checkCache(WAPI_ALL_URL + pageName);
        });
}

// Caches the article's other sections and the links within those pages
async function createFullPageCache(pageName) {
    // Creates a cache which matches the article's name
    // only if a cache for this page doesn't already exist
    return caches.has(pageName).then(hasCache => {
        if (!hasCache) {
            return cachePageSections(pageName).then(() => {
                return removeOldCaches(pageName);
            })
            .then(() => {
                return cacheOtherPageLinks(pageName);
            })
            .catch(error => console.log(error));
        }
    })
}

// Updates files in the cache after they have been return
async function updateCache(request, requestURL, pageName) {
    return fetchAndCache(request, requestURL, pageName)
        .then(response => {
            // Caches other links the user may go to if the update was successful
            // and an article's start page was loaded
            return pageName && response.ok ? createFullPageCache(pageName) : response;
        });
}

// Grabs all fetch requests from the add-in's domain and handles the requests for them
// Allows for all the functionality of the service worker after it's installed and activated
self.addEventListener('fetch', event => {
    // Service workers cannot handle post requests
    if (event.request.method != "POST") {
        // Normalizes urls to lowercase so cache recognizes files as the same regardless of casing
        let requestURL = event.request.url.toLowerCase();
        // Checks if the fetch was made to the Wikipedia API site
        let WAPICall = requestURL.startsWith(WAPI_URL);
        let pageMatch = (WAPICall ? requestURL.match(WAPI_PAGE_RX) : null);
        // Retrieves the title of the page if loading a new page from search
        let pageName = (pageMatch ? pageMatch[1] : null);

        // Chooses whether to return a cached response or a new response
        // Also queues background work for after the response is returned
        event.respondWith(
            caches.match(requestURL, {
                // Only Wikipeida API call's in this add-in use queries to specify the file
                ignoreSearch: !WAPICall
            }).then(cachedResponse => {
                if (cachedResponse) {
                    // Keeps the service worker running after the cached response is returned
                    // until the cache updates
                    event.waitUntil(updateCache(event.request, requestURL, pageName));
                    return cachedResponse;
                }

                // Caches other links the user may go to if loading an article's start page is being loaded
                if (pageName) {
                    event.waitUntil(createFullPageCache(pageName));
                }

                return fetchAndCache(event.request, requestURL, pageName);
            })
        );
    }
});
