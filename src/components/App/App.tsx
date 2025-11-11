import ExamScreen from '../../pages/ExamScreen/ExamScreen.tsx';
import '../../styles/global.scss';
import {CardScreen} from '../../pages/CardScreen/CardScreen.tsx';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {AppRoute} from '../../const.ts';
import {EditCardScreen} from '../../pages/EditCardScreen/EditCardScreen.tsx';
import {ExamListScreen} from '../../pages/ExamListScreen/ExamListScreen.tsx';

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
            path={'/card-edit'}
            element={<EditCardScreen canEdit={true}/>}
          />
          <Route
            path={'/exam-list'}
            element={<ExamListScreen isFavorites={true}/>}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
