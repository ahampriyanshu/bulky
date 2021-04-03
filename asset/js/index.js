const userName = document.getElementById("name");
const orgName = document.getElementById("org");
const contestName = document.getElementById("contest");
const signName = document.getElementById("sign");
const designation = document.getElementById("designation");
const submitBtn = document.getElementById("submitBtn");

// console.log(userName, orgName, contestName, signName, designation);

const { PDFDocument, rgb, degrees } = PDFLib;

const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
    match.toUpperCase()
  );

submitBtn.addEventListener("click", () => {
  const val = capitalize(userName.value);
  const valOrg = capitalize(orgName.value);
  const valContest = capitalize(contestName.value);
  const valSign = capitalize(signName.value);
  const valDes = capitalize(designation.value);

  if (val.trim() !== "" && userName.checkValidity()) {
    generatePDF(val, valOrg, valContest,valSign,valDes);
  } else {
    userName.reportValidity();
  }
});

function bulkypdf(data) {

  // generatePDF(val, valOrg, valContest,valSign,valDes);
}

const generatePDF = async (name, valOrg, valContest,valSign,valDes) => {
  const existingPdfBytes = await fetch("asset/sample.pdf").then((res) =>
    res.arrayBuffer()
  );

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await fetch("./Roboto-Medium.ttf").then((res) =>
    res.arrayBuffer()
  );

  const RobotoFont = await pdfDoc.embedFont(fontBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize()
  const largeTextSize = 50
  const mediumTextSize = 30
  const smallTextSize = 15
  const nameTextWidth = RobotoFont.widthOfTextAtSize(name, largeTextSize)
  const collegeTextWidth = RobotoFont.widthOfTextAtSize(valOrg, mediumTextSize)
  const signTextWidth = RobotoFont.widthOfTextAtSize(valSign, smallTextSize)
  const desTextWidth = RobotoFont.widthOfTextAtSize(valDes, smallTextSize)
  const contestTextWidth = RobotoFont.widthOfTextAtSize(valContest, smallTextSize)

  firstPage.drawText(name, {
    x: (width - nameTextWidth) / 2,
    y: 300,
    size: largeTextSize,
    font: RobotoFont,
    color: rgb(1, 0.6, 0.3),
  });

  firstPage.drawText(valOrg, {
    x:(width - collegeTextWidth) / 2,
    y: 500,
    size: 30,
    font: RobotoFont,
    color: rgb(1, 0.6, 0.3),
  });

  firstPage.drawText(valContest, {
    x:(width - contestTextWidth) / 2,
    y: 250,
    size: smallTextSize,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(valSign, {
    x: (width - signTextWidth) / 2,
    y: 108,
    size: smallTextSize,
  });

  firstPage.drawText(valDes, {
    x: (width - desTextWidth) / 2,
    y: 83,
    size: smallTextSize,
  });

  const pdfBytes = await pdfDoc.save();
  var file = new File(
    [pdfBytes],
    "Certificate.pdf",
    {
      type: "application/pdf;charset=utf-8",
    }
  );
 saveAs(file);
};