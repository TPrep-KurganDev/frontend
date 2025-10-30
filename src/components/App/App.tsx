import ExamScreen from '../../pages/ExamScreen/ExamScreen.tsx';
import '../../styles/global.scss';
import {CardScreen} from '../../pages/CardScreen/CardScreen.tsx';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {AppRoute} from '../../const.ts';
import {CardEditScreen} from '../../pages/CardEditScreen/CardEditScreen.tsx';
import {ExamListScreen} from '../../pages/ExamListScreen/ExamListScreen.tsx';

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
            path={'/cardEdit'}
            element={<CardEditScreen/>}
          />
          <Route
            path={'/examList'}
            element={<ExamListScreen/>}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
