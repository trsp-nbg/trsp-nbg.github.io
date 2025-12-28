/* ----------------------------------------------------
   Dynamisches CSS
---------------------------------------------------- */
const style = document.createElement("style");
style.textContent = `
    img.nodrag {
        border-radius: 50%;
        -webkit-user-drag: none;
        user-drag: none;
        pointer-events: none;
        user-select: none;
    }
    .right-align {
        display: block;
        text-align: right;
    }
    req {
        display: block;
    }
`;
document.head.appendChild(style);


/* ----------------------------------------------------
   SVG-Unterstützung
---------------------------------------------------- */
function isSVG(str) {
    if (!str) return false;
    const s = str.trim();
    return s.startsWith("<svg") || s.endsWith(".svg");
}

function createSVGElement(svgString) {
    const s = svgString.trim();

    // Inline-SVG
    if (s.startsWith("<svg")) {
        const wrapper = document.createElement("span");
        wrapper.innerHTML = s;
        return wrapper.firstElementChild;
    }

    // SVG-Datei
    const img = document.createElement("img");
    img.src = s;
    img.style.width = "1em";
    img.style.height = "1em";
    img.style.verticalAlign = "middle";
    return img;
}


/* ----------------------------------------------------
   TikTok API Loader
---------------------------------------------------- */
const TikTokAPI = {
    cache: JSON.parse(localStorage.getItem("tiktok_cache") || "{}"),
    loading: {},
    queue: Promise.resolve(),

    async fetchUser(uniqueId) {
        const entry = this.cache[uniqueId];

        // Cache 0.5 Sekunden gültig
        if (entry) {
            const age = Date.now() - entry.timestamp;
            if (age < 500) {
                return entry.data;
            }
        }

        if (this.loading[uniqueId]) return this.loading[uniqueId];

        this.loading[uniqueId] = this.queue.then(async () => {
            await new Promise(r => setTimeout(r, 1100));

            const url =
                "https://www.tikwm.com/api/user/info/?unique_id=" +
                encodeURIComponent(uniqueId);

            try {
                const res = await fetch(url);
                const json = await res.json();

                if (json.code !== -1) {
                    this.cache[uniqueId] = {
                        data: json,
                        timestamp: Date.now()
                    };
                    localStorage.setItem(
                        "tiktok_cache",
                        JSON.stringify(this.cache)
                    );
                }

                return this.cache[uniqueId]?.data || json;

            } catch {
                return null;
            }
        });

        this.queue = this.loading[uniqueId];
        return this.loading[uniqueId];
    },

    extract(json, key) {
        if (!json) return null;

        // json kann sein:
        // 1. API response: {data:{user:{},stats:{}}}
        // 2. Cache entry: {data:{data:{user:{},stats:{}}}, timestamp:...}

        let api = null;

        // Fall 2: Cache-Objekt
        if (json.data?.data) {
            api = json.data.data;
        }
        // Fall 1: API-Objekt
        else if (json.data) {
            api = json.data;
        }
        // Fallback
        else {
            api = json;
        }

        if (!api) return null;

        const user = api.user || {};
        const stats = api.stats || {};

        const combined = { ...user, ...stats };

        return combined[key] ?? null;
    }
};


/* ----------------------------------------------------
   Zahlenformatierung
---------------------------------------------------- */
function shortenNumber(num) {
    if (num < 10000) return num.toString();
    return (num / 1000).toFixed(1).replace(".", ",") + "K";
}


/* ----------------------------------------------------
   Werte eintragen (Text + SVG + IMG)
---------------------------------------------------- */
function applyValue(element, value) {
    const addLeft = element.getAttribute("addleft") || "";
    const addRight = element.getAttribute("addright") || "";
    const shortened = element.getAttribute("shortened") === "1";
    const rightAlign = element.getAttribute("right") === "1";

    if (typeof value === "number" && shortened) {
        value = shortenNumber(value);
    }

    /* IMG */
    if (element.tagName === "IMG") {
        const size = element.getAttribute("size");
        if (size) {
            element.style.width = size;
            element.style.height = size;
        }
        element.src = value;
        element.classList.add("nodrag");
        return;
    }

    /* TEXT + SVG */
    element.textContent = "";

    // addLeft
    if (addLeft) {
        if (isSVG(addLeft)) {
            element.appendChild(createSVGElement(addLeft));
            element.appendChild(document.createTextNode(" "));
        } else {
            element.appendChild(document.createTextNode(addLeft));
        }
    }

    // Wert
    element.appendChild(document.createTextNode(value));

    // addRight
    if (addRight) {
        element.appendChild(document.createTextNode(" "));
        if (isSVG(addRight)) {
            element.appendChild(createSVGElement(addRight));
        } else {
            element.appendChild(document.createTextNode(addRight));
        }
    }

    if (rightAlign) {
        element.classList.add("right-align");
    }
}


/* ----------------------------------------------------
   Hauptfunktion
---------------------------------------------------- */
async function loadTikTokRequests() {
    const elements = [
        ...document.querySelectorAll(".request"),
        ...document.querySelectorAll("req")
    ];

    const groups = {};
    for (const el of elements) {
        const id = el.getAttribute("uniqueid");
        const key = el.getAttribute("data-key");

        if (!groups[id]) groups[id] = [];
        groups[id].push({ el, key });

        // LocalStorage IMMER anzeigen
        const entry = TikTokAPI.cache[id];
        if (entry) {
            const val = TikTokAPI.extract(entry.data, key);
            if (val !== null) applyValue(el, val);
        }
    }

    const uniqueIds = Object.keys(groups);

    for (const id of uniqueIds) {
        const json = await TikTokAPI.fetchUser(id);

        groups[id].forEach(({ el, key }) => {
            const value = TikTokAPI.extract(json, key);
            if (value !== null) applyValue(el, value);
        });
    }
}

document.addEventListener("DOMContentLoaded", loadTikTokRequests);