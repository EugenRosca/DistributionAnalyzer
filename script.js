import { WebR } from "https://webr.r-wasm.org/latest/webr.mjs";

const output = document.getElementById("output");

const webR = new WebR();

await webR.init();

output.textContent = "WebR loaded successfully.";

document.getElementById("runButton").onclick = async () => {

    const result = await webR.evalR("2 + 2");

    output.textContent = await result.toString();

};
