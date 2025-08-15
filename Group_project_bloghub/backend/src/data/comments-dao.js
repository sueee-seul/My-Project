import { getDatabase } from "./database.js";
import { createCommentNotification } from "./notifications-dao.js";
import dayjs from "dayjs";


//Create new comment
export async function createCommentWithMentions({content, articleId, userId}) {

    const db = await getDatabase();
    const createdAt = dayjs().format("YYYY-MM-DD HH:mm:ss");

    try{ 
        
    await db.run("BEGIN");

    //Save comments
    const result = await db.run(
        `INSERT INTO Comments (content, created_at, article_id, user_id)
        VALUES (?, ?, ?, ?)`,
        content, createdAt, articleId, userId
    );

    console.log(result);

    const commentId = result.lastID;

    //Mention and alarm notification

    const mentionPattern = /@(\w+)/g;
    const mentionedUsernames = [];
    let match;

    while((match = mentionPattern.exec(content)) !== null){
        mentionedUsernames.push(match[1]);
    } 

    for(const username of mentionedUsernames){
        const mentionedUser = await db.get(
            `SELECT id FROM Users WHERE username = ?`,
            username
        );

        if(mentionedUser){
            await createCommentNotification(mentionedUser.id, commentId);
        }
    }

    await db.run("COMMIT");
    return commentId;

    } catch(error){
        await db.run("ROLLBACK");
        throw error;
    }
   
}

//Search comment's username
export async function getCommentById(commentId) {
    const db = await getDatabase();
    const comment = await db.get(
        `SELECT Comments.*, Users.username FROM Comments 
        JOIN Users ON Comments.user_id = Users.id
        WHERE Comments.id = ?`,
        commentId
    );

    return comment;
    
}

//Delete comment(cad delete author or user written comment)
export async function deleteComment(commentId, userId) {
    const db = await getDatabase();

    console.log('deleteComment - Received commentId:', commentId, 'userId:', userId);

    const comment = await db.get(`
    SELECT Comments.user_id, Articles.author_id
    FROM Comments
    JOIN Articles ON Comments.article_id = Articles.id
    WHERE Comments.id = ?
  `, [commentId]);

    console.log('deleteComment - Fetched comment object:', comment);

  if (!comment) {
    console.log('deleteComment - Comment not found.');
    return false; 
  }

  // Get the current user's admin status
  const currentUserData = await db.get(`SELECT is_admin FROM Users WHERE id = ?`, [userId]);
  const isAdmin = currentUserData && currentUserData.is_admin === 1;
  console.log('deleteComment - isAdmin:', isAdmin);

  // Convert IDs to numbers for strict comparison
  const commentUserId = Number(comment.user_id);
  const articleAuthorId = Number(comment.author_id);
  const currentUserId = Number(userId);

  console.log('deleteComment - Converted IDs: commentUserId=', commentUserId, ', articleAuthorId=', articleAuthorId, ', currentUserId=', currentUserId);

  //Check if the user is either the comment's owner, the article's author, or an admin
  const isCommentOwner = commentUserId === currentUserId;
  const isArticleAuthor = articleAuthorId === currentUserId;
  console.log('deleteComment - isCommentOwner:', isCommentOwner, 'isArticleAuthor:', isArticleAuthor);

  if (!isCommentOwner && !isArticleAuthor && !isAdmin) {
    console.log('deleteComment - Not authorized.');
    return false; 
  }

  await db.run(`DELETE FROM Notifications WHERE comment_id = ?`, [commentId]);

  await db.run(`DELETE FROM Comments WHERE id = ?`, [commentId]);
  console.log('deleteComment - Comment deleted successfully.');
  return true;
}

//get comments by articleId (order by created at ASC)

export async function getCommentsByArticleId(articleId) {

    const db = await getDatabase();
    const comments = await db.all(
        `SELECT Comments.*, Users.username FROM Comments
         JOIN Users ON Comments.user_id = Users.id
         WHERE article_id = ?
         ORDER BY created_at ASC`,
         articleId
    );

    return comments;
    
}


export async function getCommentsByUserId(userId) {

    const db = await getDatabase();
    return await db.all(
       `SELECT Comments.*, Users.username FROM Comments
         JOIN Users ON Comments.user_id = Users.id
         WHERE Comments.user_id = ?
         ORDER BY created_at DESC`,
         [userId]
    );
    
}