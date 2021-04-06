window.addEventListener("load", function () {
  document.getElementById("upload").addEventListener("click", function () {
      var fileUpload = document.getElementById("file");
      var regex = /.+\.(xlsx|xls)$/i;
      if (regex.test(fileUpload.value.toLowerCase())) {
          try { 
            (typeof (FileReader) != "undefined") 
              var reader = new FileReader();
              if (reader.readAsBinaryString) {
                  reader.onload = function (e) {
                      ProcessExcel(e.target.result);
                  };
                  reader.readAsBinaryString(fileUpload.files[0]);
              } else {
                  reader.onload = function (e) {
                      var data = "";
                      var bytes = new Uint8Array(e.target.result);
                      for (var i = 0; i < bytes.byteLength; i++) {
                          data += String.fromCharCode(bytes[i]);
                      }
                      ProcessExcel(data);
                  };
                  reader.readAsArrayBuffer(fileUpload.files[0]);
              }
          }  catch(err) {
            console.log(err);
            openClose("alertBox", 'Browser noi Supported', 'Please update/ change your browser');
          }
      } else {
        openClose("alertBox", 'Error occured while uploading xlsx', 'Please upload a valid file or try renaming the file to a safe name');
      }

      function ProcessExcel(data) {
        try {
          var workbook = XLSX.read(data, {
              type: 'binary'
          });
          var firstSheet = workbook.SheetNames[0];
          var isOK = false;
          var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

          for (var i = 0; i < excelRows.length; i++) {
          isOK = generatePDF(excelRows[i].Participant, excelRows[i].Title,excelRows[i].Organisation, excelRows[i].Event, excelRows[i].Sign, excelRows[i].Name, excelRows[i].Designation, excelRows[i].Layout);
        }

        if (isOK) { openClose("successBox", "Certificates generated successfully from .xlsx", "Liked the project? Star the repo on GitHub , that would really motivate me .Collaborate to create some more awesome open-source projects"); }


      }
      catch(err) {
        console.log(err);
        openClose(alertBox, 'Error file parsing xlsx', 'Incorrect data enteries were found. Please take a look at the  sample.xlsx and fill up the data accordingly');
      }

      };
  })
})

