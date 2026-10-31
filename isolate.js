function autoDetect() {
  const area = e => { const r = e.getBoundingClientRect(); return r.width * r.height; };
  const list = [...document.querySelectorAll("canvas, svg, iframe")]
    .filter(e => e.getBoundingClientRect().width > 100)
    .sort((a, b) => area(b) - area(a));
  let el = list[0] || null;
  if (!el) return null;
  while (el.parentElement && el.parentElement !== document.body) {
    const p = el.parentElement.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (p.width <= r.width * 1.6 && p.height <= r.height * 1.6) el = el.parentElement;
    else break;
  }
  return el;
}

async function isolate(selector, maxH, skinName) {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let el = null;
  for (let i = 0; i < 40 && !el; i++) {
    el = selector ? document.querySelector(selector) : autoDetect();
    if (!el) await sleep(250);
  }
  if (!el) return null;

  if (skinName === "casio-fx92" && el.matches(".classwiz-face-container")) {
    const face = el.querySelector(".face-img");
    const baseWidth = Number.parseFloat(face?.getAttribute("width")) || 367;
    const baseHeight = Number.parseFloat(face?.getAttribute("height")) || 635;
    const scale = Math.min(window.innerWidth / baseWidth, (maxH || window.innerHeight) / baseHeight);
    el.style.width = `${baseWidth}px`;
    el.style.height = `${baseHeight}px`;
    el.style.transform = `scale(${scale})`;
    el.style.transformOrigin = "top left";
  }

  if (skinName === "modern" && el.matches(".imgbox")) {
    const face = el.querySelector(".faceImg");
    try {
      const imageUrl = getComputedStyle(face).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
      if (imageUrl) {
        const response = await fetch(imageUrl);
        if (response.ok) {
          const svg = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
          const svgHeight = Number.parseFloat(svg.documentElement.getAttribute("height")) || 0;
          const sideBorders = [...svg.querySelectorAll('rect[fill="#4B81A4"]')]
            .filter(rect => Number(rect.getAttribute("width")) <= 12 &&
              Number(rect.getAttribute("height")) >= svgHeight * .9);

          if (sideBorders.length) {
            sideBorders.forEach(rect => rect.setAttribute("fill", "#D0D0D0"));
            const image = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
            face.style.backgroundImage = `url("${URL.createObjectURL(image)}")`;
          }
        }
      }
    } catch {}
  }

  const clip = maxH && skinName !== "casio-fx92"
    ? `.__calc { height: ${maxH}px !important; max-height: ${maxH}px !important; overflow: hidden !important; }`
    : "";
  const skin = skinName === "modern" ? `
    .__calc.imgbox {
      background: transparent !important;
      box-shadow: 0 8px 20px rgba(0, 0, 0, .14) !important;
    }
    .__calc.imgbox > .key {
      transition: background-color .12s ease, box-shadow .12s ease;
    }
    .__calc.imgbox > .key:hover {
      background: rgba(35, 125, 205, .14) !important;
      box-shadow: 0 0 0 1px rgba(30, 116, 190, .28) !important;
    }
    .__calc.imgbox > .key:active {
      background: rgba(25, 111, 190, .22) !important;
      box-shadow: inset 0 1px 3px rgba(15, 35, 55, .2) !important;
    }
  ` : "";
  const calculatorLayout = skinName === "mathplus" ? `
    .__calc#imgbox {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 430px !important;
      height: 742px !important;
      max-height: 742px !important;
      overflow: hidden !important;
    }
    .__calc#imgbox > #faceImg {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      object-fit: fill !important;
    }
    .__calc#imgbox > #buttons {
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
  ` : skinName === "numworks-scientifique" ? `
    .__calc.calculator-container {
      width: 100vw !important;
      height: 100vh !important;
      margin: 0 !important;
    }
    .__calc.calculator-container > img {
      width: 100% !important;
      height: 100% !important;
      object-fit: contain !important;
    }
    .__calc.calculator-container > .calculator {
      width: 100% !important;
      height: 100% !important;
    }
  ` : skinName === "ti83" ? `
    .__calc#my_calculator {
      width: 100vw !important;
      height: 100vh !important;
      margin: 0 !important;
    }
    .__calc#my_calculator > svg {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
    }
  ` : "";
  const style = document.createElement("style");
  style.textContent = `
    html, body { overflow: hidden !important; }
    body * { visibility: hidden !important; }
    .__calc, .__calc * { visibility: visible !important; }
    .__calc { position: fixed !important; top: 0 !important; left: 0 !important;
              margin: 0 !important; z-index: 2147483647 !important; }
    ${clip}
    ${skin}
    ${calculatorLayout}
  `;
  document.head.appendChild(style);
  el.classList.add("__calc");
  await sleep(300);

  const r = el.getBoundingClientRect();
  return { w: Math.ceil(r.width), h: Math.ceil(r.height) };
}