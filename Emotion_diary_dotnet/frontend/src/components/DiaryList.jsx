import Button from "./Botton";
import "./DiaryList.css";
import DiaryItem from "./DiaryItem";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


const DiaryList = ({data}) =>{

    const [sortType, setSortType] = useState("latest");

    const onChangeSortType =(e) =>{
        setSortType(e.target.value);
    };

    // 1) 리턴값이 0 보다 작으면 a-b 순서로 나열되고, 이 말은 a가 b 보다 작은 수라는 의미. 왜? 두 수를 뺀 값이 음성이면 앞에 수가 작은게 당연하니까
    const getSortedData = () =>{
        return data.toSorted((a,b)=>{
            if(sortType ==="oldest"){
                return Number(a.createDate) - Number(b.createDate);
            }else{
                return Number(b.createDate) - Number(a.createDate);
            }
        })
    }

    const sortedData = getSortedData();

     const nav = useNavigate();
    return (
    <div className="DiaryList">
        <div className="menu_bar">
            <select onChange={onChangeSortType}>
                <option value={"latest"}>Latest</option>
                <option value={"oldest"}>Oldest</option>
            </select>
            <Button onClick={()=> nav("/new")} text={"New Diary"} type={"POSITIVE"}/>
        </div>
        <div className="list_wrapper">
            {sortedData.map((item)=><DiaryItem key={item.id} {...item}/>)}
        </div>
    </div>
    );
}

export default DiaryList;