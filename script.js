alert("script.js loaded");

const fileInput = document.getElementById("csvFile");
const fileName = document.getElementById("fileName");

fileInput.addEventListener("change", function () {

    alert("File selected!");

    fileName.textContent = this.files[0].name;

});
