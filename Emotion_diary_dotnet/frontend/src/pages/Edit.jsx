import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Botton";
import Editor from "../components/Editor";
import { useContext} from "react";
import {DiaryDispatchContext, DiaryStateContext} from "../App";
import useDiary from "../hooks/useDiary";
import usePageTitle from "../hooks/usePageTitle";

const Edit = ()=>{

    const params = useParams();
    console.log("params:", params)
    const nav = useNavigate();
    const {onDelete, onUpdate} = useContext(DiaryDispatchContext);
    const curDiaryItem = useDiary(params.id);

    usePageTitle(`${params.id} diary modification`)
    

    const onClickDelete = () =>{
        if(window.confirm("Are you sure?")){
            onDelete(params.id);
            nav('/', {replace:true});
        }
    }

    const onSubmit = (input) =>{
        if(window.confirm("Are you sure?")){
            onUpdate(
            params.id, 
            input.createDate.getTime(), 
            input.emotionId, 
            input.content );
            nav('/', {replace:true})
        } 
    }


    return( 
    
    <div>
        <Header 
        title={"modify diary"}
        leftButton={<Button onClick={()=> nav(-1)} text={"< Back"} />}
        rightButton={<Button onClick={onClickDelete} text={"Delete"} type={"NEGATIVE"}/>}
        />
        <Editor initData={curDiaryItem} onSubmit={onSubmit}/>
    </div>
    )
}

export default Edit;