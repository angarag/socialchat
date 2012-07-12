var countries;
var fs = require('fs');
var rootVert = new Vertex('');
var trie = new Trie(rootVert);
var html = require('fs').readFileSync(__dirname+'/helloworld.html');
var prehtml = require('fs').readFileSync(__dirname+'/helloworld.html');
var http = require('http');
var express = require('express');
var rest = require('restler');
var less = require('less');
var lessMiddleware = require('less-middleware');
var server = express.createServer();
 scripts = [
   'javascripts/jquery.js',
   'javascripts/easel.js',
   'javascripts/script.js'
];
//Facebook connection
var everyauth = require('./index');
everyauth.debug = true;
everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

var connect = require('connect');
var usersById = {};
var nextUserId = 0;
var allmsg="";
var lastmsgs=[];
var counter=0;
var users = {}; //To store the client id for user name (assume name=unique)
var cusers = {}; //To store the user name for client id (assume clientId=name)

//FB connection cont'd
everyauth.facebook
  .appId('154899014623013')
  .appSecret('78d4d75ad55e40aee61a7645b0189570')
  .entryPath('/auth/facebook')
  .callbackPath('/auth/facebook/callback')
  .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUser) {
		var id = fbUser.username+"@facebook";
		var user = {
			id: id,
			facebookUser: fbUser,
			username: fbUser.username,
			name: fbUser.name,
                        network: 'facebook'
		};
		usersById[id] = user;
		return user;
  })
  .redirectPath('/');

//Twitter connection
everyauth
  .twitter
    .consumerKey('172J8UzsZFWfEQFFfpgA')
    .consumerSecret('Zlxsrwww4ZiriUTstIpDPM4Jmoaf6NfTLIRZPzuXk')
    .entryPath('/auth/twitter')
//    .callbackPath('/')
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
//                console.log('Twitter Meta date %j',twitUser);
		var id = twitUser.name+"@twitter";
		var user = {
			id: id,
			twitUser: twitUser,
			username: twitUser.screen_name,
			name: twitUser.name,
                        network: 'twitter'
		};
		usersById[id] = user;
		return user;
    })
    .redirectPath('/');
//GooglePlus connection
everyauth.google
  .appId('29775226891.apps.googleusercontent.com')
  .appSecret('9f7vsUOj81D7I0UNvHEQ3tlU')
  .scope('https://www.googleapis.com/auth/plus.me')
  .callbackPath('/chat')
  .handleAuthCallbackError(function (req, res) {
     res.redirect('/error/');
   })
  .findOrCreateUser( function (sess, accessToken, extra, googleUser) {
		var id = googleUser.id+"@gmail";
		var user = {
			id: id,
			googleUser: googleUser,
			username: googleUser.id,
			name: googleUser.displayName,
                        network: 'google+'
		};
		usersById[id] = user;
                console.log('username %s name %s',user.username,user.name);         
		return user;
  })
  .redirectPath('/');

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

//Connect module Routes
var routes = function (server) {
  // Define your routes here
};

var app = express.createServer(
    express.bodyParser()
  , express.cookieParser()
  , express.session({ secret: 'htuayreve'})
  , everyauth.middleware()
);
app.configure( function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(lessMiddleware({
    src      : __dirname + "/public",
    compress : true
  }));
  app.use(express.compiler({ src: __dirname + '/public/stylesheets', enable: ['less'] }));
  app.use(express.static(__dirname + '/public'));
});
//Routings
app.get('/', function(req, res){
   if(!req.user)
	res.redirect('/auth');
   else{
       everyone.setUser(req.user);
	//res.end(html);
       res.render('home');
   }
})

app.get('/auth', function(req, res){
   console.log('Routing auth');
   if(!req.user)
        res.render('home');
   else{
       everyone.setUser(req.user);
	res.end(html);
   }
})

app.get('/chat', function(req, res){
   console.log('Routing chat');
   if(!req.user)
	res.redirect('/auth');
   else{
       everyone.setUser(req.user);
	res.end(html);
   }
})

app.get('/error', function(req, res){
	res.send('Error');
})

app.get('/gplus/gplus.png', function(req, res){
        console.log('gplus');
	res.redirect('/images/gplus.png');
})
//app.get('/css/main.js', function(req, res){
//        console.log('main.js');
//	res.redirect('/css/main.js');
//})

app.get('/logout', function(req, res){
   console.log('Routing logout');
   if(!req.user){
       console.log('user not existing');
	res.redirect('/');}
   else{
       console.log('user deleted');
       everyone.logOut();
       res.redirect('/');
   }
})

//server.listen(3000,"laruche.local");
everyauth.helpExpress(app);
app.listen(process.env['app_port'] || 3000);

//Init Nowjs
var nowjs = require("now");
var everyone = nowjs.initialize(app); //Main 
var post_everyone = nowjs.getGroup('everyone');
var group = nowjs.getGroup('everyone');

