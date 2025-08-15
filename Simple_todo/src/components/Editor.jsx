import './Editor.css';
import { useState, useRef } from 'react';

const Editor = ({onCreate}) =>{

    const [content, setContent] = useState("");
    const contentRef = useRef();

    //onChangeContent

    const onChangeContent = (e) =>{
        setContent(e.target.value);
    }
  
    //onKeyDown

    const onKeyDown = (e) =>{
        if(e.KeyCode === 13) {
            onSubmit();
        }
    }

    //onSubmit
    const onSubmit = () =>{
        if(content === ""){
            return contentRef.current.focus();
        }
        onCreate(content);
        setContent("");
    }

    return <div className="editor">
        <input onKeyDown={onKeyDown} ref={contentRef} value ={content} onChange={onChangeContent} placeholder="Add to do"/>
        <button onClick={onSubmit}>Add</button>
    </div>
}

export default Editor;