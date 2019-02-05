
// delete the front and back space
function trim(str){
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

// JQuery

$(document).ready(function(){

// if the user is login, currentUser is the username
  var currentUser = null;
  var historyMessage;
  var token;
  var mb_beforeTitle = '<div id="MessageLists"><div class="panel panel-info"><div class="panel-heading"><h3 class="panel-title">';
  var mb_betweenContTtl ='</h3></div><div class="panel-body">';
  // var mb_afterCont='<br><hr /> <button class="btn btn-default"> Delete</button></div>';
  var mb_afterCont='<br>';
  var concertina = "concertina";


// get the login status from the Server
  $.get('/session',function(response){
    currentUser = response.sessNam;
    console.log("currentUser equals to '': " + (currentUser==""));
    if(currentUser != "" && currentUser != null && currentUser != undefined){
      //hide reg and login and display user and logout
      $("#regBtn").css("display","none");
      $("#loginBtn").css("display","none");
      $("#loginUser a").append(currentUser);
      $("#loginUser").css("display","block");
      $("#logout").css("display","block");
      // able the group tag
      historyMessage = response.msgQ;
      console.log(response);
      if(historyMessage.length > 1){
        for(var i = 0; i < historyMessage.length; i++){
          var message = historyMessage[i];
          $("#chatbox").append("<p class='historyMsg'>"+message[0].toLocaleString()+" <br>"+message[1]+": <span class='msg hisMsg'>"+message[2]+"</span></p>");
          $("#chatbox")[0].scrollTop = $("#chatbox")[0].scrollHeight;
        }
        $("#chatbox").append("<hr />");
      }
      else{
        console.log("empty historyMessage");
      }
      // $("#loginSys").append('<li class="nav-item" id="logout" display="none"><button type="button" class="btn btn-default navbar-btn">Logout</button></li>');
      let msgs = response.allMsg;
      if(msgs.length > 0){
        $("#MessageLists").html("");
        for(var i = 0; i < msgs.length; i++){
          let t = msgs[i].date;
          let msg = msgs[i].msg;
          let uer = msgs[i].user;
          $("#MessageLists").prepend(mb_beforeTitle+t+mb_betweenContTtl+uer+": "+msg+mb_afterCont);
        }
      }
    }
    else{
      current = null;
    }
  });

  // change tab pages under navigator bar
  $("#myTab a").click(function(){
    $(this).tab('show');
  });

  // click groups, if haven't login, alert
  $("#groups").click(function(){
    $.get('/session',function(response){
      currentUser = response.sessNam;
      if(currentUser == "" || currentUser == null|| currentUser == undefined){
        alert("Please login first.")
        window.location.reload();
        return ;
      }
      // $('#usermsg').val(''); //give $('#usermsg') an empty value
    });
  });

  // hide register modal after click the login on register modalTitle
  $("#LoginOnRegister").click(function(){
    $("#register").modal('hide');
    // $("#login").modal('show');
    $("#register").on("hidden.bs.modal",function(){
      $("#login").modal("show");
  		$("#register").off().on("hidden","hidden.bs.modal");
		});
    // 原文：https://blog.csdn.net/somehow1002/article/details/73737321
  });

  // hide register modal after click the login on register modalTitle
  $("#regOnLogin").click(function(){
    $("#login").modal('hide');
    $("#login").on("hidden.bs.modal",function(){
     $("#register").modal("show");
     $("#login").off().on("hidden","hidden.bs.modal");
   });
  });

  // submit button on register modal
  $("#registerSubmit").click(function(){
    var uName = $("#regUsername").val();
    var fName = $("#forename").val();
    var lName = $("#surname").val();
    var email = $("#email").val();
    var pw1 = $("#inputPassword").val();
    var pw2 = $("#confirmPassword").val();
    uName = $.trim(uName);
    fName = $.trim(fName);
    lName = $.trim(lName);
    email = $.trim(email);
    pw1 = $.trim(pw1);
    if(pw1==null || pw1==""){
      alert("The password cannot be empty!");
    }
    else if (pw1 !== pw2){
      alert("different password");
      $("#inputPassword").css("border","1px solid red");
      $("#confirmPassword").css("border","1px solid red");
      return ;
    }
    else if(uName==null || uName==""){
      alert("The username cannot be empty!");
      return ;
    }
    else if(fName==null || fName==""){
      alert("Your first name cannot be empty!");
      return ;
    }
    else if(lName==null || lName==""){
      alert("Your last name cannot be empty!");
      return ;
    }
    else if(pw1.length < 6){
      alert("Password should be at least 6 digits.");
      return ;
    }
    // check if email is valid
    else if(email != null && email != ""){
      var at = email.indexOf("@");
      var dot = email.lastIndexOf(".");
      if (at < 1 || dot < at + 2 || dot+2 >= email.length){
        alert("Invalid email address!");
      }
    }
    if (pw1 === pw2) {
      pw1 = hex_md5(pw1);
      var data = {
        "username":uName,
        "forename":fName,
        "surname":lName,
        "email":email,
        "password":pw1,
        "access_token": concertina
      }
      // ajax 执行异步 AJAX 请求
      // alert("ajax");
      $.ajax({
        url: '/people',
        type: 'POST',
        data: data,
        success: function(response){
            // hide register, show login modal
          // alert("data sent successfully");
          console.log(response);
          alert(response.message);
          if(response.success == true){
             $("#register").modal("hide");
          }
        },
        error: function(data, err){
          // still show register modal
          alert("The username is existed. Please change to a new one.");
          // console.log("data: "+data);
          // alert("registered successfully");
           $("#register").modal("hide");
        }
      });
    }
  });

  // login button on login modal
  $("#loginSubmit").click(function(){
    var uName = $("#LoginUsername").val();
    var pw = $("#psw").val();
    uName = $.trim(uName);
    pw = $.trim(pw);
    if(uName==null || uName==""){
      alert("The username cannot be empty!");
      return ;
    }
    else if(pw==null || pw==""){
      alert("Please enter your password!");
      return ;
    }
    pw = hex_md5(pw);
    var data = {"username":uName, "password":pw, "access_token":""};
    $.post("/login",data,function(result){
      console.log(result);
      if(result.message == "Login successfully."){
        currentUser = uName;
        alert("Login successfully.");
        //change the webpage
        $("#login").modal('hide');
        $("#regBtn").css("display","none");
        $("#loginBtn").css("display","none");
        $("#loginUser a").append(currentUser);
        $("#loginUser").css("display","block");
        $("#logout").css("display","block");
        // $("#loginSys").append('<li id="loginUser" display="none"><a href="#user"><span class="glyphicon glyphicon-user"></span> '+uName+'</a></li>');
        // $("#loginSys").append('<li class="nav-item" id="logout" display="none"><button type="button" class="btn btn-default navbar-btn">Logout</button></li>');
        currentUser = uName;
        historyMessage = result.hisMsg;
        token = result.token;
        // alert(token);
        let msgs = result.allMsg;
        if(historyMessage.length > 0){
          for(var i = 0; i < historyMessage.length; i++){
            var message = historyMessage[i];
            $("#chatbox").append("<p class='historyMsg'>"+message[0].toLocaleString()+" <br>"+message[1]+": <span class='msg hisMsg'>"+message[2]+"</span></p>");
            $("#chatbox")[0].scrollTop = $("#chatbox")[0].scrollHeight;
          }

          $("#chatbox").append("<hr />");
        }
        else{
          console.log("empty historyMessage");
        }
        // ADD MESSAGE Board
        if(msgs.length > 0){
          $("#MessageLists").html("");
          for(var i = 0; i < msgs.length; i++){
            let t = msgs[i].date;
            let msg = msgs[i].msg;
            let uer = msgs[i].user;
            $("#MessageLists").prepend(mb_beforeTitle+t+mb_betweenContTtl+uer+": "+msg+mb_afterCont);
          }
        }
        // alert("test");
        // test();
      }
      else{
        alert(result.message);
      }
    })
  });

  // Logout
  $("#logout").click(function(){
    $.get('/session',function(response){
      currentUser = response.sessNam;
      if(currentUser == "" || currentUser == null){
        alert("Your login is expired.");
        window.location.reload();
        return ;
      }
    });
    $.get("/logout", function(resp){
      alert(resp);
      currentUser = null;
      $("#regBtn").css("display","block");
      $("#loginBtn").css("display","block");
      $("#loginUser a").replaceWith('<a href="#user"><span class="glyphicon glyphicon-user"></span> </a>');
      $("#loginUser").css("display","none");
      $("#logout").css("display","none");
      $("#chatbox").html("");
    });
    window.location.reload();
  });

  // refresh to check all the online users
  $("#checkOnlineUser").click(function(){
    $("#userList").html('');
    var alUsers;
    $.get('/allUser',function(res){
      alUsers = res.users;
      if(alUsers.length > 0){
        for(var i = 0; i < alUsers.length; i++){
            $("#userList").append("<p class='usersL'>"+ alUsers[i]+"</p>");
        }
      }
      else{
        alert("No online users.")
      }
    });
  });

  $("#addMsg").click(function(){
    if($("#ipt_leaveMsg").val()== null || $("#ipt_leaveMsg").val() ==""){
      alert("The message cannot be empty!");
      return false;
    }
    let time = new Date().toUTCString();
    var msg = {"token": token, "date":time, "message": $("#ipt_leaveMsg").val()};
    // $.post("/leaveMessage", msg, function(res){
    //   alert(res.msg);
    // });
    $.ajax({
      url: '/leaveMessage',
      type: 'POST',
      data: msg,
      success: function(response){
        alert(response.msg);
      },
      error: function(data, err){
        alert("Invalid JWT token. Please login again.");
        window.location.reload();
        return ;
      }
    });
    $.get('/leaveMessage',function(response){
      let msgs = response.allMsg;
      console.log(msgs);
      if(msgs.length > 0){
        $("#MessageLists").html("");
        for(var i = 0; i < msgs.length; i++){
          let t = msgs[i].date;
          let msg = msgs[i].msg;
          let uer = msgs[i].user;
          $("#MessageLists").prepend(mb_beforeTitle+t+mb_betweenContTtl+uer+": "+msg+mb_afterCont);
        }

      }
    });

    $("#ipt_leaveMsg").val('');
    return;
  });


// make connection
  var socket = io.connect('http://localhost:8888');
  // var socket = io.connect('https://leleartclub.eu-gb.mybluemix.net/');

  // send message
  $("#sendMsg").click(function(){
    if($("#usermsg").val()== null || $("#usermsg").val() ==""){
      alert("The message cannot be empty!")
      return false;
    }
    $.get('/session',function(response){
      currentUser = response.sessNam;
      if(currentUser == "" || currentUser == null){
        alert("Your login is expired.");
        window.location.reload();
        return ;
      }
      var date = new Date().toUTCString();
      console.log(date);
      socket.emit('message', {date: date, user: currentUser, message: $("#usermsg").val()});
      $('#usermsg').val(''); //give $('#usermsg') an empty value
    });
  });

   $("#sendMsg").keydown(function(e){
     if(e.keyCode === 13 && e.ctrlKey){
       document.getElementById("sendMsg").value +="\n";
       // $("#sendMsg").val()+="\n";
     }
     else if(e.keyCode === 13){
       console.log("enter");
       e.preventDefault();
       var date = new Date().toUTCString();
       socket.emit('message', {date: date, user: currentUser, message: $("#usermsg").val()});
       // $('#usermsg').val('');
     }
   });
// listen on response
  socket.on('new_message', function(msg){ //give $('#usermsg') an empty value

      // $('#usermsg').val(''); //give $('#usermsg') an empty value

    if(msg.user == currentUser){
      $.get('/session',function(response){
        currentUser = response.sessNam;
        if(currentUser == "" || currentUser == null){
          alert("Your login is expired.");
          window.location.reload();
          return ;
        }
      });
      $("#chatbox").append("<p class='myMessage'>"+msg.date +'<br>'+"<span class='msg myMsg'>"+ msg.message + "</span></p><br>");
    }
    else{
      $.get('/session',function(response){
        currentUser = response.sessNam;
        if(currentUser == "" || currentUser == null){
          alert("Your login is expired.");
          window.location.reload();
          return ;
        }
      });
      $("#chatbox").append("<p class='othersMessage'>"+msg.date +"<br>"+ msg.user + ": <span class='msg othMsg'>"+ msg.message + "</span></p><br>");
    }
    // make the scroll bar at the bottom
    $("#chatbox")[0].scrollTop = $("#chatbox")[0].scrollHeight;
  });


});
