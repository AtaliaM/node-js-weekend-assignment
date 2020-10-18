const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 7000;

let users;
let questions;
let nextIndex;

//get questions&answers
app.get("/questions", (req, res) => {
    try {
        questions = JSON.parse(readFromFile("questions-w-answers.json"));
        res.send(questions);
    } catch (e) {
        return [];
    }
})

//get all users from file
app.get("/users", (req, res) => {
    try {
        users = JSON.parse(readFromFile("users.json"));
        res.send(users);
    } catch (e) {
        return [];
    }
})


//get user by id from all users file
app.get("/user/:id", (req, res) => {
    let user;
    try {
        users = JSON.parse(readFromFile("users.json"));
        user = users.filter(user => Number(user.id) === Number(req.params.id));

        if (user.length !== 0) {
            res.send(user[0]);
        }
    } catch (e) {
        res.send("no user with this id");
    }
})

//add user updated answers
app.put("/user/:id", (req, res) => {
    users = JSON.parse(readFromFile("users.json"));
    const userData = req.body;
    if (Number(userData.id) === Number(req.params.id)) {
        const userUpdatedAnswers = userData.answers;
        console.log(userUpdatedAnswers);
        for (let i = 0; i < users.length; i++) {
            if (Number(users[i].id) === Number(req.params.id)) {
                users[i].answers = userUpdatedAnswers;

                const user = JSON.parse(readFromFile(`users/${users[i].name}.json`)); //updating the specific user file as well

                user.answers = userUpdatedAnswers;
                console.log(`user's updated answers: ${user.answers}`);
                const userBackToJson = JSON.stringify(user);
                fs.writeFileSync(`users/${users[i].name}.json`, userBackToJson);
                break;
            }
        }
        const backtojson = JSON.stringify(users);
        fs.writeFileSync("users.json", backtojson);
        res.status(200);
        res.send(users);
    }
    else {
        res.send("error");
    }
})

//get user from user file
app.get("/userbyname/:name", (req, res) => {
    let user;
    try {
        console.log(req.params.name);

        user = JSON.parse(readFromFile(`users/${req.params.name}.json`));
        res.send(user);

    } catch (e) {
        res.send("no user with this name");
    }
})

//create new user with his answers
app.post("/user/create", (req, res) => {
    const userData = req.body;

    users = JSON.parse(readFromFile("users.json"));
    nextIndex = users[users.length - 1].id + 1; //next available index

    const isNameTaken = users.filter(user => user.name === userData.name);
    if (isNameTaken.length !== 0) {
        return res.send("this user name is already taken");
    }

    if (userData.name && userData.location && userData.answers && userData.answers.length === 5 && Object.keys(userData).length === 3) {
        const newUser = {
            name: userData.name,
            id: nextIndex,
            location: userData.location,
            answers: userData.answers,
        }
        users.push(newUser);

        const backtojson = JSON.stringify(users);
        fs.writeFileSync("users.json", backtojson);
        res.status(200);
        res.send(users);

        const newUserJason = JSON.stringify(newUser);
        fs.writeFileSync(`users/${userData.name}.json`, newUserJason); //creating new file to the new user
        fs.writeFileSync(`users-friends-answers/${userData.name}-friends-answers.json`,""); //creating new file for user's friends answers
    }
    else {
        res.send("error");
    }
})


//post request with a user's friend guesses for answers
app.post("/:username/answerquiz/:friendsname", (req, res) => {
    let currentUser;
    let friendData = req.body;

    questions = JSON.parse(readFromFile("questions-w-answers.json"));
    users = JSON.parse(readFromFile("users.json"));
   
    //check if username exists, if it does, open/create `friends answer` file
    for (let i = 0; i < users.length; i++) {
        if (req.params.username === users[i].name) {
            currentUser = users[i];
            console.log("found user!");
            break;
        }
    }////
    if (currentUser === undefined) {
        return res.send("there isn't a user with that name");
    }

    let friendsAnswers = readFromFile(`users-friends-answers/${currentUser.name}-friends-answers.json`);
    if (friendsAnswers) {
        friendsAnswers = JSON.parse(friendsAnswers);
    }
    else {
        friendsAnswers = [];
    }
    
    if (friendData.name && friendData.location && friendData.answers && friendData.answers.length === 5 && Object.keys(friendData).length === 3) {
        const friendsdetails = {
            name: friendData.name,
            location: friendData.location,
            answers: friendData.answers,
        }
        friendsAnswers.push(friendsdetails); //push current friend answers to user's friend's file

        const backtojson = JSON.stringify(friendsAnswers);
        fs.writeFileSync(`users-friends-answers/${currentUser.name}-friends-answers.json`, backtojson);
        res.status(200);
        res.send(friendsAnswers);
    }
    else {
        res.send("error");
    }
})

//get friend rank for specific user questions
app.get("/:username/rank/:friendname", (req, res) => { //need to take care of friends with same name
    try {
        let rank = 0;
        const friendsAnswers = JSON.parse(readFromFile(`users-friends-answers/${req.params.username}-friends-answers.json`));
        const userAnswers = JSON.parse(readFromFile(`users/${req.params.username}.json`));
        const friend = friendsAnswers.filter(friend => friend.name === req.params.friendname);
        if (friend.length>=1 && userAnswers) {
            console.log("found friend");
            for (let i=0; i< friend[0].answers.length; i++) {
                if (friend[0].answers[i] === userAnswers.answers[i]) {
                    rank++;
                }
            }
            res.send(`${friend[0].name}'s rank is: ${rank}`);
        }
        res.send(`no friend with name ${req.params.friendname} answered this quiz`);
    } catch (e) {
        res.send("error");
    }
})


const readFromFile = (filename) => {
    const dataBuffer = fs.readFileSync(filename);
    const dataJSON = dataBuffer.toString();
    return dataJSON;
}


app.listen(port, () => {

    console.log("server up on port " + port);

}) //starts up the server and sending callback func that runs when the server is up and running