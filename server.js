
const express = require("express");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
const path = require('path')

const MongoClient = require("mongodb").MongoClient;

const url = ""
let db;


var cors = require('cors');
app.use(cors({credentials: true, origin: true}));
app.get("/",function(req,res){
res.send("leaderboard");
});

(async() => {
  let client = await MongoClient.connect(
	url,
	{useNewUrlParser: true }
);

db = client.db("Geode");

app.listen(PORT, async function() {
 console.log(`Listening on Port ${PORT}`);
 if (db) {
    console.log("connected");
  }
 });
})();


app.use(express.static(path.join(__dirname, 'cave')));
app.get('/cave',function(req,res){
  res.sendFile(path.join(__dirname+'/cave/index.html'));
});

//Route to create new player
app.post("/geode",async function(req,res){
	let {username, uid, start_time, session} = req.body;
	const alreadyExisting = await db
        	.collection("geode")
	   	.findOne({username: username})

	if (alreadyExisting){
		res.send({status: false, msf: "player usename already exists"});
	}
	else{
	//create new
		await db.collection("geode").insertOne({username, uid, start_time, session});
//		console.log(`Created player ${username}`);
		res.send({ status:true, msg:"player created"});
	}
	});

app.put("/geode",async function(req,res){
let {username, uid, start_time, session} = req.body;
//check if username already exists
const alreadyExisting = await db
	.collection("geode")
	.findOne({username:username});
if(alreadyExisting){
//update player object w the username
	await db
		.collection("geode")
		.updateOne({username},{$set:{username, uid, start_time, session}});
//	console.log(`Player ${username} score updated to ${score}`);
	res.send({status:true, msg:"player score updated"});
}
else{
	res.send({status:false, msg:"player username not found"});
}
});

//delete player
app.delete("/geode",async function(req,res){
	let {username, uid, start_time, session} = req.body;
	//check if usrname already exists
	const alreadyExisting = await db
		.collection("geode")
		.findOne({username:username});
	if(alreadyExisting){
		await db.collection("geode").deleteOne({username});
//		console.log(`Player ${username} deleted`);
		res.send({ status:true, msg:"player deleted"});
	}
	else{
		res.send({status: false, msg:"username not found"});
	}
});

//Leaderboard
//access the leaderboard
app.get("/geode",async function(req,res){
//retrieve lim from the query string info
	let {lim} = req.query;
	db.collection("geode")
	  .find()
	  .sort({hc:-1})	
	  .limit(parseInt(lim,1))
	  .toArray(function(err, result){
		if(err)
			res.send({status:false, msg:"failed to retrieve players"});
		//console.log(Array.from(result));
		res.send({status:true, msg:result });;
	});
});


