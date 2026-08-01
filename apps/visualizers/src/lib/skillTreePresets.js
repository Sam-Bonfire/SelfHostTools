export const PRESETS = {
  'solo-founder': {
    name: 'Solo Founder Journey',
    description: 'The path from 9-to-5 to fully automated solo indie hacker.',
    nodes: [
      {
        id: '1',
        title: '6-Month Emergency Fund',
        status: 'unlocked',
        prereqs: [],
        category: 'milestone',
        effort: '$20k',
        desc: 'Liquid cash in a high-yield savings account (HYSA) to survive the pivot.'
      },
      {
        id: '2',
        title: 'Identify Niche & Avatar',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '10 hrs',
        desc: 'Find the overlap between your skills and a starving crowd.'
      },
      {
        id: '3',
        title: 'Learn Direct Response Copy',
        status: 'in-progress',
        prereqs: ['2'],
        category: 'skill',
        effort: '40 hrs',
        desc: 'Read Cashvertising. Practice writing hooks and VSLs.'
      },
      {
        id: '4',
        title: 'Daily Audience Building',
        status: 'in-progress',
        prereqs: ['2'],
        category: 'skill',
        effort: '1 hr/day',
        desc: 'Post daily on Twitter/LinkedIn sharing your building process in public.'
      },
      {
        id: '5',
        title: 'LLC Formation & Banking',
        status: 'locked',
        prereqs: ['1'],
        category: 'milestone',
        effort: '$500',
        desc: 'Legal entity separation and a dedicated business checking account.'
      },
      {
        id: '6',
        title: 'Build MVP / V1 Product',
        status: 'locked',
        prereqs: ['2'],
        category: 'asset',
        effort: '4 weeks',
        desc: 'Build the core feature set using React or a no-code tool.'
      },
      {
        id: '7',
        title: 'High-Converting Landing Page',
        status: 'locked',
        prereqs: ['3'],
        category: 'asset',
        effort: '1 week',
        desc: 'Framer or Webflow site with a clear value proposition and CTA.'
      },
      {
        id: '8',
        title: 'Cold Outreach Engine',
        status: 'locked',
        prereqs: ['3', '5'],
        category: 'asset',
        effort: '$150/mo',
        desc: 'Setup Instantly/Apollo for automated B2B lead generation.'
      },
      {
        id: '9',
        title: 'Product Hunt Launch',
        status: 'locked',
        prereqs: ['4', '6', '7'],
        category: 'milestone',
        effort: 'High',
        desc: 'Coordinate with your built audience for a top #3 finish.'
      },
      {
        id: '10',
        title: 'Hit $1,000 MRR',
        status: 'locked',
        prereqs: ['8', '9'],
        category: 'milestone',
        effort: 'Extreme',
        desc: 'The hardest milestone. Prove product-market fit with real revenue.'
      },
      {
        id: '11',
        title: 'Automate Fulfillment',
        status: 'locked',
        prereqs: ['10'],
        category: 'skill',
        effort: '2 weeks',
        desc: 'Use Zapier/Make to remove yourself from manual onboarding tasks.'
      },
      {
        id: '12',
        title: 'Hire Offshore VA',
        status: 'locked',
        prereqs: ['5', '11'],
        category: 'asset',
        effort: '$600/mo',
        desc: 'Delegate inbox management, lead scraping, and admin tasks.'
      },
      {
        id: '13',
        title: 'Solo Founder Freedom',
        status: 'locked',
        prereqs: ['1', '10', '12'],
        category: 'milestone',
        effort: 'Priceless',
        desc: 'Quit your day job. You now own your time and equity completely.'
      }
    ]
  },
  'full-stack-dev': {
    name: 'Full-Stack Developer',
    description: 'Zero to hired as a modern web developer.',
    nodes: [
      {
        id: '1',
        title: 'HTML / CSS / JS',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '100 hrs',
        desc: 'The trinity of the web. Master the DOM and ES6 syntax.'
      },
      {
        id: '2',
        title: 'Git & GitHub',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '10 hrs',
        desc: 'Version control basics (commit, push, pull, merge).'
      },
      {
        id: '3',
        title: 'Build Static Portfolio',
        status: 'in-progress',
        prereqs: ['1', '2'],
        category: 'asset',
        effort: '20 hrs',
        desc: 'Host a simple HTML/CSS portfolio on GitHub Pages.'
      },
      {
        id: '4',
        title: 'React Fundamentals',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '80 hrs',
        desc: 'Components, state, props, and hooks (useState, useEffect).'
      },
      {
        id: '5',
        title: 'Node.js & Express',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '60 hrs',
        desc: 'Server-side JavaScript. Building RESTful APIs.'
      },
      {
        id: '6',
        title: 'Database (SQL/NoSQL)',
        status: 'locked',
        prereqs: ['5'],
        category: 'skill',
        effort: '40 hrs',
        desc: 'PostgreSQL or MongoDB. CRUD operations and schemas.'
      },
      {
        id: '7',
        title: 'Build Full-Stack App',
        status: 'locked',
        prereqs: ['3', '4', '6'],
        category: 'asset',
        effort: '4 weeks',
        desc: 'A complete SaaS or E-commerce clone with auth and database.'
      },
      {
        id: '8',
        title: 'Algorithms & Data Structures',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '50 hrs',
        desc: 'Leetcode prep for technical interviews.'
      },
      {
        id: '9',
        title: 'Apply to 100 Jobs',
        status: 'locked',
        prereqs: ['7'],
        category: 'milestone',
        effort: 'Grind',
        desc: 'Cold emailing, LinkedIn networking, and resume tailoring.'
      },
      {
        id: '10',
        title: 'Pass Tech Interview',
        status: 'locked',
        prereqs: ['8', '9'],
        category: 'milestone',
        effort: 'High',
        desc: 'Live coding and system design rounds.'
      },
      {
        id: '11',
        title: 'Sign Offer Letter',
        status: 'locked',
        prereqs: ['10'],
        category: 'milestone',
        effort: 'Priceless',
        desc: 'Welcome to the tech industry.'
      }
    ]
  },
  'marathon-runner': {
    name: 'Zero to Marathon',
    description: 'A physical conditioning roadmap for long-distance running.',
    nodes: [
      {
        id: '1',
        title: 'Buy Proper Shoes',
        status: 'unlocked',
        prereqs: [],
        category: 'asset',
        effort: '$150',
        desc: 'Visit a local running store for gait analysis.'
      },
      {
        id: '2',
        title: 'Couch to 5K',
        status: 'in-progress',
        prereqs: ['1'],
        category: 'milestone',
        effort: '8 weeks',
        desc: 'Run a continuous 5 kilometers without stopping.'
      },
      {
        id: '3',
        title: 'Zone 2 Base Building',
        status: 'locked',
        prereqs: ['2'],
        category: 'skill',
        effort: '20 hrs',
        desc: 'Learn to run slowly to build aerobic capacity.'
      },
      {
        id: '4',
        title: 'Nutrition Dial-in',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: 'Daily',
        desc: 'Macro tracking, hydration, and carb-loading basics.'
      },
      {
        id: '5',
        title: 'Run a 10K',
        status: 'locked',
        prereqs: ['2', '3'],
        category: 'milestone',
        effort: 'High',
        desc: 'Complete 6.2 miles.'
      },
      {
        id: '6',
        title: 'Strength Training',
        status: 'locked',
        prereqs: ['2'],
        category: 'skill',
        effort: '2x/week',
        desc: 'Squats, lunges, and core to prevent running injuries.'
      },
      {
        id: '7',
        title: 'Half Marathon (13.1m)',
        status: 'locked',
        prereqs: ['4', '5', '6'],
        category: 'milestone',
        effort: 'Extreme',
        desc: 'The halfway point. Requires fueling strategies during the run.'
      },
      {
        id: '8',
        title: 'Long Run (20 miles)',
        status: 'locked',
        prereqs: ['7'],
        category: 'milestone',
        effort: 'Peak',
        desc: 'The longest training run before the big race.'
      },
      {
        id: '9',
        title: 'Full Marathon (26.2m)',
        status: 'locked',
        prereqs: ['8'],
        category: 'milestone',
        effort: 'Legendary',
        desc: 'Cross the finish line and earn the medal.'
      }
    ]
  },
  'content-creator': {
    name: 'YouTube Empire',
    description: 'Grow a channel from 0 to monetized creator.',
    nodes: [
      {
        id: '1',
        title: 'Pick a Niche',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '10 hrs',
        desc: 'Define your target audience and unique value.'
      },
      {
        id: '2',
        title: 'Basic Gear Setup',
        status: 'unlocked',
        prereqs: [],
        category: 'asset',
        effort: '$300',
        desc: 'Good mic (e.g., Samson Q2U) and smartphone camera.'
      },
      {
        id: '3',
        title: 'Learn Video Editing',
        status: 'in-progress',
        prereqs: ['2'],
        category: 'skill',
        effort: '40 hrs',
        desc: 'Master Premiere Pro, Final Cut, or DaVinci Resolve.'
      },
      {
        id: '4',
        title: 'Master Thumbnails',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '20 hrs',
        desc: 'Learn Photoshop or Figma. High CTR is everything.'
      },
      {
        id: '5',
        title: 'Publish 10 Videos',
        status: 'locked',
        prereqs: ['1', '3', '4'],
        category: 'milestone',
        effort: 'Hard',
        desc: 'Get reps in. Ignore the views, focus on improving 1%.'
      },
      {
        id: '6',
        title: 'First 1,000 Subs',
        status: 'locked',
        prereqs: ['5'],
        category: 'milestone',
        effort: 'Grind',
        desc: 'Unlock the YouTube Partner Program threshold.'
      },
      {
        id: '7',
        title: '4,000 Watch Hours',
        status: 'locked',
        prereqs: ['5'],
        category: 'milestone',
        effort: 'Grind',
        desc: 'The second requirement for monetization.'
      },
      {
        id: '8',
        title: 'Monetization Unlocked',
        status: 'locked',
        prereqs: ['6', '7'],
        category: 'milestone',
        effort: 'High',
        desc: 'Start earning AdSense revenue.'
      },
      {
        id: '9',
        title: 'First Sponsorship',
        status: 'locked',
        prereqs: ['8'],
        category: 'milestone',
        effort: 'Sales',
        desc: 'Pitch brands for a dedicated integration.'
      },
      {
        id: '10',
        title: 'Hire Editor',
        status: 'locked',
        prereqs: ['9'],
        category: 'asset',
        effort: '$500/mo',
        desc: 'Buy back your time to focus entirely on ideas and recording.'
      }
    ]
  },
  'novel-writer': {
    name: 'Published Novelist',
    description: 'From a blank page to a published book.',
    nodes: [
      {
        id: '1',
        title: 'Worldbuilding & Outline',
        status: 'unlocked',
        prereqs: [],
        category: 'asset',
        effort: '2 weeks',
        desc: 'Develop characters, setting, and plot arc.'
      },
      {
        id: '2',
        title: 'Write First Draft',
        status: 'locked',
        prereqs: ['1'],
        category: 'milestone',
        effort: '3 months',
        desc: 'Just get the story out. Do not edit yet.'
      },
      {
        id: '3',
        title: 'Rest Period',
        status: 'locked',
        prereqs: ['2'],
        category: 'milestone',
        effort: '4 weeks',
        desc: 'Step away to gain fresh perspective.'
      },
      {
        id: '4',
        title: 'Developmental Edit',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '4 weeks',
        desc: 'Fix plot holes, pacing, and character arcs.'
      },
      {
        id: '5',
        title: 'Line Editing & Polish',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: '3 weeks',
        desc: 'Refine prose, dialogue, and word choice.'
      },
      {
        id: '6',
        title: 'Beta Readers',
        status: 'locked',
        prereqs: ['5'],
        category: 'asset',
        effort: 'High',
        desc: 'Get feedback from target audience.'
      },
      {
        id: '7',
        title: 'Final Revision',
        status: 'locked',
        prereqs: ['6'],
        category: 'milestone',
        effort: '2 weeks',
        desc: 'Incorporate feedback.'
      },
      {
        id: '8',
        title: 'Query Agents',
        status: 'locked',
        prereqs: ['7'],
        category: 'skill',
        effort: 'Grind',
        desc: 'Write query letters and submit to literary agents.'
      },
      {
        id: '9',
        title: 'Book Deal',
        status: 'locked',
        prereqs: ['8'],
        category: 'milestone',
        effort: 'Priceless',
        desc: 'Sign with a traditional publisher or self-publish.'
      }
    ]
  },
  'language-learning': {
    name: 'Language Fluency',
    description: 'Master a foreign language from scratch.',
    nodes: [
      {
        id: '1',
        title: 'Alphabet & Phonics',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '1 week',
        desc: 'Learn how to read and pronounce letters.'
      },
      {
        id: '2',
        title: 'Top 1000 Words',
        status: 'locked',
        prereqs: ['1'],
        category: 'asset',
        effort: '2 months',
        desc: 'Use Anki flashcards for high-frequency vocabulary.'
      },
      {
        id: '3',
        title: 'Basic Grammar Rules',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '4 weeks',
        desc: 'Sentence structure, tenses, and conjugation.'
      },
      {
        id: '4',
        title: 'A1 Level Reading',
        status: 'locked',
        prereqs: ['2', '3'],
        category: 'milestone',
        effort: 'Medium',
        desc: 'Read children books and simple texts.'
      },
      {
        id: '5',
        title: 'Language Exchange',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: 'Weekly',
        desc: 'Practice speaking with native speakers.'
      },
      {
        id: '6',
        title: 'B1 Intermediate',
        status: 'locked',
        prereqs: ['5'],
        category: 'milestone',
        effort: '6 months',
        desc: 'Hold conversations about daily life.'
      },
      {
        id: '7',
        title: 'Immersive Media',
        status: 'locked',
        prereqs: ['6'],
        category: 'skill',
        effort: 'Daily',
        desc: 'Watch movies and listen to podcasts without subtitles.'
      },
      {
        id: '8',
        title: 'C1 Advanced Fluency',
        status: 'locked',
        prereqs: ['7'],
        category: 'milestone',
        effort: 'Years',
        desc: 'Express complex ideas effortlessly.'
      }
    ]
  },
  'ui-ux-design': {
    name: 'UI/UX Designer',
    description: 'Become a professional product designer.',
    nodes: [
      {
        id: '1',
        title: 'Learn Design Principles',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '2 weeks',
        desc: 'Color theory, typography, spacing, and contrast.'
      },
      {
        id: '2',
        title: 'Master Figma',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '40 hrs',
        desc: 'Auto-layout, components, and variables.'
      },
      {
        id: '3',
        title: 'User Research Basics',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '2 weeks',
        desc: 'Interviews, personas, and journey mapping.'
      },
      {
        id: '4',
        title: 'Wireframing',
        status: 'locked',
        prereqs: ['2', '3'],
        category: 'skill',
        effort: '1 week',
        desc: 'Low-fidelity layouts to test flow.'
      },
      {
        id: '5',
        title: 'High-Fidelity Prototyping',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: '3 weeks',
        desc: 'Create interactive, pixel-perfect mockups.'
      },
      {
        id: '6',
        title: 'Design System Creation',
        status: 'locked',
        prereqs: ['5'],
        category: 'asset',
        effort: '2 weeks',
        desc: 'Build a reusable component library.'
      },
      {
        id: '7',
        title: 'Portfolio Website',
        status: 'locked',
        prereqs: ['6'],
        category: 'asset',
        effort: '2 weeks',
        desc: 'Showcase 3 detailed case studies.'
      },
      {
        id: '8',
        title: 'Land Junior Role',
        status: 'locked',
        prereqs: ['7'],
        category: 'milestone',
        effort: 'High',
        desc: 'Get hired as a UI/UX Designer.'
      }
    ]
  },
  'digital-marketing': {
    name: 'Digital Marketing Expert',
    description: 'Drive traffic and convert leads.',
    nodes: [
      {
        id: '1',
        title: 'Copywriting Basics',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '20 hrs',
        desc: 'Writing persuasive text that drives action.'
      },
      {
        id: '2',
        title: 'SEO Fundamentals',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '40 hrs',
        desc: 'On-page, off-page, and technical SEO.'
      },
      {
        id: '3',
        title: 'Content Marketing',
        status: 'locked',
        prereqs: ['1', '2'],
        category: 'skill',
        effort: '3 weeks',
        desc: 'Blogging, social media, and newsletters.'
      },
      {
        id: '4',
        title: 'Google Analytics',
        status: 'locked',
        prereqs: [],
        category: 'skill',
        effort: '20 hrs',
        desc: 'Track traffic, conversions, and bounce rates.'
      },
      {
        id: '5',
        title: 'Paid Ads (PPC)',
        status: 'locked',
        prereqs: ['1', '4'],
        category: 'skill',
        effort: '40 hrs',
        desc: 'Google Ads and Facebook Ads management.'
      },
      {
        id: '6',
        title: 'Email Automation',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '2 weeks',
        desc: 'Drip campaigns and lead nurturing.'
      },
      {
        id: '7',
        title: 'Run First Campaign',
        status: 'locked',
        prereqs: ['3', '5', '6'],
        category: 'milestone',
        effort: 'High',
        desc: 'Execute a full-funnel marketing campaign.'
      },
      {
        id: '8',
        title: 'Positive ROI',
        status: 'locked',
        prereqs: ['7'],
        category: 'milestone',
        effort: 'Extreme',
        desc: 'Generate more revenue than ad spend.'
      }
    ]
  },
  'game-dev': {
    name: 'Indie Game Developer',
    description: 'Build and publish your first game.',
    nodes: [
      {
        id: '1',
        title: 'Choose Engine',
        status: 'unlocked',
        prereqs: [],
        category: 'asset',
        effort: '1 day',
        desc: 'Unity, Godot, or Unreal Engine.'
      },
      {
        id: '2',
        title: 'Learn C# / Scripting',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '60 hrs',
        desc: 'Programming logic for the chosen engine.'
      },
      {
        id: '3',
        title: 'Game Design Document',
        status: 'unlocked',
        prereqs: [],
        category: 'asset',
        effort: '1 week',
        desc: 'Define mechanics, story, and scope.'
      },
      {
        id: '4',
        title: 'Prototype Core Loop',
        status: 'locked',
        prereqs: ['2', '3'],
        category: 'milestone',
        effort: '2 weeks',
        desc: 'Playable prototype with primitive shapes.'
      },
      {
        id: '5',
        title: 'Art & Animation',
        status: 'locked',
        prereqs: ['4'],
        category: 'asset',
        effort: '4 weeks',
        desc: 'Pixel art, 3D models, or purchased assets.'
      },
      {
        id: '6',
        title: 'Audio & SFX',
        status: 'locked',
        prereqs: ['4'],
        category: 'asset',
        effort: '1 week',
        desc: 'Music, footsteps, UI sounds.'
      },
      {
        id: '7',
        title: 'Polished Vertical Slice',
        status: 'locked',
        prereqs: ['5', '6'],
        category: 'milestone',
        effort: 'High',
        desc: 'One fully completed, polished level.'
      },
      {
        id: '8',
        title: 'Marketing & Wishlists',
        status: 'locked',
        prereqs: ['7'],
        category: 'skill',
        effort: 'Grind',
        desc: 'Steam page setup and social media hype.'
      },
      {
        id: '9',
        title: 'Publish on Steam',
        status: 'locked',
        prereqs: ['8'],
        category: 'milestone',
        effort: 'Extreme',
        desc: 'Release the full game.'
      }
    ]
  },
  'data-science': {
    name: 'Data Scientist',
    description: 'Master data manipulation and machine learning.',
    nodes: [
      {
        id: '1',
        title: 'Python Basics',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '40 hrs',
        desc: 'Syntax, data types, and functions.'
      },
      {
        id: '2',
        title: 'Statistics & Math',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '60 hrs',
        desc: 'Probability, linear algebra, and calculus.'
      },
      {
        id: '3',
        title: 'Pandas & NumPy',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '40 hrs',
        desc: 'Data cleaning and manipulation.'
      },
      {
        id: '4',
        title: 'Data Visualization',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '20 hrs',
        desc: 'Matplotlib, Seaborn, or Tableau.'
      },
      {
        id: '5',
        title: 'EDA Project',
        status: 'locked',
        prereqs: ['2', '4'],
        category: 'milestone',
        effort: '1 week',
        desc: 'Exploratory Data Analysis on a Kaggle dataset.'
      },
      {
        id: '6',
        title: 'Machine Learning Basics',
        status: 'locked',
        prereqs: ['5'],
        category: 'skill',
        effort: '60 hrs',
        desc: 'Scikit-learn, regression, classification.'
      },
      {
        id: '7',
        title: 'Deep Learning',
        status: 'locked',
        prereqs: ['6'],
        category: 'skill',
        effort: '80 hrs',
        desc: 'TensorFlow or PyTorch for neural networks.'
      },
      {
        id: '8',
        title: 'Deploy Model',
        status: 'locked',
        prereqs: ['7'],
        category: 'asset',
        effort: '2 weeks',
        desc: 'Serve a model via an API (FastAPI).'
      },
      {
        id: '9',
        title: 'Data Science Job',
        status: 'locked',
        prereqs: ['8'],
        category: 'milestone',
        effort: 'High',
        desc: 'Pass the technical interview.'
      }
    ]
  },
  photography: {
    name: 'Professional Photographer',
    description: 'Master the camera and build a business.',
    nodes: [
      {
        id: '1',
        title: 'Exposure Triangle',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '10 hrs',
        desc: 'Aperture, Shutter Speed, and ISO.'
      },
      {
        id: '2',
        title: 'Manual Mode Mastery',
        status: 'locked',
        prereqs: ['1'],
        category: 'milestone',
        effort: '20 hrs',
        desc: 'Shoot exclusively in full manual.'
      },
      {
        id: '3',
        title: 'Composition Rules',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '10 hrs',
        desc: 'Rule of thirds, leading lines, framing.'
      },
      {
        id: '4',
        title: 'Lighting Techniques',
        status: 'locked',
        prereqs: ['2', '3'],
        category: 'skill',
        effort: '30 hrs',
        desc: 'Natural light vs flashes/strobes.'
      },
      {
        id: '5',
        title: 'Lightroom Editing',
        status: 'locked',
        prereqs: ['2'],
        category: 'skill',
        effort: '20 hrs',
        desc: 'Color grading and batch processing.'
      },
      {
        id: '6',
        title: 'Build Portfolio',
        status: 'locked',
        prereqs: ['4', '5'],
        category: 'asset',
        effort: 'High',
        desc: 'Do 5 free shoots for diverse examples.'
      },
      {
        id: '7',
        title: 'First Paid Client',
        status: 'locked',
        prereqs: ['6'],
        category: 'milestone',
        effort: 'Hard',
        desc: 'Charge money for a photoshoot.'
      },
      {
        id: '8',
        title: 'Scale Business',
        status: 'locked',
        prereqs: ['7'],
        category: 'milestone',
        effort: 'Extreme',
        desc: 'Weddings, commercial work, or studio.'
      }
    ]
  },
  'guitar-mastery': {
    name: 'Guitar Virtuoso',
    description: 'From buying a guitar to shredding solos.',
    nodes: [
      {
        id: '1',
        title: 'Open Chords',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '20 hrs',
        desc: 'A, C, D, E, G, Am, Em, Dm.'
      },
      {
        id: '2',
        title: 'Strumming Patterns',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '15 hrs',
        desc: 'Rhythm, timing, and muting.'
      },
      {
        id: '3',
        title: 'Play First Song',
        status: 'locked',
        prereqs: ['2'],
        category: 'milestone',
        effort: 'Medium',
        desc: 'Play a full song seamlessly.'
      },
      {
        id: '4',
        title: 'Barre Chords',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '40 hrs',
        desc: 'F and B chords. Building hand strength.'
      },
      {
        id: '5',
        title: 'Pentatonic Scale',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: '20 hrs',
        desc: 'The foundation of lead guitar.'
      },
      {
        id: '6',
        title: 'Music Theory Basics',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: '30 hrs',
        desc: 'Intervals, major scale, and triads.'
      },
      {
        id: '7',
        title: 'Improvisation',
        status: 'locked',
        prereqs: ['5', '6'],
        category: 'skill',
        effort: 'Months',
        desc: 'Jamming over backing tracks.'
      },
      {
        id: '8',
        title: 'Perform Live',
        status: 'locked',
        prereqs: ['7'],
        category: 'milestone',
        effort: 'Scary',
        desc: 'Play at an open mic or with a band.'
      }
    ]
  },
  'personal-finance': {
    name: 'Financial Independence',
    description: 'Achieve FIRE (Financial Independence, Retire Early).',
    nodes: [
      {
        id: '1',
        title: 'Track Expenses',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '1 month',
        desc: 'Log every dollar spent.'
      },
      {
        id: '2',
        title: 'Eliminate High-Interest Debt',
        status: 'locked',
        prereqs: ['1'],
        category: 'milestone',
        effort: 'Hard',
        desc: 'Pay off all credit cards.'
      },
      {
        id: '3',
        title: '3-6 Month Emergency Fund',
        status: 'locked',
        prereqs: ['2'],
        category: 'asset',
        effort: 'Medium',
        desc: 'Cash saved for unexpected events.'
      },
      {
        id: '4',
        title: 'Max Employer Match',
        status: 'locked',
        prereqs: ['3'],
        category: 'milestone',
        effort: 'Easy',
        desc: 'Contribute to 401k up to the match.'
      },
      {
        id: '5',
        title: 'Max Roth IRA',
        status: 'locked',
        prereqs: ['4'],
        category: 'milestone',
        effort: 'Medium',
        desc: 'Tax-free growth investing.'
      },
      {
        id: '6',
        title: 'Index Fund Portfolio',
        status: 'locked',
        prereqs: ['5'],
        category: 'asset',
        effort: 'Ongoing',
        desc: 'Automated investments in VTSAX/VOO.'
      },
      {
        id: '7',
        title: 'Increase Income',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: 'Hard',
        desc: 'Job hopping or side hustles to boost savings rate.'
      },
      {
        id: '8',
        title: '100k Net Worth',
        status: 'locked',
        prereqs: ['6', '7'],
        category: 'milestone',
        effort: 'Grind',
        desc: 'The hardest financial milestone.'
      },
      {
        id: '9',
        title: 'Achieve FIRE',
        status: 'locked',
        prereqs: ['8'],
        category: 'milestone',
        effort: 'Decades',
        desc: 'Portfolio yields enough to cover living expenses.'
      }
    ]
  },
  gardening: {
    name: 'Homesteading / Gardening',
    description: 'Grow your own food.',
    nodes: [
      {
        id: '1',
        title: 'Plan Garden Layout',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '1 week',
        desc: 'Sun mapping and bed sizing.'
      },
      {
        id: '2',
        title: 'Soil Preparation',
        status: 'locked',
        prereqs: ['1'],
        category: 'asset',
        effort: 'High',
        desc: 'Composting, tilling, and testing pH.'
      },
      {
        id: '3',
        title: 'Seed Starting',
        status: 'locked',
        prereqs: ['2'],
        category: 'skill',
        effort: 'Indoor',
        desc: 'Germinating seeds under grow lights.'
      },
      {
        id: '4',
        title: 'Transplanting',
        status: 'locked',
        prereqs: ['3'],
        category: 'milestone',
        effort: 'Medium',
        desc: 'Moving seedlings outdoors after frost.'
      },
      {
        id: '5',
        title: 'Pest Management',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: 'Ongoing',
        desc: 'Organic pest control and fencing.'
      },
      {
        id: '6',
        title: 'Watering Automation',
        status: 'locked',
        prereqs: ['4'],
        category: 'asset',
        effort: 'Weekend',
        desc: 'Setting up drip irrigation.'
      },
      {
        id: '7',
        title: 'First Harvest',
        status: 'locked',
        prereqs: ['5', '6'],
        category: 'milestone',
        effort: 'Joy',
        desc: 'Eating food you grew yourself.'
      },
      {
        id: '8',
        title: 'Food Preservation',
        status: 'locked',
        prereqs: ['7'],
        category: 'skill',
        effort: 'Medium',
        desc: 'Canning, freezing, and fermenting the surplus.'
      }
    ]
  },
  podcasting: {
    name: 'Podcast Creator',
    description: 'Launch and grow an audio show.',
    nodes: [
      {
        id: '1',
        title: 'Concept & Format',
        status: 'unlocked',
        prereqs: [],
        category: 'asset',
        effort: '1 week',
        desc: 'Solo, interview, or narrative?'
      },
      {
        id: '2',
        title: 'Audio Equipment',
        status: 'unlocked',
        prereqs: [],
        category: 'asset',
        effort: '$200',
        desc: 'Dynamic mic, boom arm, and interface.'
      },
      {
        id: '3',
        title: 'Record Episode 1',
        status: 'locked',
        prereqs: ['1', '2'],
        category: 'milestone',
        effort: 'Medium',
        desc: 'Get over the cringe of your own voice.'
      },
      {
        id: '4',
        title: 'Audio Editing (DAW)',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '20 hrs',
        desc: 'Audacity, Logic, or Descript.'
      },
      {
        id: '5',
        title: 'Podcast Hosting',
        status: 'locked',
        prereqs: ['4'],
        category: 'asset',
        effort: '$15/mo',
        desc: 'Buzzsprout or Anchor setup.'
      },
      {
        id: '6',
        title: 'Launch on Apple/Spotify',
        status: 'locked',
        prereqs: ['5'],
        category: 'milestone',
        effort: 'High',
        desc: 'Submit RSS feeds and wait for approval.'
      },
      {
        id: '7',
        title: 'Consistent Schedule',
        status: 'locked',
        prereqs: ['6'],
        category: 'skill',
        effort: 'Grind',
        desc: 'Publish weekly without fail for 6 months.'
      },
      {
        id: '8',
        title: 'Guest Booking System',
        status: 'locked',
        prereqs: ['7'],
        category: 'asset',
        effort: '1 week',
        desc: 'Calendly + Email templates.'
      },
      {
        id: '9',
        title: 'Sponsorship Monetization',
        status: 'locked',
        prereqs: ['8'],
        category: 'milestone',
        effort: 'Hard',
        desc: 'Sell ad reads based on downloads.'
      }
    ]
  },
  '3d-modeling': {
    name: '3D Artist (Blender)',
    description: 'Master 3D modeling and animation.',
    nodes: [
      {
        id: '1',
        title: 'Blender Interface',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '10 hrs',
        desc: 'Navigation and hotkeys.'
      },
      {
        id: '2',
        title: 'Donut Tutorial',
        status: 'locked',
        prereqs: ['1'],
        category: 'milestone',
        effort: '20 hrs',
        desc: 'The rite of passage for Blender beginners.'
      },
      {
        id: '3',
        title: 'Hard Surface Modeling',
        status: 'locked',
        prereqs: ['2'],
        category: 'skill',
        effort: '40 hrs',
        desc: 'Topology, booleans, and edge flow.'
      },
      {
        id: '4',
        title: 'UV Unwrapping',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '15 hrs',
        desc: 'Flattening 3D models for textures.'
      },
      {
        id: '5',
        title: 'Texturing & Shading',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: '30 hrs',
        desc: 'PBR materials and node setups.'
      },
      {
        id: '6',
        title: 'Lighting & Rendering',
        status: 'locked',
        prereqs: ['5'],
        category: 'skill',
        effort: '20 hrs',
        desc: 'Cycles vs Eevee, HDRI setups.'
      },
      {
        id: '7',
        title: 'Rigging',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '30 hrs',
        desc: 'Adding bones to models.'
      },
      {
        id: '8',
        title: 'Animation Basics',
        status: 'locked',
        prereqs: ['7'],
        category: 'skill',
        effort: '40 hrs',
        desc: 'Keyframes and the graph editor.'
      },
      {
        id: '9',
        title: 'Completed Short Film',
        status: 'locked',
        prereqs: ['6', '8'],
        category: 'milestone',
        effort: 'Extreme',
        desc: 'A fully rendered scene with animation.'
      }
    ]
  },
  ecommerce: {
    name: 'E-Commerce / Dropshipping',
    description: 'Build a profitable online store.',
    nodes: [
      {
        id: '1',
        title: 'Product Research',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '2 weeks',
        desc: 'Find winning products with high margins.'
      },
      {
        id: '2',
        title: 'Supplier Sourcing',
        status: 'locked',
        prereqs: ['1'],
        category: 'asset',
        effort: '1 week',
        desc: 'Aliexpress, Zendrop, or local manufacturers.'
      },
      {
        id: '3',
        title: 'Shopify Store Setup',
        status: 'locked',
        prereqs: ['1'],
        category: 'asset',
        effort: '2 weeks',
        desc: 'Theme design, checkout, and apps.'
      },
      {
        id: '4',
        title: 'Product Copy & Media',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '1 week',
        desc: 'High-converting descriptions and images.'
      },
      {
        id: '5',
        title: 'TikTok / FB Ads Strategy',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: '3 weeks',
        desc: 'Ad creatives and media buying.'
      },
      {
        id: '6',
        title: 'Launch Ad Campaigns',
        status: 'locked',
        prereqs: ['2', '5'],
        category: 'milestone',
        effort: '$$$',
        desc: 'Testing products with real budget.'
      },
      {
        id: '7',
        title: 'First Sale',
        status: 'locked',
        prereqs: ['6'],
        category: 'milestone',
        effort: 'Joy',
        desc: 'The store works!'
      },
      {
        id: '8',
        title: 'CRO & Email Marketing',
        status: 'locked',
        prereqs: ['7'],
        category: 'skill',
        effort: 'Ongoing',
        desc: 'Abandoned cart flows and upsells.'
      },
      {
        id: '9',
        title: 'Consistent Profit',
        status: 'locked',
        prereqs: ['8'],
        category: 'milestone',
        effort: 'Hard',
        desc: 'Scaling ads while maintaining positive ROI.'
      }
    ]
  },
  'real-estate': {
    name: 'Real Estate Investor',
    description: 'Build wealth through physical property.',
    nodes: [
      {
        id: '1',
        title: 'Save Down Payment',
        status: 'unlocked',
        prereqs: [],
        category: 'asset',
        effort: 'Years',
        desc: 'Accumulate capital for the first property.'
      },
      {
        id: '2',
        title: 'Market Research',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '1 month',
        desc: 'Analyze neighborhoods, rents, and ROI.'
      },
      {
        id: '3',
        title: 'Pre-Approval',
        status: 'locked',
        prereqs: ['1'],
        category: 'milestone',
        effort: 'Medium',
        desc: 'Get financing lined up with a lender.'
      },
      {
        id: '4',
        title: 'Deal Analysis',
        status: 'locked',
        prereqs: ['2'],
        category: 'skill',
        effort: 'Ongoing',
        desc: 'Running numbers (Cash flow, Cap Rate).'
      },
      {
        id: '5',
        title: 'Make Offers',
        status: 'locked',
        prereqs: ['3', '4'],
        category: 'skill',
        effort: 'Grind',
        desc: 'Submit offers on viable properties.'
      },
      {
        id: '6',
        title: 'Close on Property',
        status: 'locked',
        prereqs: ['5'],
        category: 'milestone',
        effort: 'Huge',
        desc: 'Sign the papers and get the keys.'
      },
      {
        id: '7',
        title: 'Rehab / Renovate',
        status: 'locked',
        prereqs: ['6'],
        category: 'skill',
        effort: 'Hard',
        desc: 'Manage contractors to force appreciation.'
      },
      {
        id: '8',
        title: 'Place Tenant',
        status: 'locked',
        prereqs: ['7'],
        category: 'milestone',
        effort: 'Medium',
        desc: 'Screening and lease signing.'
      },
      {
        id: '9',
        title: 'Cash Flowing Asset',
        status: 'locked',
        prereqs: ['8'],
        category: 'milestone',
        effort: 'Passive',
        desc: 'Property management or self-managing for profit.'
      }
    ]
  },
  'ml-engineer': {
    name: 'ML Engineer',
    description: 'Building AI in production.',
    nodes: [
      {
        id: '1',
        title: 'Advanced Calculus & Linear Algebra',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: 'Months',
        desc: 'The math behind neural networks.'
      },
      {
        id: '2',
        title: 'Deep Learning Architectures',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '2 months',
        desc: 'CNNs, RNNs, and Transformers.'
      },
      {
        id: '3',
        title: 'PyTorch Mastery',
        status: 'locked',
        prereqs: ['2'],
        category: 'skill',
        effort: '1 month',
        desc: 'Building custom models and training loops.'
      },
      {
        id: '4',
        title: 'Train a Custom Transformer',
        status: 'locked',
        prereqs: ['3'],
        category: 'milestone',
        effort: 'Hard',
        desc: 'Train an NLP model from scratch.'
      },
      {
        id: '5',
        title: 'Model Optimization',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: '3 weeks',
        desc: 'Quantization, pruning, ONNX.'
      },
      {
        id: '6',
        title: 'MLOps & CI/CD',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: '1 month',
        desc: 'Docker, MLflow, and automated retraining.'
      },
      {
        id: '7',
        title: 'Deploy at Scale',
        status: 'locked',
        prereqs: ['5', '6'],
        category: 'milestone',
        effort: 'High',
        desc: 'Serve models via Kubernetes or serverless GPUs.'
      }
    ]
  },
  devops: {
    name: 'DevOps / SRE',
    description: 'Mastering infrastructure and deployment.',
    nodes: [
      {
        id: '1',
        title: 'Linux Administration',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '1 month',
        desc: 'Bash scripting, permissions, networking.'
      },
      {
        id: '2',
        title: 'Networking Fundamentals',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '2 weeks',
        desc: 'DNS, TCP/IP, Load Balancing.'
      },
      {
        id: '3',
        title: 'Docker Containerization',
        status: 'locked',
        prereqs: ['1'],
        category: 'skill',
        effort: '2 weeks',
        desc: 'Writing Dockerfiles and docker-compose.'
      },
      {
        id: '4',
        title: 'CI/CD Pipelines',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '3 weeks',
        desc: 'GitHub Actions, Jenkins, or GitLab CI.'
      },
      {
        id: '5',
        title: 'Cloud Provider (AWS/GCP)',
        status: 'locked',
        prereqs: ['2'],
        category: 'skill',
        effort: '1 month',
        desc: 'EC2, S3, IAM, VPCs.'
      },
      {
        id: '6',
        title: 'Infrastructure as Code',
        status: 'locked',
        prereqs: ['5'],
        category: 'skill',
        effort: '3 weeks',
        desc: 'Terraform or Ansible.'
      },
      {
        id: '7',
        title: 'Kubernetes',
        status: 'locked',
        prereqs: ['3', '6'],
        category: 'skill',
        effort: '2 months',
        desc: 'Pods, deployments, services, ingress.'
      },
      {
        id: '8',
        title: 'Observability',
        status: 'locked',
        prereqs: ['7'],
        category: 'asset',
        effort: '2 weeks',
        desc: 'Prometheus, Grafana, ELK stack.'
      },
      {
        id: '9',
        title: 'Automated Prod Environment',
        status: 'locked',
        prereqs: ['4', '7', '8'],
        category: 'milestone',
        effort: 'Extreme',
        desc: 'Zero-downtime, fully automated infrastructure.'
      }
    ]
  },
  cybersecurity: {
    name: 'Ethical Hacker',
    description: 'Break into systems to secure them.',
    nodes: [
      {
        id: '1',
        title: 'Networking Deep Dive',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '2 months',
        desc: 'OSI model, subnetting, protocols.'
      },
      {
        id: '2',
        title: 'Linux & Scripting',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '1 month',
        desc: 'Bash and Python.'
      },
      {
        id: '3',
        title: 'Security Fundamentals',
        status: 'locked',
        prereqs: ['1', '2'],
        category: 'skill',
        effort: '1 month',
        desc: 'CompTIA Security+ concepts.'
      },
      {
        id: '4',
        title: 'Web App Vulnerabilities',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '2 months',
        desc: 'OWASP Top 10 (SQLi, XSS, CSRF).'
      },
      {
        id: '5',
        title: 'Burp Suite Mastery',
        status: 'locked',
        prereqs: ['4'],
        category: 'asset',
        effort: '3 weeks',
        desc: 'Intercepting and modifying web traffic.'
      },
      {
        id: '6',
        title: 'Network Penetration',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '1 month',
        desc: 'Nmap, Metasploit, active directory exploits.'
      },
      {
        id: '7',
        title: 'CTF Challenges',
        status: 'locked',
        prereqs: ['5', '6'],
        category: 'milestone',
        effort: 'Ongoing',
        desc: 'HackTheBox and TryHackMe.'
      },
      {
        id: '8',
        title: 'OSCP Certification',
        status: 'locked',
        prereqs: ['7'],
        category: 'milestone',
        effort: 'Extreme',
        desc: 'The gold standard practical exam.'
      }
    ]
  },
  woodworking: {
    name: 'Master Woodworker',
    description: 'Build heirloom quality furniture.',
    nodes: [
      {
        id: '1',
        title: 'Safety & PPE',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: 'Day 1',
        desc: 'Keep your fingers attached.'
      },
      {
        id: '2',
        title: 'Basic Hand Tools',
        status: 'unlocked',
        prereqs: ['1'],
        category: 'asset',
        effort: '$100',
        desc: 'Saws, chisels, measuring.'
      },
      {
        id: '3',
        title: 'Build a Box',
        status: 'locked',
        prereqs: ['2'],
        category: 'milestone',
        effort: 'Weekend',
        desc: 'Understanding squareness and basic cuts.'
      },
      {
        id: '4',
        title: 'Power Tools (Table Saw)',
        status: 'locked',
        prereqs: ['1'],
        category: 'asset',
        effort: '$500+',
        desc: 'The heart of the woodshop.'
      },
      {
        id: '5',
        title: 'Milling Lumber',
        status: 'locked',
        prereqs: ['4'],
        category: 'skill',
        effort: '2 weeks',
        desc: 'Jointer and planer to make boards flat and square.'
      },
      {
        id: '6',
        title: 'Joinery Basics',
        status: 'locked',
        prereqs: ['3', '5'],
        category: 'skill',
        effort: '1 month',
        desc: 'Rabbets, dados, and dowels.'
      },
      {
        id: '7',
        title: 'Finishing Techniques',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '2 weeks',
        desc: 'Sanding, staining, and polyurethane.'
      },
      {
        id: '8',
        title: 'Mortise and Tenon',
        status: 'locked',
        prereqs: ['6'],
        category: 'skill',
        effort: '3 weeks',
        desc: 'Traditional, strong joints.'
      },
      {
        id: '9',
        title: 'Build a Dining Table',
        status: 'locked',
        prereqs: ['7', '8'],
        category: 'milestone',
        effort: 'High',
        desc: 'A complex, large-scale heirloom project.'
      }
    ]
  },
  'stand-up': {
    name: 'Stand-Up Comedian',
    description: 'From telling jokes in the shower to a paid feature.',
    nodes: [
      {
        id: '1',
        title: 'Write 5 Minutes of Material',
        status: 'unlocked',
        prereqs: [],
        category: 'asset',
        effort: '1 week',
        desc: 'Premise, setup, punchline.'
      },
      {
        id: '2',
        title: 'First Open Mic',
        status: 'locked',
        prereqs: ['1'],
        category: 'milestone',
        effort: 'Terrifying',
        desc: 'Bombing is guaranteed. Do it anyway.'
      },
      {
        id: '3',
        title: 'Record and Review',
        status: 'locked',
        prereqs: ['2'],
        category: 'skill',
        effort: 'Ongoing',
        desc: 'Listen back to find where the laughs actually are.'
      },
      {
        id: '4',
        title: 'Rewrite & Tighten',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: 'Ongoing',
        desc: 'Cut the fat. Get to the punchline faster.'
      },
      {
        id: '5',
        title: 'Do 50 Open Mics',
        status: 'locked',
        prereqs: ['4'],
        category: 'milestone',
        effort: 'Months',
        desc: 'Building stage presence and thick skin.'
      },
      {
        id: '6',
        title: 'Solidify a tight 5',
        status: 'locked',
        prereqs: ['5'],
        category: 'asset',
        effort: 'High',
        desc: '5 minutes of proven, consistent laughs.'
      },
      {
        id: '7',
        title: 'Crowd Work Basics',
        status: 'locked',
        prereqs: ['5'],
        category: 'skill',
        effort: 'Hard',
        desc: 'Learning to pivot when a joke fails.'
      },
      {
        id: '8',
        title: 'Book a Showcase',
        status: 'locked',
        prereqs: ['6'],
        category: 'milestone',
        effort: 'Networking',
        desc: 'Get invited to perform on a curated show.'
      },
      {
        id: '9',
        title: 'Paid Feature Spot (15 min)',
        status: 'locked',
        prereqs: ['7', '8'],
        category: 'milestone',
        effort: 'Extreme',
        desc: 'Getting paid to be the middle act.'
      }
    ]
  },
  'product-manager': {
    name: 'Product Manager',
    description: 'Lead teams and build products users love.',
    nodes: [
      {
        id: '1',
        title: 'User Research & Empathy',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '3 weeks',
        desc: 'Conducting user interviews and finding pain points.'
      },
      {
        id: '2',
        title: 'Agile & Scrum Basics',
        status: 'unlocked',
        prereqs: [],
        category: 'skill',
        effort: '1 week',
        desc: 'Sprints, standups, and backlog grooming.'
      },
      {
        id: '3',
        title: 'Write a PRD',
        status: 'locked',
        prereqs: ['1'],
        category: 'asset',
        effort: '1 week',
        desc: 'Product Requirements Document detailing scope and specs.'
      },
      {
        id: '4',
        title: 'Wireframing (Figma)',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '2 weeks',
        desc: 'Communicating ideas visually to engineers.'
      },
      {
        id: '5',
        title: 'Data Analytics',
        status: 'locked',
        prereqs: [],
        category: 'skill',
        effort: '1 month',
        desc: 'SQL and product analytics (Mixpanel/Amplitude).'
      },
      {
        id: '6',
        title: 'Prioritization Frameworks',
        status: 'locked',
        prereqs: ['3', '5'],
        category: 'skill',
        effort: '1 week',
        desc: 'RICE, MoSCoW, Kano model.'
      },
      {
        id: '7',
        title: 'Manage Engineering Sprint',
        status: 'locked',
        prereqs: ['2', '6'],
        category: 'milestone',
        effort: 'High',
        desc: 'Keep the team unblocked and shipping.'
      },
      {
        id: '8',
        title: 'Go-to-Market Strategy',
        status: 'locked',
        prereqs: ['3'],
        category: 'skill',
        effort: '2 weeks',
        desc: 'Pricing, positioning, and launch coordination.'
      },
      {
        id: '9',
        title: 'Successful Launch',
        status: 'locked',
        prereqs: ['7', '8'],
        category: 'milestone',
        effort: 'Extreme',
        desc: 'Ship a feature that hits its success metrics.'
      }
    ]
  }
};
