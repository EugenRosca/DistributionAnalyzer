const fileInput = document.getElementById("csvFile");
const fileName = document.getElementById("fileName");

const tableHead = document.querySelector("#previewTable thead");
const tableBody = document.querySelector("#previewTable tbody");

fileInput.addEventListener("change", function () {

    if (this.files.length === 0) {
        fileName.textContent = "No file selected";
        return;
    }

    const file = this.files[0];

    fileName.textContent = file.name;

    const reader = new FileReader();

    reader.onload = function(e){

        const text = e.target.result;

        const rows = text.trim().split(/\r?\n/);

        tableHead.innerHTML = "";
        tableBody.innerHTML = "";

        rows.slice(0,11).forEach((row,index)=>{

            const cols = row.split(",");

            if(index===0){

                const tr=document.createElement("tr");

                cols.forEach(col=>{

                    const th=document.createElement("th");
                    th.textContent=col;
                    tr.appendChild(th);

                });

                tableHead.appendChild(tr);

            }else{

                const tr=document.createElement("tr");

                cols.forEach(col=>{

                    const td=document.createElement("td");
                    td.textContent=col;
                    tr.appendChild(td);

                });

                tableBody.appendChild(tr);

            }

        });

    };

    reader.readAsText(file);

});
