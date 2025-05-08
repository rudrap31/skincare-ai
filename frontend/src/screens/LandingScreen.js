import Landing from '../components/Landing';
import { useAuth } from '../context/AuthContext';
import HomeScreen from './HomeScreen';

export default function LandingScreen() {
    const { user } = useAuth();

    return user ? <HomeScreen /> : <Landing />;
}
