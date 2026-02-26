# ✈️ Airport Indoor Navigation

A cross-platform mobile & web application built with **React Native + Expo** that simulates real-time indoor navigation inside an airport terminal using **Bluetooth beacon simulation**, **Kalman filtering**, **trilateration**, and **A\* pathfinding**.

> No real Bluetooth hardware required — the app simulates beacon signals using a log-distance path loss model with Gaussian noise.

---

## 📱 Screenshots

| Boarding Pass | Navigation Map | Services Sidebar | Boundary Alarm |
|:---:|:---:|:---:|:---:|
| Screen 1 — Scan your gate | Screen 2 — Live map routing | Tap any category | Trolley alert |

---

## 🚀 Features

### 🗺️ Navigation
- **Interactive SVG terminal map** based on a real airport floor plan grid
- **A\* pathfinding** — calculates shortest route between any two nodes
- **Live animated position dot** walks along the calculated path
- **Direction arrows** drawn along the route
- **Auto-route to Gate 31** on app start (matching flight info)

### 📡 Beacon Simulation (No Hardware Needed)
- **Log-distance path loss model** — simulates RSSI from virtual BLE beacons
- **Kalman filter** — smooths noisy RSSI readings in real time
- **Trilateration** (gradient descent) — estimates device position from beacon distances
- Two position dots: 🔵 **True position** (GPS-like) + 🟡 **Estimated position** (trilateration)

### 🏪 Airport Services
- **Top navigation bar** — Restrooms 🚻 | Food 🍽️ | Shopping 🛍️ | Helpdesk ❓ | Lounges 🛋️
- **Sliding sidebar** — tap any category to see all services sorted by distance from your current position
- **Navigate to any service** — reroutes A\* path to selected amenity

### ⚠️ Boundary Alarm (Trolley Tracking)
- Terminal **boundary polygon** drawn on the map
- **Outside zone node** (⚠️) placed beyond the terminal edge
- When position crosses the boundary → **pulsing red alarm overlay** fires
- Dismissible alert with **BOUNDARY ALERT** warning

### 🎫 Boarding Pass Screen
- Full boarding pass UI matching real airline designs
- Passenger details, flight info, seat, barcode
- One-tap **"Navigate to Gate"** CTA

### 🌐 Cross-Platform
- ✅ **Android** — Expo Go (scan QR) or USB debugging
- ✅ **iOS** — Expo Go or Camera app QR scan
- ✅ **Web** — runs in browser at `localhost:8081`

---

## 🧠 Algorithm Overview

```
Every 300ms tick:
  ┌─────────────────────────────────────────────────────┐
  │  BeaconSimulator.simulate(truePos)                  │
  │    └─ RSSI = TxPower - 10·n·log₁₀(d) + noise(σ=4) │
  │                          ↓                          │
  │  KalmanFilter.update(rssi)   ← per-beacon filter   │
  │    └─ Q=0.008, R=2 (process/measurement noise)     │
  │                          ↓                          │
  │  rssiToDistance(smoothedRSSI)                       │
  │    └─ d = 10^((TxPower - RSSI) / (10·n))           │
  │                          ↓                          │
  │  Trilateration.solve(measurements)                  │
  │    └─ Gradient descent, lr=0.4, 300 iterations     │
  │                          ↓                          │
  │  isInsideBoundary(pos) → ray casting check         │
  │    └─ false → BoundaryAlarm fires                  │
  └─────────────────────────────────────────────────────┘

On route request:
  AStar.findPath(startId, endId)
    └─ Euclidean heuristic, bidirectional edges
    └─ Returns [nodeId, nodeId, ...] shortest path
```

---

## 📁 Project Structure

```
IndoorNavigationRN/
│
├── App.js                          # Root — screen router (welcome ↔ navigate)
├── index.js                        # Entry point — registerRootComponent
├── app.json                        # Expo config — platforms, permissions, icons
├── package.json                    # Dependencies (pinned for Node 18 + Expo 51)
├── metro.config.js                 # Metro bundler config (web + .mjs support)
├── babel.config.js                 # Babel config (reanimated plugin last)
│
├── assets/
│   ├── icon.png                    # App icon (1024×1024)
│   ├── adaptive-icon.png           # Android adaptive icon (1024×1024)
│   ├── splash.png                  # Splash screen (1284×2778)
│   └── favicon.png                 # Web favicon (48×48)
│
└── src/
    ├── algorithms/
    │   ├── AStar.js                # A* pathfinding with Euclidean heuristic
    │   ├── BeaconSimulator.js      # BLE RSSI simulation (log-distance model)
    │   ├── KalmanFilter.js         # 1-D Kalman filter for RSSI smoothing
    │   └── Trilateration.js        # Gradient descent position estimation
    │
    ├── components/
    │   ├── AirportMap.js           # Full interactive SVG terminal map
    │   ├── ServicesSidebar.js      # Sliding services panel with distance sort
    │   └── BoundaryAlarm.js        # Pulsing red alert overlay
    │
    ├── data/
    │   └── airportData.js          # All nodes, edges, services, beacons, boundary
    │
    ├── hooks/
    │   └── useAirportNav.js        # Central navigation hook (tick loop, state)
    │
    ├── screens/
    │   ├── WelcomeScreen.js        # Boarding pass + "Navigate to Gate" CTA
    │   └── NavigationScreen.js     # Main map screen with top bar + flight info
    │
    ├── constants/
    │   ├── Colors.js               # App-wide color palette
    │   └── Sizes.js                # Layout size constants
    │
    └── utils/
        └── helpers.js              # Shared utility functions
```

