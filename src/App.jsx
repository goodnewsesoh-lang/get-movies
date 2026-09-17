import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import Genres from './pages/Genres.jsx';
import GenreDetail from './pages/GenreDetail.jsx';
import Search from './pages/Search.jsx';
import TitleDetails from './pages/TitleDetails.jsx';
import CollectionDetail from './pages/CollectionDetail.jsx';

import AdminLogin from './pages/admin/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import ManageTitles from './pages/admin/ManageTitles.jsx';
import TitleForm from './pages/admin/TitleForm.jsx';
import Collections from './pages/admin/Collections.jsx';
import CollectionForm from './pages/admin/CollectionForm.jsx';
import HomeOrder from './pages/admin/HomeOrder.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-ink">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Browse type="movie" heading="Movies" />} />
          <Route path="/tv-shows" element={<Browse type="tv" heading="TV Shows" />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/genres/:name" element={<GenreDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/title/:id" element={<TitleDetails />} />
          <Route path="/collections/:slug" element={<CollectionDetail />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/titles" element={<ProtectedRoute><ManageTitles /></ProtectedRoute>} />
          <Route path="/admin/titles/new" element={<ProtectedRoute><TitleForm /></ProtectedRoute>} />
          <Route path="/admin/titles/:id/edit" element={<ProtectedRoute><TitleForm /></ProtectedRoute>} />
          <Route path="/admin/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
          <Route path="/admin/collections/new" element={<ProtectedRoute><CollectionForm /></ProtectedRoute>} />
          <Route path="/admin/collections/:id/edit" element={<ProtectedRoute><CollectionForm /></ProtectedRoute>} />
          <Route path="/admin/home-order" element={<ProtectedRoute><HomeOrder /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
  }
