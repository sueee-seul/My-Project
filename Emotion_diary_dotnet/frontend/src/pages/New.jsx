import Header from '../components/Header';
import Button from '../components/Botton';
import Editor from '../components/Editor';
import { useNavigate } from 'react-router-dom';
import { useContext} from 'react';
import {DiaryDispatchContext} from '../App';
import usePageTitle from '../hooks/usePageTitle';

const New = () =>{

    const {onCreate} = useContext(DiaryDispatchContext);
    const nav = useNavigate();

    usePageTitle('New Dairy');

    const onSubmit = (input) =>{
        onCreate(input.createDate.getTime(), input.emotionId, input.content);
        nav('/', {replace: true})
    }
    return <div>
        <Header title={"Write new diary"}
        leftButton = {<Button onClick={()=>nav(-1)}text={"< Back"}/>}
        />
        <Editor onSubmit={onSubmit}/>
    </div>
}

export default New;