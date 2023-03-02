import logo from '../images/Logo.svg';

function Header() {
  return (
    <header className="header">
      <img src={logo} alt="Логотип сервиса Mesto" className="header__logo" />
    </header>)
}

export default Header;