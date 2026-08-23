import { useParams, useNavigate} from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Botton";
import Viewer from "../components/Viewer";
import useDiary from "../hooks/useDiary";
import { getStringedData } from "../util/getStringData";
import usePageTitle from "../hooks/usePageTitle";

const Diary = () =>{

    const params = useParams();
    const nav = useNavigate();
    const curDiaryItem = useDiary(params.id)
    console.log("now:", curDiaryItem)

    usePageTitle(`${params.id} diary`)
    
    if(!curDiaryItem){
        return <div>data loading..</div>
    }

    const {createDate, emotionId, content} = curDiaryItem;
    const title = getStringedData(new Date(createDate))
    return (
    <div>
        <Header title={`${title} record`}
        leftButton = {<Button text={"< Back"} onClick={()=>nav(-1)} />}
        rightButton = {<Button text={"Modify"} onClick={()=>nav(`/edit/${params.id}`)}/>}
        />
        <Viewer emotionId={emotionId} content={content}/>

    </div>
    )
}

export default Diary;