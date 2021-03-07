const express=require("express")
      app=express()
      bodyParser = require("body-parser")
      mysql=require("mysql")
      path=require("path");
      fetch=require("node-fetch");
      promiseAny=require("promise-any");
      cors=require("cors")
      session=require("express-session")
      bcrypt=require("bcrypt")

const db=mysql.createConnection({
    host : 'localhost',
    user : 'krishna',
    password : '0mysqldb@Krishna',
    database: 'FarmApp'
})
db.connect((err)=>{
    if(err)
        throw err;
    else
        console.log("Up and running");
})


app.use(cors({credentials:true, origin:"http://localhost:3000"}))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'/public')));   
app.use(session({
    resave:true,
    secret:"Failures are the stepping stones of success",
    saveUninitialized:true,
    name:"Share2Growcookie",
    cookie : {
          maxAge: 1000* 60 * 60 *24 * 365,
          secure:false,
      }

}))
//Sql query promise
let query=(exp,values=null)=>{
    return new Promise((resolve,reject)=>{
        db.query(exp,values,(err,results,fields)=>{
            if(err){
                console.log(err)
                reject(err);
            }
            else
                resolve({results:results,fields:fields});
        })
    })
}
    

let getUser=async(uname)=>{
    let user=await query("select * from User where user_name=?",[uname])
    user=JSON.parse(JSON.stringify(user.results[0]))
    return user
}


//Middleware to disable the cache ---FINAL
let disableCache=(req,res,next)=>{
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
}
app.use(disableCache)



//Middleware to save the previous request ----FINAL
const savePrev=(req,res,next)=>{
    req.session.redirectTo=req.url;
    next();
}


//Store the user details in each of the request for the logged in user ---FINAL
let loggedinUserDetails=(req,res,next)=>{
    let loggedin=0;
    let username="";
    if(req.session.loggedin==true){
        console.log("Logged in and done");
        loggedin=1;
        username=req.session.username;
        console.log(username);
    }
    res.locals={username:username,loggedin:loggedin};

    next();
}
app.use(loggedinUserDetails);


//Check if the user is logged in
let isLoggedin=(req,res,next)=>{
    if(req.session.loggedin)
        next();
    else
    {     
          // res.status(404).json({"log_data":"Not logged in",...res.locals})
          res.status(401).send("Not logged in");
    }
}


//Check if the user is not already logged in
let notLoggedin=(req,res,next)=>{
    // console.log(req.session)
    if(req.session.loggedin==undefined || req.session.loggedin==null)
        next();
    else
        res.status(404).json({log_data:"Already logged in",...res.locals})

}

app.get("/",(req,res)=>{

    res.status(200).send("Success")
})

//User authentication

//Login post method --- Input sanitization required
app.post('/user/login',async(req,res)=>{

    // console.log(req.body,"The request",req.session)
    let username=req.body.username;
    let user=await query("select * from User where user_name=?",[username])
    if(user.results.length<0){
        res.status(404).json({log_data:"Username doesn't exists"})
        return}
    user=JSON.parse(JSON.stringify(user.results[0]))
    let match=await bcrypt.compare(req.body.password,user.pwd)
    if(match===false){
        res.status(401).json({log_data:"Password incorrect"})
        return}
   
    req.session.loggedin=true
    req.session.username=username
    req.session.userid=user.user_id
    req.session.save()
    res.set("Content-Type","application/json")
    res.status(200).json({log_data:"Logged in Successfully",username,loggedin:true,userid:user.user_id})

})


