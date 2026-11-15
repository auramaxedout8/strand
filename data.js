// STRAND — Verified Organic Salon & Barber Intelligence Data

const INITIAL_SALONS = [
  {
    id: "salon-1",
    name: "The Artizan Barber & Consultation Studio",
    tagline: "Dedicated 10-Minute Consultation Before Shears Ever Touch Your Hair",
    address: "142 Mercer St, SoHo District",
    neighborhood: "SoHo",
    lat: 40.7248,
    lng: -73.9991,
    baseDistance: 0.3,
    phone: "(212) 555-0142",
    priceRange: "$$$",
    priceTier: 3,
    hours: "9:00 AM - 8:00 PM",
    heroImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80"
    ],
    demandUnderstandingScore: 99,
    listeningRating: 4.95,
    photoFidelityRate: 98,
    organicRating: 4.94,
    organicReviewCount: 142,
    organicTrustBadge: "100% Organic Verified • Zero Paid Placements",
    specialties: ["Curly & Textured Hair", "Skin Fades", "Beard Sculpting", "Trauma Fix / Bad Cut Recovery", "Silent Cuts"],
    hairTypeCompatibilities: ["Straight (1A-1C)", "Wavy (2A-2C)", "Curly (3A-3C)", "Coily (4A-4C)"],
    consultationProtocol: "Mandatory mirror consultation, hair grain assessment, guard confirmation, and mid-cut checkpoint check-ins.",
    barbers: [
      {
        id: "b-1",
        name: "Marcus Vance",
        title: "Master Barber & Consultation Lead",
        experience: "14 years",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        demandScore: 99,
        listeningQuote: "I never assume. If you say half an inch, I show you half an inch on the comb first.",
        specialty: "Precision Fades & Cowlick Correction"
      },
      {
        id: "b-2",
        name: "Elena Rostova",
        title: "Texture & Scissor Specialist",
        experience: "9 years",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
        demandScore: 98,
        listeningQuote: "Your reference photo is our blueprint, but your bone structure is our foundation.",
        specialty: "Curly & Wavy Layering"
      }
    ],
    organicReviews: [
      {
        id: "rev-1",
        author: "Julian K.",
        verifiedDate: "Verified Visit • Nov 2, 2026",
        hairType: "Curly (3B)",
        requestedCut: "Low taper fade, preserve top curls, do not cut into hairline",
        barberName: "Marcus Vance",
        overallScore: 5,
        listeningScore: 5,
        lengthFidelityScore: 5,
        photoMatchScore: 5,
        reviewText: "Finally a barber who doesn't scalp you when you ask for a trim! I showed Marcus 3 reference photos and explained that barbers always push my left temple back because of a tricky cowlick. He spent 7 minutes analyzing how my curls lay dry, asked clarifying questions, and showed me with the mirror before taking off any length. Absolute perfection.",
        organicAuditPass: true,
        tags: ["Listened to reference photo", "Honored length request", "Protected hairline"]
      },
      {
        id: "rev-2",
        author: "Devon M.",
        verifiedDate: "Verified Visit • Oct 18, 2026",
        hairType: "Coily (4A)",
        requestedCut: "Drop fade with scissor trim on textured sponge top",
        barberName: "Elena Rostova",
        overallScore: 5,
        listeningScore: 5,
        lengthFidelityScore: 5,
        photoMatchScore: 4.9,
        reviewText: "I booked with Elena after seeing her organic reviews on Strand. She listened to every detail about my scalp sensitivity. She didn't press down hard with clippers, checked in twice during the fade, and gave me the exact taper I requested. Authentic artistry.",
        organicAuditPass: true,
        tags: ["Scalp sensitivity care", "Mid-cut check-in"]
      }
    ]
  },
  {
    id: "salon-2",
    name: "True Form Hair Lab & Atelier",
    tagline: "The Anti-Rushed Salon: Every Request Mapped & Honored",
    address: "78 Grand St, Lower Manhattan",
    neighborhood: "Tribeca",
    lat: 40.7205,
    lng: -74.0042,
    baseDistance: 0.6,
    phone: "(212) 555-0189",
    priceRange: "$$$$",
    priceTier: 4,
    hours: "10:00 AM - 7:30 PM",
    heroImage: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80"
    ],
    demandUnderstandingScore: 98,
    listeningRating: 4.92,
    photoFidelityRate: 97,
    organicRating: 4.91,
    organicReviewCount: 118,
    organicTrustBadge: "100% Organic Verified • Client Photo Audited",
    specialties: ["Gender-Neutral Styling", "Scissor Mastery", "Wolf Cuts & Shags", "Quiet Appointments", "Thinning Hair Optimization"],
    hairTypeCompatibilities: ["Straight (1A-1C)", "Wavy (2A-2C)", "Curly (3A-3C)"],
    consultationProtocol: "Digital reference breakdown, lifestyle & morning-routine alignment, hand-mirror checkpoints.",
    barbers: [
      {
        id: "b-3",
        name: "Soren Lindqvist",
        title: "Creative Director & Scissor Artisan",
        experience: "16 years",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        demandScore: 99,
        listeningQuote: "If a client says 'I only have 3 minutes to style in the morning', I cut for real life, not an Instagram pose.",
        specialty: "Effortless Scissor Cuts & Texture"
      },
      {
        id: "b-4",
        name: "Aria Chen",
        title: "Senior Stylist & Curl Architect",
        experience: "8 years",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
        demandScore: 97,
        listeningQuote: "I never use thinning shears without explicit permission and explanation.",
        specialty: "Asian Hair & Dense Density Management"
      }
    ],
    organicReviews: [
      {
        id: "rev-3",
        author: "Kevin L.",
        verifiedDate: "Verified Visit • Nov 5, 2026",
        hairType: "Straight (1B - Coarse)",
        requestedCut: "Modern scissor crop, no clippers on sides, natural texture",
        barberName: "Soren Lindqvist",
        overallScore: 5,
        listeningScore: 5,
        lengthFidelityScore: 5,
        photoMatchScore: 4.8,
        reviewText: "Most barbers hear 'crop' and pull out a #2 clipper immediately even when you asked for scissor-over-comb. Soren didn't touch a clipper. He listened, observed my stubborn cowlick at the crown, and cut it so it naturally falls into place without styling product. Worth every single dollar.",
        organicAuditPass: true,
        tags: ["Strictly followed no-clippers request", "Cowlick mastery"]
      }
    ]
  },
  {
    id: "salon-3",
    name: "Crown & Blade Craft Barbershop",
    tagline: "Where 'Just Clean Up The Edges' Means Exactly That",
    address: "215 Bowery, Lower East Side",
    neighborhood: "Bowery",
    lat: 40.7219,
    lng: -73.9932,
    baseDistance: 0.8,
    phone: "(212) 555-0167",
    priceRange: "$$",
    priceTier: 2,
    hours: "8:30 AM - 8:30 PM",
    heroImage: "https://images.unsplash.com/photo-1593702295094-ada7554100c3?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1593702295094-ada7554100c3?auto=format&fit=crop&w=800&q=80"
    ],
    demandUnderstandingScore: 97,
    listeningRating: 4.88,
    photoFidelityRate: 96,
    organicRating: 4.89,
    organicReviewCount: 204,
    organicTrustBadge: "100% Organic Verified • High Frequency Return Rate",
    specialties: ["Classic Fades", "Beard Lineup & Hot Towel", "Low Tapers", "Edge-Up Specialists", "Budget-Friendly Craft"],
    hairTypeCompatibilities: ["Straight (1A-1C)", "Wavy (2A-2C)", "Coily (4A-4C)"],
    consultationProtocol: "Clipper guard confirmation, mirror side-profile check, zero surprises neck tapering.",
    barbers: [
      {
        id: "b-5",
        name: "Darius Washington",
        title: "Fade Craftsman & Beard Alchemist",
        experience: "11 years",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        demandScore: 98,
        listeningQuote: "A good fade is 50% muscle memory and 50% respecting what the client actually requested.",
        specialty: "Beard Sculpting & Razor Lineups"
      }
    ],
    organicReviews: [
      {
        id: "rev-5",
        author: "Marcus T.",
        verifiedDate: "Verified Visit • Nov 8, 2026",
        hairType: "Coily (4B)",
        requestedCut: "Mid taper fade, keep beard fullness, sharp lineup without chalk/paint",
        barberName: "Darius Washington",
        overallScore: 5,
        listeningScore: 5,
        lengthFidelityScore: 5,
        photoMatchScore: 4.9,
        reviewText: "Other shops spray artificial hair paint without asking. Darius asked first, I told him 'all natural only', and he gave me the sharpest organic edge without any enhancements. He understood my beard boundary demands perfectly.",
        organicAuditPass: true,
        tags: ["No unwanted enhancements", "Preserved beard bulk"]
      }
    ]
  },
  {
    id: "salon-4",
    name: "Aura & Grain Botanical Hair Space",
    tagline: "Holistic Haircare, Zero Judgment, 100% Attentive Listening",
    address: "49 Bleeker St, Greenwich Village",
    neighborhood: "Greenwich Village",
    lat: 40.7259,
    lng: -73.9961,
    baseDistance: 0.9,
    phone: "(212) 555-0133",
    priceRange: "$$$",
    priceTier: 3,
    hours: "9:30 AM - 7:00 PM",
    heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
    ],
    demandUnderstandingScore: 98,
    listeningRating: 4.94,
    photoFidelityRate: 98,
    organicRating: 4.93,
    organicReviewCount: 96,
    organicTrustBadge: "100% Organic Verified • Eco & Organic Certified",
    specialties: ["Curly Specialists (Ouidad / Deva trained)", "Scalp Health", "Organic Color", "Silent Cuts Available", "Long Hair Maintenance"],
    hairTypeCompatibilities: ["Wavy (2A-2C)", "Curly (3A-3C)", "Coily (4A-4C)"],
    consultationProtocol: "Dry curl mapping, elasticity test, interactive mirror consultation, product sensitivity scan.",
    barbers: [
      {
        id: "b-7",
        name: "Chloe Dupont",
        title: "Master Curl Stylist & Educator",
        experience: "13 years",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
        demandScore: 99,
        listeningQuote: "Curly hair has trauma. Barbers cut it wet, it shrinks 3 inches, and the customer cries. We cut dry and respect curl spring-back.",
        specialty: "Dry Curl Sculpting & Volume Balance"
      }
    ],
    organicReviews: [
      {
        id: "rev-7",
        author: "Sarah B.",
        verifiedDate: "Verified Visit • Nov 10, 2026",
        hairType: "Curly (3C)",
        requestedCut: "Shape round halo without losing overall length, remove dead ends only",
        barberName: "Chloe Dupont",
        overallScore: 5,
        listeningScore: 5,
        lengthFidelityScore: 5,
        photoMatchScore: 4.9,
        reviewText: "Chloe is the FIRST stylist in New York who understood what I meant by 'micro-trim'. She measured curl shrinkage with me in the mirror before cutting a single curl. Not a single millimeter was lost unnecessarily. She genuinely gets it.",
        organicAuditPass: true,
        tags: ["Understood curl shrinkage", "True micro-trim"]
      }
    ]
  },
  {
    id: "salon-5",
    name: "Follicle & Flow Men's Grooming Lab",
    tagline: "Consultation Driven • Engineered Fades • Silent Cuts Welcomed",
    address: "312 Hudson St, Hudson Square",
    neighborhood: "Hudson Square",
    lat: 40.7265,
    lng: -74.0076,
    baseDistance: 1.2,
    phone: "(212) 555-0158",
    priceRange: "$$",
    priceTier: 2,
    hours: "8:00 AM - 9:00 PM",
    heroImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80"
    ],
    demandUnderstandingScore: 96,
    listeningRating: 4.87,
    photoFidelityRate: 95,
    organicRating: 4.85,
    organicReviewCount: 167,
    organicTrustBadge: "100% Organic Verified • Audio Consultation Option",
    specialties: ["Textured Quiffs", "Low Skin Taper", "Silent Cut Service", "Thinning Crown Camouflage", "Beard Fade"],
    hairTypeCompatibilities: ["Straight (1A-1C)", "Wavy (2A-2C)"],
    consultationProtocol: "3D head shape inspection, cowlick direction scan, communication style option selected at check-in.",
    barbers: [
      {
        id: "b-8",
        name: "Kenji Takahashi",
        title: "Senior Barber & Fade Architect",
        experience: "10 years",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
        demandScore: 97,
        listeningQuote: "I offer a 'Silent Cut' toggle. If you had a stressful day, you don't need small talk. You just need your cut executed perfectly.",
        specialty: "High/Low Skin Fades & Japanese Scissor Work"
      }
    ],
    organicReviews: [
      {
        id: "rev-8",
        author: "Alex V.",
        verifiedDate: "Verified Visit • Nov 1, 2026",
        hairType: "Straight (1A - Fine)",
        requestedCut: "Textured crop with soft fade, disguise thinning spot on the crown",
        barberName: "Kenji Takahashi",
        overallScore: 5,
        listeningScore: 5,
        lengthFidelityScore: 4.9,
        photoMatchScore: 4.8,
        reviewText: "I selected 'Silent Cut' and provided my Strand Directive notes. Kenji read every note, gave a 2-minute nod and confirmation, and executed the exact cut. He cut around my crown cowlick so it looks 3x thicker. Best barber near me by far.",
        organicAuditPass: true,
        tags: ["Respected silent cut demand", "Crown thinning solution"]
      }
    ]
  },
  {
    id: "salon-6",
    name: "Kith & Razor Barber Lounge",
    tagline: "Where Every Customer's Hair Story is Heard, Never Dismissed",
    address: "180 Orchard St, Lower East Side",
    neighborhood: "Lower East Side",
    lat: 40.7225,
    lng: -73.9882,
    baseDistance: 1.5,
    phone: "(212) 555-0199",
    priceRange: "$$",
    priceTier: 2,
    hours: "9:00 AM - 8:00 PM",
    heroImage: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80"
    ],
    demandUnderstandingScore: 97,
    listeningRating: 4.89,
    photoFidelityRate: 96,
    organicRating: 4.88,
    organicReviewCount: 131,
    organicTrustBadge: "100% Organic Verified • Community Audited",
    specialties: ["Classic Pompadours", "Buzz Fades", "Hot Shaves", "Kids with Sensory Sensitivities", "Beard Shaping"],
    hairTypeCompatibilities: ["Straight (1A-1C)", "Wavy (2A-2C)", "Curly (3A-3C)", "Coily (4A-4C)"],
    consultationProtocol: "Patience-first intake, hair growth direction check, customer guard veto guarantee.",
    barbers: [
      {
        id: "b-9",
        name: "Mateo Gomez",
        title: "Traditional Craftsman & Patient Barber",
        experience: "12 years",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
        demandScore: 98,
        listeningQuote: "If you don't like the clipper guard I'm holding, tell me. I want you to walk out smiling, not crying in your car.",
        specialty: "Classic Tapers & Sensory-Friendly Grooming"
      }
    ],
    organicReviews: [
      {
        id: "rev-9",
        author: "Daniel R.",
        verifiedDate: "Verified Visit • Oct 15, 2026",
        hairType: "Wavy (2C)",
        requestedCut: "Mod-style scissors cut, tapered neck, don't touch length in back",
        barberName: "Mateo Gomez",
        overallScore: 5,
        listeningScore: 5,
        lengthFidelityScore: 5,
        photoMatchScore: 4.8,
        reviewText: "I've had barbers in the past who just shave off whatever they want regardless of what I say. Mateo listened intently, took his time, and kept checking in. Honest, organic 5 stars on Strand.",
        organicAuditPass: true,
        tags: ["Honored length in back", "Patient consultation"]
      }
    ]
  }
];

