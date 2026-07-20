import handlebars from 'vite-plugin-handlebars';
import {defineConfig} from 'vite';
import {imagetools} from 'vite-imagetools';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readdirSync} from 'node:fs';

const rootDir = dirname(fileURLToPath(import.meta.url));

const htmlInputs = Object.fromEntries(
    readdirSync(rootDir)
        .filter((file) => file.endsWith('.html'))
        .map((file) => [file.replace(/\.html$/, ''), resolve(rootDir, file)]),
);
/*
const galleryFilenames = readdirSync(resolve(rootDir, 'src/assets/gallery'))
    .filter((file) => file.endsWith('.jpg'))
    .map((file) => {
        const basename = file.replaceAll(".jpg", "");
        return {
            orig: file,
            at4000: basename+"-4000.avif",
            at2560: basename+"-2560.avif",
            at1920: basename+"-1920.avif",
            at1280: basename+"-1280.avif",
            at640: basename+"-640.avif"
        }
    });
*/

const pageData = {
    '/index.html': {
        pageId: "home",
        pageName: 'Infos',
    },
    '/impressum.html': {
        pageId: "imprint",
        pageName: 'Impressum',
    },
    '/datenschutz.html': {
        pageId: "data-protection",
        pageName: 'Datenschutz',
    },
    '/gallery.html': {
        pageName: 'Galerie',
        pageId: "gallery",
        //imagesJson: JSON.stringify(galleryFilenames),
    }
};


const handlebarsConfig = {
    context: function (pagePath) {
        return pageData[pagePath];
    },
    partialDirectory: resolve(__dirname, '_partials'),
}



export default defineConfig({
    base: './',
    plugins: [
        handlebars(handlebarsConfig),
        imagetools({
            removeMetadata: true,
        }),
    ],
    build: {
        rollupOptions: {
            input: htmlInputs,
        },
    },
});



