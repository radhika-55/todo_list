// const mongoose = require("mongoose");

// const conn = async () => {
//     try {
//         await mongoose.connect(
//         "mongodb+srv://laguduradhika23it_db_user:7pJEaGOT4ZlSeqMT@cluster0.wwlvmay.mongodb.net/"
//         );

//         console.log("connected");
//     } catch (error) {
//         console.log("not connected");
//         console.log(error.message);
//     }
// };

// module.exports = conn;

const mongoose = require("mongoose");

const conn = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://laguduradhika23it_db_user:7pJEaGOT4ZlSeqMT@cluster0.wwlvmay.mongodb.net/mern_todo"
        );

        console.log("connected");
    } catch (error) {
        console.log("not connected");
        console.log(error.message);
    }
};

module.exports = conn;

