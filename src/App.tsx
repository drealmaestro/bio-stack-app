import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/ui/toast';
import ReloadPrompt from './components/ReloadPrompt';
import { useStore } from './store/useStore';
import { initSync } from './lib/sync';
import { initAuth } from './lib/firebase';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));
const WorkoutManager = lazy(() => import('./pages/WorkoutManager').then((module) => ({ default: module.WorkoutManager })));
const ActiveWorkout = lazy(() => import('./pages/ActiveWorkout').then((module) => ({ default: module.ActiveWorkout })));
const HistoryLog = lazy(() => import('./pages/History').then((module) => ({ default: module.HistoryLog })));
const Nutrition = lazy(() => import('./pages/Nutrition').then((module) => ({ default: module.Nutrition })));

function PageFallback() {
    return <div className="py-10 text-center text-sm text-zinc-500">Loading...</div>;
}

function App() {
    const { seed } = useStore();

    useEffect(() => {
        seed();
    }, [seed]);

    useEffect(() => {
        const cleanupAuth = initAuth();
        const cleanupSync = initSync();
        return () => {
            cleanupSync();
            cleanupAuth();
        };
    }, []);

    return (
        <BrowserRouter>
            <ToastContainer />
            <ReloadPrompt />
            <Suspense fallback={<PageFallback />}>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="workouts" element={<WorkoutManager />} />
                        <Route path="active" element={<ActiveWorkout />} />
                        <Route path="history" element={<HistoryLog />} />
                        <Route path="nutrition" element={<Nutrition />} />
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
