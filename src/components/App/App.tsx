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
import {Toaster, toast} from 'react-hot-toast';
import {useEffect, useRef} from 'react';
import NoAccessScreen from '../../pages/NoAccessScreen/NoAccessScreen.tsx';
import {ExamCreateScreen} from '../../pages/ExamCreateScreen/ExamCreateScreen';
import {SearchExamPage} from '../../pages/SearchExamPage/SearchExamPage.tsx';
import {AccountScreen} from
    '../../pages/AccountScreen/AccountScreen.tsx';


export default function App() {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');
  const lastOfflineToastTimeRef = useRef(0);

  const isAuthPage =
    location.pathname === AppRoute.Registration ||
    location.pathname === AppRoute.Login;

  useEffect(() => {
    const onOfflineMutationBlocked = () => {
      const now = Date.now();
      if (now - lastOfflineToastTimeRef.current < 1200) {
        return;
      }
      lastOfflineToastTimeRef.current = now;
      toast.error('Действие доступно только онлайн');
    };

    window.addEventListener('app:offline-mutation-blocked', onOfflineMutationBlocked);
    return () => {
      window.removeEventListener('app:offline-mutation-blocked', onOfflineMutationBlocked);
    };
  }, []);

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
          <Route
            path={AppRoute.NoAccess}
            element={<NoAccessScreen/>}
          />
          <Route
            path={AppRoute.ExamCreate}
            element={<ExamCreateScreen/>}
          />
          <Route
            path={AppRoute.SearchExam}
            element={<SearchExamPage/>}
          />
          <Route
            path={AppRoute.Account}
            element={<AccountScreen/>}
          />
        </Routes>
      <Toaster position="top-center"/>
    </div>
  );
}
