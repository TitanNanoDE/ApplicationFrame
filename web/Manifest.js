import NetworkRequest from '../core/NetworkRequest';

const { create } = Object;

const rgbToHex = function(string) {
    const colors = string.match(/rgb(?:a?)\(([0-9, ]+)\)/);

    if (colors[1]) {
        return `#${  colors[1].split(',')
            .map(color => parseInt(color.trim()).toString(16)).join('')}`;
    }

    return '#000';
};

const descriptionTag = document.querySelector('meta[name="description"]');
const themeTag = document.querySelector('meta[name="theme-color"]');

/**
 * Instance of the sites web app Manifest
 */
const Manifest = {

    /** @type {string} */
    background_color: (() => {
        const htmlBG = window.getComputedStyle(document.body.parentElement).backgroundColor;
        let bodyBG = window.getComputedStyle(document.body).backgroundColor;

        bodyBG = rgbToHex(bodyBG);

        if (bodyBG !== '#000') {
            return bodyBG;
        } else {
            return rgbToHex(htmlBG);
        }
    })(),

    /** @type {string} */
    description: descriptionTag ? descriptionTag.content : '',

    /** @type {string} */
    dir: document.body.parentElement.dir,

    /** @type {string} */
    display: 'browser',

    /** @type {string} */
    icons: [],

    /** @type {string} */
    lang: document.body.parentElement.lang,

    /** @type {string} */
    orientation: 'any',

    /** @type {string} */
    prefer_related_applications: false,

    /** @type {string[]} */
    related_applications: [],

    /** @type {string} */
    scope: '/',

    /** @type {string} */
    short_name: document.head.title,

    /** @type {string} */
    name: document.head.title,

    /** @type {string} */
    start_url: './',

    /** @type {string} */
    theme_color: themeTag ? themeTag.content : '#fff',

    /** @type {Promise.<Manifest>} */
    get whenReady() {
        return manifestRequest;
    }
};

const manifestTag = document.querySelector('link[rel="manifest"]');
let manifestRequest = Promise.resolve(Manifest);

if (manifestTag && manifestTag.href) {
    manifestRequest = create(NetworkRequest)
        .constructor(manifestTag.href).send()
        .then(response => {
            Object.assign(Manifest, response);

            return Manifest;
        }).catch(error => {
            console.log(`[${error.status}]: ${error.statusText}`);

            return Manifest;
        });
}

export default Manifest;
