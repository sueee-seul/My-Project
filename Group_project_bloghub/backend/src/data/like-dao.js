import { getDatabase } from "./database.js";

export async function toggleLike(articleId, userId) {
    
    const db = await getDatabase();

    //Check like or not
    const existing = await db.get(
        `SELECT * FROM Likes WHERE article_id=? AND user_id = ?`,
        [articleId, userId]
    );

    if(existing){
        //Cancel like
        const result = await db.run(
            `DELETE FROM Likes WHERE article_id =? AND user_id =?`,
            [articleId, userId]
        );
        return {liked : false};
    }else{
        //Add like
        const result = await db.run(
        `INSERT INTO Likes (article_id, user_id) VALUES (?, ?)`,
        [articleId, userId]
    );
    return {liked : true};
    }
}

//Check who's choose like

export async function isLiked(articleId, userId) {

    const db = await getDatabase();
    const existing = await db.get(
        `SELECT * FROM Likes WHERE article_id = ? AND user_id =?`,
        [articleId, userId]
    );
    return !!existing;
}

export async function countLikes(articleId) {
    const db = await getDatabase();
    const row = await db.get(
        `SELECT COUNT(*) AS count FROM Likes WHERE article_id = ?`,
        [articleId]
    );
    return row.count;
}


export async function getLikesByUserId(userId) {
    const db = await getDatabase();
    return await db.all(
        `SELECT * FROM Likes WHERE user_id =?`,
        [userId]
    )
    
}
