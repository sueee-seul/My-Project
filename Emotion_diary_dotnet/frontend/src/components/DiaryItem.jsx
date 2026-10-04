import {getEmotionImage} from "../util/get-emotion-image.js";
import Button from "./Botton";
import './DiaryItem.css';
import { useNavigate } from "react-router-dom";

const DiaryItem = ({id, content, emotionId, createDate })=>{


    console.log("Create date:", createDate);

    const nav= useNavigate();

    return(
        <div className="DiaryItem">
        <div 
        onClick={()=>nav(`/diary/${id}`)}
        className={`img_section img_section_${emotionId}`} >
            <img src={getEmotionImage(emotionId)}/>
        </div>
        <div 
        onClick={()=>nav(`/diary/${id}`)}
        className="info_section">
            <div className="createDate">
                {new Date(createDate).toLocaleDateString()}
                
            </div>
            <div className="content">
                {content}
            </div>
        </div>
        <div 
        onClick={()=>nav(`/edit/${id}`)}
        className="button_section" >
            <Button text={"Edit"}/>
        </div>
        </div>
    )
}

export default DiaryItem;
