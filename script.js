import { WebR } from "https://webr.r-wasm.org/latest/webr.mjs";

const output = document.getElementById("output");

output.textContent = "Loading WebR...";

const webR = new WebR();

await webR.init();

output.textContent = "WebR loaded successfully.";

document.getElementById("runButton").onclick = async () => {
    output.textContent = "Running R...";

    const result = await webR.evalR("2+2");
    const value = await result.toJs();

    output.textContent = "Result from R = " + value;
};