---

## ⚙️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.74.5 | Cross-platform mobile framework |
| Expo | ~51.0.28 | Development toolchain + Expo Go |
| react-native-svg | 15.2.0 | SVG map rendering |
| react-native-web | ~0.19.10 | Web platform support |
| react-native-reanimated | ~3.10.1 | Boundary alarm animation |
| expo-linear-gradient | ~13.0.2 | UI gradients |
| Node.js | 18.x | Required runtime |

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js 18.x](https://nodejs.org/) (do **not** use Node 20+ with Expo 51)
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Superpavan/IndoorNavigationRN.git
cd IndoorNavigationRN

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start --clear
```

### Running the app

| Platform | Command | Notes |
|---|---|---|
| **Phone (Expo Go)** | Scan QR code | Phone + PC must be on same WiFi |
| **Web Browser** | Press `w` in terminal | Opens at `http://localhost:8081` |
| **Android Emulator** | Press `a` in terminal | Requires Android Studio + AVD setup |
| **iOS Simulator** | Press `i` in terminal | macOS only |

---

## 📱 Usage Guide

### Screen 1 — Boarding Pass
1. App opens showing your flight boarding pass (Jane Doe, DXB → LND, Gate 31)
2. Review flight details in the bottom bar
3. Tap **"Navigate to Gate 31 →"** to enter the terminal map

### Screen 2 — Navigation Map
1. Your position (🔵 blue dot) auto-navigates toward **Gate 31**
2. The **A\* route** is drawn in dark blue with directional arrows
3. A yellow dot shows the **trilateration estimate** (vs true position)

### Using Services
1. Tap any icon in the top bar — **Restrooms 🚻 | Food 🍽️ | Shopping 🛍️ | Helpdesk ❓ | Lounges 🛋️**
2. Sidebar slides in showing all locations sorted by distance
3. Tap the **▶ navigate** button to reroute to that service

### Boundary Alarm Demo
1. The **⚠️ Outside Zone** marker is visible beyond the terminal boundary (top-right)
2. The simulated path stays inside the boundary
3. If the position crosses the boundary → **red pulsing alarm** fires automatically
4. Tap **DISMISS** to acknowledge

---

## 🔧 Configuration

### Changing the flight destination
Edit `src/data/airportData.js`:
```js
export const FLIGHT_INFO = {
  flightNo:   'DJENGO',
  gate:       '31',        // ← change gate number
  gateNodeId: 21,          // ← change to matching node ID
  passenger:  'JANE DOE',  // ← change passenger name
  // ...
};
```

### Adding new services / POIs
```js
// In src/data/airportData.js → SERVICES array:
{ id: 's22', type: 'food', x: 420, y: 300, label: 'New Cafe', nearNode: 7 }
//             ↑ type: restroom | food | shopping | lounge | helpdesk
```

### Adding navigation nodes
```js
// In NAV_NODES array:
{ id: 22, x: 420, y: 300, label: 'New Junction' }

// In NAV_EDGES array:
{ from: 11, to: 22 }, { from: 22, to: 7 }
```

### Adjusting beacon simulation noise
```js
// In src/hooks/useAirportNav.js:
const simulator = new BeaconSimulator(BEACONS, 3, 4);
//                                              ↑  ↑
//                              path loss exp (n)  noise sigma (dBm)
```

---

## 🧪 Algorithm Deep Dive

### A\* Pathfinding
Uses Euclidean distance as the heuristic with a min-priority open set. Bidirectional edges allow traversal in both directions along all corridors.

### Beacon Simulation (Log-Distance Path Loss)
```
RSSI = TxPower - 10 × n × log₁₀(distance) + Gaussian(0, σ²)
```
- `n = 3` (indoor path loss exponent)
- `σ = 4 dBm` (measurement noise)
- `TxPower = -59 dBm` (reference RSSI at 1 metre)

### Kalman Filter (1-D)
```
Prediction:  P = P + Q
Update:      K = P / (P + R)
             x = x + K × (measurement - x)
             P = (1 - K) × P
```
- `Q = 0.008` (process noise — how fast signal changes)
- `R = 2.0` (measurement noise — sensor variance)

### Trilateration (Gradient Descent)
Minimises the sum of squared residuals between estimated and measured distances from each beacon. Runs 300 iterations with learning rate `lr = 0.4`.

---

## ⚠️ Known Limitations

| Limitation | Notes |
|---|---|
| Simulated beacons only | No real BLE hardware integration |
| Fixed floor plan | Map is hardcoded — no dynamic floor plan loading |
| 2D navigation only | No multi-floor / elevator routing |
| No user authentication | Boarding pass is static mock data |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add: my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Pavan Sai Kudupudi**
- GitHub: [@Superpavan](https://github.com/Superpavan)

---

## 🙏 Acknowledgements

- [Expo](https://expo.dev) — for the amazing cross-platform toolchain
- [react-native-svg](https://github.com/software-mansion/react-native-svg) — for SVG rendering on all platforms
- Log-distance path loss model based on IEEE 802.11 indoor propagation research

---

<div align="center">
  <sub>Built with ❤️ using React Native + Expo</sub>
</div>