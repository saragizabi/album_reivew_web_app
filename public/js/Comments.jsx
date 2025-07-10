import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const Comments = ({ albumId }) => {
  // initialize state variables (4)
  // useState --> return array containing two val
  // varaible containing val + fxn to replace val 
  // list of comments
  const [comments, setComments] = useState([]);
  // new user comment (string)
  const [newComment, setNewComment] = useState('');
  // bool vale 
  const [loading, setLoading] = useState(true);

  // useEffect --> allows side effects within functional components
  // callback fxn as first arg (can use fetch)
  // call after dom updated -> immidieately get new comments 
  // seconf arg = dependency array 
  // set to an Array composed of variables that will cause the 
  // function to be called when the variables changes 
  // use album id !! -> to get specific comments for an album
  useEffect(() => {
    fetchComments();
  }, [albumId]);

  // fxn toget all comments (for display)
  // call fetch in this fxn (not in useEffect)
  const fetchComments = async () => {
    try {
      // loading is true (getting comments)
      setLoading(true);
      const res = await fetch(`/api/albums/${albumId}/comments`);
      
      if (res.status < 200 || res.status >= 300) {
        throw new Error('Failed to fetch comments');
      }
      // data from fetch 
      const data = await res.json();
      // send to comments list + loading is over (recieved comments)
      setComments(data);
      // loading over 
      setLoading(false);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setLoading(false);
    }
  };

  // fxn for button event (post comment)
  const handleSubmit = async (e) => {
    // get rid of default submision behavior
    // not regular button mechanics 
    e.preventDefault();
    
    // if comment is empty or only whitespace
    if (newComment.trim() === '') {
      // dont add !!
      return; 
    }
    
    try {
      // fetch (send header info --> json info)
      const res = await fetch(`/api/albums/${albumId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      });
      
      // status code must be in 200s --> else error (cant add comment)
      if (res.status < 200 || res.status >= 300) {
        throw new Error('Failed to add comment');
      }
      
      // comment info 
      const addedComment = await res.json();
      
      // add the new comment to the state (list)
      setComments([...comments, addedComment]);
      // refresh (set blank)
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // return the main div (with nested elements)
  // use IIFE fxn to show comments
  // check if loading -> show text 
  // else -> no comments other text
  // else -> return the comments (map the comments arr as list)
  // use form to add comment (when click button)
  return (
    <div className="comments-section">
      <h3>Comments</h3>
      
      { (() => {

        if (loading) {
          return <p>Loading comments...</p>;
        } 
        else if (comments.length === 0) {
          return <p>No comments yet.</p>;
        } 
        else {
          return (
            <ul className="comments-list">
              {comments.map((comment) => (
                <li key={comment._id} className="comment">
                  <div className="comment-header">
                    <span className="comment-user">{comment.user.username}</span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="comment-text">{comment.text}</div>
                </li>
              ))}
            </ul>
          );
        }

      })() }
      
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          required
        />
        <button type="submit">Add Comment</button>
      </form>

    </div>
  );
};

// now use react app (when page loads -> load into comment container from hbs file)
document.addEventListener('DOMContentLoaded', () => {
  // get div from hbs 
  const commentContainer = document.getElementById('comments-container');
  
  if (commentContainer) {
    // get the specific album
    const albumId = commentContainer.getAttribute('data-album-id');
    // create a root for displaying react comp !!
    const root = createRoot(commentContainer);
    // add in createde comment element
    root.render(<Comments albumId={albumId} />);
  }
});