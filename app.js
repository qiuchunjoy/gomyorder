const express=require('express');
const exphbs=require('express-handlebars');
const path=require('path');
const bodyParser=require('body-parser');
const methodOverride=require('method-override');
const redis=require('redis');

// function log(socket,data){
//      console.log(data);
//      socket.emit('message',data);
// }

// create redis client
let client=redis.createClient();
var jsonReturn = '';

client.on('connect',function(){
  console.log('Connected to Redis...');
});

//set port
const port=3001;

//init app
const app=express();

//view engine
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//methodOverride
app.use(methodOverride('_method'));
//



// Search Page
app.get('/',function(req,res,next){
  res.render('searchusers');
});


// Search processing
app.post('/user/search',function(req,res,next){
  let name=req.body.name;

  client.hgetall(name,function(err,obj){
    if(!obj){
      res.render('searchusers',{
        error:'User does not exist'
      });
    }else {
      obj.name=name;
      res.render('details',{
        user:obj
      });
    }
  });
});

// Add User Page
app.get('/user/add',function(req,res,next){
  res.render('adduser');
});

// Process Add User Page
app.post('/user/add',function(req,res,next){
  let name=req.body.name;
  let takeout_name=req.body.takeout_name;
  let money=req.body.money;

  client.hmset(name, [
    'takeout_name',takeout_name,
    'money',money
  ],function(err,reply){
    if(err){
      console.log(err);
    }
    console.log(reply);
    res.redirect('/');
  });
});


// Show All users
app.get('/user/show',function(req,res,next){
  // res.render('showusers');
  res.render('index');
});

// Process Show All users Page
app.post('/user/show',function(req,res,next){
  let name_list=[];
  let takeout_list=[];
  let money_list=[];
  let jsonData = {};
    console.log('req', req)
    // console.log('res', res)
    // console.log('next', next)
  client.keys('*', function(err, res,obj) {
    // console.log(res);
    for (key in res){
      name_list.push('"'+res[key]+'"');
      client.hget(res[key], 'takeout_name',function(err, takeout){
        takeout_list.push('"'+takeout.toString()+'"');
      });
      client.hget(res[key], 'money',function(err, money){
        money_list.push('"'+money.toString()+'"');
      });
    };
    setTimeout(function(){
      jsonData='{"'+"takeout_name"+'":['+takeout_list+'],"'+"name"+'":['+name_list+'],"'+"money"+'":['+money_list+']}';
      // console.log('hello');
    },10);
  });

  setTimeout(function(){
  // console.log(jsonData);
  res.send(jsonData);
},50);

});
app.listen(3000);


// DELETE user
app.delete('/user/delete/:name',function(req,res,next){
  client.del(req.params.name);
  res.redirect('/');
})


app.listen(port,function(){
  console.log('Server started on port'+port);
});
