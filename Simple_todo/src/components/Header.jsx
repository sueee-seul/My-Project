import './Header.css';

const Header = () =>{
    return <div>
        <h3 className="header">Today</h3>
        <h1>{new Date().toDateString()}</h1>
    </div>
}

export default Header;