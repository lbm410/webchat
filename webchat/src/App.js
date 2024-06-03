import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from './config';

const App = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/`)
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
      });
  }, []);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default App;
