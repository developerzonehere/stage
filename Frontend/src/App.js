import './App.css';
import React, { useState } from 'react';

const App = () => {
  const [address, setAddress] = useState('');
  const [outlet, setOutlet] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/outlet', {
        method: 'POST',
        body: JSON.stringify({ address }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
        setOutlet(data.outletName);
        
    
    } catch (error) {
      console.error('Error:', error);

    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your Address"
        />
        <button type="submit">Submit</button>
      </form>
      <div>{outlet}</div>
    </div>
  );
};

export default App;
