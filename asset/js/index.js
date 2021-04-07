var zip = new JSZip();

function openClose(divId, header, msg) {
  var boxId = document.getElementById(divId);
  message = boxId.getElementsByClassName("message")[0];
  title = boxId.getElementsByClassName("modalTitle")[0];
  message.innerHTML = msg;
  title.innerHTML = header;
  if (boxId.style.display === "none") {
    boxId.style.display = "block";
  } else {
    boxId.style.display = "none";
  }
}

var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("description");
  var captionText = document.getElementById("caption");
  if (n > slides.length) {
    slideIndex = 1
  }
  if (n < 1) {
    slideIndex = slides.length
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" opacity-100", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " opacity-100";
  captionText.innerHTML = dots[slideIndex - 1].alt;
}

const file = document.querySelector('#file');
file.addEventListener('change', (e) => {
  const [file] = e.target.files;
  var { name: fileName, size } = file;
  const fileSize = (size / 1000).toFixed(2);
  if (fileName.length > 12) {
    fileName = fileName.slice(0, 12) + '...';
  }
  const fileNameAndSize = ` ${fileName}  ${fileSize} KB`;
  document.querySelector('.file-name').textContent = fileNameAndSize;
});

var navMenuDiv = document.getElementById("nav-content");
var navMenu = document.getElementById("nav-toggle");

document.onclick = check;
function check(e) {
  var target = (e && e.target);
  if (!checkParent(target, navMenuDiv)) {
    if (checkParent(target, navMenu)) {
      if (navMenuDiv.classList.contains("hidden")) {
        navMenuDiv.classList.remove("hidden");
      } else {
        navMenuDiv.classList.add("hidden");
      }
    } else {
      navMenuDiv.classList.add("hidden");
    }
  }
}
function checkParent(t, elm) {
  while (t.parentNode) {
    if (t == elm) {
      return true;
    }
    t = t.parentNode;
  }
  return false;
}

const generatePDF = async (participant, title, organisation, event, sign, name, designation, layout, serial) => {

  try {

    if (layout === null || layout === '' || layout > 24 || layout < 1 || (isNaN(layout))) {
      throw "Invalid Layout Number";
    }

    if (sign === null || sign === '') {
      sign = "asset/sign.png";
    }

    const layoutPath = "asset/layout/layout_" + parseInt(layout) + ".pdf"
    const existingPdfBytes = await fetch(layoutPath).then((res) =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);


    const BebaFont = await fetch("./asset/font/BebasNeue-Regular.ttf").then((res) =>
      res.arrayBuffer()
    );


    const pngImageBytes = await fetch(sign).then((res) => res.arrayBuffer())
    const pngImage = await pdfDoc.embedPng(pngImageBytes);
    const pngDims = pngImage.scale(0.5);
    const Beba = await pdfDoc.embedFont(BebaFont);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width } = firstPage.getSize();
    const xlTextSize = 60
    const largeTextSize = 45
    const mediumTextSize = 30
    const smallTextSize = 15
    const participantTextWidth = Beba.widthOfTextAtSize(participant, largeTextSize)
    const titleTextWidth = Beba.widthOfTextAtSize(title, xlTextSize)
    const organisationTextWidth = Beba.widthOfTextAtSize(organisation, mediumTextSize)
    const eventTextWidth = Beba.widthOfTextAtSize(event, smallTextSize)
    const nameTextWidth = Beba.widthOfTextAtSize(name, smallTextSize)
    const designationTextWidth = Beba.widthOfTextAtSize(designation, smallTextSize)


    firstPage.drawText(organisation, {
      x: (width - organisationTextWidth) / 2,
      y: 480,
      size: 30,
      font: Beba,
      color: rgb(1, 0.6, 0.3),
    });

    firstPage.drawText(title, {
      x: (width - titleTextWidth) / 2,
      y: 380,
      size: xlTextSize,
      font: Beba,
      color: rgb(1, 0.6, 0.3),
    });

    firstPage.drawText(participant, {
      x: (width - participantTextWidth) / 2,
      y: 300,
      size: largeTextSize,
      font: Beba,
      color: rgb(1, 0.6, 0.3),
    });

    firstPage.drawText(event, {
      x: (width - eventTextWidth) / 2,
      y: 250,
      font: Beba,
      size: smallTextSize,
      color: rgb(0, 0, 0),
    });

    firstPage.drawImage(pngImage, {
      x: width / 2 - 75,
      y: 128,
      width: 150,
      height: 100,
    })

    firstPage.drawText(name, {
      x: (width - nameTextWidth) / 2,
      y: 108,
      font: Beba,
      size: smallTextSize,
    });

    firstPage.drawText(designation, {
      x: (width - designationTextWidth) / 2,
      y: 83,
      font: Beba,
      size: smallTextSize,
    });

    var filename =  participant + "_" + serial + "_" +  String(Date.now()) + ".pdf";
    const pdfBytes = await pdfDoc.save();
    var file = new File(
      [pdfBytes],
      filename,
      {
        type: "application/pdf;charset=utf-8",
      }
    );

    zip.file(filename, file);
    return true;
  }
  catch (err) {
    console.log(err);
    return false;
  }
};


