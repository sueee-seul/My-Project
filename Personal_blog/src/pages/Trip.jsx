import { useContext } from "react";
import { ArticleStateContext } from "../App";
import ArticleList from "../component/ArticleList";

const Trip = () =>{

    const mockData = useContext(ArticleStateContext);
    const tripArticle = mockData.filter((item)=> item.category === "trip");

    return(
        <div>
            {<ArticleList articles ={tripArticle} />}
        </div>
    )
}

export default Trip;