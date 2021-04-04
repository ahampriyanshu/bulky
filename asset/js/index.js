const participantRaw = document.getElementById("participant");
const titleRaw = document.getElementById("title");
const organisationRaw = document.getElementById("organisation");
const eventRaw = document.getElementById("event");
const signRaw = document.getElementById("sign");
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
  const sign = capitalize(signRaw.value);
  const designation = capitalize(designationRaw.value);
  const layout = capitalize(layoutRaw.value);
  generatePDF(participant, title,organisation, event,sign,designation, 2, 1);
});

const generatePDF = async (participant, title, organisation, event,sign,designation, layout, serial) => {
  
  if(layout !== null && layout !== '' )
  {
    layout = Math.random() * (24 - 1) + 1;
  }
  const layoutPath = "asset/sample_layout/layout_" + parseInt(layout) + ".pdf"
  console.log(layoutPath);
  const existingPdfBytes = await fetch(layoutPath).then((res) =>
    res.arrayBuffer()
  );

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await fetch("./Roboto-Medium.ttf").then((res) =>
    res.arrayBuffer()
  );


  const pngImageBytes = await fetch("asset/sign.png").then((res) => res.arrayBuffer())
  const pngImage = await pdfDoc.embedPng(pngImageBytes)
  const pngDims = pngImage.scale(0.5)
  const RobotoFont = await pdfDoc.embedFont(fontBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize()
  const xlTextSize = 70
  const largeTextSize = 50
  const mediumTextSize = 30
  const smallTextSize = 15
  const participantTextWidth = RobotoFont.widthOfTextAtSize(participant, largeTextSize)
  const titleTextWidth = RobotoFont.widthOfTextAtSize(title, xlTextSize)
  const organisationTextWidth = RobotoFont.widthOfTextAtSize(organisation, mediumTextSize)
  const contestTextWidth = RobotoFont.widthOfTextAtSize(event, smallTextSize)
  const signTextWidth = RobotoFont.widthOfTextAtSize(sign, smallTextSize)
  const designationTextWidth = RobotoFont.widthOfTextAtSize(designation, smallTextSize)


  firstPage.drawText(organisation, {
    x: (width - organisationTextWidth) / 2,
    y: 500,
    size: 30,
    font: RobotoFont,
    color: rgb(1, 0.6, 0.3),
  });

  firstPage.drawText(title, {
    x: (width - titleTextWidth) / 2,
    y: 400,
    size: xlTextSize,
    font: RobotoFont,
    color: rgb(1, 0.6, 0.3),
  });

  firstPage.drawText(participant, {
    x: (width - participantTextWidth) / 2,
    y: 300,
    size: largeTextSize,
    font: RobotoFont,
    color: rgb(1, 0.6, 0.3),
  });

  firstPage.drawText(event, {
    x: (width - contestTextWidth) / 2,
    y: 250,
    size: smallTextSize,
    color: rgb(0, 0, 0),
  });

  firstPage.drawImage(pngImage, {
    x: width  / 2 - 75,
    y: 128 ,
    width: 150,
    height: 100,
  })

  firstPage.drawText(sign, {
    x: (width - signTextWidth) / 2,
    y: 108,
    size: smallTextSize,
  });

  firstPage.drawText(designation, {
    x: (width - designationTextWidth) / 2,
    y: 83,
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