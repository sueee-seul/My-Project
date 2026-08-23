import { useReducer, useRef, createContext, useEffect, useState } from 'react';
import {Routes, Route} from "react-router-dom";
import Diary from './pages/Diary';
import Home from './pages/Home.jsx';
import New from './pages/New.jsx';
import NotFound from './pages/NotFound.jsx';
import Edit from './pages/Edit.jsx';


function reducer(state, action){
  
  switch(action.type){
    case 'INIT' :
      return action.data;
    case 'CREATE':
      return [action.data, ...state];
    case 'UPDATE':
      return state.map((item)=> 
        String(item.id) === String(action.data.id) ? action.data : item
    );
    case 'DELETE':
      return state.filter((item)=>
        String(item.id) !== String(action.id)
    );
    default : 
       return state; 
  }
}

export const DiaryStateContext = createContext();
export const DiaryDispatchContext = createContext();
function App() {
  const [isLoading, setLoading] = useState(true);
  const [data, dispatch] = useReducer(reducer,[])
  const idRef = useRef(0)
  //localStorage -> Backend API
  useEffect(()=>{
    const initData = async ()=>{
      try{
        const response = await fetch("http://localhost:5167/api/diary");
        if(!response.ok) throw new Error("Can't bring the data");

        const data = await response.json();
        
        if(data.length>0){
          const maxId = Math.max(...data.map(item=> Number(item.id)));
          idRef.current = maxId +1;
        }

        dispatch({type: "INIT", data});

      } catch(error){
        console.error(error);
      }finally {
        setLoading(false);
      }
    };
    initData();
  },[])

  //create
  const onCreate = async (createDate, emotionId, content)=>{
    try{
      const response = await fetch("http://localhost:5167/api/diary",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({createDate, emotionId, content})
      });

      if(response.ok){
        const newDiary = await response.json();
        dispatch({type: "CREATE", data: newDiary});
      }
    }catch(error){
      console.error("Fail:", error);
    }
  }

  //update
  const onUpdate = async (id,createDate, emotionId, content) =>{
    try{
      const response = await fetch(`http://localhost:5167/api/diary/${id}`,{
        method: "PATCH",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({createDate, emotionId, content})
      });

      if(response.ok){
        dispatch({
          type: "UPDATE",
          data: {id, createDate, emotionId, content}
        });
      }
    }catch(error){
      console.error("Update Fail:", error);
    }
  };

  //delete
  const onDelete = async (id)=>{
    try{
      const response = await fetch(`http://localhost:5167/api/diary/${id}`,{
        method: "DELETE"
      });
      
      if(response.ok){
        dispatch({type: "DELETE", id});
      }
    }catch(error){
      console.error("Fail:", error);
    }
  };

  if(isLoading){
    return <div>Data loading...</div>
  }

  return (
  <>
 <DiaryStateContext.Provider value={data}>
  <DiaryDispatchContext.Provider 
  value={
    {
    onCreate,
    onUpdate,
    onDelete
    }
  }>
  <Routes>
     
     <Route path='/' element={<Home/>}/>
     <Route path='/new' element={<New/>}/>
     <Route path='/diary/:id' element={<Diary/>}/>
     <Route path='*' element={<NotFound/>}/>
     <Route path='/edit/:id' element={<Edit/>}/>

</Routes>
</DiaryDispatchContext.Provider>
  </DiaryStateContext.Provider>
 </>
   
  )
}

export default App
