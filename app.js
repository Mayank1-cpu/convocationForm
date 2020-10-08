const express = require("express");
const ejs = require("ejs");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
var fs = require('fs');
os = require('os');
var Busboy = require('busboy');
var http = require('http'),
    inspect = require('util').inspect;


const app = express();
app.set('view engine', 'ejs');

app.use(express.static("public"));
dotenv.config({path:'./.env'});


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
app.get('/createdb', (req,res) => {
  let sql = 'CREATE DATABASE convocation2020';
  db.query(sql, (err,result) => {
    if(err) throw err;
    console.log(result);
    res.send('DATABASE CREATED');
  })
});
app.get('/createtable', (req,res) => {
  let sql = 'CREATE TABLE students(id int AUTO_INCREMENT,honorific VARCHAR(50) NOT NULL,name VARCHAR(100) NOT NULL,rollNumber VARCHAR(50) NOT NULL,programme VARCHAR(50) NOT NULL, email VARCHAR(100) NOT NULL,mobileNumber VARCHAR(10) NOT NULL,address VARCHAR(200) NOT NULL,photograph BLOB,mode VARCHAR(30) NOT NULL,paymentRefernceNumbeR VARCHAR(50) NOT NULL,pursuing VARCHAR(20) NOT NULL,studyInfo VARCHAR(200),jobInfo VARCHAR(200),PRIMARY KEY(id))';
  db.query(sql, (err,result) => {
    if(err) throw err;
    console.log(result);
    res.send("table created");
  })
})

app.get("/", (req,res) => {
res.render("home");
});

app.post("/",function(req,res){
  let busboy = new Busboy({headers:req.headers});
   let formData = new Map();
  busboy.on('file', function(fieldname, file, filename) {
    if(filename.length > 0){
      filename = formData.get("rollNumber")+'_'+filename
      var saveTo = path.join('./file', filename);
    console.log('Uploading: ' + saveTo);
    file.pipe(fs.createWriteStream(saveTo));
    formData.set('photograph', filename);
  }else{
  res.render("home", {message:'Please Fill All The entry!'})
  }
    });
    busboy.on('finish', function() {
      console.log("finish")
    });
  busboy.on('field', function(fieldname, val) {
      formData.set(fieldname, val);
    });
  busboy.on('finish', function() {
    console.log(formData.get("photograph"))
   if(formData.get("name").length > 0 && formData.get("rollNumber").length > 0 && formData.get("programme").length > 0 && formData.get("email").length > 0 && formData.get("mobileNumber").length > 0 && formData.get("postalAddress").length > 0 && formData.get("photograph").length > 0 && formData.get("paymentRefernceNumber").length > 0 ){
      db.query("INSERT INTO students SET ?",
      {
       honorific:formData.get('honorific'),
       name:formData.get('name'),
       rollNumber:formData.get('rollNumber'),
       programme:formData.get('programme'),
       email:formData.get('email'),
       mobileNumber:formData.get('mobileNumber'),
       address:formData.get('postalAddress'),
       photograph:formData.get('photograph'),
       mode:formData.get('mode'),
       paymentRefernceNumbeR:formData.get('paymentRefernceNumber'),
       pursuing:formData.get('pursuing'),
       studyInfo:formData.get('studyInfo'),
       jobInfo:formData.get('jobInfo')
     })
     res.render('home',{message:"User registered"})
    }else{
      res.render('home',{message:"Please Fill All The entry!"});
    }
      console.log('Done parsing form!');

    });
    req.pipe(busboy);
});

app.listen(3000,() => {
  console.log("Server is up and running on port 3000");
});
