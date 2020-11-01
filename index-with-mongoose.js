const express = require("express");
const bodyParser = require("body-parser");
require("./mongoose");
const User = require("./models/user");
const Question = require("./models/question");
const FriendsAnswers = require("./models/user-friends-answers");

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 7000;

let users;

//get questions&answers
app.get("/questions", async(req, res) => {
    try {
        const questions = await Question.find({});
        res.send(questions);
    }
    catch(e) {
        res.status(500).send();
    }
})

app.post("/question/create", async(req, res) => {
    const question = new Question(req.body);
    //async await
    try {
        await question.save()   //save the user
        res.status(201).send(question);
    }
    catch (e) {
        res.status(400).send(e);
    }
    console.log(question);
})

//get all users from file
app.get("/users", async(req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    }
    catch(e) {
        res.status(500).send();
    }
})


//get user by id from all users file
app.get("/user/:id", async(req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if(!user) {
            return res.status(404).send();
        }
        res.send(user);
    }
    catch (e) {
        res.status(500).send()
    }
})

//get user by name
app.get("/userbyname/:name/:id", async(req, res) => {
    const name = req.params.name;
    const _id = req.params.id;
    try {
        const user = await User.find({name, _id});
        console.log(user);
        if(user.length === 0) {
            return res.status(404).send();
        }
        res.send(user);
    }
    catch (e) {
        res.status(500).send()
    }
})

//create new user with his answers
app.post("/user/create", async(req, res) => {
    const user = new User(req.body);
    //async await
    try {
        await user.save()   //save the user
        res.status(201).send(user);
    }
    catch (e) {
        res.status(400).send(e);
    }
    console.log(user);
})

//user's quiz link //
app.get("/:username/:userid/answerquiz"), async(req,res) => {
    console.log("in");
    const name = req.params.username;
    const _id= req.params.userid;
    try {
        const user = await User.find({name,_id});
        console.log(user);
        if(!user) {
            return res.status(404).send();
        }
        res.send(user);
    }
    catch (e) {
        res.status(500).send()
    }
}

//post request with a user's friend guesses for answers
app.post("/:username/:userid/answerquiz", async (req, res) => { 
    let name = req.params.username;
    let _id = req.params.userid;
    try {
        const user = await User.find({name, _id});
        console.log(user);
        if(!user) {
            return res.status(404).send();
        }
        const friendAnswers = new FriendsAnswers(req.body);

        if(friendAnswers.userName !== name) {
            return res.status(500).send()
        }
        await friendAnswers.save()  //save friend's answers to friend's answers collection
        res.status(201).send(friendAnswers);
    }
    catch(e) {
        res.status(500).send()
    }
})


//get all friends rank's for specific user
app.get("/:username/:userid/friendsrank", async(req, res) => { 
    const name = req.params.username;
    const _id = req.params.userid;
    try {
        let rank = 0;
        const friendsRank = [];
        const friendsAnswers = await FriendsAnswers.find({userName : name})
        let userAnswers = await User.find({name, _id});
        userAnswers = userAnswers[0]; //User.find returns an array

        for (let i=0; i < friendsAnswers.length; i++) { //iterating over friends list
            for (let j = 0; j < friendsAnswers[i].answers.length; j++) { //iterating over each friend's guesses
                if (friendsAnswers[i].answers[j] === userAnswers.answers[j]) { // checking how many guesses are correct
                    rank++;
                }
            }
            const friend = {
                name: friendsAnswers[i].friendName,
                rank: rank,
            }
            console.log("friend:", friend);
            friendsRank.push(friend);
            rank = 0;
        }
        friendsRank.sort((a, b) => (a.rank > b.rank) ? -1 : 1);
        res.send(friendsRank);

    } catch (e) {
        res.send("error");
    }
})



app.listen(port, () => {
    console.log("server up on port " + port);
})