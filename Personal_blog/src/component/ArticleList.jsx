import './ArticleList.css';
import ArticleItem from "./ArticleItem";
import { useState } from 'react';
import {useNavigate } from "react-router-dom";
import Button from './Button';



const ArticleList = ({articles}) =>{

    const [sortedType,setSortedType] = useState("oldest");
    const nav = useNavigate();

    const onClickBack = ()=>{
        nav(-1);
    }

    const onChangeSortedType = (e)=>{
        setSortedType(e.target.value);
    }

    const getSortedType = () =>{
        return articles.toSorted((a,b)=>{
            if(sortedType === "oldest"){
                return new Date(a.createDate) - new Date(b.createDate);
            }else{
                return new Date(b.createDate) - new Date(a.createDate);
            }
        })
    }

    const sortedDate = getSortedType();

    return(
        <div className='ArticleList'>
            <Button text={"< Back"} onClick={onClickBack} type={"back"} />
            <div className='menu-bar'>
                <select onChange={onChangeSortedType}>
                    <option value={"oldest"}>Oldest</option>
                    <option value={"latest"}>Latest</option>
                </select>

            </div>
        <div className='article-grid'>
            {sortedDate.map((article)=> <ArticleItem key={article.id} {...article}/>)}
        </div>
        </div>
    )
}

export default ArticleList;
