import { WebR } from "https://webr.r-wasm.org/latest/webr.mjs";

const output = document.getElementById("output");

output.textContent = "Loading WebR...";

const webR = new WebR();

await webR.init();

output.textContent = "WebR loaded successfully.";

document.getElementById("runButton").addEventListener("click", async () => {

    const result = await webR.evalR("2 + 2");

    console.log(result);

    output.textContent = JSON.stringify(result);

});
