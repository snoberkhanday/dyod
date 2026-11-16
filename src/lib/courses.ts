/**
 * Course and basket data for BS (DYOD) at IUST.
 *
 * Source: IUST "Design your own degree @IUST" slides (29 May 2025), which
 * supersede the April 2024 slides. Where the 2024 slides differ, the old value
 * is kept in `legacy` so answers can mention it.
 */

export interface Basket {
  n: number
  name: string
  code: string
  acronym: string
  includes: string
  courses: string[]
}

export const BASKETS: Basket[] = [
  {
    n: 1,
    name: 'Natural Sciences',
    code: 'S',
    acronym: 'NS',
    includes: 'Physical, Chemical and Biological Sciences',
    courses: [
      'Physics as Fun: Unveiling the Magic I',
      'Molecules of Life',
      'Chemistry in Everyday Life',
      'From Atoms to Molecules: Demystifying Matter',
      'Understanding Biodiversity',
      'Immunology: From Health to Disease',
      'Science as the Art of Enquiry',
      'Physics as Fun: Unveiling the Magic II'
    ]
  },
  {
    n: 2,
    name: 'Mathematical Sciences',
    code: 'M',
    acronym: 'MS',
    includes: 'Pure and Applied Mathematics',
    courses: [
      'The Joy of Maths: From Zero to Infinity',
      'Maths and Art',
      'Enjoying Calculus',
      'Numerical Methods using Python Programming',
      'Linear Algebra using Python Programming',
      'Probability Theory'
    ]
  },
  {
    n: 3,
    name: 'Computing and Data Science',
    code: 'C',
    acronym: 'CDS',
    includes: 'Data Science, Computing and Artificial Intelligence',
    courses: [
      'Data Science and AI for All',
      'AI Unveiled: Python Powered Intelligence',
      'Computation for Society',
      'Social Media and Education',
      'Computation for Solving Real World Problems',
      'System Design for Data Driven Applications'
    ]
  },
  {
    n: 4,
    name: 'Humanities and Social Sciences',
    code: 'H',
    acronym: 'HSS',
    includes: 'Humanities, Arts and Social Sciences',
    courses: [
      'Inclusive Learning with Liberal Arts',
      'Lessons from History',
      'Poetry, Prose and Drama: An Introductory Journey',
      'Art and Aesthetics',
      'Islamic Ethics',
      'An Introductory Course in Economics',
      'Methods of Engaging with Community',
      'Kashmiri Folk Tales',
      'Ethics in the Public Domain',
      'Global Literature',
      'Micro and Macro Premises of Economics'
    ]
  },
  {
    n: 5,
    name: 'Engineering and Technology',
    code: 'T',
    acronym: 'ET',
    includes: 'Engineering and Technology',
    courses: [
      'Sketch and Build Your Prototype',
      'Exploring Neighbourhood with Space Technology',
      'Smart Materials and their Novel Applications',
      'Microcontroller Programming and Project Development',
      'Troubleshooting Your PC',
      'Web Designing',
      'CNC Programming'
    ]
  },
  {
    n: 6,
    name: 'Earth, Environment and Sustainability',
    code: 'E',
    acronym: 'EES',
    includes: 'Earth, Environment and Sustainability',
    courses: [
      'Introduction to Environmental Sustainability',
      'Introduction to Climate Change and Resilience',
      'From Walking to Flying: Navigating Sustainable Transportation Solutions',
      'Innovations in Global Urbanization and Climate Solutions',
      'Disaster Proof Future: Innovative Strategies',
      'Basics of Hydrology',
      'Drivers of Climate Change',
      "Earth's Role in a Sustainable Future",
      'Remote Sensing in Climate Science'
    ]
  },
  {
    n: 7,
    name: 'Design, Innovation and Business',
    code: 'D',
    acronym: 'DIB',
    includes: 'Design, Creativity, Innovation and Business Management',
    courses: [
      'Design Thinking',
      'Theory of Change',
      "Manager's Toolkit for Everyday Life",
      'Entrepreneurship and Innovation',
      'Principles of Product Design',
      'Critical Thinking and Logic',
      'Palette and Purpose'
    ]
  },
  {
    n: 8,
    name: 'Wellness, Health and Personal Development',
    code: 'W',
    acronym: 'WHP',
    includes: 'Wellness, Mental Health, Physical Fitness and Nutrition',
    courses: [
      'The Art of Effective Communication',
      'Fun to Know Food',
      'Life Saving Heroes',
      'Eat Smart, Live Well: Your Path to Wellness',
      'Disaster Proofing Your World',
      'Self-Improvement and Personal Effectiveness'
    ]
  }
]

/** Semester 1 (2025 slides). Total 21 credits. */
export const SEM1 = [
  { code: 'DIC101M', name: 'Joy of Mathematics: From Zero to Infinity', credits: 3 },
  { code: 'DIC101H', name: 'Inclusive Learning with Liberal Arts', credits: 3 },
  { code: 'DIC101C', name: 'Data Science and AI for All', credits: 3 },
  { code: 'DIC101D', name: 'Design Thinking', credits: 2 },
  { code: 'DIC101W', name: 'Art of Effective Communication', credits: 3 },
  { code: 'DIC101S', name: 'Science as Art of Enquiry', credits: 3 },
  { code: 'DIC101E', name: 'Sketch and Build Your Prototype', credits: 2 },
  { code: 'DIC101P', name: 'Project I', credits: 2 }
]

export interface Course {
  name: string
  basket: Basket
}

export const COURSES: Course[] = BASKETS.flatMap((basket) =>
  basket.courses.map((name) => ({ name, basket }))
)
