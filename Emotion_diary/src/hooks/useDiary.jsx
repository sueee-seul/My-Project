import { useContext, useState,useEffect } from "react";
import { DiaryStateContext } from "../App";
import { useNavigate } from "react-router-dom";

const useDiary = (id)=>{
   const data = useContext(DiaryStateContext);
   const [curDiaryItem, setCurDiaryItem] = useState();
   const nav = useNavigate(); 
   
   useEffect(()=>{
        const curruentDiaryItem = data.find((item)=> 
            String(item.id) === String(id) )

        if(!curruentDiaryItem){
            window.alert("Not Exist!")
            nav("/", {replace: true});
        }

        setCurDiaryItem(curruentDiaryItem);

    },[id, data]);
    
    return curDiaryItem;
}

export default useDiary;