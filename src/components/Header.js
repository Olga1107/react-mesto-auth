import { Link, Route } from 'react-router-dom';
import logo from '../images/Logo.svg';

function Header(props) {
  return (
    <header className="header">
      <img 
      src={logo} 
      alt="Логотип сервиса Mesto" 
      className="header__logo" />
      <Route exact path="/">
        <div className="header__info">
          <p className="header__out">{props.headerMail}</p>
          <Link to="/sign-in" className="header__out-link" onClick={props.signOut}>
            Выйти
          </Link>
        </div>
      </Route>
      <Route path="/sign-in">
        <Link to="/sign-up" className="header__sign-link">
          Регистрация
        </Link>
      </Route>
      <Route path="/sign-up">
        <Link to="/sign-in" className="header__sign-link">
          Войти
        </Link>
      </Route>
    </header>)
}

export default Header;