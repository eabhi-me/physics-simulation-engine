# Optical Setup Designer

A full-stack web application for designing and simulating optical setups with drag-and-drop components.

## Features

- 🎨 **Visual Designer**: Drag and drop optical components (mirrors, lenses, sources, detectors)
- 🔧 **Component Properties**: Edit focal length, reflectivity, angle, and more
- 🌈 **Ray Visualization**: See light rays propagate through your optical setup
- 📊 **Simulation**: Backend calculates ray paths, path lengths, and frequency sweeps
- 💾 **Export/Import**: Download and upload optical setups as JSON
- 🎯 **Angle Control**: Adjust angle of incidence for light sources
- 📈 **Frequency Sweep**: Analyze optical response across frequencies

## Project Structure

```
Physics-lab/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── types/        # TypeScript definitions
│   │   ├── utils/        # Helper functions
│   │   └── App.tsx       # Main application
│   ├── package.json
│   └── vercel.json       # Vercel deployment config
├── backend/           # FastAPI backend
│   ├── main.py           # API endpoints
│   ├── simulation.py     # Optical simulation logic
│   ├── requirements.txt
│   └── render.yaml       # Render deployment config
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- pip

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On Unix/MacOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

The backend API will run on `http://localhost:8000`

## Usage

1. **Add Components**: Click components in the sidebar to add them to the canvas
2. **Move & Rotate**: Drag components to reposition, use rotation handle to rotate
3. **Edit Properties**: Select a component to edit its properties in the right panel
4. **Configure Light Source**: Set angle of incidence and frequency sweep parameters
5. **Run Simulation**: Click "Run Simulation" to compute ray paths
6. **Export Setup**: Click "Download JSON" to save your optical design

## API Endpoints

### POST `/api/simulate`

Processes optical setup and returns simulation results.

**Request Body:**
```json
{
  "components": [
    {
      "id": "source-1",
      "type": "source",
      "position": { "x": 100, "y": 300 },
      "rotation": 0,
      "properties": {
        "angle": 45,
        "wavelength": 632.8
      }
    }
  ],
  "simulationSettings": {
    "freqStart": 400,
    "freqStop": 700,
    "freqPoints": 10
  }
}
```

**Response:**
```json
{
  "rays": [...],
  "pathLengths": [...],
  "frequencySweep": [...]
}
```

## Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Backend (Render)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

Or use the included `render.yaml` for Blueprint deployment.

## Environment Variables

### Frontend

Create `.env` file in `frontend/`:
```
VITE_API_URL=http://localhost:8000
```

For production, update to your backend URL.

### Backend

No environment variables required for basic setup.

## Technologies Used

### Frontend
- React 18 with TypeScript
- React Flow for drag-and-drop canvas
- TailwindCSS for styling
- Lucide React for icons
- Vite for build tooling

### Backend
- FastAPI for REST API
- NumPy for numerical computations
- Pydantic for data validation
- Uvicorn as ASGI server

## 📚 Complete Documentation

### 🚀 Quick Start
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[DEMO.md](DEMO.md)** - Interactive demo scenarios

### 📖 Reference Guides
- **[COMPONENTS.md](COMPONENTS.md)** - Complete component reference
- **[VIDEO_SCRIPTS.md](VIDEO_SCRIPTS.md)** - Tutorial video scripts
- **[INDEX.md](INDEX.md)** - Documentation index

### 🏗️ Technical Documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[VISUAL.md](VISUAL.md)** - Visual diagrams & flows
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment

### 📊 Project Info
- **[SUMMARY.md](SUMMARY.md)** - Project overview
- **[STATUS.md](STATUS.md)** - Project status

## 🎯 Quick Links

- **Frontend Demo**: Run `npm run dev` in `frontend/`
- **Backend API**: Run `uvicorn main:app --reload` in `backend/`
- **API Documentation**: http://localhost:8000/docs
- **Test Backend**: `python test_api.py` in `backend/`

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- React Flow for the excellent drag-and-drop library
- FastAPI for the modern Python framework
- TailwindCSS for the utility-first CSS framework
- The open-source community

## 📞 Support & Questions

- Check [QUICKSTART.md](QUICKSTART.md) for setup issues
- Review [DEMO.md](DEMO.md) for usage examples
- See [COMPONENTS.md](COMPONENTS.md) for component details
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help

## 🎓 Learning Resources

This project demonstrates:
- Modern React development with TypeScript
- FastAPI backend development
- REST API design and integration
- Drag-and-drop user interfaces
- Optical physics simulation
- Full-stack deployment strategies
