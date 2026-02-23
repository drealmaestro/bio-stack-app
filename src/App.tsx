import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { WorkoutManager } from './pages/WorkoutManager';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { HistoryLog } from './pages/History';
import { ToastContainer } from './components/ui/toast';

import { useEffect } from 'react';
import { useStore } from './store/useStore';

function App() {
    const { seed } = useStore();

    useEffect(() => {
        seed();
    }, [seed]);

    return (
        <BrowserRouter>
            <ToastContainer />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="workouts" element={<WorkoutManager />} />
                    <Route path="active" element={<ActiveWorkout />} />
                    <Route path="history" element={<HistoryLog />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
