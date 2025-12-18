import ExamScreen from '../../pages/ExamScreen/ExamScreen.tsx';
import '../../styles/global.scss';
import {CardScreen} from '../../pages/CardScreen/CardScreen.tsx';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {AppRoute} from '../../const.ts';
import {EditCardScreen} from '../../pages/EditCardScreen/EditCardScreen.tsx';
import {LoginScreen} from '../../pages/LoginScreen/LoginScreen.tsx';
import {RegistrationScreen} from '../../pages/RegistrationScreen/RegistrationScreen.tsx';
import {ExamListScreen} from '../../pages/ExamListScreen/ExamListScreen.tsx';
import ExamCover from '../../pages/ExamCover/ExamCover.tsx';
import {MainScreen} from '../../pages/MainScreen/MainScreen.tsx';
import NotFoundScreen from '../../pages/NotFoundScreen/NotFoundScreen.tsx';
import {ResultScreen} from '../../pages/ResultScreen/ResultScreen.tsx';
import {FileUploadScreen} from '../../pages/FileUploadScreen/FileUploadScreen.tsx';


export default function App() {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');

  const isAuthPage =
    location.pathname === AppRoute.Registration ||
    location.pathname === AppRoute.Login;

  if (!token && !isAuthPage) {
    return <Navigate to={AppRoute.Registration} replace />;
  }

  return (
    <div className="screen">
        <Routes>
          <Route
            path={AppRoute.Exam}
            element={<ExamScreen/>}
          />
          <Route
            path={AppRoute.Card}
            element={<CardScreen/>}
          />
          <Route
            path={AppRoute.CardEdit}
            element={<EditCardScreen/>}
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
            element={<EditCardScreen/>}
          />
          <Route
            path={AppRoute.FavouriteExamList}
            element={<ExamListScreen isFavorites={true}/>}
          />
          <Route
            path={AppRoute.ExamList}
            element={<ExamListScreen isFavorites={false}/>}
          />
          <Route
            path={AppRoute.ExamCover}
            element={<ExamCover/>}
          />
          <Route
            path={AppRoute.Main}
            element={<MainScreen/>}
          />
          <Route
            path={AppRoute.NotFound}
            element={<NotFoundScreen/>}
          />
          <Route
            path={AppRoute.Result}
            element={<ResultScreen/>}
          />
          <Route
            path={AppRoute.FileUpload}
            element={<FileUploadScreen/>}
          />
        </Routes>
    </div>
  );
}
