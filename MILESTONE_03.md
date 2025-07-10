Milestone 03
===

Repository Link
---
[github repo - saragizabi](https://github.com/nyu-csci-ua-0467-001-002-spring-2025/final-project-deployment-saragizabi/tree/master)

URL for form 1 (from previous milestone) 
---
there's a form for registering account and a form for adding a new album:
- link to adding a new album: http://localhost:3000/albums/new
- link to register account: http://localhost:3000/

Special Instructions for Form 1
---
to login you can either:
1. click on login button (initial page just leads to register form) and use these credentials --> username:testuser and password:hello123
2. register with own information --> will immidiately be redirected to main page, you can then logout and re-login with the credentials you used

URL for form 2 (for current milestone)
---
there's a form for adding songs to an existing album (created by user), can go to my reviews page, click on view details and then add songs button:
- link to adding songs to existing album: http://localhost:3000/albums/:id/add-songs

Special Instructions for Form 2
---
same login as form 1 but !!! 
- important info for testing registration -> username and password BOTH must be at least 8 characters.
test login: --> username:testuser and password:hello123
- (** also quick question: i dont know if i can get points back but last milestone because i got points off for the grader not being able to register. i was able to register fine but i think it was because i forgot to mention that the username and password must both be at least 8 charas or it will not create account (error was sent to console but not to actual web page) which may have been the issue.)

URL(s) to github repository with commits that show progress on research
--- 
- link to mocha test file [test.mjs](https://github.com/nyu-csci-ua-0467-001-002-spring-2025/final-project-deployment-saragizabi/blob/master/test/test.mjs) (test with: npx mocha test/test.mjs)
- link to login page which implements css bootstrap template (fixed + cleaned up the code from before) [index.hbs](https://github.com/nyu-csci-ua-0467-001-002-spring-2025/final-project-deployment-saragizabi/blob/master/views/index.hbs) (register page was updated as well)
- also still figuring out how to implement react.js into my code (havent changed file directory yet) though may switch to a diff topic 

References
---
[adding section to html](https://stackoverflow.com/questions/64930946/how-to-add-a-group-of-html-elements-by-a-button-click) - in the addSongs.hbs file i looked into this stack discussion when looking into how to add multiple songs at a time to form (DOM manipulation)
```javascript
<script>
    document.getElementById('add-more-btn').addEventListener('click', function() {
        const container = document.getElementById('songs-container');
        const newSongEntry = document.createElement('div');
        newSongEntry.className = 'song-entry';
        newSongEntry.innerHTML = `
            <div class="form-group">
                <label for="title">Song Title:</label>
                <input type="text" name="title" required>
            </div>
            <div class="form-group">
                <label for="rating">Rating (1-10):</label>
                <input type="number" name="rating" min="1" max="10" required>
            </div>
            <button type="button" class="remove-song-btn">Remove</button>
        `;
        container.appendChild(newSongEntry);

        // Add event listener to the remove button
        newSongEntry.querySelector('.remove-song-btn').addEventListener('click', function() {
            container.removeChild(newSongEntry);
        });
    });
</script>
```
