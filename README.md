# X3D Viewer POC

## Overview
This project is a proof-of-concept (POC) for a web-based 3D model viewer inspired by OnShape-style navigation controls. It includes features such as panning, orbiting, zooming, and an interactive view cube for orientation control. The viewer is built using React and X3D-DOM for rendering 3D models.

---

## Features

### 1. OnShape-Style Navigation Controls
- **Pan**:
  - Middle-mouse drag to pan.
  - Shift + left-click drag as an alternative.
  - Smooth, responsive panning with speed scaling based on camera distance.
  - Converts screen space movement to world space for accurate panning.
- **Orbit**:
  - Left-click drag to rotate around the model.
  - Maintains the focal point during rotation.
- **Zoom**:
  - Scroll wheel to zoom in and out.
  - Zooms toward the cursor position.
  - Enforces minimum and maximum zoom limits.

### 2. View Cube
- Interactive view cube for orientation control:
  - Clickable faces (Front, Back, Top, Bottom, Left, Right).
  - Clickable edges for 45° views.
  - Clickable corners for isometric views.
- Smooth animated transitions between views.
- Fixed position in the top-right corner of the viewer.
- Updates orientation dynamically as the main view rotates.

---

## Assumptions
- The world Z-axis is initially aligned with the screen Y-axis.
- The world Y-axis is initially aligned with the screen X-axis.
- The viewer is designed for desktop use only (Chrome, Firefox, Safari - latest versions).

---

## Architecture

### Folder Structure
```
src/
├── components/
│   ├── Navigation.tsx       # Navigation controls for pan, orbit, zoom, and reset
│   ├── ViewCube.tsx         # Interactive view cube for orientation control
│   ├── X3DViewer.tsx        # Main 3D viewer component
├── context/
│   ├── NavigationContext.tsx # Context for managing active navigation mode
│   ├── RotationContext.tsx   # Context for managing rotation state
├── hooks/
│   ├── useNavigation.ts      # Custom hook for navigation context
│   ├── useRotation.ts        # Custom hook for rotation context
├── styles/                   # CSS styles for components
├── types/
│   ├── x3d.d.ts              # Type definitions for X3D elements
```

### Key Components
1. **`X3DViewer.tsx`**:
   - The main component for rendering the 3D model and handling interactions.
   - Implements panning, orbiting, and zooming functionalities.
   - Uses `THREE.js` for quaternion-based transformations and vector calculations.
   - Manages the `viewpoint` and `centerOfRotation` attributes for accurate navigation.

2. **`ViewCube.tsx`**:
   - Renders an interactive view cube for orientation control.
   - Uses quaternions for smooth transitions between views.
   - Synchronizes with the main viewer's orientation.

3. **`Navigation.tsx`**:
   - Provides UI controls for switching between pan, orbit, and zoom modes.
   - Includes a reset button to restore the initial view.

4. **Contexts**:
   - `NavigationContext`: Manages the active navigation mode (pan, orbit, zoom).
   - `RotationContext`: Tracks the current rotation state of the model.

### Key Implementation Notes
- **Pan**:
  - Calculates pan speed based on the camera's distance from the model.
  - Converts screen space movement to world space for accurate panning.
  - Updates the `viewpoint` and `centerOfRotation` attributes in real time.
- **Orbit**:
  - Uses quaternions to rotate the model around its focal point.
  - Ensures smooth and intuitive rotation without gimbal lock.
- **Zoom**:
  - Adjusts the camera's position along the Z-axis based on scroll input.
  - Zooms toward the cursor position by calculating the direction vector in world space.
  - Enforces minimum and maximum zoom limits to prevent clipping or excessive zooming.
- **View Cube**:
  - Implements clickable faces, edges, and corners for orientation control.
  - Uses quaternions for smooth transitions between views.
  - Updates dynamically as the main view rotates.

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or later)
- npm (v7 or later)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/samthemogul/x3d-viewer.git
   cd x3d-viewer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser:
   ```
   http://localhost:5173
   ```

---

## Usage Instructions

1. **Pan**:
   - Drag with the middle mouse button or hold `Shift` and drag with the left mouse button.
   - The model will move smoothly in the direction of the drag.

2. **Orbit**:
   - Drag with the left mouse button to rotate the model.
   - The rotation will pivot around the model's center.

3. **Zoom**:
   - Scroll up to zoom in and scroll down to zoom out.
   - The zoom will focus on the cursor's position.

4. **View Cube**:
   - Click on a face, edge, or corner of the view cube to change the orientation.
   - The transition will be smooth and animated.

5. **Reset**:
   - Click the reset button to restore the initial view.

---

## Live Demo
- [Deployed URL](https://x3d-app.netlify.app/)

---

## Assumptions Made
- The world Z-axis is initially aligned with the screen Y-axis, and the world Y-axis is aligned with the screen X-axis.
- The application is designed for desktop use only and is not optimized for mobile devices.
- The `X3D-DOM` library is used for rendering the 3D model, and `THREE.js` is used for mathematical transformations.

---

## Known Issues
- The panning has some degree of rotation because translation is in world 3d space.

---

## License
This project is licensed under the MIT License.