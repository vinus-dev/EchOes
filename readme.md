EchOes — "Every number unlocks a memory."
A full-stack memory-sharing web app for friends. Users enter a number/name to unlock a media memory (video or photos) with immersive Three.js animations. Protected by a PIN screen. Admin panel for managing all content.

Tech Stack
Layer	Tech
Frontend	Vite + React + TypeScript
3D / Animation	Three.js + @react-three/fiber + @react-three/drei
Routing	React Router v7
State	Zustand
HTTP Client	Axios
Styling	Vanilla CSS (custom design system) + Google Fonts
Backend	Node.js + Express
Database	MongoDB + Mongoose
Media Storage	Cloudinary
Auth	JWT (admin)
Environment	dotenv, cors, helmet, morgan
User Review Required
IMPORTANT

PIN Reset Flow: The admin can reset the PIN from the admin panel. The default PIN will be 1234 on first launch. Please confirm if this is acceptable.

IMPORTANT

Search Type: The search bar will support both numeric codes (e.g., 42) and names (e.g., vinayak). Each memory entry will have both a code (number) and a name (string) — the search matches either. Confirm?

WARNING

Cloudinary Setup: You'll need a Cloudinary account. During setup you'll provide CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the .env file. The admin panel will handle all uploads directly.

NOTE

Admin Access: The admin panel will be accessible via a hidden route — /echoes-admin — with its own JWT-based login (username + password, separate from the PIN). This keeps it hidden from regular users.

Proposed Folder Structure

Biita/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── cloudinary.js      # Cloudinary config
│   │   ├── controllers/
│   │   │   ├── authController.js  # Admin login, PIN verify/reset
│   │   │   ├── memoryController.js# CRUD for memories
│   │   │   └── mediaController.js # Cloudinary upload/delete
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js  # JWT verification
│   │   │   └── uploadMiddleware.js# Multer + Cloudinary stream
│   │   ├── models/
│   │   │   ├── Memory.js          # Memory schema
│   │   │   ├── Admin.js           # Admin credentials schema
│   │   │   └── AppConfig.js       # App-level config (PIN hash)
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── memoryRoutes.js
│   │   │   └── mediaRoutes.js
│   │   └── utils/
│   │       └── cloudinaryHelper.js
│   ├── server.js                  # Entry point (refactored)
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── assets/                # Static assets (logo, fonts etc.)
    │   ├── components/
    │   │   ├── three/
    │   │   │   ├── SplashScene.tsx      # Three.js splash animation
    │   │   │   ├── SearchScene.tsx      # Three.js floating particles scene
    │   │   │   ├── MemoryScene.tsx      # Three.js memory reveal animation
    │   │   │   └── AdminScene.tsx       # Subtle 3D background for admin
    │   │   ├── ui/
    │   │   │   ├── PinPad.tsx           # PIN entry keypad
    │   │   │   ├── SearchBar.tsx        # Glowing search input
    │   │   │   ├── MediaPlayer.tsx      # Video/Photo viewer
    │   │   │   ├── PhotoGallery.tsx     # Image grid/carousel
    │   │   │   ├── Loader.tsx           # Full-screen animated loader
    │   │   │   └── Toast.tsx            # Notifications
    │   │   └── admin/
    │   │       ├── MemoryCard.tsx       # Memory list item in admin
    │   │       ├── UploadForm.tsx       # Add/Edit memory form
    │   │       └── MediaGrid.tsx        # Cloudinary media browser
    │   ├── hooks/
    │   │   ├── useMemory.ts            # Memory fetch/search logic
    │   │   ├── useAdmin.ts             # Admin CRUD operations
    │   │   └── useAuth.ts              # PIN & JWT auth state
    │   ├── pages/
    │   │   ├── SplashPage.tsx          # Animated splash screen
    │   │   ├── PinPage.tsx             # PIN entry screen
    │   │   ├── SearchPage.tsx          # Main search interface
    │   │   ├── MemoryPage.tsx          # Memory reveal page
    │   │   ├── AdminLoginPage.tsx      # Hidden admin login
    │   │   └── AdminDashboard.tsx      # Full admin panel
    │   ├── store/
    │   │   ├── authStore.ts            # Zustand: PIN unlock + admin JWT
    │   │   └── memoryStore.ts          # Zustand: current memory, search state
    │   ├── services/
    │   │   └── api.ts                  # Axios instance + all API calls
    │   ├── styles/
    │   │   ├── globals.css             # CSS variables, resets, typography
    │   │   ├── animations.css          # Keyframe animations
    │   │   └── components.css          # Shared component styles
    │   ├── types/
    │   │   └── index.ts                # TypeScript interfaces
    │   ├── utils/
    │   │   └── helpers.ts              # Utility functions
    │   ├── App.tsx                     # Router setup + guards
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    └── vite.config.ts
Proposed Changes
Backend
[MODIFY] 
server.js
Refactor to import routes, apply middleware (cors, helmet, morgan, express.json)
Connect MongoDB on startup
Mount all route groups under /api/v1/
[NEW] src/config/db.js
Mongoose connect with retry logic and connection logging
[NEW] src/config/cloudinary.js
Cloudinary SDK configuration using env vars
[NEW] src/models/Memory.js
MongoDB Schema:

