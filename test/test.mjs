//mocha + chai -- unit testing (4 tests min)

// necessary imports (esp with the mongodb login)
import { expect } from 'chai';
import request from 'supertest';
import { app } from '../app.mjs';
import mongoose from 'mongoose';
import { User, Album } from '../db.js'; 
import bcrypt from 'bcrypt';

describe('Album Routes', function () {
    // necessary info for login (connect to mongodb w test)
    let user;
    let testPassword = 'testing123';
    let testUsername = 'testingUser'; 
    let testAlbumTitle = 'Test Album'; 
    
    before(async () => {
        // connect to mongo db
        await mongoose.connect(process.env.DSN, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        
        // salt + hash the pw 
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(testPassword, salt);
        
        // create test user w/ hashed password
        user = new User({
            username: testUsername,
            password: hashedPassword,
        });
        await user.save();

        // create test album with all fields 
        await Album.create({
            title: testAlbumTitle,
            user: user._id,
            genre: 'Test Genre',
            artist: 'Test Artist',
            description: 'Test description'
        });
    });

    after(async () => {
        // delete the test user + album after test (so doesnt clutter)
        await User.deleteMany({ username: testUsername});
        await Album.deleteMany({ title: testAlbumTitle});
        await mongoose.disconnect();
    });

    // tests start -------------------
    describe('POST /login', function() {
        // 1 (check if login works + takes u to main page)
        it('should redirect to /albums after login', async function() {
            const agent = request.agent(app);
            
            // login w test username + pw (post request)
            const response = await agent
                .post('/login')
                .type('form')
                .send({
                    username: testUsername,
                    password: testPassword
                });
            
            // login redirects to /albums page (302)
            expect(response.status).to.equal(302);
            expect(response.header.location).to.equal('/albums');
        });
        
        // 2 (if login fails -> error)
        it('should show error when fail login', async function() {
            
            // login w test username + pw (post request)
            const response = await request(app)
                .post('/login')
                .type('form')
                .send({
                    username: testUsername,
                    password: 'wrongPassword'
                });
            
            expect(response.status).to.equal(200);
            expect(response.text).to.include('PASSWORDS DO NOT MATCH');
        });
    });

    describe('GET /albums', function () {
        // 3 when go to main pg -> should display the test album
        it('should return album list page with test album', async function () {
            const agent = request.agent(app);
            
            // login w test username + pw (post request)
            const response = await agent
                .post('/login')
                .type('form')
                .send({
                    username: testUsername,
                    password: testPassword
                });
            
            // login redirect -> /album
            expect(response.status).to.equal(302);
            const albumResponse = await agent.get('/albums');
            
            // check that the test album is displayed there 
            expect(albumResponse.status).to.equal(200);
            expect(albumResponse.text).to.include(testAlbumTitle);
        });
    });
        
    describe('GET /albums/:id', function() {
        // 4 when click on albums (more details -> get info)
        it('should show details of a specific album', async function() {
            const agent = request.agent(app);
            
            // login w test username + pw (post request)
            await agent
                .post('/login')
                .type('form')
                .send({
                    username: testUsername,
                    password: testPassword
                });
            
            // get album ID from the database (using title)
            const album = await Album.findOne({ title: testAlbumTitle });
            const albumId = album._id.toString();
            
            // find the test album using id 
            const response = await agent.get(`/albums/${albumId}`);
            // if return 200 -> means stored correctly in db (works)
            expect(response.status).to.equal(200);
        });
    });
});