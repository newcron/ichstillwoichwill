import Gallery from "./gallery.js";
import InitiativesMap from "./initiatives-map.js";

document.addEventListener("DOMContentLoaded", function() {
    console.log("document is ready!")
    const pageId = document.body.getAttribute("data-page-id");
    switch (pageId) {
        case "home": new InitiativesMap("#initiative-map-area").initialize(); break;
        case "imprint": break;
        case "data-protection": break;
        case "gallery": new Gallery().initialize();
    }
    // code...
});