import { useParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ArticleStateContext } from "../App";
import Button from "../component/Button";
import '../component/ArticleItem.css';


const ArticleDetail = ()=>{

    const {id} = useParams();
    const articles = useContext(ArticleStateContext);
    const nav = useNavigate();
    const article = articles.find((item)=> item.id === parseInt(id));

    if(!article) return <p>Article not found</p>


    const onClickBack = () =>{
        nav(-1);
    }

    return(
         <div className="article-item">
            <Button text={"< Back"} onClick={onClickBack} type="back"/>
            <h2>{article.title}</h2>
            <p>{article.createDate}</p>
            <img src={article.image} alt={article.title} className="article-image" />
            <p>{article.content}</p>
        </div>
    )
}

export default ArticleDetail;