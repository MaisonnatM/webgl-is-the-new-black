import React from 'react';
import { BrowserRouter, Route } from "react-router-dom";

import PimpMyChair from '../pages/PimpMyChair/PimpMyChair';

function App() {
  return (
    <BrowserRouter>
      <Route path="/" exact component={PimpMyChair} />
    </BrowserRouter>
  );
}

export default App;
