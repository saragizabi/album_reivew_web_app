import './config.mjs';
import { connectDB, User, Album, Comment } from './db.js';
import sanitize from 'mongo-sanitize';

import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from "url";
import { config } from 'dotenv'
import bcrypt from 'bcrypt'; 

export const app = express();

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret-key', 
    resave: false,
    saveUninitialized: true
  }));

//connect to specific mongodb 
connectDB(); 

// index page is just register page 
app.get('/', (req, res) => {
    res.render('index'); 
});
  
// login page
app.get('/login', (req, res) => {
    res.render('login');
});

// login form 
app.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        
        // debug if need
        console.log("username", username)
        console.log("password", password)
        
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.render('login', {error: "USER NOT FOUND"});
        }

        const pw = await bcrypt.compare(password, user.password);
        if (!pw) {
            return res.render('login', {error: "PASSWORDS DO NOT MATCH"});
        }

        req.session.userId = user._id;

        res.redirect('/albums');
    } catch (err) {
        console.log(err);
        res.render('login', {error: "Login error. Please try again!"});
    }
});

//register form 
app.post('/register', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if(username.length < 8 && password.length < 8){
            return res.render('index', {error: "USERNAME/PASSWORD TOO SHORT, MUST BOTH BE AT LEAST 8 CHARAS"});
        }

        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.render('index', {error: "USERNAME ALREADY EXISTS"});
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const newUser = new User({ username, password: hash });
        await newUser.save();

        req.session.userId = newUser._id;

        res.redirect('/albums');
    } catch (err) {
        console.log(err);
        res.render('index', {error: "Registration error. Please try again!"});
    }
});

// logout --> back to register 
app.get('/logout', (req, res) => {
    res.redirect('/');
});

//main page --> shows username + all album reviews 
app.get('/albums', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    try {
        const user = await User.findById(req.session.userId);
        const albums = await Album.find().populate('user');
        res.render('albumsList', { albums, username: user.username });
    } catch (err) {
        res.render('albumsList', {error: "Error with album reviews"});
    }
});

// add new album 
app.get('/albums/new', (req, res) => {
    res.render('addAlbum');
});

// form for adding new album 
app.post('/albums/new', async (req, res) => {
    try {        
        if (!req.session.userId) {
            return res.status(401).send("You must be logged in to add an album review.");
        }

        const newAlbum = new Album({
            user: sanitize(req.session.userId), 
            title: sanitize(req.body.title),
            artist: sanitize(req.body.artist),
            genre: sanitize(req.body.genre),
            description: sanitize(req.body.description),
        });

        await newAlbum.save();
        res.redirect('/albums');
    } catch (err) {
        res.render('addAlbum', {error: "Error adding album review"});
    }
});

// form to delete album
app.post('/albums/:id/delete', async (req, res) => {
    // be logged in first 
    if (!req.session.userId) {
        return res.redirect('/');
    }

    try {
        // find the specific album 
        const album = await Album.findById(req.params.id);

        if (!album) {
            return res.status(404).send("Album not found!");
        }

        // does the user match 
        if (album.user.toString() !== req.session.userId) {
            return res.status(403).send("Can only delete albums you create!");
        }

        // delete album
        await Album.findByIdAndDelete(req.params.id);

        res.redirect('/albums');
    } catch (err) {
        res.render('albumDetails', {error: "Error deleting album"});
    }
});

// specific album 
app.get('/albums/:id', async (req, res) => {
try {
    const album = await Album.findById(req.params.id).populate('user');
    if (!album) return res.status(404).send("Album not found!");

    // check if current user is the album owner 
    const isOwner = req.session.userId && album.user._id.toString() === req.session.userId;
        
    res.render('albumDetails', { album, isOwner });
} catch (err) {
    res.render('albumDetails', {error: "Error finding album"});
}
});


// show only the logged-in user's album reviews 
app.get('/myalbums', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    try {
        const user = await User.findById(req.session.userId);
        // find albums created by the current user ONLY (use id)
        const albums = await Album.find({ user: req.session.userId }).populate('user');
        res.render('myAlbums', { albums, username: user.username });
    } catch (err) {
        res.render('myAlbums', {error: "Error retrieving your album reviews"});
    }
});


// add songs (to ur albums only) ---------
// new form to add songs to existing album
app.get('/albums/:id/add-songs', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    try {
        const album = await Album.findById(req.params.id).populate('user');
        
        // check if album exists first
        if (!album) {
            return res.status(404).send("Album not found!");
        }
        
        // only add songs to album review YOU created (check w id)
        if (album.user._id.toString() !== req.session.userId) {
            return res.status(403).send("Only add songs to your own album review!");
        }
        
        res.render('addSongs', { album });
    } catch (err) {
        console.log(err);
        res.render('albumDetails', {error: "Error getting album"});
    }
});

// adding songs to an album -> post form
app.post('/albums/:id/add-songs', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    try {
        const album = await Album.findById(req.params.id);
        
        // existing album only !!
        if (!album) {
            return res.status(404).send("Album not found!");
        }
        
        // check if user (you) added this review
        if (album.user.toString() !== req.session.userId) {
            return res.status(403).send("You can only add songs to your own albums!");
        }
        
        // adding one song 
        if (typeof req.body.title === 'string') {
            const songTitle = sanitize(req.body.title);
            const songRating = parseInt(sanitize(req.body.rating));
            
            // add to db
            album.songs.push({
                title: songTitle,
                rating: songRating
            });
        } 

        // adding more than one song (more than 1 array)
        if (Array.isArray(req.body.title)) {
            // go thru the array of info 
            req.body.title.forEach((title, index) => {
                // find the rating
                const rating = req.body.rating[index];
                if (title && rating) {
                    // now with both info add to db
                    album.songs.push({
                        title: sanitize(title),
                        rating: parseInt(sanitize(rating))
                    });
                }
            });
        }
        
        await album.save();
        res.redirect(`/albums/${album._id}`);
    } catch (err) {
        console.log(err);
        res.render('addSongs', {error: "Error adding songs"});
    }
});

// get comments for review
app.get('/api/albums/:id/comments', async (req, res) => {
    try {
        // album id 
        const albumId = req.params.id;
        // get the comments (inlcl usernames)
        const album = await Album.findById(albumId).populate({
            path: 'comments',
            populate: { path: 'user', select: 'username' }
        });
        
        // existing album only !!
        if (!album) {
            return res.status(404).send("Album not found!");
        }
        
        // send a response 
        res.json(album.comments);
    } catch (err) {
        // send back error 
        res.json({ error: "Error getting comments" });
    }
});

// add new comment to album review
app.post('/api/albums/:id/comments', async (req, res) => {
    // must be logged in first to post comment (need username)
    if (!req.session.userId) {
        return res.redirect('/');
    }
    
    try {
        // get all the necessary info (album info, user info, comment)
        const albumId = req.params.id;
        const userId = req.session.userId;
        const commentText = sanitize(req.body.text);
        
        // adding new comment 
        const comment = new Comment({
            user: userId,
            album: albumId,
            text: commentText
        });

        await comment.save();
        
        // get the specific album
        const album = await Album.findById(albumId);
        // add comment to specific album's list 
        album.comments.push(comment._id);
        await album.save();
        
        // get back the comment w user info to post right away 
        const populatedComment = await Comment.findById(comment._id).populate('user', 'username');
        
        res.json(populatedComment);
    } catch (err) {
        // send back error 
        res.json({ error: "Error adding comment" });
    }
});

app.listen(process.env.PORT ?? 3000);