js

{
  code: Number,        // unique numeric key (e.g. 42)
  name: String,        // alternate search name (e.g. "vinayak")
  title: String,       // display title
  description: String, // optional caption
  type: enum['video', 'photos'],
  mediaItems: [{
    publicId: String,  // Cloudinary public_id
    url: String,       // Cloudinary secure_url
    thumbnail: String, // for video thumbnail
    order: Number
  }],
  tags: [String],
  isActive: Boolean,
  createdAt, updatedAt
}
[NEW] src/models/Admin.js
username, passwordHash (bcrypt)
[NEW] src/models/AppConfig.js
pinHash (bcrypt), single document (singleton)
[NEW] src/controllers/authController.js
POST /api/v1/auth/verify-pin — verify app PIN
POST /api/v1/auth/admin/login — admin JWT login
PUT /api/v1/auth/admin/reset-pin — reset app PIN (admin only)
[NEW] src/controllers/memoryController.js
GET /api/v1/memories/search?q=42 — search by code or name
GET /api/v1/memories — list all (admin)
POST /api/v1/memories — create (admin)
PUT /api/v1/memories/:id — update (admin)
DELETE /api/v1/memories/:id — delete (admin + cleanup Cloudinary)
[NEW] src/middlewares/uploadMiddleware.js
Multer memory storage → stream upload to Cloudinary
Support both video and image uploads
Max 10 files per request
[NEW] src/routes/authRoutes.js, memoryRoutes.js, mediaRoutes.js
Frontend
[MODIFY] 
package.json
New dependencies to install:

three, @types/three
@react-three/fiber, @react-three/drei
react-router-dom
zustand
axios
gsap (for non-Three.js UI animations)
react-hot-toast
[MODIFY] 
index.html
Set title to EchOes
Add Google Fonts (Outfit + Space Grotesk)
Add meta description and OG tags
[NEW] src/styles/globals.css
Design system with CSS variables:

Dark aurora theme: deep space blacks (#050508), vibrant purples (#7c3aed), electric blues (#06b6d4), warm golds (#f59e0b)
Typography scale
Glassmorphism utilities
Responsive breakpoints
Pages Flow:

App Load
  └─► SplashPage (3-4s Three.js animation, auto-advance)
        └─► PinPage (PIN keypad, locks app)
              └─► SearchPage (Three.js particles + search bar)
                    └─► MemoryPage (Three.js reveal + video/photos)
                          └─► back to SearchPage
Hidden Route: /echoes-admin
  └─► AdminLoginPage (username + password)
        └─► AdminDashboard (full CRUD + PIN reset)
[NEW] src/pages/SplashPage.tsx
Full-screen Three.js scene: floating "EchOes" text in 3D with particle burst
Tagline fade-in: "Every number unlocks a memory."
Auto-advance to PinPage after ~4 seconds (or tap to skip)
[NEW] src/pages/PinPage.tsx
Glassmorphism card with custom 6-digit PIN pad
Three.js subtle star field background
Wrong PIN: shake animation + red flash
On success: slide transition to SearchPage
[NEW] src/pages/SearchPage.tsx
Three.js floating particle orbs in background
Central glowing search bar
Typewriter hint text cycling through friend names/numbers
Enter code → loading shimmer → MemoryPage
[NEW] src/pages/MemoryPage.tsx
Full-screen Three.js reveal animation (portal/wormhole effect)
Memory title flies in with GSAP
Video: custom player with controls
Photos: full-screen swipeable gallery with zoom
Back button to return to search
[NEW] src/pages/AdminDashboard.tsx
Stats overview (total memories, videos, photos)
Memories table with search/filter
Add/Edit memory modal with multi-file upload to Cloudinary
PIN reset section
Drag-and-drop media ordering
Backend .env Template
env

PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_USERNAME=vinayak
ADMIN_PASSWORD=your_admin_password
DEFAULT_PIN=1234
Additional Backend Dependencies to Install

express cors helmet morgan dotenv bcryptjs jsonwebtoken
mongoose cloudinary multer multer-storage-cloudinary
Verification Plan
Automated
Backend: GET /api/v1/health endpoint to confirm server + DB connection
Test all API routes via curl or Postman collection
Manual Verification
App loads → Splash → PIN → Search (full flow)
Enter a valid code → Memory page plays video/shows photos
Enter invalid code → Friendly error animation
Visit /echoes-admin → Login → Add a memory with media → Confirm it appears on search
Reset PIN from admin → Verify new PIN works on next visit
Test on mobile (375px) — all screens fully responsive
Open Questions
NOTE

Do you want the PIN to be 4 digits or 6 digits?
Should the memory page auto-play video, or require user to press play?
Do you have a Cloudinary account ready? If so, share the Cloud Name and I'll pre-wire the config.
Should the search support fuzzy matching (e.g., typing "vina" finds "vinayak") or exact match only?
Any specific color palette preference, or should I go with the dark aurora/galaxy theme I've proposed?