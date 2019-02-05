
// var http = require("http");
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session'); // remember login state
// var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var PORT = process.env.PORT || 8888;

var concertina = "concertina";

// app.listen(port);
server = app.listen(PORT, function(){
// var server = require('http').createServer();
  // var time = new Date(+new Date() + 0 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');
  let time = new Date().toUTCString();
  console.log(time);
  console.log('Server listening on ' + PORT);
});

var io = require('socket.io').listen(server);
// var port = 8888;

var people = [
  {"username":"doctorwhocomposer", "forename":"Delia", "surname":"Derbyshire", "email": "", "password":'123', "regTime":new Date().toUTCString()}
];

var allUsers = [];
var msgBoardMsgs = new Array();
var messageId = 0;

// app.use('/cssFiles',express.static(__dirname));
// app.use('/JavaScript',express.static(__dirname));
app.use(express.static(path.join(__dirname,'/static')));
app.use(bodyParser());
app.use(bodyParser.urlencoded({extended: true}));

// app.use(cookieParser());
//use sessions
app.use(session({
  secret: 'LeLeArtClub',
  resave: true,
  saveUninitialized: false,
  cookie:{
    maxAge: 1000 * 60 * 5 //expire in 5 minutes
  }
}));


//store 1000 history messages
var messageQueue = new Array();
// console.log("messageQueue is empty: "+ messageQueue.isEmpty());
// console.log("messageQ"+ messageQueue.size()); initial = 0


app.get('/', function(req,res){
  // res.sendFile('firstDraft.html', {root: path.join(__dirname,'/')});
  // res.render('firstDraft.html', {root: path.join(__dirname,'/')});
});

// app.post('/', function(req,res){
//   console.log(req);
//   // res.end(JSON.stringify(req.body));
//   // res.end(req.body.username);
//   // res.send("1");
//   res.send(req.body.username);
//
// });
// post for login: if(req.body.username =='admin' &&)

// /people
app.get('/people', function(req,res){
  // res.status
  res.json(people);
});


// /people/:username321321
app.get('/people/:username',function(req,res){
  let user = people.filter(function(item){
    return item.username == req.params.username;
  });
  res.json(user[0]);
});

// app.get('/register',function(req,res){
//   res.send("regster");
// });

app.post('/register',function(req,res){
  var uname = req.body.username;
  var fname = req.body.forename;
  var lname = req.body.surname;
  var emailadd = req.body.email;
  var psw = req.body.password;
  // if username not exist, ifUsernameExist = false
  var ifUsernameExist = people.filter(function(item){
    return item.username == uname;
  });
  var ifEmailExist = people.filter(function(item){
    if (emailadd == null || emailadd == ""){
      return false;
    }
    else{
      return item.email == emailadd;
    }
  });
  var success;
  if(ifUsernameExist != false) {
    message = "The username is existed. Please change to a new one.";
    success = false;
    console.log("The username is existed. Please change to a new one.");
  }
  else if(ifEmailExist != false){
    message = "This email is registed.";
    success = false;
    console.log("This email is registed.");
  }
  else{
    success = true;
    allUsers.push(uname);
    people.push({
      "username": uname,
      "forename": fname,
      "surname": lname,
      "email": emailadd,
      "password": psw,
      "regTime": new Date().toUTCString(),
    });
    message = "registered successfully";
  }
  res.json({message, success});


});

app.post('/login', function(req, res){
  console.log("login username: " + req.body.username);
  var uname = req.body.username;
  var pw = req.body.password;
  var con = req.body.access_token;
  //for concertina only
  if(con == concertina){
    req.session = "concertina";
    message = "Login successfully.";
    // var token = jwt.sign(specificUser, 'concertina', {expiresIn: 1000 * 60 * 5});
    res.json({
      message,
      hisMsg: messageQueue,
      token: token,
      allMsg: msgBoardMsgs
    });
  }
  var message;
  // get the user in json format
  var user = people.filter(function(item){
    return item;
  });
  // if username not exist, ifUsernameExist == false
  var ifUsernameExist = people.filter(function(item){
    return item.username == uname;
  });
  if (ifUsernameExist == false){
    message = "The username does not exist.";
    // res.send("The username does not exist.");
  }
  else{
    let specificUser = ifUsernameExist[0];
    if(pw == specificUser.password){
      // save to session
      req.session.userName = uname;
      console.log("req.session.userName: "+ req.session.userName);
      message = "Login successfully.";
      // res.send(["Login successfully.", messageQueue]);
      // create access_token
      var token = jwt.sign(specificUser, 'concertina', {expiresIn: 1000 * 60 * 5});
      console.log(token);
    }
    else{
      message = "Wrong password!";
      // res.json({message:"Wrong password!"});
    }
  }
  if(token){
    res.json({
      message,
      hisMsg: messageQueue,
      token: token,
      allMsg: msgBoardMsgs
    });
  }
  else{
    res.json({
      message
    });
  }
});

