// sw-cache-config.js
// Enterprise SW Cache Config

self.CACHE_CONFIG = {

    VERSION:
        'v7-pages-1',

    STATIC_CACHE:
        'static-v7-pages-1',

    RUNTIME_CACHE:
        'runtime-v7-pages-1',

    STATIC_ASSETS: [

        './',
        './index.html',
        './styles.css',
        './app.js'
    ],

    NETWORK_FIRST: [

        '/api/',
        '/auth/'
    ],

    CACHE_FIRST: [

        '.png',
        '.jpg',
        '.svg',
        '.woff2'
    ]
};
