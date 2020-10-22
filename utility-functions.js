const fs = require("fs");


const searchForUser = (userData, users, paramsId) => {
    const userUpdatedAnswers = userData.answers;
    updateUserAnswers(userUpdatedAnswers,users, paramsId);
}

const updateUserAnswers = (userUpdatedAnswers,users,paramsId) => {
    for (let i = 0; i < users.length; i++) {
        if (Number(users[i].id) === Number(paramsId)) {
            users[i].answers = userUpdatedAnswers;

            const user = JSON.parse(readFromFile(`users/${users[i].name}.json`)); //updating the specific user file as well

            user.answers = userUpdatedAnswers;
            console.log(`user's updated answers: ${user.answers}`);
            const userBackToJson = JSON.stringify(user);
            fs.writeFileSync(`users/${users[i].name}.json`, userBackToJson);
            break;
        }
    }
}

const checkIfUserExists = (users, userName) => {
    //check if username exists, if it does, open/create `friends answer` file
    for (let i = 0; i < users.length; i++) {
        if (userName === users[i].name) {
            return users[i];
        }
    }
}


const readFromFile = (filename) => {
    const dataBuffer = fs.readFileSync(filename);
    const dataJSON = dataBuffer.toString();
    return dataJSON;
}


module.exports = {
    searchForUser,
    checkIfUserExists,

}