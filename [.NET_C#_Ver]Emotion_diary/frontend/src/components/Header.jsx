import './Header.css';

    const Header = ({title, leftButton, rightButton})=>{
    return (<header className="Header">
        <div className='header_left'>{leftButton}</div>
        <div className='header_center'>{title}</div>
        <div className='header_right'>{rightButton}</div>

    </header>
    );
    }
   
export default Header;