const express = require("express");
const app = express();
const port = 5000;
const bp = require("body-parser");
const qr = require("qrcode");
const path = require('path')
const fileUpload = require('express-fileupload');
const fs = require('fs')
const run = require('../src/pdfImage')
const main = require('../src/mostRecent')
const OAuthClient = require('intuit-oauth')

var filepath = '';

// Using the ejs (Embedded JavaScript templates) as our template engine
// and call the body parser  - middleware for parsing bodies from URL
//                           - middleware for parsing json objects
app.use(fileUpload());
app.set("view engine", "ejs");
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

var sellerName =''
var InvoiceTotal = ''
var TotalTax = ''

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
  let vat_total = parseInt(req.body.invoiceTotal)*0.15 + parseInt(req.body.invoiceTotal)
  const url = "Seller Name: "+"Establishment Hulul Labibah Commercial"+"\n"
              +"VAT Seller: "+"2062025378"+"\n"
              +"Date: "+req.body.date+"\n"
              +"invoice Total: "+req.body.invoiceTotal+"\n"
              +"VAT Total: "+vat_total+"\n" ;

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


/**
 * App Variables
 * @type {null}
 */
let oauth2_token_json = null;
let redirectUri = '';

/**
 * Instantiate new Client
 * @type {OAuthClient}
*/

let oauthClient = null;

const urlencodedParser = bp.urlencoded({ extended: false });


app.get('/authUri', (req,res)=>{
    res.render('auth')
})

app.get('/customers',(req,res)=>{
    res.render('customers')
})

app.post('/authUri', function (req, res) {
    console.log("aaaaaa")
    oauthClient = new OAuthClient({
      clientId: req.body.clientId,
      clientSecret: req.body.clientSecret,
      environment: req.body.environment,
      redirectUri: req.body.redirectUri,
    });

    const authUri = oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.Accounting],
        state: 'intuit-test',
      });
    
    //   redirectUri = authUri

      console.log(authUri)

    //   res.send(authUri);
    res.redirect(authUri)
});

app.get('/callback', function (req, res) {
    // console.log(req.url)
    oauthClient
      .createToken(req.url)
      .then(function (authResponse) {
        oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
        // console.log(oauth2_token_json)
      })
      .catch(function (e) {
        console.error(e);
      });
  
    res.render('auth');
});

app.get('/getCompanyInfo', function (req, res) {
    const companyID = oauthClient.getToken().realmId;
    console.log("Company ID --> ", companyID)
  
    const url =
      oauthClient.environment == 'sandbox'
        ? OAuthClient.environment.sandbox
        : OAuthClient.environment.production;
  
    oauthClient
      .makeApiCall({ url:  `${url}v3/company/${companyID}/companyinfo/${companyID}`})
      .then(function (authResponse) {
        console.log(`The response for API call is :${JSON.stringify(authResponse)}`);
        res.send(JSON.parse(authResponse.text()));
      })
      .catch(function (e) {
        console.error(e);
      });
});


app.get('/AllInvoices', function (req,res) {

    const companyID = oauthClient.getToken().realmId;
    // console.log("Company ID --> ", companyID)
  
    const url =
      oauthClient.environment == 'sandbox'
        ? OAuthClient.environment.sandbox
        : OAuthClient.environment.production;
  
        oauthClient.makeApiCall({url : `${url}v3/company/${companyID}/query?query=select * from invoice `})
        .then((response)=>{
          // console.log(`The response for API call is :${JSON.stringify(response)}`)
        //   res.send(JSON.parse(response.text()));
        // console.log(JSON.parse(response.body).QueryResponse.Invoice)
        res.render('customers',{
            data:JSON.parse(response.body).QueryResponse.Invoice
        })
        }).catch((err)=>{
          console.log(err)
        })
  
  })

  app.get('/invoice',(req,res)=>{
      console.log(req.query)
      sellerName = req.query.sellerName
      InvoiceTotal = req.query.InvoiceTotal
      TotalTax = req.query.TotalTax

      res.redirect('/')
  })




// Setting up the port for listening requests
const server = app.listen(process.env.PORT || port, () => {
    console.log(`💻 Server listening on port ${server.address().port}`);
    
      redirectUri = `${server.address().port}` + '/callback';
      console.log(
        `💳  Step 1 : Paste this URL in your browser : ` +
          'http://localhost:' +
          `${server.address().port}`,
      );
      console.log(
        '💳  Step 2 : Copy and Paste the clientId and clientSecret from : https://developer.intuit.com',
      );
      console.log(
        `💳  Step 3 : Copy Paste this callback URL into redirectURI :` +
          'http://localhost:' +
          `${server.address().port}` +
          '/callback',
      );
      console.log(
        `💻  Step 4 : Make Sure this redirect URI is also listed under the Redirect URIs on your app in : https://developer.intuit.com`,
      );

  });