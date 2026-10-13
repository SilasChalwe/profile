import mediaManifest from './data/project-media.json';

export const portfolio = {
  profile: {
    name: "Silas Chalwe",
    shortName: "SC",
    location: "Zambia",
    roles: ["Computer Engineer", "Software Engineer", "UI/UX Designer"],
    positioning:
      "I design interfaces, engineer software systems, and connect hardware with software when the problem demands it.",
    portrait: "https://avatars.githubusercontent.com/u/176147815?v=4",
    portraitAlt: "Silas Chalwe",
    links: {
      email: "mailto:mchalwesilas@gmail.com",
      github: "https://github.com/SilasChalwe",
      linkedin: "https://www.linkedin.com/in/silas-chalwe-2085a5414"
    }
  },

  projects: [
    {
      id: "fix",
      zoneId: 'software',
      number: "01",
      title: "FIX",
      strapline: "A local-first media toolkit built around careful, recoverable processing.",
      category: ["engineering", "desktop"],
      discipline: "Desktop engineering · Media systems",
      status: "Working Linux application",
      statusTone: "verified",
      role: "Application architecture, desktop UI and media-processing engineering",
      problem:
        "Creative workflows often need precise watermark, cover-art and metadata changes without sending source media to a remote service.",
      contribution:
        "Built a Python/GTK desktop workflow around shared selection state, a plugin-and-adapter architecture, FFmpeg/FFprobe services and output validation.",
      details: [
        "Visual region selection for watermark work",
        "Localized re-encoding with unchanged sections stream-copied where practical",
        "Metadata, chapters and compatible attachments restored after processing",
        "Plugin contracts and tests for maintainable feature expansion"
      ],
      tech: ["Python", "GTK 4", "FFmpeg", "FFprobe", "OpenCV"],
      link: "https://github.com/SilasChalwe/Fix",
      linkLabel: "View repository",
      visual: "timeline",
      media: { placeholder: true, label: "Verified application screenshots required" }
    },
    {
      id: "agrospeak",
      zoneId: 'mobile',
      number: "02",
      title: "AgroSpeak Connect",
      strapline: "A farmer-facing mobile foundation designed for accessible agricultural workflows.",
      category: ["mobile", "design", "engineering"],
      discipline: "Mobile product · UI/UX · API integration",
      status: "Foundation implemented · broader platform in development",
      statusTone: "progress",
      role: "Mobile architecture, interface design and backend integration",
      problem:
        "Agricultural tools need to work across language, connectivity and device constraints while keeping core actions direct and understandable.",
      contribution:
        "Implemented the public React Native/Expo foundation: onboarding, authentication, validation, loading/error feedback, secure token storage and Spring Boot API integration. A wider 32-page product prototype is awaiting asset clearance.",
      details: [
        "Responsive onboarding and authentication flows",
        "Centralized API and error handling",
        "JWT session persistence with AsyncStorage",
        "Planned marketplace, voice, farm and offline workflows kept distinct from implemented functionality"
      ],
      tech: ["React Native", "Expo", "JavaScript", "Spring Boot", "JWT"],
      link: "https://github.com/SilasChalwe/agro_speak_frontend",
      linkLabel: "View repository",
      visual: "mobile",
      media: { placeholder: true, label: "Prototype screens pending publication approval" }
    },
    {
      id: "campusnest",
      zoneId: 'software',
      number: "03",
      title: "CampusNest",
      strapline: "A service-oriented backend for student accommodation workflows.",
      category: ["engineering", "backend"],
      discipline: "Backend engineering · Systems design",
      status: "Public implementation",
      statusTone: "verified",
      role: "Backend architecture and implementation",
      problem:
        "Students, landlords and administrators need separate, secure workflows across listings, bookings, messaging and account management.",
      contribution:
        "Designed a Spring Boot codebase with REST controllers, JPA persistence, Flyway migrations, JWT authentication, role-based access and WebSocket/STOMP messaging structures.",
      details: [
        "Student, landlord and administrator authorization boundaries",
        "Property, unit, booking, payment and messaging domains",
        "OpenAPI documentation and environment profiles",
        "Structured migration and service layers"
      ],
      tech: ["Java", "Spring Boot", "PostgreSQL", "JWT", "WebSocket"],
      link: "https://github.com/SilasChalwe/campusnest-backend",
      linkLabel: "View repository",
      visual: "architecture",
      media: { placeholder: true, label: "Architecture capture pending" }
    },
    {
      id: "covian",
      zoneId: 'software',
      number: "04",
      title: "Covian",
      strapline: "A security-first rendering boundary with a deterministic C++ core.",
      category: ["engineering", "security"],
      discipline: "Application security · WebAssembly",
      status: "Open-source framework",
      statusTone: "verified",
      role: "Architecture, C++/WebAssembly core and JavaScript safe-DOM API",
      problem:
        "Untrusted content can reach dangerous browser sinks when rendering rules are optional or spread across a codebase.",
      contribution:
        "Built a typed safe-DOM approach that keeps context-aware encoding at the Wasm boundary, blocks unsafe sinks and uses Trusted Types to fail closed.",
      details: [
        "Separate text, attribute and URL-context encoding",
        "Strict URL-scheme validation",
        "Unsafe DOM sink hardening",
        "Native adversarial tests and prebuilt Wasm artifacts"
      ],
      tech: ["C++", "WebAssembly", "JavaScript", "Trusted Types", "CSP"],
      link: "https://github.com/SilasChalwe/xss-framework",
      linkLabel: "View repository",
      visual: "secure",
      media: { placeholder: true, label: "Security demo capture pending" }
    },
    {
      id: "cs301",
      zoneId: 'embedded',
      number: "05",
      title: "Hardware-backed data protection",
      strapline: "A physical-presence layer for encrypted file workflows.",
      category: ["engineering", "embedded"],
      discipline: "Embedded systems · Backend engineering",
      status: "Academic engineering project",
      statusTone: "verified",
      role: "System design and implementation",
      problem:
        "Password-only file protection does not prove that an authorized physical device is present at decrypt time.",
      contribution:
        "Combined a Spring Boot service, AES-based file workflows and an Arduino hardware key component communicating over serial, with OLED feedback and physical confirmation.",
      details: [
        "REST endpoints for encrypted file workflows",
        "Arduino key provisioning and serial communication",
        "Physical confirmation with timeout handling",
        "File metadata and integrity hashes"
      ],
      tech: ["Java", "Spring Boot", "Arduino", "AES", "Serial I/O"],
      link: "https://github.com/SilasChalwe/CS301",
      linkLabel: "View repository",
      visual: "hardware",
      media: { placeholder: true, label: "Device photography required" }
    }
  ],

  designStudies: [
    {
      title: "AgroSpeak / ASPECT",
      scope: "Farmer mobile experience",
      note: "32-page prototype covering onboarding, marketplace, voice, farm mapping, device, offline and error states.",
      status: "Screens pending publication approval",
      placeholder: true
    },
    {
      title: "AIMZO",
      scope: "Customer, provider and admin products",
      note: "82-page supplied interface document. Ownership and client-publication clearance must be confirmed before images are published.",
      status: "Client approval required",
      placeholder: true
    },
    {
      title: "Gate",
      scope: "Messaging permissions and quarantine",
      note: "Inbox, allow/block and sender-permission flows are identified in the brief; implementation status and reusable screens remain unverified.",
      status: "Evidence required",
      placeholder: true
    },
    {
      title: "BrandDesign",
      scope: "Brand colour application system",
      note: "Public code bundle links back to an original Figma design and provides an evidence-backed design artifact.",
      status: "Public Figma-linked project",
      placeholder: false,
      link: "https://github.com/SilasChalwe/BrandDesign"
    },
    {
      title: "iSort",
      scope: "Product definition and UX specification",
      note: "Product definition, requirements and feasibility documents are noted in the source inventory; implementation is not claimed.",
      status: "Source review required",
      placeholder: true
    },
    {
      title: "Coded Master / client design",
      scope: "UI/UX and client delivery",
      note: "Exact deliverables, role and publication permission need confirmation before this becomes a public case study.",
      status: "Client approval required",
      placeholder: true
    }
  ],

  experience: [
    {
      period: "Nov 2025 — present",
      role: "Founder & Chief Executive Officer",
      organization: "Covian Hive Technologies",
      summary:
        "Leads custom software, systems integration and technical-support work; translates requirements into scoped implementation and coordinates quality checks across software and infrastructure tasks."
    },
    {
      period: "2024 — present",
      role: "Lead Integration Specialist · Contractor",
      organization: "International freelance engineering",
      summary:
        "Works on bounded client engagements involving backend services, server scripts and data-acquisition workflows. Public details are limited to consent-cleared technical scope."
    },
    {
      period: "23 Feb — 4 Mar 2026",
      role: "Backend developer · delivery sprint",
      organization: "Legal-technology client, Italy",
      summary:
        "Contributed Django-based web/PDF data acquisition, persistence, structured logging and recoverable execution for Italian legal information sources."
    }
  ],

  skills: [
    { name: "Software & backend", tools: ["Java", "JavaScript", "TypeScript", "Python", "C/C++", "Node.js", "Spring Boot", "REST APIs", "PostgreSQL"] },
    { name: "Mobile", tools: ["Android", "React Native", "Expo", "Flutter / Dart", "API integration", "Offline-aware UX"] },
    { name: "UI/UX & product", tools: ["Figma", "User flows", "Prototypes", "Responsive UI", "Design systems", "Interaction states"] },
    { name: "AI & data", tools: ["Speech technology", "Computer vision", "PyTorch", "OpenCV", "Model integration", "Data ingestion"] },
    { name: "Embedded & connected", tools: ["ESP32", "Arduino", "MQTT", "ESP-NOW", "Sensors", "Serial communication"] },
    { name: "Systems & delivery", tools: ["Linux", "Git", "GitHub", "Docker", "Testing", "Debugging", "Deployment workflows"] }
  ],

  placeholders: [
    { id: "PROFILE_PHOTO_REPOSITORY_COPY_REQUIRED", status: "needs-information", placeholder: true, requiredInformation: "Approved, high-resolution local portrait asset. The current site uses the verified public GitHub avatar." },
    { id: "PROJECT_SCREENSHOTS_REQUIRED", status: "needs-information", placeholder: true, requiredInformation: "Original screenshots or recordings for FIX, CampusNest, Covian and hardware projects." },
    { id: "CLIENT_APPROVAL_REQUIRED", status: "needs-information", placeholder: true, requiredInformation: "Written approval to publish AIMZO, Coded Master, Gate and other client work." },
    { id: "FIGMA_LINKS_REQUIRED", status: "needs-information", placeholder: true, requiredInformation: "View-only public Figma prototype links for approved UI/UX case studies." },
    { id: "PROJECT_CONTRIBUTIONS_NEED_VERIFICATION", status: "needs-information", placeholder: true, requiredInformation: "Exact roles and contributions for Pulse, Gate, MFocus and collaborative projects not evidenced in accessible public repositories." },
    { id: "EXPERIENCE_DATES_NEED_VERIFICATION", status: "needs-information", placeholder: true, requiredInformation: "Verified dates and public-safe descriptions for Compiler Technologies Limited and additional leadership/client roles." },
    { id: "METRICS_NOT_VERIFIED", status: "needs-information", placeholder: true, requiredInformation: "Only add project outcomes after evidence is supplied." }
  ]
};

