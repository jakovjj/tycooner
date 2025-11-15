# Tycooner - European Logistics Tycoon

A mobile-friendly browser game built with React + TypeScript where you build and manage a logistics empire across Europe.

## 🎮 Game Overview

Tycooner is a strategy game where you:
- Build factories to produce goods
- Construct warehouses to store inventory
- Create road networks between countries
- Set up truck lines to transport goods
- Optimize production and sales for maximum profit

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Game

```bash
npm run dev
```

The game will be available at `http://localhost:5173/`

## 📱 How to Play

### Map Controls

**Zoom:**
- **Mouse Wheel** - Scroll to zoom in/out
- **+ / - Buttons** - Click zoom controls (top right)
- **Home Button** - Reset zoom to default view

**Pan:**
- **Click and Drag** - Move the map around
- **Touch and Drag** - Works on mobile devices

### Basic Controls

**On Mobile/Touch Devices:**
- **Tap a country** - Open country panel to build/upgrade warehouses and factories
- **Drag from country to country** - Create roads between neighboring countries (must start on a country)
- **Tap a road** - Open road panel to set up truck lines
- **Pinch/spread** - Use zoom controls instead (pinch-zoom disabled for game controls)

**On Desktop:**
- **Click a country** - Open country panel
- **Click and drag from country** - Create roads (release on neighbor)
- **Click a road** - Configure logistics
- **Mouse wheel** - Zoom in/out
- **Click and drag background** - Pan the map

### Game Mechanics

#### 1. Warehouses
- Each country can have one warehouse
- Stores all goods in that country
- Has limited capacity (upgradeable)
- Required before building factories
- **Cost:** $5,000 (initial), $3,000 × level (upgrades)

#### 2. Factories
- Produce specific goods automatically each day
- Require a warehouse in the same country
- Output can be upgraded
- Different goods have different production costs per country
- **Cost:** $10,000 (initial), $5,000 × level (upgrades)

#### 3. Roads
- Connect neighboring countries
- Required for transporting goods
- Can be upgraded for better capacity
- **Cost:** $2,000

#### 4. Truck Lines
- Transport goods from one country to another
- Run on existing roads
- Configurable number of trucks
- Each truck carries 100 units per day
- Incur logistics costs based on distance

#### 5. Markets
- Each country has demand for all goods
- Prices fluctuate based on supply vs demand
- Shortage (low supply) → higher prices (+50% max)
- Oversupply (high supply) → lower prices (-50% max)
- Sell goods automatically each day up to demand limit

## 🎯 Strategy Tips

1. **Find Profitable Routes**
   - Look for goods with low production cost in one country
   - Transport to countries with high sell prices
   - Consider logistics costs in your profit calculations

2. **Balance Production and Storage**
   - Factories stop producing when warehouses are full
   - Upgrade warehouses to prevent bottlenecks
   - Move excess inventory to high-demand markets

3. **Optimize Logistics**
   - Shorter routes = lower transport costs
   - Adjust truck counts based on production levels
   - Monitor the profit preview when setting up truck lines

4. **Watch Market Dynamics**
   - Prices shown in country panels reflect current supply/demand
   - High demand goods are more profitable
   - Diversify to multiple goods to spread risk

## 🗺️ Countries Included

The game includes 12 European countries with accurate geographic borders:
- �� **United Kingdom** - High wages, good for electronics
- 🇩🇪 **Germany** - Industrial powerhouse, steel & electronics
- 🇫🇷 **France** - Balanced economy, processed food
- 🇮🇹 **Italy** - Lower costs, food & consumer goods
- 🇵🇱 **Poland** - Low wages, excellent for grain & steel
- 🇪🇸 **Spain** - Good agricultural production
- 🇵🇹 **Portugal** - Coastal economy, agriculture
- �🇱 **Netherlands** - Trade hub, processed food
- 🇧🇪 **Belgium** - Industrial center
- 🇨🇭 **Switzerland** - High income, expensive labor
- 🇦🇹 **Austria** - Manufacturing focus
- 🇨🇿 **Czech Republic** - Competitive manufacturing

## 📦 Available Goods

1. **Grain** (Food) - Basic agricultural product
2. **Steel** (Raw Material) - Industrial material
3. **Consumer Goods** - General merchandise
4. **Electronics** (Manufactured) - High-tech products
5. **Processed Food** - Value-added food products

Each good has different:
- Base prices
- Labor intensity
- Resource requirements
- Market demand per country

## 🎨 Visual Indicators

**Country Colors:**
- 🟢 Green - Has warehouse + factories
- 🟡 Light Green - Has warehouse only
- 🟠 Orange - Has factories only
- ⚫ Gray - No buildings

**Icons:**
- 🟠 Orange circle - Warehouse present
- 🔵 Blue circle - Factories present

## 🛠️ Technical Details

### Built With
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **SVG** - Scalable map rendering with real geographic data
- **CSS3** - Styling and animations

### Map Features
- **Real Geographic Data** - Accurate country borders based on geographic coordinates
- **Zoom & Pan** - Mouse wheel zoom, drag to pan, touch gestures
- **Responsive Scaling** - Labels and icons scale with zoom level
- **12 European Countries** - UK, Germany, France, Italy, Poland, Spain, Portugal, Netherlands, Belgium, Switzerland, Austria, Czech Republic

### Architecture
- Game state managed via React Context
- Tick-based simulation (configurable speed)
- Client-side only (no backend required)
- Touch-optimized for mobile play

### File Structure
```
src/
├── components/       # React components
│   ├── EuropeMap.tsx        # Interactive map
│   ├── TopBar.tsx           # Stats and controls
│   ├── CountryPanel.tsx     # Country management
│   └── RoadPanel.tsx        # Logistics management
├── context/          # State management
│   └── GameContext.tsx      # Game state and simulation
├── data/            # Game data
│   ├── europeMap.ts         # Map geometry
│   └── initialGameState.ts  # Initial data
├── types/           # TypeScript types
│   └── game.ts              # Core interfaces
└── App.tsx          # Main app component
```

## 🔮 Future Enhancements

The game is designed to scale. Potential additions:
- More European countries
- More goods (100+ planned)
- Different truck types
- Sea routes
- Train logistics
- Seasonal demand variations
- Random events (strikes, weather)
- Competition from AI players
- Save/load game state
- Achievements and challenges

## 📄 License

MIT License - Feel free to modify and expand the game!

---

**Enjoy building your logistics empire! 🚚💰**