//Signup post method ----- Input sanitization required
app.post('/user/signup',notLoggedin,async(req,res)=>{
    let name=req.body.name;
    let username=req.body.username;
    let address=req.body.address;
    let ph=req.body.ph;
    let pin=req.body.pin;
    let password=req.body.password
    
    let user=await query("select * from User where user_name=?",[username])
    if(user.results.length>0){
          res.status(409).json({log_data:"Username already exists"})
          return
    }
    if(username===""){
          res.status(404).json({log_data:"Invalid Username"})
          return
    }
    username=username.toLowerCase()
    
    if(req.body.password===""){
          res.status(404).json({log_data:"Password cannot be empty"})
          return
    }
    password=await bcrypt.hash(req.body.password,10);
    try{
    user=await query("insert into User(user_name,pwd,Full_Name,addr,phone,pincode) values(?,?,?,?,?,?)",[username, password, name,address,ph,pin])
    }
    catch(err){
          res.send(404).json({log_data:"Server error"})
    }
    req.session.loggedin=true
    req.session.username=username
    req.session.userid=user.user_id
    req.session.save()
    res.status(202).json({log_data:"Account Created Successfully",username,loggedin:true})
})


//User logout method destroys the session created ---- FINAL
app.post('/user/logout',isLoggedin,(req,res)=>{
    req.session.destroy();
    res.status(200).json({log_data:"Logged out"})
})


app.post('/user/follow',isLoggedin,async(req,res)=>{
    let follower=req.session.userid, following=req.body.username
    try{
    let result=await query("insert into followers(user_id,follower_id) values((select user_id from User where user_name=?),(select user_id from User where user_id=?))",[following,follower])
    console.log(result)
    res.status(200).json({log_data:"Followed Successfully"})
    }
    catch(e){
        console.log(e)
        res.send(409)
    }
})

app.get('/user/following',isLoggedin,async(req,res)=>{

    let followers=await query("select user_name from User where user_id in (select user_id from followers where follower_id=(select user_id from User where user_name=?))",[req.session.username])
    console.log(followers)
    if(followers)
        if(followers.length>0)
            {  
             followers=JSON.parse(JSON.stringify(followers.result))
             res.send(200).json({followers})
            }
    else{
        
    }

})

app.get('/user/followers',isLoggedin,async(req,res)=>{

    let user=await getUser(req.session.username)
    let followers=await query("select user_name from User where user_id in (select user_id from followers where follower_id=?)",[user.user_id])
    if(followers)
        if(followers.length>0)
            {  
             followers=JSON.parse(JSON.stringify(followers.result))
             res.send(200).json({followers})
            }

})


//Posts display
app.get('/feed/posts/:id',async (req,res)=>{
    let user_id=req.params.id;
    // console.log(user_id)
    let posts=await query("select * from posts where user_id in (select user_id from followers where follower_id=?)",[user_id])
    posts=JSON.parse(JSON.stringify(posts.results))
    let arr=[]
    let loop=async()=>{
    for await(let post of posts)
    {
        let user=await query("select user_name from User where user_id=?",[post.user_id])
        let item=await query("select * from items where item_id=?",[post.item_id])
        user=JSON.parse(JSON.stringify(user.results[0]))
        item=JSON.parse(JSON.stringify(item.results[0]))
        post={...post,user,item}
        arr.push(post)
    }
    return posts
    }
    posts=await loop()

    res.status(200).json({posts:arr})
})

app.get('/search/:name',async(req,res)=>{
    let name=req.params.name;
    console.log(name)
    let posts=await query("select * from posts where item_id in (select item_id from items where item_name=?)",[name])
    posts=JSON.parse(JSON.stringify(posts.results))
    let arr=[]
    let loop=async()=>{
    for await(let post of posts)
    {
        let user=await query("select user_name from User where user_id=?",[post.user_id])
        let item=await query("select * from items where item_id=?",[post.item_id])
        user=JSON.parse(JSON.stringify(user.results[0]))
        item=JSON.parse(JSON.stringify(item.results[0]))
        post={...post,user,item}
        arr.push(post)
    }
    return posts
    }
    posts=await loop()

    res.status(200).json({posts:arr})

})

app.get('/feed',isLoggedin,(req,res)=>{
    
})



app.listen(9000, (err,res)=>{
    if(err)
        throw err;
    console.log(res)

})

