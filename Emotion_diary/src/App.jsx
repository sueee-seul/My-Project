
import './App.css'
import { useReducer, useRef, createContext, useEffect, useState } from 'react';
import {Routes, Route} from "react-router-dom";
import Diary from './pages/Diary';
import Home from './pages/Home.jsx';
import New from './pages/New.jsx';
import NotFound from './pages/NotFound.jsx';
import Edit from './pages/Edit.jsx';



function reducer(state, action){
  let nextState;

  switch(action.type){
    case 'INIT' :
      return action.data;
    case 'CREATE':
      {nextState= [action.data, ...state]
        break;
      }
    case 'UPDATE':
      { nextState = state.map((item)=> 
        String(item.id) === String(action.data.id) ? action.data : item)  
        break;
      }
    case 'DELETE':
      { nextState =  state.filter((item)=>
        String(item.id) !== String(action.id))
      }
        break;
    default : 
       return state; 
  }
  localStorage.setItem("diary", JSON.stringify(nextState));
  return nextState;
}

export const DiaryStateContext = createContext();
export const DiaryDispatchContext = createContext();
function App() {
  const [isLoading, setLoading] = useState(true);
  const [data, dispatch] = useReducer(reducer,[])
  const idRef = useRef(0)

  useEffect(()=>{
    const storedData = localStorage.getItem("diary");
    if(!storedData){
      setLoading(false);
      return;
    }
    const parsedData = JSON.parse(storedData);
    if(!Array.isArray(parsedData)) {
      setLoading(false);
      return
    };

    let maxId = 0;
    parsedData.forEach((item)=>{
      if(Number(item.id)> maxId){
        maxId = Number(item.id);
      }
    })

    idRef.current = maxId +1

    dispatch({
      type: "INIT",
      data: parsedData,
    });
    setLoading(false);
  },[])

  //create

  const onCreate = (createDate, emotionId, content)=>{
    dispatch({
      type: "CREATE",
      data: {
        id: idRef.current++,
        createDate,
        emotionId,
        content,
      }
    })
  }

  //update

  const onUpdate = (id,createDate, emotionId, content) =>{
    dispatch({
      type: "UPDATE",
      data : {
        id,createDate, emotionId, content
      }
    })
  }
  //delete
  const onDelete = (id)=>{
    dispatch({
      type:'DELETE',
      id
    })
  }

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
