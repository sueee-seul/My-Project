import { useContext } from "react";
import { ArticleStateContext } from "../App";
import ArticleList from "../component/ArticleList";

const Study = () =>{

    const mockData = useContext(ArticleStateContext);
    const studyArticle = mockData.filter((item)=> item.category === "study");
    return(
        <div>
            {<ArticleList articles={studyArticle}/>}
        </div>
    )
}

export default Study;