window.addEventListener("load", function () {
  document.getElementById("upload").addEventListener("click", function () {
    var fileUpload = document.getElementById("file");
    if (fileUpload.value === null || fileUpload.value === '') {
      openClose("alertBox", "No file selected", "Please upload a valid .xlsx/.xls file");
      return;
    }
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
      } catch (err) {
        openClose("alertBox", "Browser Not Supported", "Please update/ change your browser");
      }
    } else {
      openClose("alertBox", "Error occured while uploading xlsx", "Please upload a valid file or try renaming the file");
    }

    function ProcessExcel(data) {
      try {
        var workbook = XLSX.read(data, {
          type: 'binary'
        });
        var firstSheet = workbook.SheetNames[0];
        var printPDFs = false;
        var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
        console.log(excelRows);
        for (var i = 0; i < excelRows.length; i++) {
          printPDFs = generatePDF(excelRows[i].Participant, excelRows[i].Title,
            excelRows[i].Organisation, excelRows[i].Event, excelRows[i].Sign, excelRows[i].Name,
            excelRows[i].Designation, excelRows[i].Layout, i);
        }

        printPDFs.then(
          function (value) {
            if (value) {
              zipPDF(zip);
              openClose("successBox", "Certificates generated successfully from .xlsx", "Liked the project? Star the repo on GitHub.");
            } else {
              openClose("alertBox", "Error occured while creating PDF", "Incorrect data enteries were found. Please take a look at the sampe.xlxs and fill up the data accordingly");
            }
          },
          function (error) { console.log(error);
            openClose("alertBox", "Error occured while creating PDF", "Incorrect data enteries were found. Please take a look at the sampe.xlxs and fill up the data accordingly");
           }
        );

      }
      catch (err) {
        console.log(err);
        openClose("alertBox", "Error file parsing xlsx", "Incorrect data enteries were found. Please take a look at the  sample.xlsx and fill up the data accordingly");
      }

    };
  })
})

const participantRaw = document.getElementById("participant");
const titleRaw = document.getElementById("title");
const organisationRaw = document.getElementById("organisation");
const eventRaw = document.getElementById("event");
const nameRaw = document.getElementById("name");
const designationRaw = document.getElementById("designation");
const layoutRaw = document.getElementById("layout");
const submitBtn = document.getElementById("submitBtn");
const { PDFDocument, rgb, degrees } = PDFLib;

const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
    match.toUpperCase()
  );

submitBtn.addEventListener("click", () => {
  const participant = capitalize(participantRaw.value);
  const title = capitalize(titleRaw.value);
  const organisation = capitalize(organisationRaw.value);
  const event = eventRaw.value;
  const name = capitalize(nameRaw.value);
  const designation = designationRaw.value;
  var layout = layoutRaw.value;
  if (layout === null || layout === '' || layout > 24 || layout < 1 || (isNaN(layout))) {
    layout = Math.floor((Math.random() * 24) + 1);
  }
  const printPDF = generatePDF(participant, title, organisation, event, "asset/sign.png", name, designation, layout, 1);
  printPDF.then(
    function (value) {
      if (value) {
        zipPDF(zip);
        openClose("successBox", "Certificate generated successfully via html form", "Liked the project? Star the repo on GitHub , that would really motivate me.");
      } else {
        openClose("alertBox", "Error occured while creating PDF", "Incorrect data enteries were found. Please take a look at the sampe.xlxs and fill up the data accordingly");
      }
    },
    function (error) { console.log(error); 
      openClose("alertBox", "Error occured while creating PDF", "Incorrect data enteries were found. Please take a look at the sampe.xlxs and fill up the data accordingly");
    }
  );

});

function zipPDF(zip){
zip.generateAsync({type:"blob"})
.then(function(content) {
    saveAs(content, "bulky_" + Date.now() +  ".zip");
});
}