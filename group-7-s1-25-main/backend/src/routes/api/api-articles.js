import express from "express";
import {requiresAuthentication} from "../../middleware/auth-middleware.js";
import {
    createArticle,
    getArticleById,
    updateArticle,
    deleteArticle,
    getAllArticles,
    getArticleByTag,
    
} from "../../data/article-dao.js";
import { getCommentsByArticleId } from "../../data/comments-dao.js";
import { countLikes, isLiked } from "../../data/like-dao.js";
import { getAllTags, getTagsByArticleId } from "../../data/tags-dao.js";
import * as yup from "yup"; 

const router = express.Router();

// tag yup
const articleSchema = yup.object({
  title: yup.string().required("Title is required"),
  content: yup.string().required("Content is required"),
  tags: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^\w+$/, "Each tag must be a single word (letters, numbers, or _)")
    )
    .optional(), 
});

//Bring all tags 
router.get("/tags", async (req,res) =>{
    try{
        const tags = await getAllTags();
        res.status(200).json(tags);
    }catch(error){
        console.error("Error fetching tags:", error);
        res.status(400).json({ error: "Failed to load tags" });
    }
})

router.get("/tags/:tag", async (req, res) =>{
    const tag = req.params.tag;

    try{
        const articles = await getArticleByTag(tag);

        if(articles.length ===0){
            return res.status(404).json({error:`No articles found with tag "${tag}"` });

        }

        res.status(200).json(articles);
    }catch(error){
        console.error('Error fetching articles by tag:', error);
        res.status(400).json({ error: 'Internal server error' });
    }
})



//Article page-left side calling all articles(user who isn't log in can see the article)  
  router.get("/", async (req,res)=>{
    try{
     const articles = await getAllArticles();
     
     const simplified = articles.map((article)=>({
        id: article.id,
        title: article.title,
        createdAt: article.created_at,
        authorName: article.author_name,
     }));

    res.json(articles);
    }catch(error){
        console.log(error);
        console.error("getAllArticles error:", error);
        res.status(400).json({error: "Failed to fetch articles"})
    }
  });



//Right side _calling specific article having specific id
router.get("/:id", async (req,res)=>{
    try{
        const id = req.params.id;
        const article = await getArticleById(id);
        
        if(!article){
            return res.status(404).json({error: "Article not found"});    
        }
        //append comments and likes, tag
        const comments = await getCommentsByArticleId(id);
        const likesCount = await countLikes(id);
        const tags = await getTagsByArticleId(id);

        const articleData = { 
            ...article, 
            comments,
            likesCount,
            tags,
         };

         if(req.user){
            const likedByUser = await isLiked(id, req.user.id);
            articleData.likedByUser = likedByUser;
         }
        res.json(articleData); 

    }catch(error){
        console.error(error);
        res.status(400).json({error: "Failed to fetch article"});
    }
});


router.post("/", requiresAuthentication, async (req,res)=>{
  try{
    await articleSchema.validate(req.body); 
    const {title, content, tags, image_id =[]} = req.body;
    const articleId = await createArticle({
        title,
        content,
        tags,
        image_id,
        authorId: req.user.id,
    });

    res.status(201).json({articleId});
  }catch(error){
    console.error(error);
    res.status(400).json({error: "Failed to create article"});
  }

} );

router.patch("/:id", requiresAuthentication, async (req,res)=>{
    try{

        await articleSchema.validate(req.body); 

        const {title, content, tags, image_id} = req.body;
        const userId = req.user.id;
        const id = req.params.id;

        console.log(image_id);

        const updated = await updateArticle(id, userId, {
            title, 
            content,
            tags,
            image_id
        });

        if(!updated) return res.status(404).json({error: "Article not found or not authorized"});
        
        res.status(200).json({ message: "Article updated successfully" });
   
    }catch(error){
        console.error(error);
        res.status(400).json({Error: "Failed to update article"});
    }
} );

router.delete("/:id", requiresAuthentication, async (req,res)=>{
    try{
        const id = req.params.id;
        const userId = req.user.id;

        const deleted = await deleteArticle(id, userId);
        if(!deleted){
            return res.status(404).json({Error: "Article not found or not authorized"});    
        }

        res.status(200).json({message: "Article deleted successfully"});
    }catch(error){
        console.log(error);
        res.status(400).json({error: "Failed to delete article"});
    } 
} );


export default router;