app.post('/people',function(req,res){
    var uname = req.body.username;
    var fname = req.body.forename;
    var lname = req.body.surname;
    var emailadd = req.body.email;
    var psw = req.body.password;
    var con = req.body.access_token;
    if (con != concertina){
      res.sendStatus(403);
      return ;
    }
    // if username not exist, ifUsernameExist = false
    var ifUsernameExist = people.filter(function(item){
      return item.username == uname;
    });
    var ifEmailExist = people.filter(function(item){
      if (emailadd == null || emailadd == ""){
        return false;
      }
      else{
        return item.email == emailadd;
      }
    });
    var success;
    // console.log(ifEmailExist);
    // console.log(ifEmailExist == false);
    if(ifUsernameExist != false) {
      // message = "The username is existed. Please change to a new one.";
      // success = false;
      res.sendStatus(400);
      console.log("The username is existed. Please change to a new one.");
      return ;
    }
    // else if(ifEmailExist != false){
    //   message = "This email is registed.";
    //   success = false;
    //   status = 400;
    //   console.log("This email is registed.");
    // }
    else{
      success = true;
      allUsers.push(uname);
      people.push({
        "username": uname,
        "forename": fname,
        "surname": lname,
        "email": emailadd,
        "password": psw,
        "regTime": new Date().toUTCString(),
      });
      console.log(people);
      message = "registered successfully";
      res.json({message, success});
    }
});

//sessions
app.get('/session',function(req, res){
  res.json({sessNam: req.session.userName, msgQ: messageQueue,allMsg: msgBoardMsgs});
});

// logout
app.get('/logout',function(req,res){
  req.session.userName = null;
  console.log(req.session.userName);
  message = "Successfully logged out.";
  res.json(message);
});

app.get('/allUser',function(req,res){
  console.log("allUsers:"+ allUsers.toString());
  res.json({users: allUsers});
});

app.post('/leaveMessage',function(req,res){
  var status;
  var msg = req.body.message;
  // var id = req.body.id;
  var time = req.body.date;
  if(msgBoardMsgs.length > 100){
    console.log(">100");
    msgBoardMsgs.shift();
  }
  msgBoardMsgs.push({
    "id": messageId,
    "user": req.session.userName,
    "msg":msg,
    "date":time
  });
  messageId++;
  res.json({msg:"Add message successfully."});
  console.log(msgBoardMsgs);
});

app.get('/leaveMessage',function(req,res){

  res.json({allMsg: msgBoardMsgs});
});


// app.post('/test',function(req,res){
//   var status;
//   console.log("token: "+ req.body.token);
//   jwt.verify(req.body.token, 'concertina', function(err, decoded){
//     if(err){
//       status = 403;
//       console.log(err);
//       res.sendStatus(status);
//     }
//     else{
//       console.log(decoded);
//       res.send("success");
//     }
//   });
// });

// socket: listen on every connection
io.on('connect', function(socket){
  console.log('New user connected');

  //listen on message
  socket.on('message',function(data){
    console.log("date: "+data.date);
    //broadcast the new_message
    io.sockets.emit('new_message',{date: data.date, message: data.message, user: data.user});
    // save to the Queue
    if(messageQueue.length > 1000){
      console.log(">1000");
      messageQueue.shift();
    }
    messageQueue.push([data.date, data.user, data.message]); //datatype[date, string, string]
    console.log(messageQueue.toString());
  });
});

module.exports = app;

// console.log('Server running at http://127.0.0.1:8888/');
