import { getDatabase } from "./database.js";
import { getCommentsByArticleId } from './comments-dao.js';
import{
    insertTagsForArticle,
    getTagsByArticleId,
    updateTagsForArticle,
    deleteTagsByArticleId
} from "./tags-dao.js";
import dayjs from "dayjs";
import { createArticleNotifications } from "./notifications-dao.js";

//Create article
export async function createArticle({title, content, tags, image_id, authorId}) {

    const db = await getDatabase();
    const createdAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const updatedAt = createdAt;

    try{
        await db.run("BEGIN");

        //Insert contents into article
        const result = await db.run(
            `INSERT INTO Articles(title, content, created_at, updated_at, author_id, image_id)
            VALUES (?, ?, datetime('now'), datetime('now'), ?, ?)`,
            [title, content, authorId, image_id]
        );

        const articleId = result.lastID;

        //If there are some tags, insert into the tags table
        if(Array.isArray(tags) && tags.length>0){
            await insertTagsForArticle(articleId, tags) //Insert tag
        }

        // Creates notifications for users subscribed to author
        await createArticleNotifications(authorId, articleId);

        await db.run("COMMIT");
        return articleId;
    }catch(error){
        await db.run("ROLLBACK");
        throw error;
    }
}

//Get article by id
export async function getArticleById(id) {
  const db = await getDatabase();

  // Bring information about user and article
  const article = await db.get(`
    SELECT 
      Articles.id,
      Articles.title,
      Articles.content,
      Articles.created_at,
      Articles.updated_at,
      Articles.author_id,
      Articles.image_id,
      Users.firstname || ' ' || Users.lastname AS author_name
    FROM Articles
    JOIN Users ON Articles.author_id = Users.id
    WHERE Articles.id = ?
  `, [id]);

  if (!article) return null;

  // Get tag
  const tags = await getTagsByArticleId(id);

  //Bring comments list
const comments = await getCommentsByArticleId(id);

  return {
    ...article,
    tags,// Add tag array
    comments
    };
}
//Add about tag function
export async function getArticleByTag(tag) {
   const db = await getDatabase();
   
   //Bring article_id list related to tag
   const articleIds = await db.all(
    `SELECT article_id FROM Tags WHERE name = ?`,
    [tag]
   );

   if(articleIds.length ===0) {
    return [];
   }

   //Bring real article information using article_id
   const ids = articleIds.map(row => row.article_id);
   const placeholders = ids.map(()=> '?').join(',');
   
   const articles = await db.all(
    `SELECT 
       Articles.id,
       Articles.title,
       Articles.content,
       Articles.created_at,
       Articles.updated_at,
       Users.firstname || ' ' || Users.lastname AS author_name
     FROM Articles
     JOIN Users ON Articles.author_id = Users.id
     WHERE Articles.id IN (${placeholders})`,
    ids
   );

   //Add tag to each article
   for(const article of articles){

    article.tags = await getTagsByArticleId(article.id);
   }

   return articles;

}


//update article(including tags)
export async function updateArticle(id, userId, {title, content, tags, image_id}) {

    try{
        const db = await getDatabase();

        await db.run("BEGIN");

        //Update content
        const result = await db.run(
            `UPDATE Articles
            SET title = ?, content =?, updated_at = datetime('now'), image_id=?
            WHERE id = ? AND author_id = ?`,
            [title, content, image_id, id, userId]

        );

        //If there's no content or no right, ROLLBACK and false return
        if(result.changes === 0){

            await db.run("ROLLBACK");
            return false;
        }

       
      
        //Calling currently saved tags
        if(Array.isArray(tags)){
            
            await updateTagsForArticle(id, tags)// Tag update
        }   
    
        await db.run("COMMIT");
        return true;
    } catch(error){
        throw error;
    }
}

//Delete article
export async function deleteArticle(id, userId) {
    const db = await getDatabase();
   try{
     await db.run("BEGIN TRANSACTION");

    await db.run(`DELETE FROM notifications WHERE comment_id IN
            (SELECT id FROM Comments WHERE article_id=?)`, 
            [id]);
    await db.run(`DELETE FROM Comments WHERE article_id = ?`, [id]);
    await deleteTagsByArticleId(id); //Tag delete
    await db.run(`DELETE FROM Likes WHERE article_id = ?`, [id]);
    await db.run(`DELETE FROM Notifications WHERE article_id = ?`, [id]);

     const result = await db.run(
     `DELETE FROM Articles WHERE id = ? AND author_id = ?`,
    [id, userId]
    );

    await db.run("COMMIT");
    return result.changes>0;

   } catch(error){
    await db.run("ROLLBACK");
    throw error;
   }
  
}

//Get all articles using user's id

export async function getArticlesByUserId(userId) {
    const db = await getDatabase();

    const articles = await db.all(
        `SELECT 
            Articles.id,
            Articles.title,
            Articles.content,
            Articles.created_at,
            Articles.updated_at,
            Articles.author_id,
            Articles.image_id,
            Users.firstname || ' ' || Users.lastname AS author_name
        FROM Articles
        JOIN Users ON Articles.author_id = Users.id
        WHERE Articles.author_id = ?`,
        [userId]
    );

    //Call all tags realated to all articles
    for(const article of articles){
     
        article.tags = await getTagsByArticleId(article.id); //tag search
    }

    return articles;
}

//Call all articles
export async function getAllArticles() {
    let articles = [];

    const db = await getDatabase();
    
    const articleIds = await db.all(`SELECT Articles.id FROM Articles`);
    console.log(articleIds);
    for (const id of articleIds) {
        articles.push(await getArticleById(id.id));
    }
    return articles;
}

