import { BrowserRouter } from "react-router-dom";

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.tsx'
import { PlanningSessionsProvider } from './context/PlanningSessionsContext.tsx'
import { RoadmapItemsProvider } from './context/RoadmapItemsContext.tsx'
import { ItemInputsProvider } from './context/ItemInputsContext.tsx'
import theme from './theme'
import './index.css'

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
  
