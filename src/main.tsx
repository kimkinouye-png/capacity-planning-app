import { BrowserRouter } from "react-router-dom";

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.tsx'
import './index.css'
import { PlanningSessionsProvider } from './context/PlanningSessionsContext'
import { RoadmapItemsProvider } from './context/RoadmapItemsContext'
import { ItemInputsProvider } from './context/ItemInputsContext'
import { ActivityProvider } from './context/ActivityContext'
import { SettingsProvider } from './context/SettingsContext'
import theme from './theme'
import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ChakraProvider theme={theme}>
          <BrowserRouter>
            <SettingsProvider>
              <ActivityProvider>
                <PlanningSessionsProvider>
                  <RoadmapItemsProvider>
                    <ItemInputsProvider>
                      <App />
                    </ItemInputsProvider>
                  </RoadmapItemsProvider>
                </PlanningSessionsProvider>
              </ActivityProvider>
            </SettingsProvider>
          </BrowserRouter>
        </ChakraProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
  
