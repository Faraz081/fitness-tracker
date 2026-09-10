import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Progress from './pages/Progress';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import WorkoutList from './pages/WorkoutList';
import WorkoutForm from './pages/WorkoutForm';
import Nutrition from './pages/Nutrition';
import WorkoutHistory from './pages/WorkoutHistory';
import WorkoutDetail from './pages/WorkoutDetail';
import ExerciseHistory from './pages/ExerciseHistory';
import { useAuth } from './hooks/useAuth';
function PublicOnly({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return null;
    }
    if (user) {
        return <Navigate to="/" replace/>;
    }
    return <>{children}</>;
}
function HomeRouter() {
    const { user, loading } = useAuth();
    if (loading) {
        return null;
    }
    return user ? (<Dashboard />) : (<Landing />);
}
export default function App() {
    return (<Routes>
  <Route path="/landing" element={<Landing />}/>
  <Route path="/" element={<HomeRouter />}/>
      <Route path="/progress" element={<ProtectedRoute>
            <Progress />
          </ProtectedRoute>}/>
      <Route path="/analytics" element={<ProtectedRoute>
            <Analytics />
          </ProtectedRoute>}/>
      <Route path="/goals" element={<ProtectedRoute>
            <Goals />
          </ProtectedRoute>}/>
      <Route path="/notifications" element={<ProtectedRoute>
            <Notifications />
          </ProtectedRoute>}/>
      <Route path="/settings" element={<ProtectedRoute>
            <Settings />
          </ProtectedRoute>}/>
      <Route path="/reports" element={<ProtectedRoute>
            <Reports />
          </ProtectedRoute>}/>
      <Route element={<Layout />}>
        <Route path="/login" element={<PublicOnly>
              <Login />
            </PublicOnly>}/>
        <Route path="/register" element={<PublicOnly>
              <Register />
            </PublicOnly>}/>
        <Route path="/profile" element={<ProtectedRoute>
              <Profile />
            </ProtectedRoute>}/>
        <Route path="/workouts" element={<ProtectedRoute>
              <WorkoutList />
            </ProtectedRoute>}/>
        <Route path="/workouts/new" element={<ProtectedRoute>
              <WorkoutForm />
            </ProtectedRoute>}/>
        <Route path="/workouts/:id/edit" element={<ProtectedRoute>
              <WorkoutForm />
            </ProtectedRoute>}/>
        <Route path="/workouts-history" element={<ProtectedRoute>
              <WorkoutHistory />
            </ProtectedRoute>}/>
        <Route path="/workouts/:id" element={<ProtectedRoute>
              <WorkoutDetail />
            </ProtectedRoute>}/>
        <Route path="/exercises" element={<ProtectedRoute>
              <ExerciseHistory />
            </ProtectedRoute>}/>
        <Route path="/nutrition" element={<ProtectedRoute>
              <Nutrition />
            </ProtectedRoute>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Route>
    </Routes>);
}
