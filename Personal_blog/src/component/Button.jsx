import './Button.css'

const Button = ({text, onClick,type="default"}) =>{
    return(
        <button className={`custom-button ${type}`} onClick={onClick}>
            {text}
        </button>
    )
}

export default Button;