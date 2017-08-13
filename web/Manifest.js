import NetworkRequest from '../core/NetworkRequest';

const { create } = Object;

const rgbToHex = function(string) {
    const colors = string.match(/rgb\(([0-9, ]+)\)/);

    if (colors[1]) {
        return '#' + colors[1].split(',')
            .map(color => parseInt(color.trim()).toString(16)).join('');
    }

    return '#000';
}

const descriptionTag = document.querySelector('meta[name="description"]');
const themeTag = document.querySelector('meta[name="theme-color"]');

const Manifest = {
    theme: '#fff',
    background_color: (() => {
        const htmlBG = window.getComputedStyle(document.body.parentElement).backgroundColor;
        const bodyBG = window.getComputedStyle(document.body).backgroundColor;

        bodyBG = rgbToHex(htmlBG);

        if (bodyBG !== '#000') {
            return bodyBG;
        } else {
            return rgbToHex(htmlBG);
        }
    })(),

    description: descriptionTag ? descriptionTag.content : '',
    dir: document.body.parentElement.dir,
    display: 'browser',
    icons: [],
    lang: document.body.parentElement.lang,
    orientation: 'any',
    prefer_related_applications: false,
    related_applications: [],
    scope: '/',
    short_name: document.head.title,
    name: document.head.title,
    start_url: './',
    theme_color: themeTag ? themeTag.content : '#fff',

    get whenReady() {
        return manifestRequest;
    }
};

const manifestTag = document.querySelector('link[rel="manifest"]');
let manifestRequest = null;

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

manifestRequest  = Promise.resolve(Manifest);

export default Manifest;
