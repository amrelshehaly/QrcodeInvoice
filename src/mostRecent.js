const fs = require('fs');
const path = require('path');

 
const main = () => {
    const imgFile = getMostRecentFile(path.join(__dirname,'..','\images\/')).file
    const pdfFile = getMostRecentFile(path.join(__dirname,'..','\pdf\/')).file

    const imgPath = path.join(__dirname,'..','\images\/',imgFile)
    const pdfPath = path.join(__dirname,'..','\pdf\/', pdfFile)

//    var filenames = fs.readdirSync(path.join(__dirname,'..','\images\/'))
//    filenames.forEach(file => {
//     console.log(file);
//   });

    console.log({pdfPath, imgPath})
    return {pdfPath, imgPath}

}

const getMostRecentFile = (dir) => {
    const files = orderReccentFiles(dir);
    return files.length ? files[0] : undefined;
};
    
const orderReccentFiles = (dir) => {
    return fs.readdirSync(dir)
    .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
    .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};
    

    

// console.log(imgPath)
// console.log(pdfPath)

// main()

module.exports = main