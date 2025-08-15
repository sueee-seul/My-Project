import express from "express";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import{
    createCommentWithMentions,
    deleteComment,
    getCommentById,
    getCommentsByArticleId
} from "../../data/comments-dao.js";


const router = express.Router();


//Creat comments
router.post("/", requiresAuthentication, async (req,res)=>{

    try{
        const {content, articleId} = req.body;
        const userId = req.user.id;

        const commentId = await createCommentWithMentions({content, articleId, userId});
        const comment = await getCommentById(commentId);
        res.status(201).json(comment);
    }catch(error){
        console.log(error);
        res.status(400).json({error: "Failed to create comment"});
    }

});


//Delete a comment
router.delete("/:id", requiresAuthentication, async (req,res)=>{
    
try{
    const commentId = req.params.id;
    const userId = req.user.id;

    const deleted = await deleteComment(commentId, userId);

    if(!deleted){
        return res.status(404).json({error: "Comment not found or not authorized"});
    }

    res.status(200).json({message: "Comment deleted successfully"});

}catch(error){
    console.log(error);
    res.status(400).json({error: "Failed to delete comment"});
}

});

//Get comments for a specific article

router.get("/articles/:articleId", async (req,res)=>{
    try{
        const articleId = req.params.articleId;
        const comments = await getCommentsByArticleId(articleId);

        console.log("articleId:", articleId);
        console.log("comments:", comments);

        res.json({comments});
    }catch(error){
        console.log(error);
        res.status(400).json({error: "Failed to get comments"});
    }
});

router.get("/:commentId", async (req, res) => {
    const comment = await getCommentById(req.params.commentId);
    console.log(comment);
    return res.json(comment);
})

export default router