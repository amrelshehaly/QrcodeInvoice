const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { PDFDocument } = require('pdf-lib');

const run = async (pdfPath,imgPath) => {

  // console.log(pathToPDF)
  var a = fs.readFileSync(pdfPath)
  const pdfDoc = await PDFDocument.load(a);
  const img = await pdfDoc.embedPng(fs.readFileSync(imgPath));

  const pages = pdfDoc.getPages()
  // console.log(pages)
  const firstPage = pages[0]
  // console.log(firstPage)
//   const imagePage = pdfDoc.insertPage(0);
  firstPage.drawImage(img, {
    x: 0,
    y: 0,
    width: firstPage.getWidth()-400,
    height: firstPage.getHeight()-550,
  });

  const pdfBytes = await pdfDoc.save();
  const newFileDir = path.join(__dirname,'..','\output\/',`${path.basename(pdfPath, '.pdf')}-result.pdf`)
  // const newFilePath = `${path.basename(pdfPath, '.pdf')}-result.pdf`;
  fs.writeFileSync(newFileDir, pdfBytes);

  return newFileDir
}

const ERRORS = {
  ARGUMENTS: 'Please provide path to the PDF file as a first argument and path to image as the second argument'
};

// const pathToPDF = process.argv[2];
// assert.notEqual(pathToPDF, null, ERRORS.ARGUMENTS);
// const pathToImage = process.argv[3];
// assert.notEqual(pathToImage, null, ERRORS.ARGUMENTS);

// const getMostRecentFile = (dir) => {
//   const files = orderReccentFiles(dir);
//   return files.length ? files[0] : undefined;
// };

// const orderReccentFiles = (dir) => {
//   return fs.readdirSync(dir)
//     .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
//     .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
//     .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
// };

// const imgFile = getMostRecentFile('../images').file
// const pdfFile = getMostRecentFile('../pdf').file

// const imgPath = path.join(__dirname,'..','\images\/',imgFile)
// const pdfPath = path.join(__dirname,'..','\pdf\/', pdfFile)


// console.log(imgPath)
// console.log(pdfPath)



module.exports = run