//Handling connect and disconnect
everyone.on('leave', function() { 
    message=' is disconnected from chat';
    console.log('Disconnected from server'); 
    --counter;
    link=this.now.name;
    if(this.now.network=='facebook')
    link='<a target="_blank" href="http://www.facebook.com/'+this.now.username+'">'+this.now.name+'</a>';
    else
    if(this.now.network=='twitter')
    link='<a target="_blank" href="http://www.twitter.com/'+this.now.username+'">'+this.now.name+'</a>';
    else
    if(this.now.network=='google+')
    link='<a target="_blank" href="https://plus.google.com/'+this.now.username+'">'+this.now.name+'</a>';
    everyone.now.receiveMessage(link, message,7); 
   console.log('this.user.clientId %s',this.user.clientId);
   if(this.user.clientId){
   //everyone.removeUser(this.user.clientId);
    users[this.now.name] = null;
  }
   everyone.count(function (ct) {
	    everyone.now.countUsers(ct);
   });
   console.log('this.now  = %j',this.now)
   delete this.now;
   console.log('Hiring disconnect');
}); 
everyone.on('connect', function() { 
  console.log('Hiring connect');
  this.now.receivePrevMessage(lastmsgs.toString());   
  trie.addWord(rootVert, this.now.name);
  if(this.user.clientId){
    everyone.addUser(this.user.clientId);
    users[this.now.name] = this.user.clientId;
    if(cusers[this.user.clientId]==null)
      message=' is connected to chat via '+this.now.network;
    cusers[this.user.clientId] = this.now.name;
  }
    console.log('connected to server'); 
    ++counter;
    everyone.count(function (ct) {
	    everyone.now.countUsers(ct);
	});
    //Date.now() = mill sec since 1970
    link=this.now.name;
    if(this.now.network=='facebook')
    link='<a target="_blank" href="http://www.facebook.com/'+this.now.username+'">'+this.now.name+'</a>';
    else
    if(this.now.network=='twitter')
    link='<a target="_blank" href="http://www.twitter.com/'+this.now.username+'">'+this.now.name+'</a>';
    else
    if(this.now.network=='google+')
    link='<a target="_blank" href="https://plus.google.com/'+this.now.username+'">'+this.now.name+'</a>';
    everyone.now.receiveMessage(link, message,7);
  var usernames=[];
  everyone.getUsers(function (users) { 
	for (var i = 0; i < users.length; i++)
	      usernames.push("<br>"+cusers[users[i]]+"");
  });
  everyone.now.receiveUserList(usernames.toString());   
}); 
//Nowjs
group.now.distributeMessage = function(message){
  console.log('Group:'+message);
};
//Depreciated
everyone.now.startChat = function(message){
  console.log("Hiring StartChat");
  this.now.receivePrevMessage(lastmsgs.toString());   
  trie.addWord(rootVert, this.now.name);
  if(this.user.clientId){
    console.log(this.user.clientId);
    everyone.addUser(this.user.clientId);
    users[this.now.name] = this.user.clientId;
  }
};

everyone.logOut= function() {
     console.log('Hiring logout function');
   delete this.now;
};

everyone.setUser= function(user) {
  this.now.name=user.name;
  this.now.username=user.username;
  this.now.network=user.network;
};
everyone.getUsers(function (users) {
  for (var i = 0; i < users.length; i++) 
   console.log(users[i]);
});
getUserNames = function (cusers) {
var usernames=[];
for (var i = 0; i < cusers.length; i++){
  nowjs.hasClient(cusers[i], function (bool) { 
    if (bool) { 
      usernames.push(cusers[i]);
    } 
  });
console.log(cusers.toString());
}
};
//get and post message
everyone.now.distributeMessage = function(to_whom,message){//,prevmessages){
  console.log('benim id: %s adim %s',this.user.clientId,this.now.name);
  from_user = cusers[this.user.clientId];
  nowjs.getClient(this.user.clientId, function(data){
            console.log('getClient %j',this.now.name);
  }); 
  if(to_whom){
    if(users[to_whom]){
    console.log('to whom:'+to_whom+' '+users[to_whom]);
    nowjs.getClient(users[to_whom], function(data){
	    console.log('callback on to whom');
	    this.now.receiveMessage(from_user, message,-1); //private
	    }); 
    this.now.receiveMessage('Me -> '+to_whom, message,0); //me
    }
    else 
    this.now.receiveMessage('There is no user with name ', to_whom,7); //custom
  }
  else{
  everyone.now.receiveMessage(from_user, message,1); //public
  }
};
everyone.now.updatePrevMessages = function(message){
lastmsgs.push(message);
while(lastmsgs.length>10)
lastmsgs.shift();
};
//Autocomplete
everyone.now.getGuess = function(val) {
  //val = val.toLowerCase();
  var guesses = trie.retrieve(val);
  console.log('%s getGuess -> receiveGuess %j',val,guesses[0]);
  this.now.receiveGuess(guesses[0]);
};

 function Trie(vertex) {
  this.root = vertex;
  this.addWord = function(vertex, word) {
    if(!word.length) {
        return;
    } else {
      vertex.words.push(word);
      if(!(word[0] in vertex.children)) {
        vertex.children[word[0]] = new Vertex(word[0]);
      }
      this.addWord(vertex.children[word[0]], word.substring(1));
      return;
    }
  }

  this.retrieve = function(prefix) {
    var vertex = this.root;
    while(prefix.length) {
      vertex = vertex.children[prefix[0]];
      prefix = prefix.substring(1);
      if(!vertex) {
        return ''; 
      }   
    }   
    return vertex.words;
  }
}

function Vertex(val) {
  this.children = {};
  this.words = [];
  this.val = val;
} 


