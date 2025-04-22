import './App.css';
import Navbar from './components/Navbar';
import InfoSections from './components/InfoSections';
import GradientText from "./components/ReactBits/GradientText";
import AnimatedButton from './components/ReactBits/AnimatedButton';
import AnimatedSection from './components/ReactBits/AnimatedSection';
import AnimatedText from './components/ReactBits/AnimatedText';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() { 
  return (
    <Router>
      <div className="min-h-screen"> 

        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
