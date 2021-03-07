const mysql=require("mysql");
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

module.exports={

}
