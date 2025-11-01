import axios from 'axios';
import { OpticalSetup, SimulationResult } from '../types/optical';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const simulateOpticalSetup = async (setup: OpticalSetup): Promise<SimulationResult> => {
  try {
    const response = await axios.post(`${API_URL}/api/simulate`, setup);
    return response.data;
  } catch (error) {
    console.error('Simulation error:', error);
    throw error;
  }
};
