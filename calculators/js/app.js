(async () => {
    const grid = document.getElementById("grid");
    const modelCount = document.getElementById("modelCount");
    const all = await window.api.list();
    modelCount.textContent = `${all.length} ${all.length === 1 ? "MODÈLE" : "MODÈLES"}`;

    function createDeviceIcon(calculator) {
        const icon = document.createElement("div");
        icon.className = "calc-icon";
        icon.setAttribute("aria-hidden", "true");

        const device = document.createElement("div");
        device.className = "calc-device";

        const brand = document.createElement("span");
        brand.className = "device-brand";
        brand.textContent = calculator.brand || calculator.name;

        const screen = document.createElement("div");
        screen.className = "device-screen";
        const mark = document.createElement("span");
        mark.textContent = calculator.brand?.toLowerCase().includes("numworks") ? "nw" : "fx";
        screen.appendChild(mark);

        const keys = document.createElement("div");
        keys.className = "device-keys";
        for (let keyIndex = 0; keyIndex < 12; keyIndex++) {
            keys.appendChild(document.createElement("i"));
        }

        device.append(brand, screen, keys);
        icon.appendChild(device);
        return icon;
    }

    function render() {
        grid.innerHTML = "";
        const shown = all.filter(c =>
            (c.name + " " + (c.brand || "")).toLowerCase().includes(Search.query));

        if (!shown.length) {
            const e = document.createElement("div");
            e.className = "empty";
            e.textContent = "Aucune calculatrice trouvée";
            grid.appendChild(e);
            return;
        }

        shown.forEach(c => {
            const card = document.createElement("button");
            card.className = "card";
            card.style.setProperty("--card-accent", c.color || "#167a91");
            card.style.setProperty("--card-index", String(grid.children.length));
            card.setAttribute("aria-label", `Ouvrir ${c.name}`);

            const icon = createDeviceIcon(c);

            const meta = document.createElement("div");
            meta.className = "card-meta";
            const copy = document.createElement("div");
            copy.className = "card-copy";
            const name = document.createElement("div");
            name.className = "name";
            name.textContent = c.name;

            const brand = document.createElement("div");
            brand.className = "brand";
            brand.textContent = c.requiresNetwork
                ? `${c.brand || ""} · Internet requis`
                : c.brand || "";

            const openIndicator = document.createElement("span");
            openIndicator.className = "open-indicator";
            openIndicator.setAttribute("aria-hidden", "true");
            openIndicator.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>';

            copy.append(name, brand);
            meta.append(copy, openIndicator);
            card.append(icon, meta);
            card.onclick = () => window.api.openCalc(c);
            grid.appendChild(card);
        });
    }

    Search.onChange = render;
    render();
})();