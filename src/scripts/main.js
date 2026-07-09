import Gallery from "./gallery.js";

document.addEventListener("DOMContentLoaded", function() {
    console.log("document is ready!")
    const pageId = document.body.getAttribute("data-page-id");
    switch (pageId) {
        case "home": break;
        case "imprint": break;
        case "data-protection": break;
        case "gallery": new Gallery().initialize();
    }
    // code...
});