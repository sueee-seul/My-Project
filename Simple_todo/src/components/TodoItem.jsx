import "./TodoItem.css";



const TodoItem = ({id, isDone, date, content, onUpdate, onDelete}) =>{
    
    //onUpdateChange

    const onUpdateChange = ()=>{
        onUpdate(id);
    }

    //onDeleteChange

    const onDeleteChange = () =>{
        onDelete(id);
    }
 
    
    return <div className="todoItem">
        <input onChange={onUpdateChange} checked={isDone} type="checkbox" />
        <div className="content">{content}</div>
        <div className="date">{new Date(date).toLocaleDateString()}</div>
        <button onClick={onDeleteChange}>Delete</button>
    </div>
}


export default TodoItem;