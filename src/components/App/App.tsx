import ExamScreen from '../../pages/ExamScreen/ExamScreen.tsx';
import '../../styles/global.scss';
import {CardScreen} from '../../pages/CardScreen/CardScreen.tsx';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {AppRoute} from '../../const.ts';
import {CardEditScreen} from '../../pages/CardEditScreen/CardEditScreen.tsx';
import {ExamListScreen} from '../../pages/ExamListScreen/ExamListScreen.tsx';
import {FavoriteExamListScreen} from '../../pages/FavoriteExamScreen/FavoriteExamScreen.tsx';

export default function App() {
  return (
    <div className="screen">
      <BrowserRouter>
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
            path={'/card-edit'}
            element={<CardEditScreen/>}
          />
          <Route
            path={'/exam-list'}
            element={<ExamListScreen/>}
          />
          <Route
            path={'/favorite-exam-list'}
            element={<FavoriteExamListScreen/>}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
