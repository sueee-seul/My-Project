import Header from "../components/Header";
import Button from "../components/Botton";
import DiaryList from "../components/DiaryList";
import { useState, useContext } from "react";
import { DiaryStateContext } from "../App";
import usePageTitle from "../hooks/usePageTitle";

const getMonthlyData = (pivotDate, data) =>{
    const beginTime= new Date(pivotDate.getFullYear(), pivotDate.getMonth(), 1,0,0,0). getTime();
    const endTime = new Date(pivotDate.getFullYear(), pivotDate.getMonth()+1, 0, 23,59,59).getTime();
    return data.filter((item)=> beginTime <= item.createDate && item.createDate <= endTime);
}

const Home = () =>{
    const data =useContext(DiaryStateContext);
    const [pivotDate, setPivotDate] = useState(new Date());
    const monthlyData = getMonthlyData(pivotDate, data);
    console.log("monthlyData:", monthlyData);

    usePageTitle("Emotion Diary")

    
    const onInceaseMonth = () =>{
        setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1));
    };
    const onDecreaseMonth = () =>{
        setPivotDate(new Date(pivotDate.getFullYear(), pivotDate.getMonth()-1));
    };
    return (
    
    <div>
        <Header title={`${pivotDate.getFullYear()}. ${pivotDate.getMonth()+1}.`}
            leftButton={<Button onClick={onDecreaseMonth} text={"<"}/>}
            rightButton={<Button onClick={onInceaseMonth} text={">"}/>}
        />

        <DiaryList data={monthlyData}/>

    </div>
    
);
}

export default Home;