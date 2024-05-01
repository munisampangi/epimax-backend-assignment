const sqlite=require('sqlite3').verbose();
const db=new sqlite.Database("./quote.db",sqlite.OPEN_READWRITE,(err)=>{
    if(err) return console.error(err)
});


// 
 
const sql2=`create table users(ID integer primary key autoincrement,username text,password_hash text)`;
db.run(sql2)

const sql=`create table tasks(ID integer primary key,title text,description text,status text,assignee_id integer,created_at datetime,updated_at datetime,foreign key(assignee_id)references users(id))`;
db.run(sql)
// const sql=`drop table tasks`;
// db.run(sql)