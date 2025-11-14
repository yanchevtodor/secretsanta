import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import LoginForm from './components/Login';
import ProfileForm from './components/Profile';
import RandomPicker from './components/RandomPicker';
import AdminPanel from './components/AdminPanel';

function App() {

  return (
    <UserProvider>

      <Router>
        <div class="snowflakes" aria-hidden="true">
          <div class="snowflake">
            ❅
          </div>
          <div class="snowflake">
            ❅
          </div>
          <div class="snowflake">
            ❆
          </div>
          <div class="snowflake">
            ❄
          </div>
          <div class="snowflake">
            ❅
          </div>
          <div class="snowflake">
            ❆
          </div>
          <div class="snowflake">
            ❄
          </div>
          <div class="snowflake">
            ❅
          </div>
          <div class="snowflake">
            ❆
          </div>
          <div class="snowflake">
            ❄
          </div>
        </div>
        <div className="App">
          <header className="App-header">
            <img src="/imotipremier-logo.png" alt="logo" className="logo" />
          </header>
          <main>
            <Routes>
              <Route path="/" element={<LoginForm />} />
              <Route path="/login" element={<LoginForm />} />

              {/* Защитени маршрути */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfileForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/random"
                element={
                  <PrivateRoute>
                    <RandomPicker />
                  </PrivateRoute>
                }
              />

              {/* Само за админ */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>
        </div>

      </Router>
    </UserProvider>

  );
}

export default App;
