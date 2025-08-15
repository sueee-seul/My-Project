import { getDatabase } from "./database.js";

//All users list and number articles written by each user

export async function getAllUsersWithArticleCount() {
    const db = await getDatabase();
    const result = await db.all(`
    SELECT
      users.id,
      users.username,
      users.is_admin,
      users.avatar_id,                 
      COUNT(articles.id) AS article_count
    FROM users
    LEFT JOIN articles ON users.id = articles.author_id
    GROUP BY users.id
    ORDER BY users.id;
  `);
 
  return result;
    
}

//Delete user
export async function deleteUserAndRelatedData(userId) {

    const db = await getDatabase();
 

    try{
        await db.run("BEGIN");

        //Delete notification from user's comments
        await db.run(`DELETE FROM notifications WHERE comment_id IN
            (SELECT id FROM Comments WHERE user_id=?)`, 
            [userId])

        //Delete notification from user's article
        await db.run(`DELETE FROM notifications WHERE article_id IN
            (SELECT id FROM Articles WHERE user_id = ?)`,
            [userId]
        )

        //Delete notification from user
        await db.run("DELETE FROM notifications WHERE user_id =?", [userId]);


       //Delete like
        await db.run("DELETE FROM likes WHERE user_id = ?", [userId]);

       //Delete subscription
         await db.run("DELETE FROM subscriptions WHERE subscriber_id = ? OR recipient_id = ?", [userId, userId]);

        //Delete comment
        await db.run("DELETE FROM comments WHERE user_id = ?",[userId]);
        
       //Sorting specific articles related to deleted user
        const articleRows = await db.all("SELECT id FROM articles WHERE author_id =?", [userId]);
        const articleIds = articleRows.map(row => row.id);

        if(articleIds.length>0){
            const placeholders = articleIds.map(() => '?').join(',');
            //Delete comment in article
            await db.run(`DELETE FROM comments WHERE article_id IN (${placeholders})`, articleIds);

            //Delete like in article
            await db.run(`DELETE FROM likes WHERE article_id IN (${placeholders})`, articleIds);

            //Delete tag in article
            await db.run(`DELETE FROM tags WHERE article_id IN (${placeholders})`, articleIds);

            //Delete notification related to article
            await db.run(`DELETE FROM notifications WHERE article_id IN (${placeholders})`, articleIds);

        }


        //Delete articles
        await db.run("DELETE FROM articles WHERE author_id = ?", [userId]);

        //Delete users
        await db.run("DELETE FROM users WHERE id = ?", [userId]);

    await db.run("COMMIT");
    }catch(err){
        await db.run("ROLLBACK");
        console.log("error during user deletion", err);
        throw err;
    }
    
}




