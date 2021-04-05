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
  const event = capitalize(eventRaw.value);
  const name = capitalize(nameRaw.value);
  const designation = capitalize(designationRaw.value);
  const layout = capitalize(layoutRaw.value);
  generatePDF(participant, title,organisation, event, "asset/sign.png", name,designation, layout, 1);
});

const generatePDF = async (participant, title, organisation, event, sign, name,designation, layout, serial) => {

  if(layout === null || layout === '' || layout > 24 || layout < 1) {
    layout = Math.floor((Math.random() * 24) + 1);
    alert("Invalid sample layout entered! Now opting randomly");
 }

 if(sign === null || sign === '') {
  sign = "asset/sign.png";
}

  const layoutPath = "asset/sample_layout/layout_" + parseInt(layout) + ".pdf"
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
    x:  (width - eventTextWidth) / 2,
    y: 250,
    font: Beba,
    size: smallTextSize,
    color: rgb(0, 0, 0),
  });

  firstPage.drawImage(pngImage, {
    x: width  / 2 - 75,
    y: 128 ,
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

  var filename = "Cert_" + participant + "_" + serial + ".pdf";
  const pdfBytes = await pdfDoc.save();
  var file = new File(
    [pdfBytes],
    filename,
    {
      type: "application/pdf;charset=utf-8",
    }
  );
 saveAs(file);
};