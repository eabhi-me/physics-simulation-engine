"""
Optical simulation module for computing ray paths, path lengths, and frequency sweeps.
This module provides simplified optical ray tracing for mirrors, lenses, sources, and detectors.
"""

import numpy as np
from typing import List, Dict, Any, Tuple
import math

class OpticalSimulator:
    """
    Simulates optical systems by tracing light rays through components.
    """
    
    def __init__(self):
        self.c = 299792458  # Speed of light in m/s
        
    def simulate(self, components: List[Any], settings: Any) -> Dict[str, Any]:
        """
        Main simulation method that computes rays, path lengths, and frequency sweep.
        
        Args:
            components: List of optical components
            settings: Simulation settings including frequency sweep parameters
            
        Returns:
            Dictionary containing rays, path lengths, and frequency sweep data
        """
        # Sort components by x position for sequential processing
        sorted_components = sorted(components, key=lambda c: c.position.x)
        
        # Find all light sources
        sources = [c for c in sorted_components if c.type == 'source']
        
        if not sources:
            # No sources - return empty results
            return {
                'rays': [],
                'pathLengths': [],
                'frequencySweep': self._compute_frequency_sweep(settings, 0)
            }
        
        # Trace rays from each source
        all_rays = []
        all_path_lengths = []
        
        for source in sources:
            rays, path_lengths = self._trace_from_source(source, sorted_components)
            all_rays.extend(rays)
            all_path_lengths.extend(path_lengths)
        
        # Compute frequency sweep
        total_transmission = sum(ray['intensity'] for ray in all_rays) / len(all_rays) if all_rays else 0
        frequency_sweep = self._compute_frequency_sweep(settings, total_transmission)
        
        return {
            'rays': all_rays,
            'pathLengths': all_path_lengths,
            'frequencySweep': frequency_sweep
        }
    
    def _trace_from_source(self, source: Any, components: List[Any]) -> Tuple[List[Dict], List[Dict]]:
        """
        Trace rays from a light source through the optical system.
        
        Args:
            source: Source component
            components: All components in the system
            
        Returns:
            Tuple of (rays, path_lengths)
        """
        rays = []
        path_lengths = []
        
        # Get source properties
        source_props = source.properties
        wavelength = source_props.get('wavelength', 632.8)  # nm
        intensity = source_props.get('intensity', 100)
        angle = source_props.get('angle', 0)  # degrees
        
        # Calculate initial ray direction
        rotation_rad = math.radians(source.rotation)
        angle_rad = math.radians(angle)
        
        # Combined angle
        total_angle = rotation_rad + angle_rad
        
        # Ray direction vector
        dx = math.cos(total_angle)
        dy = math.sin(total_angle)
        
        # Starting position
        start_x = source.position.x
        start_y = source.position.y
        
        # Trace primary ray
        ray_points = [{'x': start_x, 'y': start_y}]
        current_x, current_y = start_x, start_y
        current_dx, current_dy = dx, dy
        current_intensity = intensity
        
        # Find next components in path
        remaining_components = [c for c in components if c.id != source.id and c.position.x > current_x]
        
        for component in remaining_components[:5]:  # Limit to 5 interactions
            # Calculate intersection point with component
            intersection = self._find_intersection(
                current_x, current_y, current_dx, current_dy,
                component
            )
            
            if intersection:
                int_x, int_y = intersection
                ray_points.append({'x': int_x, 'y': int_y})
                
                # Calculate path length
                segment_length = math.sqrt((int_x - current_x)**2 + (int_y - current_y)**2)
                path_lengths.append({
                    'componentId': component.id,
                    'length': segment_length
                })
                
                # Process interaction based on component type
                if component.type == 'mirror':
                    # Reflect ray
                    current_dx, current_dy = self._reflect_ray(
                        current_dx, current_dy, component
                    )
                    current_intensity *= component.properties.get('reflectivity', 95) / 100
                    
                elif component.type == 'lens':
                    # Refract ray (simplified)
                    current_dx, current_dy = self._refract_ray(
                        current_dx, current_dy, component
                    )
                    current_intensity *= 0.95  # Some loss through lens
                    
                elif component.type == 'detector':
                    # Ray absorbed by detector
                    current_intensity *= component.properties.get('sensitivity', 90) / 100
                    break
                
                # Update position
                current_x, current_y = int_x, int_y
                
                # Stop if intensity too low
                if current_intensity < 1:
                    break
            else:
                # No intersection, extend ray to edge of canvas
                current_x += current_dx * 300
                current_y += current_dy * 300
                ray_points.append({'x': current_x, 'y': current_y})
                break
        
        # If ray didn't hit anything, extend it
        if len(ray_points) == 1:
            current_x += dx * 500
            current_y += dy * 500
            ray_points.append({'x': current_x, 'y': current_y})
        
        # Create ray object
        color = self._wavelength_to_color(wavelength)
        rays.append({
            'id': f'ray-{source.id}',
            'points': ray_points,
            'color': color,
            'intensity': current_intensity
        })
        
        return rays, path_lengths
    
    def _find_intersection(self, x: float, y: float, dx: float, dy: float, 
                          component: Any) -> Tuple[float, float] | None:
        """
        Find intersection point between a ray and a component.
        
        Args:
            x, y: Ray origin
            dx, dy: Ray direction
            component: Component to check intersection with
            
        Returns:
            (x, y) intersection point or None
        """
        comp_x = component.position.x
        comp_y = component.position.y
        
        # Simplified intersection - check if ray passes near component
        # Project component position onto ray
        t = ((comp_x - x) * dx + (comp_y - y) * dy) / (dx*dx + dy*dy)
        
        if t <= 0:
            return None  # Component is behind ray origin
        
        # Closest point on ray to component
        closest_x = x + t * dx
        closest_y = y + t * dy
        
        # Check distance
        dist = math.sqrt((closest_x - comp_x)**2 + (closest_y - comp_y)**2)
        
        # Get component width/diameter
        if component.type == 'lens':
            threshold = component.properties.get('diameter', 50) / 2
        else:
            threshold = component.properties.get('width', 50) / 2
        
        if dist <= threshold:
            return (comp_x, comp_y)
        
        return None
    
    def _reflect_ray(self, dx: float, dy: float, mirror: Any) -> Tuple[float, float]:
        """
        Calculate reflected ray direction from a mirror.
        
        Args:
            dx, dy: Incident ray direction
            mirror: Mirror component
            
        Returns:
            (dx, dy) reflected ray direction
        """
        # Mirror normal (perpendicular to mirror surface)
        mirror_angle = math.radians(mirror.rotation)
        normal_x = -math.sin(mirror_angle)
        normal_y = math.cos(mirror_angle)
        
        # Reflection formula: r = d - 2(d·n)n
        dot_product = dx * normal_x + dy * normal_y
        reflected_dx = dx - 2 * dot_product * normal_x
        reflected_dy = dy - 2 * dot_product * normal_y
        
        return reflected_dx, reflected_dy
    
    def _refract_ray(self, dx: float, dy: float, lens: Any) -> Tuple[float, float]:
        """
        Calculate refracted ray direction through a lens (simplified).
        
        Args:
            dx, dy: Incident ray direction
            lens: Lens component
            
        Returns:
            (dx, dy) refracted ray direction
        """
        # Simplified refraction - bend ray toward optical axis
        focal_length = lens.properties.get('focalLength', 100)
        
        # Small deflection based on focal length (simplified thin lens approximation)
        deflection = 0.1 / (focal_length / 100)
        
        # Normalize direction
        magnitude = math.sqrt(dx*dx + dy*dy)
        dx_norm = dx / magnitude
        dy_norm = dy / magnitude
        
        # Apply small deflection
        new_dx = dx_norm
        new_dy = dy_norm - deflection if dy_norm > 0 else dy_norm + deflection
        
        # Renormalize
        magnitude = math.sqrt(new_dx*new_dx + new_dy*new_dy)
        return new_dx / magnitude, new_dy / magnitude
    
    def _wavelength_to_color(self, wavelength: float) -> str:
        """
        Convert wavelength (nm) to RGB color string.
        
        Args:
            wavelength: Wavelength in nanometers
            
        Returns:
            RGB color string like '#FF0000'
        """
        # Simplified wavelength to color mapping
        if wavelength < 450:
            return '#8B00FF'  # Violet
        elif wavelength < 495:
            return '#0000FF'  # Blue
        elif wavelength < 570:
            return '#00FF00'  # Green
        elif wavelength < 590:
            return '#FFFF00'  # Yellow
        elif wavelength < 620:
            return '#FFA500'  # Orange
        else:
            return '#FF0000'  # Red
    
    def _compute_frequency_sweep(self, settings: Any, base_transmission: float) -> List[Dict]:
        """
        Compute frequency sweep data.
        
        Args:
            settings: Simulation settings with frequency parameters
            base_transmission: Base transmission value
            
        Returns:
            List of frequency points with transmission values
        """
        freq_start = settings.freqStart
        freq_stop = settings.freqStop
        freq_points = settings.freqPoints
        
        if freq_points <= 1:
            return [{'frequency': freq_start, 'transmission': base_transmission}]
        
        frequencies = np.linspace(freq_start, freq_stop, freq_points)
        sweep_data = []
        
        for freq in frequencies:
            # Simulate frequency-dependent transmission (simplified)
            # Add some variation based on frequency
            variation = np.sin((freq - freq_start) / (freq_stop - freq_start) * np.pi * 2) * 0.2
            transmission = max(0, min(100, base_transmission + variation * 100))
            
            sweep_data.append({
                'frequency': float(freq),
                'transmission': float(transmission)
            })
        
        return sweep_data
