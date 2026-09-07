import L from "leaflet";
import "leaflet/dist/leaflet.css";
import geoJsonUrl from "../assets/dach-states.geojson?url";

export default class InitiativesMap {
    constructor(rootSelector = ".initiatives-map") {
        this.root = document.querySelector(rootSelector);
        if (!this.root) {
            return;
        }

        this.mapElement = this.root.querySelector(".initiatives-map-canvas");
        this.locationsListElement = this.root.querySelector(".initiatives-map-locations");
        this.markerLayer = L.featureGroup();
    }

    async initialize() {
        if (!this.mapElement) {
            return;
        }

        const response = await fetch(geoJsonUrl);
        const geoData = await response.json();

        this.map = L.map(this.mapElement, {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            dragging: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            touchZoom: false,
            zoomSnap: 0,
        });

        // Leaflet vector layers need an initialized view before being added.
        this.map.setView([51.0, 10.0], 5);

        this.geoLayer = L.geoJSON(geoData, {
            style: {
                color: "#ccbdb0",
                weight: 1,
                fill: true,
                fillColor: "#e7dfd8",
                fillOpacity: 1,
            },
            interactive: false,
        }).addTo(this.map);
        this.markerLayer.addTo(this.map);

        this.observeMapResize();
        requestAnimationFrame(() => {
            this.fitToShapes();
            this.renderLocationMarkers();
            this.fitToShapes();
        });
    }

    renderLocationMarkers() {
        if (!this.map || !this.locationsListElement) {
            return;
        }

        const markerColor = this.getHeadlineColor();

        const locationElements = this.locationsListElement.querySelectorAll(".initiatives-map-location");
        for (const locationElement of locationElements) {
            const lat = Number.parseFloat(locationElement.dataset.lat || "");
            const lon = Number.parseFloat(locationElement.dataset.lon || "");
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
                continue;
            }

            const city = locationElement.dataset.city || locationElement.textContent?.trim() || "";
            const photographerNames = this.parseListData(locationElement.dataset.photographerName);
            const photographerUrls = this.parseListData(locationElement.dataset.photographerUrl);

            const marker = L.circleMarker([lat, lon], {
                radius: 6,
                color: "#ccbdb0",
                weight: 1,
                fillColor: markerColor,
                fillOpacity: 1,
            }).addTo(this.markerLayer);

            marker.bindPopup(
                this.buildTooltipContent({
                    city,
                    photographers: photographerNames.map((name, index) => ({
                        name,
                        url: photographerUrls[index] || "",
                    })),
                }),
                {
                    closeButton: false,
                    offset: [0, -6],
                },
            );

            marker.on("click", function () {
                this.openPopup();
            });
        }
    }

    buildTooltipContent(location) {
        const content = document.createElement("div");
        const city = document.createElement("strong");
        city.textContent = location.city;
        content.appendChild(city);

        if (location.photographers && location.photographers.length > 0) {
            const photographer = document.createElement("div");
            const isPlural = location.photographers.length > 1;
            photographer.append(isPlural ? "Fotografinnen: " : "Fotografin: ");

            location.photographers.forEach((entry, index) => {
                if (index > 0) {
                    photographer.append(", ");
                }

                if (entry.url) {
                    const link = document.createElement("a");
                    link.href = entry.url;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent = entry.name;
                    photographer.appendChild(link);
                } else {
                    photographer.append(entry.name);
                }
            });

            content.appendChild(photographer);
        }

        return content;
    }

    fitToShapes() {
        if (!this.map || !this.geoLayer) {
            return;
        }

        let bounds = this.geoLayer.getBounds();
        if (this.markerLayer && this.markerLayer.getLayers().length > 0) {
            bounds = bounds.extend(this.markerLayer.getBounds());
        }
        if (!bounds || !bounds.isValid()) {
            return;
        }

        this.map.invalidateSize();
        this.map.fitBounds(bounds, {
            padding: [8, 8],
            animate: false,
        });
    }

    parseListData(value) {
        if (!value) {
            return [];
        }

        return value
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean);
    }

    getHeadlineColor() {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue("--headline-color")
            .trim();

        return value || "#E8FB88";
    }


    observeMapResize() {
        if (typeof ResizeObserver === "undefined") {
            return;
        }

        this.resizeObserver = new ResizeObserver(() => {
            this.fitToShapes();
        });

        this.resizeObserver.observe(this.mapElement);
    }
}



