Milestone 02
===

Repository Link
---
[github repo - saragizabi](https://github.com/nyu-csci-ua-0467-001-002-spring-2025/final-project-deployment-saragizabi/tree/master)

Special Instructions for Using Form (or Login details if auth is part of your project)
---
to login you can either:
1. click on login button (initial page just leads to register form) and use these credentials --> username:testuser and password:hello123
2. register with own information --> will immidiately be redirected to main page, you can then logout and re-login with the credentials you used

URL for form 
---
there's a form for registering account and a form for adding a new album:
- link to adding a new album: http://localhost:3000/albums/new
- link to register account: http://localhost:3000/

URL for form result
---
link that shows album name + artist appearing in main page: http://localhost:3000/albums
(if you click on view details it gives more info)

URL to github that shows line of code where research topic(s) are used / implemented
--- 
- link to starting test file (mocha unit testing) [test.js](https://github.com/nyu-csci-ua-0467-001-002-spring-2025/final-project-deployment-saragizabi/blob/master/test/test.js)
- link to register page which implements css bootstrap template (still needs to be fixed up) (login page also utilizes this) [index.hbs](https://github.com/nyu-csci-ua-0467-001-002-spring-2025/final-project-deployment-saragizabi/blob/master/views/index.hbs)

References 
---
[mongodb atlas fxn](https://blog.appsignal.com/2023/08/09/how-to-use-mongodb-and-mongoose-for-nodejs.html) - in the db.js file i used some sample code that helped me export a fxn to make it easier to connect to mongo db atlas in my main app.mjs
```javascript
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
```


