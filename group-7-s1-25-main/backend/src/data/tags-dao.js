import { getDatabase } from "./database.js";

//Create tags for an article(post)
export async function insertTagsForArticle(articleId, tags) {

    const db = await getDatabase();

    //delete duplicate tags
    const uniqueTags = Array.from(new Set(tags));

    for (const tagName of uniqueTags) {
        if (/^\s*$/.test(tagName)) {
            console.log("invalid tag found, discarding")
        } else {
            await db.run(
                `INSERT INTO Tags (article_id, name) VALUES (?, ?)`,
                [articleId, tagName]
            );
        }

    }
}

//When user click article, get all tags in there
export async function getTagsByArticleId(articleId) {

    const db = await getDatabase();
    const tags = await db.all(
        `SELECT name FROM Tags WHERE article_id = ?`,
        [articleId]
    );

    return tags.map(t => t.name);

}

//Update tags for an article
export async function updateTagsForArticle(articleId, newTags) {

    const db = await getDatabase();

    const existingTags = await db.all(
        `SELECT name FROM Tags WHERE article_id = ?`,
        [articleId]
    );

    const existingSet = new Set(existingTags.map(t => t.name));
    const newSet = new Set(newTags);

    for (const tag of existingSet) {
        if (!newSet.has(tag)) {
            await db.run(
                `DELETE FROM Tags WHERE article_id = ? AND name = ?`,
                [articleId, tag]
            );
        }
    }

    for (const tag of newSet) {
        if (!existingSet.has(tag)) {
            await db.run(
                `INSERT INTO Tags (article_id, name) VALUES (?, ?)`,
                [articleId, tag]
            );
        }
    }

}

//Delete all tags for an article
export async function deleteTagsByArticleId(articleId) {
    const db = await getDatabase();
    await db.run(
        `DELETE FROM Tags WHERE article_id = ?`,
        [articleId]
    );

}

//Get all articles with a specific tag
export async function getArticleByTag(tag) {
    const db = await getDatabase();
    return await db.all(`
            SELECT 
            Articles.id,
            Articles.title,
            Articles.content,
            Articles.created_at,
            Articles.updated_at,
            Users.firstname || ' ' || Users.lastname AS author_name
            FROM Articles
            JOIN Users ON Articles.author_id = Users.id
            JOIN Tags ON Tags.article_id = Articles.id
            WHERE Tags.name = ?
            ORDER BY Articles.created_at DESC
            
            ` [tag]

    );

}



//User can see all tags
export async function getAllTags(params) {

    const db = await getDatabase();
    const rows = await db.all(`SELECT DISTINCT name FROM Tags ORDER BY name ASC`);
    return rows.map(r => r.name);

}