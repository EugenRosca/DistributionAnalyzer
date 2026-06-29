alert("script.js loaded");

const fileInput = document.getElementById("csvFile");
const fileName = document.getElementById("fileName");

console.log(fileInput);

fileInput.addEventListener("change", function () {

    alert("change event");

    console.log(this.files);

    if (this.files.length > 0) {
        fileName.textContent = this.files[0].name;
    }

});
