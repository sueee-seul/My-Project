import express from "express";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import { toggleLike, countLikes, isLiked } from "../../data/like-dao.js";

const router =  express.Router();

//Like, unlike toggle
router.post("/", requiresAuthentication, async (req, res) =>{
    try{
        const {articleId} = req.body;
        if(!articleId){
         return res.status(400).json({error : "articleId is required"});
        }

        const userId = req.user.id;
        const result = await toggleLike(articleId, userId);
        res.status(200).json({message : `Like toggled`, liked: result.liked});
    }catch(error){
        console.log(error);
        res.status(400).json({error: "Failed to toggle like"});
    }
});

router.get("/:articleId/count", async (req,res)=>{
    try{
        const count = await countLikes(req.params.articleId);
        res.status(200).json({likes: count});
    }catch(error){
        console.error(error);
        res.status(500).json({error : "Failed to get like count"});
    }
});


router.get("/:articleId/status",requiresAuthentication, async (req,res)=>{
    try{
        const userId = req.user.id;
        const {articleId} = req.params;

        const liked = await isLiked(articleId, userId);
        res.json({liked});
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Failed to get like status"});

    }
});

export default router;