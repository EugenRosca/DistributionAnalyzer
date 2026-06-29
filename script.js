const fileInput = document.getElementById("csvFile");
const fileName = document.getElementById("fileName");

fileInput.addEventListener("change", function () {

    if (this.files.length === 0) {

        fileName.textContent = "No file selected";
        return;

    }

    fileName.textContent = this.files[0].name;

});
