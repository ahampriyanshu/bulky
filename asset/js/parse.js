window.addEventListener("load", function () {
  document.getElementById("upload").addEventListener("click", function () {
    var fileUpload = document.getElementById("file");
    var regex = /.+\.(csv)$/i;
    if (regex.test(fileUpload.value.toLowerCase())) {
      if (typeof (FileReader) != "undefined") {
        var reader = new FileReader();
        reader.onload = function (e) {
          var rows = e.target.result.split("\n");
          for (var i = 1; i < rows.length; i++) {
            var cells = rows[i].split(",");
            generatePDF(cells[0], cells[1], cells[2], cells[3], cells[4], i);
          }
        }
        reader.readAsText(fileUpload.files[0]);
      } else {
        alert("This browser does not support HTML5.");
      }
    } else {
      alert("Please upload a valid CSV file.");
    }
  })
})