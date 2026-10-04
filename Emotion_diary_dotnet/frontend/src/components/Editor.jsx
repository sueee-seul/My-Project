import './Editor.css'
import EmotionItem from './EmotionItem';
import Button from './Botton';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emotionList } from '../util/constants';
import { getStringedData } from '../util/getStringData';

const Editor = ({onSubmit, initData})=>{


    const [input, setInput] = useState({
        createDate : new Date(),
        emotionId : 3,
        content : "",
    });

    const nav = useNavigate();

    useEffect(()=>{
        if(initData){
            setInput({
                ...initData,
                createDate: new Date(Number(initData.createDate)),
            })
        }
    },[initData])

    const onChangeInput = (e) =>{
      
        let name = e.target.name; //변화가 일어나는 컨테이너의 이름,어떤 요소에 입력이 들어온건지
        let value = e.target.value;// 스트링// 입력되는 값이 무엇인지?

        if(name === "createDate"){
            value = new Date(value);
        }
        setInput({
            ...input,
            [name] : value,
        })
    }

    const onClickSubmitButton = () =>{
        onSubmit(input)
    }




    return <div className='Editor'>
        <section className='date_section'>
            <h4>Today's </h4>
            <input 
            name='createDate'
            onChange={onChangeInput}
            value={getStringedData(input.createDate)} type="date" />
        </section>

        <section className='emotion_section'>
            <h4>Today's emotion</h4>
            <div className='emotion_list_wrapper'>
                {emotionList.map((item)=>
                <EmotionItem 
                onClick={()=>onChangeInput({
                    target : {
                        name: "emotionId",
                        value: item.emotionId,
                    }
                })}
                key={item.emotionId} {...item} 
                isSelected={item.emotionId === input.emotionId}/> )}
            </div>
        </section>
        <section className='content_section'>
            <h4>Today's diary</h4>
            <textarea 
            name='content'
            value={input.content}
            onChange={onChangeInput}
            placeholder='How about your day?'></textarea>
        </section>
        <section className='button_section'>
                    <Button onClick={()=> nav(-1)} text={"Cancel"}/>
                    <Button 
                    onClick={onClickSubmitButton}
                    text={"Done"} type={"POSITIVE"}/>
        </section>

    </div>
}

export default Editor;