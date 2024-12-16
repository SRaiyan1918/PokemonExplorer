import React, {useState, useEffect} from 'react';
import Navbar from './components/Navbar';
import News from './components/News';
import './theme.css';

function App() {
	const [theme, setTheme] = useState('dark');
	const toggleTheme = () => {
     const newTheme = theme === 'light' ? 'dark' : 'light';
     setTheme(newTheme);
     document.body.className = `${newTheme}-theme`;
     localStorage.setItem('theme', newTheme);
   };

useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
     document.body.className = `${savedTheme}-theme`;
  }, []);

	return(<>
		<Navbar toggleTheme={toggleTheme} theme={theme} />
		<div className='container'>
			<News />
		</div>
	</>)
}

export default App