export const worldZones = [
  { id: 'software', label: 'Software Engineering', short: 'Software', position: [0, 0, -24], color: '#62d9ff', projectIds: ['campusnest', 'covian', 'fix'], description: 'Backends, secure rendering and desktop systems.' },
  { id: 'mobile', label: 'Mobile Applications', short: 'Mobile', position: [21, 0, -12], color: '#b7f35c', projectIds: ['agrospeak'], description: 'Android, React Native and connected product experiences.' },
  { id: 'design', label: 'UI/UX & Visual Design', short: 'Design', position: [21, 0, 13], color: '#ff8b5e', projectIds: [], description: 'Figma systems, journeys, interaction states and visual communication.' },
  { id: 'ai', label: 'AI & Research', short: 'AI / ML', position: [0, 0, 25], color: '#c3a6ff', projectIds: [], description: 'Speech technology, computer vision and applied machine learning.' },
  { id: 'embedded', label: 'Embedded Engineering', short: 'Embedded', position: [-21, 0, 13], color: '#ffd45e', projectIds: ['cs301'], description: 'Hardware/software integration, serial systems and connected devices.' },
  { id: 'clients', label: 'Professional Experience', short: 'Experience', position: [-21, 0, -12], color: '#ef6d8e', projectIds: [], description: 'Client delivery, technical leadership and systems integration.' }
];


