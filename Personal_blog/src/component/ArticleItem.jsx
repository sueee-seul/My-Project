import './ArticleItem.css';
import { useNavigate, useLocation } from 'react-router-dom';

const ArticleItem = ({id,image, content, createDate, title}) =>{

    const nav = useNavigate();
    const location = useLocation();

    const onClickArticle = () =>{
        nav(`${location.pathname}/${id}`);
    }

    return(
        <div className='article-item' onClick={onClickArticle} style={{cursor: "pointer"}}> 
            <h3>{title}</h3>
            <p>{createDate}</p>
            <img src={image} alt={content} className='article-image' width="200"/>
        </div>
    )
}

export default ArticleItem;