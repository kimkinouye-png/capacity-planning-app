import { BrowserRouter } from "react-router-dom";

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.tsx'
import './index.css'
import { PlanningSessionsProvider } from './context/PlanningSessionsContext'
import { RoadmapItemsProvider } from './context/RoadmapItemsContext'
import { ItemInputsProvider } from './context/ItemInputsContext'
import theme from './theme'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <PlanningSessionsProvider>
            <RoadmapItemsProvider>
              <ItemInputsProvider>
                <App />
              </ItemInputsProvider>
            </RoadmapItemsProvider>
          </PlanningSessionsProvider>
        </BrowserRouter>
      </ChakraProvider>
    </React.StrictMode>,
  );
  
