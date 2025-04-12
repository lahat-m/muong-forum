import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import UserDashboard from './pages/UsersDashboard'

function App() {

	return (
		<Router>
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/users/dashboard/" element={<UserDashboard />} />
				<Route path="/auth" element={<AuthPage />} />
			</Routes>
		</Router>
	)
}

export default App
