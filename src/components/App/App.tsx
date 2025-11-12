import ExamScreen from '../../pages/ExamScreen/ExamScreen.tsx';
import '../../styles/global.scss';
import {CardScreen} from '../../pages/CardScreen/CardScreen.tsx';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {AppRoute} from '../../const.ts';
import {EditCardScreen} from '../../pages/EditCardScreen/EditCardScreen.tsx';
import {LoginScreen} from '../../pages/LoginScreen/LoginScreen.tsx';
import {RegistrationScreen} from '../../pages/RegistrationScreen/RegistrationScreen.tsx';
import {ExamListScreen} from '../../pages/ExamListScreen/ExamListScreen.tsx';
import ExamCover from '../../pages/ExamCover/ExamCover.tsx';


export default function App() {
  return (
    <div className="screen">
      <BrowserRouter>
        <Routes>
          <Route
            path={AppRoute.Exam}
            element={<ExamScreen canEdit={true}/>}
          />
          <Route
            path={AppRoute.Card}
            element={<CardScreen/>}
          />
          <Route
            path={AppRoute.CardEdit}
            element={<EditCardScreen canEdit={true}/>}
            />
          <Route
            path={AppRoute.Login}
            element={<LoginScreen/>}
          />
          <Route
            path={AppRoute.Registration}
            element={<RegistrationScreen/>}
          />
          <Route
            path={AppRoute.CardEdit}
            element={<EditCardScreen canEdit={false}/>}
          />
          <Route
            path={AppRoute.ExamList}
            element={<ExamListScreen isFavorites={true}/>}
          />
          <Route
            path={AppRoute.ExamCover}
            element={<ExamCover/>}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