// Predefined Haircut Blueprint Templates with curated reference photo previews
const HAIRSTYLE_TEMPLATES = [
  {
    id: "low-taper-fade",
    name: "Low Drop Taper + Preserved Curls",
    category: "Modern Fade",
    photoUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80",
    defaultInstructions: "Keep top length natural. Low drop taper on temples and nape. Do not push hairline back. Leave sideburns natural."
  },
  {
    id: "scissor-crop",
    name: "Textured French Crop (Scissor Cut)",
    category: "Scissor / Low Maintenance",
    photoUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
    defaultInstructions: "Cut with scissors only or #3 guard minimum on sides. Textured forward fringe, soft natural neck taper."
  },
  {
    id: "curly-layering",
    name: "Curly Shape & Hydration Cut",
    category: "Curls & Coils",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    defaultInstructions: "Cut dry curl by curl. Preserve overall length. Round silhouette, remove split ends without thinning shears."
  },
  {
    id: "classic-gentleman",
    name: "Classic Side Part / Executive Taper",
    category: "Classic Barber",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    defaultInstructions: "Finger length on top, taper sides with #2.5 to #1. Natural part line, no hard razor part."
  },
  {
    id: "wolf-cut-shag",
    name: "Layered Shag / Modern Wolf Cut",
    category: "Texture & Flow",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    defaultInstructions: "Face-framing layers, curtain fringe, retain perimeter length and bulk on ends."
  },
  {
    id: "beard-hair-combo",
    name: "Skin Fade + Full Beard Lineup",
    category: "Fade & Beard",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    defaultInstructions: "Mid skin fade, blended beard transition. Define cheek lines naturally without digging into jaw line."
  }
];
