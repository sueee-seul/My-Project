import { useContext } from "react";
import { ArticleStateContext } from "../App";
import ArticleList from "../component/ArticleList";

const Coffee = () =>{

    const mockData = useContext(ArticleStateContext);
    const coffeeArticle = mockData.filter((item)=> item.category === "coffee");
    
    return(
        <div>
           {<ArticleList articles = {coffeeArticle}/>}
        </div>
    )
}

export default Coffee;