import { Route, Routes } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import HomePage from '../pages/HomePage.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes