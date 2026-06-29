const fileInput = document.getElementById("csvFile");
const fileName = document.getElementById("fileName");

fileInput.addEventListener("change", () => {

    console.log(fileInput.files);

    if (fileInput.files.length === 0) {
        fileName.textContent = "No file selected";
        return;
    }

    fileName.textContent = fileInput.files[0].name;

    console.log("Filename:", fileInput.files[0].name);

});
