import React, { useEffect, useRef } from 'react';
import { BrowserRouter } from "react-router-dom";
import {Stage, AddObject, Cuelist, Console, Navbar} from "./components"
import './index.css'

const App = () => {


  return (
    <BrowserRouter>
      <div className=" bg-white flex flex-col pt-16">
  <Navbar className= "z-50  "/>
  <div><Console className= "z-30  "/></div>
  </div>
    </BrowserRouter>


  );
};

export default App
