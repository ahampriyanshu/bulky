const participantRaw = document.getElementById("participant");
const organisationRaw = document.getElementById("organisation");
const eventRaw = document.getElementById("event");
const signRaw = document.getElementById("sign");
const designationRaw = document.getElementById("designation");
const submitBtn = document.getElementById("submitBtn");
const { PDFDocument, rgb, degrees } = PDFLib;
const demo = 1;

const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
    match.toUpperCase()
  );

submitBtn.addEventListener("click", () => {
  const participant = capitalize(participantRaw.value);
  const organisation = capitalize(organisationRaw.value);
  const event = capitalize(eventRaw.value);
  const sign = capitalize(signRaw.value);
  const designation = capitalize(designationRaw.value);
  generatePDF(participant, organisation, event,sign,designation, demo);
});

const generatePDF = async (participant, organisation, event,sign,designation, serial) => {
  const existingPdfBytes = await fetch("asset/sample.pdf").then((res) =>
    res.arrayBuffer()
  );

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await fetch("./Roboto-Medium.ttf").then((res) =>
    res.arrayBuffer()
  );


  const pngImageBytes = await fetch("https://user-images.githubusercontent.com/54521023/113497335-b601de80-9520-11eb-8d58-bad58c95cb3c.png").then((res) => res.arrayBuffer())
  const pngImage = await pdfDoc.embedPng(pngImageBytes)
  const pngDims = pngImage.scale(0.5)

  const RobotoFont = await pdfDoc.embedFont(fontBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize()
  const largeTextSize = 50
  const mediumTextSize = 30
  const smallTextSize = 15
  const participantTextWidth = RobotoFont.widthOfTextAtSize(participant, largeTextSize)
  const collegeTextWidth = RobotoFont.widthOfTextAtSize(organisation, mediumTextSize)
  const signTextWidth = RobotoFont.widthOfTextAtSize(sign, smallTextSize)
  const desTextWidth = RobotoFont.widthOfTextAtSize(designation, smallTextSize)
  const contestTextWidth = RobotoFont.widthOfTextAtSize(event, smallTextSize)

  firstPage.drawText(participant, {
    x: (width - participantTextWidth) / 2,
    y: 300,
    size: largeTextSize,
    font: RobotoFont,
    color: rgb(1, 0.6, 0.3),
  });

  firstPage.drawText(organisation, {
    x: (width - collegeTextWidth) / 2,
    y: 500,
    size: 30,
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
    x: (width - desTextWidth) / 2,
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