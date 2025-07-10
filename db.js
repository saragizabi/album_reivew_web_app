import mongoose from 'mongoose';
import mongooseSlugPlugin from 'mongoose-slug-plugin';

// users
// users can register and log in w/ username + pw
// users have their own reviews (as many as wanted)
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    //need to hash for authentication
    password: { type: String, required: true }, 
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }]
});

// song (embedded within album)
// each album contains multiple
// each song has a title + rating (1-10)
const SongSchema = new mongoose.Schema({
    title: { type: String, required: true },
    rating: { type: Number, min: 0, max: 10, required: true }
}, { 
    _id: true 
}); 

// album
// each album (review) belongs to a user (reference)
// has an array of songs (embedded)
const AlbumSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    title: { type: String, required: true },
    artist: { type: String, required: true },
    genre: { type: String, required: true }, 
    //optional -> leave a description/any comments
    description: { type: String }, 
    //each album can contain 0 or more songs 
    songs: [SongSchema], 
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], 
});

// comment
// comments are linked to a specific album AND user
const CommentSchema = new mongoose.Schema({
    // comment should refer user (username) and album 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who commented
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true }, // Reference to the album being commented on
    text: { type: String, required: true }, 
    //include time stamp
    createdAt: { type: Date, default: Date.now }
});

//figure out to slug title later
AlbumSchema.plugin(mongooseSlugPlugin, {tmpl: '<%=title%>'});

// register models --> should export to apap.mjs
const User = mongoose.model('User', UserSchema);
const Album = mongoose.model('Album', AlbumSchema);
const Comment = mongoose.model('Comment', CommentSchema);

//https://blog.appsignal.com/2023/08/09/how-to-use-mongodb-and-mongoose-for-nodejs.html

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DSN, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

export { connectDB, User, Album, Comment };