"""
Test the optical simulation backend
Run this file after starting the backend server to verify it's working correctly.
"""

import requests
import json

# API endpoint
API_URL = "http://localhost:8000"

def test_health():
    """Test health check endpoint"""
    print("\n=== Testing Health Check ===")
    response = requests.get(f"{API_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_components():
    """Test components list endpoint"""
    print("\n=== Testing Components List ===")
    response = requests.get(f"{API_URL}/api/components")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Available components: {len(data['components'])}")
    for comp in data['components']:
        print(f"  - {comp['name']} ({comp['type']})")
    return response.status_code == 200

def test_simulation():
    """Test optical simulation endpoint"""
    print("\n=== Testing Optical Simulation ===")
    
    # Create a simple optical setup
    setup = {
        "components": [
            {
                "id": "source-1",
                "type": "source",
                "position": {"x": 100, "y": 300},
                "rotation": 0,
                "properties": {
                    "angle": 0,
                    "wavelength": 632.8,
                    "intensity": 100
                }
            },
            {
                "id": "mirror-1",
                "type": "mirror",
                "position": {"x": 400, "y": 300},
                "rotation": 45,
                "properties": {
                    "reflectivity": 95,
                    "width": 50
                }
            },
            {
                "id": "detector-1",
                "type": "detector",
                "position": {"x": 400, "y": 100},
                "rotation": 0,
                "properties": {
                    "sensitivity": 90,
                    "width": 50
                }
            }
        ],
        "simulationSettings": {
            "freqStart": 400,
            "freqStop": 700,
            "freqPoints": 10
        }
    }
    
    response = requests.post(f"{API_URL}/api/simulate", json=setup)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nSimulation Results:")
        print(f"  - Rays traced: {len(data['rays'])}")
        print(f"  - Path segments: {len(data['pathLengths'])}")
        print(f"  - Frequency points: {len(data['frequencySweep'])}")
        
        if data['rays']:
            ray = data['rays'][0]
            print(f"\n  First ray:")
            print(f"    - Color: {ray['color']}")
            print(f"    - Intensity: {ray['intensity']:.2f}")
            print(f"    - Points: {len(ray['points'])}")
        
        if data['pathLengths']:
            print(f"\n  Path lengths:")
            for pl in data['pathLengths']:
                print(f"    - {pl['componentId']}: {pl['length']:.2f} units")
        
        return True
    else:
        print(f"Error: {response.text}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("Optical Designer Backend Tests")
    print("=" * 50)
    print(f"\nTesting API at: {API_URL}")
    print("Make sure the backend server is running!")
    
    try:
        results = []
        results.append(("Health Check", test_health()))
        results.append(("Components List", test_components()))
        results.append(("Optical Simulation", test_simulation()))
        
        print("\n" + "=" * 50)
        print("Test Results Summary")
        print("=" * 50)
        
        for test_name, passed in results:
            status = "✓ PASSED" if passed else "✗ FAILED"
            print(f"{test_name}: {status}")
        
        all_passed = all(result[1] for result in results)
        if all_passed:
            print("\n🎉 All tests passed!")
        else:
            print("\n⚠️  Some tests failed. Check the output above.")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to backend server.")
        print("   Please make sure the server is running at http://localhost:8000")
        print("\n   To start the server:")
        print("   1. cd backend")
        print("   2. python -m venv venv")
        print("   3. .\\venv\\Scripts\\activate (Windows) or source venv/bin/activate (Unix)")
        print("   4. pip install -r requirements.txt")
        print("   5. uvicorn main:app --reload")

if __name__ == "__main__":
    main()
