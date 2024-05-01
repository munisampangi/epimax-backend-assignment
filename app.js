const express=require("express")
const bodyParser=require("body-parser")
const jwt=require("jsonwebtoken")
const app=express()
const bcrypt=require("bcrypt")
const url=require('url')
const sqlite=require('sqlite3').verbose()
const db=new sqlite.Database("./quote.db",sqlite.OPEN_READWRITE,(err)=>{
    if(err) return console.error(err)
    console.log('server is running')
});
let sql;
app.use(bodyParser.json())

// register request
app.post("/users",async(req,res)=>{
    try{
        const {username,password_hash}=req.body
        const hashedPassword= await bcrypt.hash(password_hash,10)
        sql=`select * from users where username = "${username}";`;

       db.get(sql,[],(err,row)=>{
        if (err) return console.error(err)
        
        if (row===undefined){
            const userQuery=`insert into users(username,password_hash) values(?,?);`
            db.run(userQuery,[username,hashedPassword],(err)=> console.log(err))
            res.send(`user Created Successfully having ${hashedPassword}`)
                    }
        else{
            return res.send("user already exits")
            
                    }
})}
    catch(error){
        console.log(error)
        return res.json({
            status:400,
            success:false
        });
    }
})

// request of user login 
app.post("/login",async(req,res)=>{
    try{
        const {username,password_hash}=req.body;
        sql=`select * from users where username ='${username}';`;
        db.get(sql,[],async(err,row)=>{
            if(err) return res.json({status:300,success:false})
            if (row===undefined){
                 res.send("invalid username and password")
            }
            else{
                const isPasswordMatch= await bcrypt.compare(password_hash,row.password_hash)
                
                if(isPasswordMatch===true){
                    const payload={
                        username:username
                    };
                    const jwtToken=jwt.sign(payload,"MY_SECRET_TOKEN")
                    res.send({jwtToken})
                }
                 console.log(`the userrname is ${row.username} and password is ${row.password_hash} `)
                //  res.send(`login success of user ${row.username}`)
            }

           
        })
    }
    catch{
        console.log(error)
        return res.json({
            status:400,
            success:false
        });
    }
})
// middleWare 
const middleWare=(req,res,next)=>{
    let jwtToken;
        const authHeader=req.headers["authorization"]
        if (authHeader!== undefined){
            jwtToken=authHeader.split(" ")[1]
        }
        if (jwtToken===undefined){
            res.send("invalid access token")
        }
        else{
            next();
        }
}

// post request of the task
app.post("/tasks",middleWare,(req,res)=>{
    try{
            const {title,description,status,assignee_id,created_at,updated_at}=req.body
       sql=`insert into tasks(title,description,status,assignee_id,created_at,updated_at) values(?,?,?,?,?,?)`
       db.run(sql,[title,description,status,assignee_id,created_at,updated_at],(err)=>{
        if (err) return res.json({status:300,success:false})
        console.log(`successful insert into table`)
       })
       return  res.json({
           status:200,success:true,name:"muni"
        })
    }
    catch (error){
    return res.json({
        status:400,
        success:false
    });
    }
})
// get request
app.get("/tasks/:id",middleWare,(req,res)=>{
    sql=`select * from tasks`;
    try{
           const {id}=req.params//query parameters
             sql+=` where id = ${id}`
            db.all(sql,[],(err,rows)=>{
              if(err) return console.log(err)
      
              
              return res.json({status:200,data:rows,success:true})
            })
    }
    catch (error){
        console.log(error)
        return res.json({
            status:400,
            success:false
        });
    }
})
app.get("/tasks",middleWare,(req,res)=>{
    sql=`select * from tasks`;
    try{
           const queryObj=url.parse(req.url,true).query//query parameters
            if (queryObj.key && queryObj.value) sql+=` where ${queryObj.key} like '%${queryObj.value}%'`
            db.all(sql,[],(err,rows)=>{
              if(err) return res.json({
                  status:200,
                  success:false
              })
      
              
              return res.json({status:200,data:rows,success:true})
            })
    }
    catch (error){
        console.log(error)
        return res.json({
            status:400,
            success:false
        });
    }
})
// delete request
app.delete("/tasks/:id",middleWare,(req,res)=>{
    sql=`delete  from tasks`;
    
    try{
        const {id}=req.params//query parameters
        sql+=` where id = ${id}`
      db.all(sql,[],(err,rows)=>{
        console.log(err)
        if(err) return res.json({
            status:200,
            success:false
        })

        
        return res.json({status:200,data:rows,success:true})
      })
      
    }
    catch (error){
        console.log(error)
        return res.json({
            status:400,
            success:false
        });
    }
})

// put request
app.put("/tasks/:id",middleWare,(req,res)=>{
    
    
    try{
    const  {id}=req.params
    const {title,description,status,assignee_id,created_at,updated_at}=req.body
    sql=`update tasks set title='${title}',
    description="${description}",
    status='${status}',
    assignee_id=${assignee_id},
    created_at='${created_at}',
    updated_at='${updated_at}' 
    where id=${id};`;
      
      db.all(sql,[],(err,rows)=>{
        console.log(err)
        if(err) return res.json({
            status:200,
            success:false
        })

        
        return res.json({status:200,data:rows,success:true})
      })
      
    }
    catch (error){
        console.log(error)
        return res.json({
            status:400,
            success:false
        });
    }
})

app.listen(3000)