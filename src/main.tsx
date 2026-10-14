import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initNetworkLogger } from './utils/networkLogger';

initNetworkLogger();

createRoot(document.getElementById('root')!).render(<App />);
