const express = require("express");
const app = express();
const port = 5000;
const bp = require("body-parser");
const qr = require("qrcode");
const axios = require('axios')
const path = require('path')
const assert = require('assert')
const {PDFDocument} = require('pdf-lib')
const fileUpload = require('express-fileupload');
const request = require('request')
const fs = require('fs')
const https = require('https')
const download = require('download');
const run = require('../src/pdfImage')
const main = require('../src/mostRecent')

var filepath = '';

// Using the ejs (Embedded JavaScript templates) as our template engine
// and call the body parser  - middleware for parsing bodies from URL
//                           - middleware for parsing json objects
app.use(fileUpload());
app.set("view engine", "ejs");
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

// Simple routing to the index.ejs file
app.get("/", (req, res) => {
    // console.log(path.join(__dirname,'..','\images'))
    res.render("index");
});

app.post("/upload", (req,res)=>{
    if (req.files) {
        const file = req.files.file
        const fileName = file.name
        const folderPath =path.join(__dirname,'..','\pdf\/')
        file.mv(`${folderPath}${fileName}`, err => {
            if (err) {
                console.log(err)
                res.send('There is error')
            } else {
                // res.send('uploaded successfully')
                res.render('upload')
            }
        })
    } else {
        res.send('There are no files')
    }
})


// var download = function(uri, filename, callback){
//     request.head(uri, function(err, res, body){
//       console.log('content-type:', res.headers['content-type']);
//       console.log('content-length:', res.headers['content-length']);
  
//       request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//     });
//   };

const deleteFolderContent = (directory) =>{
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
            console.log(file)
            if(file.includes("out.txt") || file.includes("text.txt")){
                continue
            }else{
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
         
        }
      })
}


// Blank input
// Incase of blank in the index.ejs file, return error 
// Error  - Empty Data!
app.post("/scan", (req, res) => {
    const url = "Seller Name: "+req.body.sellerName+"\n"
                +"VAT Seller: "+req.body.VATSeller+"\n"
                +"Date: "+req.body.date+"\n"
                +"invoice Total: "+req.body.invoiceTotal+"\n"
                +"VAT Total: "+req.body.VATTotal+"\n" ;

    if (url.length === 0) res.send("Empty Data!");
    else console.log(url)

    qr.toDataURL(url, (err, src) => {
        if (err) res.send("Error occured");
        // console.log("src", src)

        // var base64Data = req.rawBody.replace(/^data:image\/png;base64,/, "");
        const FolderPath = path.join(__dirname,'..','\images\/')
        var base64Data = src.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(`${FolderPath}\out.png`, base64Data, 'base64', function(err) {
            if(err){
                console.log(err)
            }else{
                console.log("file created")
                // console.log(main)
                
                run(main().pdfPath, main().imgPath).then((res)=>{
                    filepath = res
                })
            }
        });

        res.render("scan", { 
            src : src ,
        });
    });
});

app.get('/download', async (req,res)=>{
    // const file = path.join(__dirname,'..','\images\/','out.png')
    const file = filepath
    await res.download(file)
    await deleteFolderContent(path.join(__dirname,'..','\output\/'))
    await deleteFolderContent(path.join(__dirname,'..','\pdf\/'))
})


// Setting up the port for listening requests
app.listen(process.env.PORT || port, () => console.log("Server at 5000"));