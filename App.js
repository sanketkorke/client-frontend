import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Streamer from './Streamer';
import Viewer from './Viewer';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Streamer />} />
                <Route path="/view" element={<Viewer />} />
            </Routes>
        </Router>
    );
}
