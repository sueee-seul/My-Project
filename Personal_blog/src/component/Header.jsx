import './Header.css'

const Header = ({title})=>{
    const today = new Date();
    const dateText = today.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
    return(
        <header className='header-wrapper'>
        <div className='header-date'>{dateText}</div>
        <div className='header-line'/>
        <h1>{title}</h1> 
        <h2 className='header-title'>A personal journal exploring everyday life, learning journeys, and quiet thoughts.</h2>
        <p className='header-subtitle'>Learning to code, enjoying small things, sharing what I know.</p>
        </header>
    )
}

export default Header;