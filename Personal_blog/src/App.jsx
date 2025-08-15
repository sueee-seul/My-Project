
import './App.css';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Book from './pages/Book';
import Coffee from './pages/Coffee';
import Study from './pages/Study';
import Trip from './pages/Trip';
import Image1 from './assets/Image1.jpg';
import Image2 from './assets/Image2.jpg';
import Image3 from './assets/Image3.jpg';
import Image4 from './assets/Image4.jpg';
import Image5 from './assets/Image5.jpg';
import {createContext} from 'react';
import {Routes, Route} from 'react-router-dom';
import ArticleDetail from './pages/ArticleDetail';


 
const mockData = [
  {
    id: 1,
    createDate: "2025-07-01",
    title: "Find Your Study Flow",
    content: "Studying consistently is key to improvement.\nFinding your own study rhythm helps efficiency.\nTake breaks and review regularly for retention.",
    image: Image1,
    category: "study"
  },
  {
    id: 2,
    createDate: "2025-07-02",
    title: "Why Reading Matters",
    content: "Books open doors to new worlds and ideas.\nReading helps expand your vocabulary naturally.\nChoose books that match your interests to build habit.",
    image: Image2,
    category: "book"
  },
  {
    id: 3,
    createDate: "2025-07-03",
    title: "The Joy of Coffee Rituals",
    content: "Coffee can be a comforting daily ritual.\nThe aroma of freshly brewed coffee boosts mood.\nTry different brewing methods to find your favorite.",
    image: Image3,
    category: "coffee"
  },
  {
    id: 4,
    createDate: "2025-07-04",
    title: "Plan the Perfect Trip",
    content: "Traveling helps you discover new cultures.\nPlanning your trip in advance saves time.\nTake photos to keep your travel memories alive.",
    image: Image2,
    category: "trip"
  },
  {
    id: 5,
    createDate: "2025-07-05",
    title: "Explore Local Coffee Shops",
    content: "Exploring local coffee shops can be fun.\nLatte art adds joy to your coffee experience.\nCoffee breaks can refresh your mind during study.",
    image: Image4,
    category: "coffee"
  },
  {
    id: 6,
    createDate: "2025-07-06",
    title: "Stay Motivated While Studying",
    content: "Setting clear study goals keeps you focused.\nStudy with friends to stay motivated.\nReview your notes regularly to strengthen memory.",
    image: Image2,
    category: "study"
  },
  {
    id: 7,
    createDate: "2025-07-07",
    title: "Expand Your World Through Books",
    content: "Reading different genres expands perspective.\nJoin a book club to discuss ideas with others.\nKeep a reading journal to track what you learn.",
    image: Image1,
    category: "book"
  },
  {
    id: 8,
    createDate: "2025-07-08",
    title: "Travel Tips for Mindful Explorers",
    content: "Traveling teaches you to adapt to new places.\nExploring nature can reduce stress and anxiety.\nLearning basic phrases in local language helps.",
    image: Image2,
    category: "trip"
  },
  {
    id: 9,
    createDate: "2025-07-09",
    title: "Discover Your Coffee Style",
    content: "Coffee can be enjoyed alone or with friends.\nExperiment with different beans for taste variety.\nMorning coffee can be part of a productive routine.",
    image: Image5,
    category: "coffee"
  },
  {
    id: 10,
    createDate: "2025-07-10",
    title: "Small Joys of Traveling",
    content: "Travel helps you gain confidence in yourself.\nExploring new foods is part of the adventure.\nCapture small moments that make trips special.",
    image: Image2,
    category: "trip"
  },
];




export const ArticleStateContext  = createContext();

function App() {


  return (
    <>
      <ArticleStateContext.Provider value={mockData}>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/book" element={<Book/>}/>
        <Route path="/coffee" element={<Coffee/>}/>
        <Route path="/study" element={<Study/>}/>
        <Route path="/trip" element={<Trip/>}/>
        <Route path="/book/:id" element={<ArticleDetail/>}/>
        <Route path="/coffee/:id" element={<ArticleDetail/>}/>
        <Route path="/study/:id" element={<ArticleDetail/>}/>
        <Route path="/trip/:id" element={<ArticleDetail/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
      </ArticleStateContext.Provider>
    </>
  )
}

export default App
