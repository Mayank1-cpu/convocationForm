const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

dotenv.config({path:'./.env'});

// Set storage engine
const storage = multer.diskStorage({
  destination:"./public/images/upload_images/",
  filename: function(req, file, cb){
    cb(null, file.fieldname+"-"+Date.now()+path.extname(file.originalname))
  }
});
//Init upload
const upload = multer({
  storage:storage,
  limits:{fileSize:100000}
}).single("photograph");


//Create connection
const db = mysql.createConnection({
  host     : process.env.DATABASE_HOST,
  user     : process.env.DATABASE_USER,
  password : process.env.DATABASE_PASSWORD,
  database : process.env.DATABASE
});

db.connect((err) => {
  if(err){
    console.log(err);
  }else{
    console.log("MySQL connected...")
  }
});




app.get("/", (req,res) => {
res.render("home");
});
app.post("/", (req,res) => {
console.log(req.body);
const {honorific,name,rollNumber,programme,email,mobileNumber,postalAddress,photograph,mode,
       paymentRefernceNumber,pursuing,studyInfo,jobInfo} = req.body;
db.query("SELECT email From students WHERE email = ?", [email], (err, results) => {
  if(err){
    console.log(err);
  }
  if(results.length > 0){
    return res.render("home", { message: "Email is already exist!!"})
  }
})


 db.query("INSERT INTO students SET ?",
        {
         honorific:honorific,
         name:name,
         rollNumber:rollNumber,
         programme:programme,
 	       email:email,
         mobileNumber:mobileNumber,
         address:postalAddress,
         photograph:photograph,
         mode:mode,
         paymentRefernceNumbeR:paymentRefernceNumber,
         pursuing:pursuing,
         studyInfo:studyInfo,
         jobInfo:jobInfo },
       (err,results) => {
         if(err){
           res.render("home",{message:err});
           console.log(err);
         }else{
           res.render("home",{
             message: "User registered"
           });
         }
       });


       upload(req, res, (err) => {
         if(err){
         res.render("home", {message:"error file is too large!"})
       }else{
         console.log(req.file);
       }
       })

});

app.listen(3000,() => {
  console.log("Server is up and running on port 3000");
});
