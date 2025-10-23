import ExamScreen from '../../pages/ExamScreen/ExamScreen.tsx';
import '../../styles/global.scss';
import {CardScreen} from '../../pages/CardScreen/CardScreen.tsx';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {AppRoute} from '../../const.ts';

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
        </Routes>
      </BrowserRouter>
    </div>
  );
}
