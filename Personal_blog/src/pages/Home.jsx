import Header from "../component/Header";
import StudyImg from "../assets/study.jpg";
import BookImg from "../assets/book.jpg";
import CoffeeImg from '../assets/coffee.jpg';
import TripImg from '../assets/trip.jpg';
import Decor1 from '../assets/Decor1.jpg';
import Decor2 from '../assets/Decor2.jpg';
import Decor3 from '../assets/Decor3.jpg';
import Decor4 from '../assets/Decor4.jpg';
import Decor5 from '../assets/Decor5.jpg';
import Decor6 from '../assets/Decor6.jpg';
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';


const categories = [
    {name: "Study", img: StudyImg, link: "/study", clickable: true},
    {name: "Book", img: BookImg, link: "/book", clickable: true},
    {name: "Coffee", img: CoffeeImg, link: "/coffee", clickable: true},
    {name: "Trip", img: TripImg, link: "/trip", clickable: true},
    {name: "Decor1", img: Decor1,clickable: false },
    {name: "Decor2", img: Decor2,clickable: false},
    {name: "Decor3", img: Decor3,clickable: false},
    {name: "Decor4", img: Decor4,clickable: false},
    {name: "Decor5", img: Decor5,clickable: false},
    {name: "Decor6", img: Decor6,clickable: false},

]


const Home = () =>{

    const nav = useNavigate();

    useEffect(() => {
    document.title = "Sue's Now";
  }, []);

    return( 
    <div>
        <Header title={`Sue's Now | Est. 2025`}/>
        <main className="main-grid">
            <section className="grid-right">
                <div className="category-grid">
                    {categories.map((item)=>(
                        <div
                        key={item.name}
                        className={`category-card ${item.clickable ? "clickable" :"unClickable" }`}
                        onClick={item.clickable? ()=>nav(item.link): undefined}
                        >
                            <img src={item.img} alt={item.name} className="category-image"/>
                          
                        </div>
                    ))}
                </div>
            </section>
        </main>
    </div>
    )
}

export default Home;