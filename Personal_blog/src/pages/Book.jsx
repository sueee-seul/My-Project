import { useContext } from "react";
import { ArticleStateContext } from "../App";
import ArticleList from "../component/ArticleList";

const Book = () =>{
    const mockData = useContext(ArticleStateContext);
    const bookArticle = mockData.filter((item)=> item.category === "book");
    return(
        <div>
            <ArticleList articles = {bookArticle}/>
        </div>
    )
}

export default Book;