// Visual experience enhancements — curated media and project exhibits
portfolio.projects.push(
  {
    id:'pulse',
      zoneId: 'mobile',number:'06',title:'Pulse',strapline:'Android media discovery and streaming backed by an actively developed Node.js service.',
    category:['mobile','engineering'],discipline:'Android development · Backend services',
    status:'Working application · distribution in progress',statusTone:'progress',
    role:'Mobile development, API integration and backend debugging',
    problem:'Media discovery and playback require a responsive mobile interface, reliable search services and handling of network failures.',
    contribution:'Developed and tested Android features and investigated backend search, deployment and media-delivery behavior.',
    details:['Android application and backend integration','Search reliability and catalogue investigation','Streaming, device playback and download workflows','Release build and application testing'],
    tech:['Android','Node.js','REST APIs','Linux','Git'],link:'https://github.com/SilasChalwe',linkLabel:'View developer profile',
    media:{placeholder:true,label:'Real Android screenshots awaiting approved export'}
  },
  {
    id:'gate',
      zoneId: 'design',number:'07',title:'Gate',strapline:'A sender-permission messaging experience built around clear inbox and quarantine decisions.',
    category:['design','mobile'],discipline:'Product design · Messaging UX',
    status:'UI/UX product study',statusTone:'progress',role:'Interface design and messaging workflow specification',
    problem:'Users need to make deliberate decisions about which senders can reach their primary inbox.',
    contribution:'Designed sender access, quarantined messages, allow/block and message review interaction models.',
    details:['Allowed / quarantined sender states','Inbox and message-action interaction design','Privacy-focused local-processing concept','Design and architecture documents'],
    tech:['UI/UX','Product flows','Mobile UI','Figma'],link:'https://github.com/SilasChalwe',linkLabel:'View developer profile',
    preview:'/assets/previews/gate.svg',previewType:'Original Gate brand mark; interface screenshots pending',
    media:{placeholder:true,label:'Gate PDF screenshots awaiting approval'}
  },
  {
    id:'aimzo',
      zoneId: 'design',number:'08',title:'AIMZO',strapline:'Connected mobile and web interfaces for booking, service management and administration.',
    category:['design','mobile','clients'],discipline:'UI/UX design · Multi-sided service product',
    status:'Documented design prototype',statusTone:'progress',role:'Product interface design; client-specific attribution to confirm',
    problem:'Customers, service providers and administrators need distinct and consistent booking workflows.',
    contribution:'The supplied UI documentation includes customer discovery and booking, provider availability and earnings, and administrative dashboard flows. Final public attribution remains subject to clearance.',
    details:['Customer mobile browsing and reservations','Provider bookings, earnings and availability','Web admin dashboard and management views','Loading, verification and booking states'],
    tech:['UI/UX','Mobile design','Dashboard design','Prototyping'],link:'https://github.com/SilasChalwe',linkLabel:'View developer profile',
    media:{placeholder:true,label:'AIMZO 82-page prototype; public image approval pending'}
  },
  {
    id:'bembaspeech',
      zoneId: 'ai',number:'09',title:'BembaSpeech',strapline:'Practical experimentation with Bemba and English speech recognition.',
    category:['ai','engineering'],discipline:'Speech AI · Model experimentation',
    status:'Research and evaluation',statusTone:'progress',role:'Fine-tuning and speech-model evaluation',
    problem:'Low-resource language users have fewer robust speech-recognition options.',
    contribution:'Investigated and evaluated multilingual speech recognition with attention to Bemba/English decoding and data quality.',
    details:['Speech recognition experimentation','Model evaluation and error analysis','Low-resource language data','English and Bemba support investigation'],
    tech:['Python','Whisper','PyTorch','ASR'],link:'https://github.com/SilasChalwe/BembaSpeech',linkLabel:'View repository',
    media:{placeholder:true,label:'Model evaluation charts pending'}
  },
  {
    id:'mfocus',
      zoneId: 'mobile',number:'10',title:'MFocus',strapline:'Mobile application and product design work.',
    category:['mobile','design'],discipline:'Mobile application · UI/UX',
    status:'Project evidence being curated',statusTone:'progress',role:'Application work; exact contributions to be documented',
    problem:'Full product brief and user problem statement to be supplied.',
    contribution:'An MFocus repository is available; screenshots and verified scope must be reviewed before publication.',
    details:['Source repository available','Product imagery pending','Public technical description pending'],
    tech:['Mobile UI','Product design'],link:'https://github.com/SilasChalwe/Mfocus',linkLabel:'View repository',
    preview:'/assets/previews/mfocus.svg',previewType:'Authentic MFocus launch-screen image with supplementary project illustration',
    media:{placeholder:true,label:'MFocus authentic app screenshots required'}
  },
  {
    id:'coded',
      zoneId: 'clients',number:'11',title:'Coded Master',strapline:'Client-facing interface and product design work.',
    category:['design','clients'],discipline:'Client work · UI/UX design',
    status:'Client presentation pending clearance',statusTone:'progress',
    role:'UI design work reported by creator; exact deliverables pending',
    problem:'Client context and disclosure permission required.',
    contribution:'Interface and client design work is awaiting public-safe project imagery and a validated case-study narrative.',
    details:['Client interface design','Design deliverables pending','Publication approval required'],
    tech:['Figma','UI/UX','Visual design'],link:'https://github.com/SilasChalwe',linkLabel:'View developer profile',
    media:{placeholder:true,label:'Approved Coded Master designs required'}
  },
  {
    id:'covianhive',
      zoneId: 'clients',number:'12',title:'CovianHive.tech',strapline:'A real corporate website with a restrained, white-first brand system.',
    category:['design','clients','engineering'],discipline:'Website design · Frontend engineering',
    status:'Website design and implementation',statusTone:'verified',
    role:'Web interface and visual presentation design',
    problem:'An engineering and innovation business needs accessible service information, navigation and an identifiable brand.',
    contribution:'Designed web interface work with Covian Navy, Hive Orange and responsive page structures.',
    details:['Responsive website design','Brand-consistent component styling','Corporate page layouts','Navigation and content presentation'],
    tech:['Web design','Responsive UI','JavaScript','CSS'],link:'https://covianhive.tech',linkLabel:'View live website',
    media:{placeholder:true,label:'Approved real website captures to be added'}
  }
);

// Media and exhibition membership are derived from the project data and asset manifest.
// Add a project with a zoneId; add approved screenshots to public/projects/<id>/;
// run npm run media:sync. No 3D scene code needs editing.
export const getProjectMedia = project => (
  mediaManifest[typeof project === 'string' ? project : project.id] || []
);
for (const project of portfolio.projects) {
  project.previewImages = getProjectMedia(project);
  project.coverImage = project.previewImages[0]?.src || null;
  // Retain legacy 'preview' only as a fallback when no screenshots are published.
}
for (const zone of worldZones) {
  zone.projectIds = portfolio.projects
    .filter(project => project.zoneId === zone.id && project.published !== false)
    .map(project => project.id);
}
export const projectsForZone = zoneId => portfolio.projects.filter(
  project => project.zoneId === zoneId && project.published !== false
);
