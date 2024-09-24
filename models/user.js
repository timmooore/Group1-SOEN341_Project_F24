const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    user_type: {
        type: String,
        enum: ['student', 'instructor'], //Only allows users to be "students" or "instructors"
        required: true
    }
});

/* Note: 
No need to specify username or password, since passport does it for us.
Passport also makes sure the usernames are unique & offers several methods onto our Schema */
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);