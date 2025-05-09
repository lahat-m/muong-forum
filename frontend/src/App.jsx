import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import UserDashboard from './pages/UsersDashboard'
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';

function App() {

	return (
		<Router>
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/users/dashboard/" element={<UserDashboard />} />
				<Route path="/auth" element={<AuthPage />} />
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/reset-password" element={<ResetPasswordPage />} />
				<Route path="/auth/verify-email" element={<EmailVerificationPage />} />
			</Routes>
		</Router>
	)
}

export default App
