import "./List.css";
import TodoItem from "./TodoItem";
import { useMemo, useState } from "react";

const List = ({todos, onUpdate, onDelete}) =>{

    //search function

    const [search, setSearch] = useState("");
    
    //onChangeSearch

    const onChangeSearch = (e) =>{
        setSearch(e.target.value);
    }
   
    // getFilteredData ,filter
    const getFilteredData = ()=>{
        if(search=== ""){
            return todos;
        }
        return todos.filter((todo)=> todo.content
        .toLowerCase()
        .includes(search.toLowerCase()));
    }

    const filteredTodo = getFilteredData();
  

    const {totalCount, doneCount, notDoneCount} =
    
    
    useMemo(()=>{      
        const totalCount = todos.length;
        const doneCount= todos.filter((todo)=> todo.isDone).length;
        const notDoneCount= totalCount - doneCount;

        return {
            totalCount,
            doneCount,
            notDoneCount,
        }
    },[todos]);
    



    return <div className="list">
        <h4>TodoList📚</h4>

        <div>total : {totalCount}</div>
        <div>Done : {doneCount}</div>
        <div>Not Done: {notDoneCount}</div>

        <input  value={search} onChange={onChangeSearch} placeholder="Add your plans"/>
        <div className="todosWrapper">
         { filteredTodo.map((todo) =>(
                <TodoItem key={todo.id} {...todo} onUpdate={onUpdate} onDelete={onDelete} />          
         ))
            
         }
         
        </div>
    </div>
}

export default List;