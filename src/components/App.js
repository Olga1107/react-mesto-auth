import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import '../index.css';

import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ConfirmationDeleteCard from './ConformationDeleteCard';
import Login from './Login';
import Register from './Register';
import InfoTooltip from './InfoTooltip';
import ProtectedRoute from './ProtectedRoute';
import { CurrentUserContext } from '../contexts/CurrentUserContext';

import { api } from '../utils/Api';
import * as authApi from '../utils/authApi'

import okRegistration from '../images/ok-registration.png'
import errorRegistration from '../images/error-registration.png'

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false)
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false)
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false)
  const [isConfirmationDeletePopupOpen, setIsConfirmationDeletePopupOpen] = useState(false)
  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState({})
  const [currentUser, setCurrentUser] = useState({})
  const [cards, setCards] = useState([])
  const [cardDelete, setCardDelete] = useState({})
  const [dataInfoTool, setDataInfoTool] = useState({
    title: "",
    icon: "",
  });
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState("");
  const navigate = useNavigate();

  function tokenCheck() {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      authApi
        .checkToken(jwt)
        .then((res) => {
          if (res) {
            setLoggedIn(true);
            setUserData(res.data.email);
            navigate("/", { replace: true });
          } else {
            setDataInfoTool({
              title: "??????-???? ?????????? ???? ??????! ???????????????????? ?????? ??????.",
              icon: errorRegistration,
            });
          }
        })
        .catch((err) => console.log(err));
    }
  }

  useEffect(() => {
    tokenCheck();
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([users, cardData]) => {
        setCurrentUser(users)
        setCards(cardData);
      })
      .catch((err) => {
        console.log(`????????????: ${err}`);
      });
  }, [])

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c)));
      })
      .catch((err) => {
        console.log(`????????????: ${err}`);
      });

  }


  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then(() => {
        setCards(cards.filter((c) => c._id !== card._id));
        closeAllPopup();
      })

      .catch((err) => {
        console.log(`????????????: ${err}`);
      });
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true)
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true)
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true)
  }

  function handleConfirmationDeleteClick(card) {
    setIsConfirmationDeletePopupOpen(true)
    setCardDelete(card)
  }

  function handleInfoTooltipOpen() {
    setIsInfoToolTipOpen(true);
  }

  function closeAllPopup() {
    setIsEditAvatarPopupOpen(false)
    setIsEditProfilePopupOpen(false)
    setIsAddPlacePopupOpen(false)
    setIsConfirmationDeletePopupOpen(false)
    setIsInfoToolTipOpen(false)
    setSelectedCard({ isOpen: false })
  }

  function handleUpdateUser(userData) {
    api
      .setUserInfo(userData)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopup();
      })
      .catch((err) => {
        console.log(`????????????: ${err}`);
      });
  }

  function handleUpdateAvatar(userData) {
    api
      .setUserAvatar(userData.avatar)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopup();
      })
      .catch((err) => {
        console.log(`????????????: ${err}`);
      });
  }

  function handleAddPlaceSubmit(cardData) {
    api
      .addCards(cardData)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopup();
      })
      .catch((err) => {
        console.log(`????????????: ${err}`);
      });
  }



  function handleRegister(email, password) {
    authApi
      .register(email, password)
      .then(() => {
        navigate("/sign-in", { replace: true });
        setDataInfoTool({
          title: "???? ?????????????? ????????????????????????????????????!",
          icon: okRegistration
        });
      })
      .catch((err) => {
        console.error(err);
        setDataInfoTool({
          title: "??????-???? ?????????? ???? ??????! ???????????????????? ?????? ??????.",
          icon: errorRegistration,
        });
      })
      .finally(() => handleInfoTooltipOpen());
  }

  function handleLogin(email, password) {
    authApi
      .authorize(email, password)
      .then((data) => {
        localStorage.setItem("token", data.token);
        setUserData(email);
        setLoggedIn(true);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        setDataInfoTool({
          title: "??????-???? ?????????? ???? ??????! ???????????????????? ?????? ??????.",
          icon: errorRegistration,
        });
        console.error(err);
        handleInfoTooltipOpen();
      });
  }

  function signOut() {
    setLoggedIn(false);
    setUserData("");
    localStorage.removeItem("token");
    navigate("/sign-in", { replace: true });
  }


  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">

        <Header
          headerMail={userData}
          signOut={signOut}
        />


        <Routes>
          <Route element={<ProtectedRoute loggedIn={loggedIn} />}>
            <Route
              path="/"
              element={
                <Main
                  onEditProfile={handleEditProfileClick}
                  onAddPlace={handleAddPlaceClick}
                  onEditAvatar={handleEditAvatarClick}
                  setSelectedCard={setSelectedCard}
                  cards={cards}
                  handleCardLike={handleCardLike}
                  handleCardDelete={handleConfirmationDeleteClick} />
              }
            />
          </Route>
          <Route path='/sign-up' element={<Register handleRegister={handleRegister} />} />
          <Route path='/sign-in' element={<Login handleLogin={handleLogin} />} />
          <Route path='/' element={loggedIn ? <Navigate to="/" /> : <Navigate to='/sign-in' />} />
        </Routes>


        {loggedIn && <Footer />}

        <ImagePopup
          card={selectedCard}
          isOpen={selectedCard.isOpen}
          onClose={closeAllPopup}
        />

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopup}
          onUpdateUser={handleUpdateUser} />

        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopup}
          handleAddPlaceSubmit={handleAddPlaceSubmit} />

        <ConfirmationDeleteCard
          isOpen={isConfirmationDeletePopupOpen}
          onClose={closeAllPopup}
          card={cardDelete}
          onCardDelete={handleCardDelete} />

        <EditAvatarPopup
          onUpdateAvatar={handleUpdateAvatar}
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopup} />

        <InfoTooltip
          isOpen={isInfoToolTipOpen}
          onClose={closeAllPopup}
          title={dataInfoTool.title}
          icon={dataInfoTool.icon}
        />

      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;