import { BASKETS, COURSES, SEM1 } from './courses'

/**
 * Everything Dyod knows. Written in simple English, short on purpose.
 *
 * Sources
 *  - IUST DIC slides "4 year BS programme through DYOD mode" (27 Apr 2024)
 *  - IUST DIC slides "Design your own degree @IUST" (29 May 2025) - newer
 *  - IUST Design Innovation Centre page, IUST DYOD activity report (2025)
 *  - Rising Kashmir report on the launch (2023)
 *
 * Answers use the newest official slides and mention the 2024 plan only where
 * it was different.
 */

export interface Entry {
  id: string
  /** Short label, also used as a follow-up chip. */
  chip: string
  /** Ways a student might ask this. Strongly matched. */
  examples: string[]
  /** Extra words that point to this topic. */
  keywords: string[]
  /** Answer text. Supports **bold**, "- " bullets, | tables | and [links](url). */
  answer: string
  /** Entry ids to offer as next questions. */
  follow?: string[]
  /** Marks replies that are not real answers (used to pick the blob mood). */
  kind?: 'answer' | 'chat' | 'gap'
}

const CONTACT = 'ditss@iust.ac.in'

const basketTable =
  '| # | Basket | Code |\n|---|---|---|\n' +
  BASKETS.map((b) => `| ${b.n} | ${b.name} | ${b.code} |`).join('\n')

const sem1Table =
  '| Code | Course | Credits |\n|---|---|---|\n' +
  SEM1.map((c) => `| ${c.code} | ${c.name} | ${c.credits} |`).join('\n') +
  '\n| | **Total** | **21** |'

const core: Entry[] = [
  {
    id: 'about',
    chip: 'What is DYOD?',
    examples: [
      'What is DYOD',
      'What is Design Your Own Degree',
      'Tell me about DYOD',
      'Explain the DYOD programme',
      'What is this degree about',
      'What is the degree called',
      'When did DYOD start',
      'DYOD'
    ],
    keywords: ['nomenclature', 'degree name', 'called', 'launched', 'launch', 'started', 'first batch', 'introduced', 'dyod', 'design your own degree', 'overview', 'introduction', 'programme', 'program', 'iust', 'bs', 'meaning', 'about'],
    answer: `**DYOD** means **Design Your Own Degree**. It is a 4-year BS programme at **IUST** (Islamic University of Science & Technology, Awantipora), run by the **Design Innovation Centre (DIC@IUST)**.

- You start by exploring many subjects in the first 3 semesters.
- Then you pick your **Major**.
- Your degree is called **"BS in your Major, through DYOD mode"**.
- Learning is mostly **project based** and done in teams.

The first batch joined in 2023.`,
    follow: ['why', 'structure', 'majors']
  },
  {
    id: 'why',
    chip: 'Why choose DYOD?',
    examples: [
      'Why DYOD',
      'Why should I choose this degree',
      'Why should I choose DYOD',
      'What are the benefits',
      'What makes DYOD special',
      'Advantages of DYOD',
      'How is it different from a normal degree'
    ],
    keywords: ['skills', 'skill', 'gain', 'outcomes', 'benefit', 'advantage', 'why', 'special', 'different', 'unique', 'reason', 'purpose', 'customization', 'flexible', 'interdisciplinary', 'normal', 'regular', 'traditional'],
    answer: `Here is why DYOD exists:

- **Your choice:** you shape your studies around your interests and career goals.
- **Mix of subjects:** arts, sciences and commerce can be blended.
- **Learning by doing:** real-world projects, internships and fieldwork.
- **Useful skills:** critical thinking, digital skills, leadership, teamwork.
- **Fresh evaluation:** not only written exams.
- **Technology:** online resources, digital tools and simulation software.
- **Flexible exits:** you can leave with a certificate, diploma or BS.

It is also very close in spirit to **NEP 2020**.`,
    follow: ['pedagogy', 'evaluation', 'early-exit']
  },
  {
    id: 'duration',
    chip: 'How long is the degree?',
    examples: [
      'How long is the course',
      'What is the duration of DYOD',
      'How many years is the degree',
      'How many semesters are there'
    ],
    keywords: ['how many semesters', 'duration', 'years', 'year', 'semesters', 'semester', 'long', 'length', 'time', 'hons', 'research', '4', 'four', 'eight', '8'],
    answer: `DYOD is a **4-year (8 semester)** BS programme. In regular mode it is a **BS (Hons / Research)**.

You can also leave earlier and still get a qualification. See "Early exit".`,
    follow: ['structure', 'early-exit']
  },
  {
    id: 'structure',
    chip: 'How is the degree structured?',
    examples: [
      'How is the degree structured',
      'What is the academic scheme',
      'Semester wise breakup',
      'What happens in each semester',
      'Explain the 8 semesters',
      'Year wise plan'
    ],
    keywords: ['structure', 'scheme', 'academic', 'breakup', 'break-up', 'plan', 'roadmap', 'semester wise', 'year wise', 'department', 'dic', 'bridge'],
    answer: `The 8 semesters have 3 stages:

| Semester | What you study | Who teaches |
|---|---|---|
| 1, 2, 3 | Courses from all domains | DIC |
| 4 | Bridge semester | Your Major's department |
| 5, 6, 7, 8 | Your Major | Your Major's department |

- **Semester 1:** one course from each basket, no choice.
- **Semester 2:** choose courses from the baskets.
- **Semester 3:** choose more freely. Then you **declare your Major**.
- **Semester 4:** a bridge to fill any gaps for your Major.

A project runs in **every** semester.`,
    follow: ['sem1', 'major-declare', 'bridge']
  },
  {
    id: 'major-declare',
    chip: 'When do I choose my Major?',
    examples: [
      'When do I choose my major',
      'When can I declare my major',
      'When is the major selected',
      'Can I change my major'
    ],
    keywords: ['declare', 'select', 'pick', 'decide', 'when', 'major', 'specialization', 'specialisation', 'change', 'switch'],
    answer: `You **declare your Major after Semester 3**.

By then you have tried courses from many baskets, so you can choose with more confidence. Semester 4 is a bridge to help you prepare for the Major.

Rules for changing a Major are not in the DYOD slides. Please ask the DIC (${CONTACT}).`,
    follow: ['majors', 'bridge', 'major-credits']
  },
  {
    id: 'bridge',
    chip: 'What is the bridge semester?',
    examples: [
      'What is the bridge semester',
      'What happens in semester 4',
      'Explain semester 4',
      'What is a bridge semester'
    ],
    keywords: ['bridge', 'semester 4', 'fourth', 'deficiency', 'deficiencies', 'cover'],
    answer: `**Semester 4** is the **bridge semester**.

- It is taught by your **Major's department**.
- It covers any gaps (deficiencies) you may have before starting your Major courses.
- Semesters 5 to 8 are then full Major semesters.`,
    follow: ['major-declare', 'structure']
  },
  {
    id: 'major-credits',
    chip: 'How many credits are needed in a Major?',
    examples: [
      'How many credits do I need in my major',
      'What is the credit rule for a major',
      'Credits for major discipline',
      'Do I need 50 percent credits in major'
    ],
    keywords: ['credits', 'credit', 'fifty', '50', 'percent', 'percentage', 'qualify', 'requirement', 'major'],
    answer: `You must earn **more than 50% of your total credits in your Major** to get a BS in that Major.`,
    follow: ['credits-sem', 'majors']
  },
  {
    id: 'majors',
    chip: 'Which majors can I pick?',
    examples: [
      'Which majors are available',
      'What majors can I choose',
      'List of majors',
      'What subjects can I specialise in',
      'Which departments offer DYOD majors',
      'How many majors are there'
    ],
    keywords: ['how many majors', 'major', 'majors', 'specialization', 'specialisation', 'subjects', 'streams', 'options', 'available', 'department', 'departments', 'list', 'english', 'islamic', 'mathematical', 'physics', 'chemistry', 'arabic', 'media', 'data science', 'artificial intelligence', 'economics', 'ai'],
    answer: `Ten Major areas are listed so far.

**Existing BS (Hons/Research) courses:**
- English: Dept. of English Language and Literature
- Islamic Studies: Dept. of Islamic Studies
- Mathematical Sciences: Dept. of Mathematical Sciences
- Physics: Dept. of Physics
- Chemistry: Dept. of Chemistry
- Arabic Language and Literature: Dept. of Arabic Language and Literature

**New BS (Hons/Research) courses:**
- Media Studies: Dept. of Journalism and Media Studies
- Data Science: Dept. of Mathematical Sciences
- Artificial Intelligence: Centre of Artificial Intelligence
- Economics: Dept. of Economics

More may be added later. *The April 2024 plan listed 7 majors (no Physics, Chemistry or Arabic).*`,
    follow: ['major-declare', 'major-credits', 'baskets']
  },
  {
    id: 'baskets',
    chip: 'What are course baskets?',
    examples: [
      'What are course baskets',
      'How many baskets are there',
      'List the baskets',
      'Explain baskets',
      'What are the themes'
    ],
    keywords: ['basket', 'baskets', 'theme', 'themes', 'group', 'groups', 'categories', 'category', 'codes', 'basket code'],
    answer: `A **basket** is a group of courses on one theme. In Semesters 1 to 3 you take courses from different baskets, so you see many fields.

${basketTable}

Ask me about any basket, for example "courses in Basket 3".

*The April 2024 plan had 5 baskets (10 themes). The 2025 plan has 8.*`,
    follow: ['sem1', 'courses', 'course-codes']
  },
  {
    id: 'courses',
    chip: 'What courses are offered?',
    examples: [
      'What courses are offered',
      'List all courses',
      'Which subjects will I study',
      'What are the DYOD courses',
      'Show me the courses'
    ],
    keywords: ['courses', 'course', 'subjects', 'subject', 'syllabus', 'curriculum', 'offered', 'list', 'electives', 'catalogue', 'catalog'],
    answer: `DYOD has **${COURSES.length} courses across 8 baskets** in the first 3 semesters.

- Basket 1: ${BASKETS[0]!.courses.length} courses (Natural Sciences)
- Basket 2: ${BASKETS[1]!.courses.length} (Mathematical Sciences)
- Basket 3: ${BASKETS[2]!.courses.length} (Computing and Data Science)
- Basket 4: ${BASKETS[3]!.courses.length} (Humanities and Social Sciences)
- Basket 5: ${BASKETS[4]!.courses.length} (Engineering and Technology)
- Basket 6: ${BASKETS[5]!.courses.length} (Earth, Environment and Sustainability)
- Basket 7: ${BASKETS[6]!.courses.length} (Design, Innovation and Business)
- Basket 8: ${BASKETS[7]!.courses.length} (Wellness, Health and Personal Development)

Type a basket number, like "Basket 7 courses", to see its list. After Semester 4, your courses come from your Major.`,
    follow: ['baskets', 'sem1', 'sample-content']
  },
  {
    id: 'sem1',
    chip: 'What do I study in Semester 1?',
    examples: [
      'What do I study in semester 1',
      'First semester courses',
      'Semester 1 subjects',
      'What are the first year subjects',
      'Semester 1 credits'
    ],
    keywords: ['semester 1', 'semester i', 'first semester', 'sem 1', 'first year', 'foundation', 'foundational', 'freshers', 'dic101'],
    answer: `**Semester 1** is the foundation semester. Everyone takes the same courses, with **no choice**. Total: **21 credits**.

${sem1Table}

*The April 2024 plan was a little different: Project I was 4 credits, there was a 2-credit Study Tour, and there was no "Science as Art of Enquiry" or "Sketch and Build" course.*`,
    follow: ['sem2', 'projects', 'course-codes']
  },
  {
    id: 'sem2',
    chip: 'What about Semester 2?',
    examples: [
      'What do I study in semester 2',
      'Second semester courses',
      'Semester 2 subjects',
      'Semester 2 credits'
    ],
    keywords: ['semester 2', 'semester ii', 'second semester', 'sem 2', 'dic102', 'dic103'],
    answer: `In **Semester 2** you start to **choose**.

- 3 fixed courses: *Physics as Fun: Unveiling the Magic I*, *Enjoying Calculus*, *Global Literature* (3 credits each).
- 3 courses chosen from the baskets C, T, E, D and W (8 or 9 credits).
- **Project II** (2 credits).
- Total: **19 or 20 credits**.

You get one course offered per basket, and six baskets are covered overall.

*In the April 2024 plan, Semester 2 was 21 credits with one course from each of 5 baskets, plus Project II and a Seminar.*`,
    follow: ['sem3', 'sem1', 'projects']
  },
  {
    id: 'sem3',
    chip: 'What about Semester 3?',
    examples: [
      'What do I study in semester 3',
      'Third semester courses',
      'Semester 3 subjects',
      'Semester 3 credits'
    ],
    keywords: ['semester 3', 'semester iii', 'third semester', 'sem 3', 'second year'],
    answer: `**Semester 3** gives you the most freedom.

- Take **six courses**, covering **at least 3 baskets**.
- At most **2 courses per basket**.
- Plus **Project III** (3 credits).
- Total: **20 or 21 credits**.

This is the first step towards your Major. You **declare your Major after this semester**.`,
    follow: ['major-declare', 'bridge']
  },
  {
    id: 'credits-sem',
    chip: 'How many credits per semester?',
    examples: [
      'How many credits per semester',
      'Credits in each semester',
      'Total credits',
      'What is the credit load'
    ],
    keywords: ['credits', 'credit', 'load', 'per semester', 'credits each semester'],
    answer: `Credits per semester (2025 plan):

| Semester | Credits |
|---|---|
| 1 | 21 |
| 2 | 19 or 20 |
| 3 | 20 or 21 |

The slides do not give a fixed total for all 8 semesters. One rule is clear: **more than 50%** of total credits must be in your Major.

*In the 2024 plan, Semesters 1 and 2 were both 21 credits.*`,
    follow: ['major-credits', 'structure']
  },
  {
    id: 'projects',
    chip: 'How do projects work?',
    examples: [
      'How do projects work',
      'Is there a project in every semester',
      'Tell me about the semester project',
      'What is Project I'
    ],
    keywords: ['project', 'projects', 'semester project', 'capstone', 'mentor', 'mentoring', 'collaborative', 'team'],
    answer: `Projects are at the heart of DYOD.

- There is a **semester-long project in every semester** (Project I, II, III and so on).
- A **mentoring faculty member** works with you.
- In the **last four semesters**, your project matches your **Major**.
- Main teaching style: **collaborative, project-based problem solving**.`,
    follow: ['pedagogy', 'evaluation']
  },
  {
    id: 'pedagogy',
    chip: 'How will I be taught?',
    examples: [
      'How will I be taught',
      'What is the teaching method',
      'What is project based learning',
      'Teaching style in DYOD',
      'Will there be lectures'
    ],
    keywords: ['teaching', 'pedagogy', 'method', 'learning', 'taught', 'active', 'peer', 'facilitator', 'experiential', 'lectures', 'teachers', 'style'],
    answer: `DYOD uses **active, project-based learning**.

- You solve **real-world problems** to learn skills.
- Teachers act more like **mentors and facilitators** than only lecturers.
- You work in **teams** and learn from your peers.
- There is a strong focus on **internships, fieldwork** and a social-impact angle.
- Technology is used for learning: online resources, digital collaboration tools and simulations.`,
    follow: ['projects', 'evaluation']
  },
  {
    id: 'evaluation',
    chip: 'How are students evaluated?',
    examples: [
      'How are students evaluated',
      'What is the exam pattern',
      'How are marks given',
      'How will I be assessed',
      'Are there exams',
      'What is CIA',
      'What is the evaluation scheme'
    ],
    keywords: ['evaluation', 'exam', 'exams', 'examination', 'marks', 'assessment', 'assessed', 'grading', 'grades', 'cia', 'test', 'open book', 'continuous', 'internal', 'end semester', 'pattern', 'evaluated', 'judged'],
    answer: `Marks are split **50 / 50**:

- **50% Continuous Internal Assessment (CIA):** assignments through the semester, like literature reviews, group discussions and presentations.
- **50% End-semester evaluation:** can be open-book exams, 24 or 48-hour problem solving, group projects, or a syllabus-based Q&A exam.

The idea is to test understanding and skills, not only memory.`,
    follow: ['projects', 'pedagogy']
  },
  {
    id: 'early-exit',
    chip: 'Can I leave early?',
    examples: [
      'Can I leave early',
      'What are the exit options',
      'What if I quit after 2 years',
      'Do I get a diploma or certificate',
      'Early exit options'
    ],
    keywords: ['exit', 'leave', 'quit', 'drop', 'dropout', 'early', 'diploma', 'certificate', 'stop', 'nep', 'multiple exit', 'three year', '3 year', 'two year', '2 year', 'one year'],
    answer: `Yes. DYOD has **early exit options** (as in NEP 2020):

| You study for | You get |
|---|---|
| 1 year (2 semesters) | **Certificate** (Certificate in Critical Thinking) |
| 2 years (4 semesters) | **Diploma** in your Major |
| 3 years (6 semesters) | **BS** in your Major † |
| 4 years (8 semesters) | **BS (Hons / Research)** |

† For the 3-year BS, you need at least **50% of credits in your Major**.`,
    follow: ['major-credits', 'duration']
  },
  {
    id: 'admission',
    chip: 'How do I get admission?',
    examples: [
      'How do I get admission',
      'How can I apply',
      'What is the eligibility',
      'Is CUET required',
      'Who can join DYOD',
      'Admission process'
    ],
    keywords: ['admission', 'admissions', 'apply', 'application', 'eligibility', 'eligible', 'cuet', 'join', 'enroll', 'enrol', 'entrance', 'criteria', 'requirement', 'requirements', 'qualification', '12th', '10+2', 'marks', 'percentage', 'portal', 'register', 'registration', 'enrolment', 'admitted'],
    answer: `- **Entry route:** students are admitted to BS (DYOD) through **CUET**.
- **Eligibility:** at the 2023 launch, IUST asked for at least **50% marks in 10+2 in any stream**. Check the latest notice, as rules can change.
- **Apply here:** [admission.iust.ac.in](https://admission.iust.ac.in/)

Seats, fees and dates are not in the DYOD slides.`,
    follow: ['fees', 'about']
  },
  {
    id: 'fees',
    chip: 'What about fees and seats?',
    examples: [
      'What is the fee',
      'How much does it cost',
      'How many seats are there',
      'Is there a scholarship',
      'What are the dates and deadlines'
    ],
    keywords: ['pay', 'payment', 'free', 'fee', 'fees', 'cost', 'price', 'tuition', 'seats', 'seat', 'intake', 'scholarship', 'deadline', 'date', 'dates', 'placement', 'placements', 'salary', 'job', 'jobs', 'career', 'careers', 'money', 'expensive', 'last date', 'schedule'],
    kind: 'gap',
    answer: `I do not have that in the DYOD documents, so I will not guess.

Please check:
- [admission.iust.ac.in](https://admission.iust.ac.in/) for admissions, dates and fees
- [iust.ac.in](https://www.iust.ac.in/) for official notices
- DIC office: **${CONTACT}**, +91-01933-247954 / 247955`,
    follow: ['admission', 'dic-contact']
  },
  {
    id: 'not-covered',
    chip: 'Recognition and campus life',
    kind: 'gap',
    examples: [
      'Is the degree recognised by UGC',
      'Is there a hostel',
      'What is the medium of instruction',
      'Is attendance compulsory'
    ],
    keywords: ['recognised', 'recognized', 'recognition', 'approved', 'accreditation', 'accredited', 'naac', 'valid', 'equivalent', 'hostel', 'transport', 'bus', 'mess', 'medium', 'language of instruction', 'attendance', 'timetable'],
    answer: `The DYOD documents I have do not cover that, so I will not guess.

Please ask the DIC (${CONTACT}) or check [iust.ac.in](https://www.iust.ac.in/).`,
    follow: ['dic-contact', 'admission']
  },
  {
    id: 'course-codes',
    chip: 'How do course codes work?',
    examples: [
      'What do course codes mean',
      'How are course codes made',
      'What is DIC101M',
      'What are basket codes'
    ],
    keywords: ['code', 'codes', 'course code', 'dic101', 'basket code', 'letters', 'naming'],
    answer: `Course codes follow a simple pattern, for example **DIC101M**:

- **DIC**: the department (Design Innovation Centre)
- **1**: first year, then a subject number
- **Last letter**: the basket code

Basket codes: **S** Natural Sciences, **M** Mathematical Sciences, **C** Computing and Data Science, **H** Humanities and Social Sciences, **T** Engineering and Technology, **E** Earth and Environment, **D** Design, Innovation and Business, **W** Wellness.`,
    follow: ['baskets', 'sem1']
  },
  {
    id: 'sample-content',
    chip: 'What is taught in Design Thinking?',
    examples: [
      'What is taught in Design Thinking',
      'Design Thinking syllabus',
      'Sample course content',
      'What is in Inclusive Learning with Liberal Arts'
    ],
    keywords: ['content', 'modules', 'module', 'syllabus', 'design thinking', 'liberal arts', 'sample', 'weeks', 'week', 'topics', 'outcomes', 'objectives'],
    answer: `**Design Thinking** (4 modules):
- **Mindsets:** creative confidence, growth mindset, empathy, learning from failure
- **Methods:** frame a design challenge, interviews, build a team
- **Ideation:** brainstorm, storyboard, rapid prototyping, feedback
- **Implementation:** live prototyping, roadmap, pitch, evaluate

**Inclusive Learning with Liberal Arts** (13 weeks, 4 modules): intro to liberal arts, humanities, social sciences (economics, politics, sociology, anthropology) and philosophy (ethics, metaphysics, epistemology).`,
    follow: ['courses', 'sem1']
  },
  {
    id: 'dic',
    chip: 'What is the Design Innovation Centre?',
    examples: [
      'What is DIC',
      'What is the Design Innovation Centre',
      'Who runs DYOD',
      'Who coordinates the programme',
      'Tell me about DIC at IUST'
    ],
    keywords: ['dic', 'design innovation centre', 'centre', 'center', 'coordinator', 'runs', 'committee', 'board of studies', 'bos', 'nidi', 'lab', 'innovation lab', 'coordinates'],
    answer: `The **Design Innovation Centre (DIC@IUST)** coordinates the DYOD programme and teaches Semesters 1 to 3.

- Started in **2015** with Delhi University, Jamia Millia Islamia and the School of Planning & Architecture, under the national NIDI scheme.
- Has an **innovation lab** with CAD, 3D printing and scanning, electronics and laser cutting.
- Coordinator: **Dr. Shahkar Ahmad Nahvi**.
- DYOD is guided by a **Programme Implementation Committee** (chaired by the Dean Academic Affairs) and a **Board of Studies** with experts from Delhi University and IISER Pune.`,
    follow: ['dic-contact', 'about']
  },
  {
    id: 'dic-contact',
    chip: 'How do I contact DIC?',
    examples: [
      'How do I contact DIC',
      'What is the DIC email',
      'Phone number',
      'Where is IUST located',
      'Address of IUST'
    ],
    keywords: ['contact', 'email', 'mail', 'phone', 'number', 'call', 'address', 'location', 'located', 'where', 'reach', 'office'],
    answer: `**DIC@IUST**
- Email: ${CONTACT}
- Phone: +91-01933-247954 / 247955
- Address: 1 University Avenue, Awantipora, Pulwama, 192122, Jammu & Kashmir`,
    follow: ['dic', 'admission']
  },
  {
    id: 'iust',
    chip: 'Why IUST for DYOD?',
    examples: [
      'Why IUST',
      'What is the IUST advantage',
      'Is IUST good for this programme',
      'What facilities does IUST have'
    ],
    keywords: ['iust', 'university', 'advantage', 'strength', 'facilities', 'infrastructure', 'kalam', 'ciec', 'cied', 'skilling', 'ecosystem'],
    answer: `IUST lists these strengths for DYOD:

- Already runs B.Tech, FYUGP and integrated Masters programmes.
- Good labs and resources in technology, engineering and science.
- Teachers across science, engineering and humanities.
- A well-known **innovation and entrepreneurship** ecosystem (CIED, DIC).
- A growing focus on skills through the **Kalam Academy of Skilling**.`,
    follow: ['dic', 'about']
  },
  {
    id: 'activities',
    chip: 'What activities do DYOD students do?',
    examples: [
      'What activities do students do',
      'Is there a study tour',
      'Tell me about the study tour',
      'Are there trips or events',
      'Student life in DYOD'
    ],
    keywords: ['activities', 'activity', 'tour', 'study tour', 'trip', 'events', 'event', 'film', 'travelogue', 'fest', 'life', 'fieldwork', 'visit', 'internship', 'internships'],
    answer: `DYOD students learn outside the classroom too.

- **Study tour:** a January 2025 tour to historic sites and local art and craft workshops.
- **Travelogue film:** students made a film about the tour (Feb 2025).
- **Campus events:** a film screening, a food-fest stall and an Open Day (2025).
- DYOD puts extra weight on **internships, projects and fieldwork**.`,
    follow: ['pedagogy', 'projects']
  },
  {
    id: 'nep',
    chip: 'How is DYOD linked to NEP 2020?',
    examples: [
      'How is DYOD related to NEP 2020',
      'Is DYOD part of NEP',
      'What is NEP',
      'Does DYOD follow the national education policy'
    ],
    keywords: ['nep', 'nep2020', 'national education policy', 'policy', 'ugc', 'fyugp'],
    answer: `The slides say there are **many similarities between NEP 2020 and DYOD**. Two examples:

- Flexible, multidisciplinary study across arts, sciences and commerce.
- **Early exit options** (certificate, diploma, BS). The exit rules of NEP 2020 will be followed.

The "BS in a Major" name was proposed on advice of a UGC expert committee on degree names.`,
    follow: ['early-exit', 'why']
  }
]

/** Replies for small talk. They are not DYOD facts. */
const chat: Entry[] = [
  {
    id: 'hello',
    chip: 'Hello',
    kind: 'chat',
    examples: ['Hi', 'Hello', 'Hey', 'Good morning', 'Good evening', 'Salam', 'Assalamu alaikum', 'Hello there'],
    keywords: ['hi', 'hello', 'hey', 'greetings', 'salam', 'namaste'],
    answer: `Hi! I am **Dyod**. I answer questions about the **Design Your Own Degree** programme at IUST.

Try one of these, or ask your own.`,
    follow: ['about', 'structure', 'majors']
  },
  {
    id: 'thanks',
    chip: 'Thanks',
    kind: 'chat',
    examples: ['Thanks', 'Thank you', 'Thanks a lot', 'Great thanks', 'Okay thanks', 'Got it', 'Cool'],
    keywords: ['thanks', 'thank', 'thankyou', 'thx', 'appreciate', 'great', 'perfect', 'awesome', 'nice', 'ok', 'okay', 'cool'],
    answer: `You are welcome! Ask me anything else about DYOD.`,
    follow: ['evaluation', 'early-exit', 'admission']
  },
  {
    id: 'bye',
    chip: 'Bye',
    kind: 'chat',
    examples: ['Bye', 'Goodbye', 'See you', 'Good night'],
    keywords: ['bye', 'goodbye', 'later', 'night'],
    answer: `Goodbye! Come back any time you have a question about DYOD.`
  },
  {
    id: 'who',
    chip: 'What can you do?',
    kind: 'chat',
    examples: ['Who are you', 'What can you do', 'What are you', 'Help', 'What can I ask you', 'How do you work'],
    keywords: ['who', 'you', 'help', 'bot', 'assistant', 'chatbot', 'ask', 'can', 'do', 'name'],
    answer: `I am **Dyod**, a small chatbot for the **Design Your Own Degree** programme at IUST.

I can explain:
- what DYOD is and how the 4 years work
- majors, baskets and courses
- credits, projects and evaluation
- early exit options and admission basics

I only use IUST's DYOD documents. If I do not know something, I will say so.`,
    follow: ['about', 'majors', 'evaluation']
  }
]

/* ---------- Generated entries: baskets, courses, majors ---------- */

const ordinal = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']

const basketEntries: Entry[] = BASKETS.map((b) => ({
  id: `basket-${b.n}`,
  chip: `Courses in Basket ${b.n}`,
  examples: [
    `Courses in Basket ${b.n}`,
    `What is in Basket ${b.n}`,
    `Basket ${ordinal[b.n]} courses`,
    `${b.name} courses`,
    `Show basket ${b.n}`
  ],
  keywords: [`${b.name.split(/[ ,]/)[0]!.toLowerCase()} basket`, `basket ${b.n}`, `basket ${ordinal[b.n]}`, b.name.toLowerCase(), b.acronym.toLowerCase(), `code ${b.code.toLowerCase()}`, `basket ${b.code.toLowerCase()}`],
  answer: `**Basket ${b.n}: ${b.name}** (code **${b.code}**). Covers ${b.includes.toLowerCase()}.

${b.courses.map((c) => `- ${c}`).join('\n')}`,
  follow: ['baskets', 'courses']
}))

const courseEntries: Entry[] = COURSES.map((c, i) => {
  const sem1 = SEM1.find((s) => s.name.toLowerCase() === c.name.toLowerCase())
  const extra = sem1
    ? ` It is a **Semester 1** course (${sem1.code}, ${sem1.credits} credits).`
    : ''
  return {
    id: `course-${i}`,
    chip: c.name,
    examples: [c.name, `Tell me about ${c.name}`],
    keywords: [c.name.toLowerCase()],
    answer: `**${c.name}** is in **Basket ${c.basket.n}: ${c.basket.name}** (code ${c.basket.code}).${extra}`,
    follow: [`basket-${c.basket.n}`, 'baskets']
  }
})

interface MajorInfo {
  name: string
  dept: string
  isNew: boolean
  aka: string[]
}

const MAJORS: MajorInfo[] = [
  { name: 'English', dept: 'Department of English Language and Literature', isNew: false, aka: ['english literature'] },
  { name: 'Islamic Studies', dept: 'Department of Islamic Studies', isNew: false, aka: ['islamic'] },
  { name: 'Mathematical Sciences', dept: 'Department of Mathematical Sciences', isNew: false, aka: ['maths major', 'mathematics major', 'math major'] },
  { name: 'Physics', dept: 'Department of Physics', isNew: false, aka: ['physics major'] },
  { name: 'Chemistry', dept: 'Department of Chemistry', isNew: false, aka: ['chemistry major'] },
  { name: 'Arabic Language and Literature', dept: 'Department of Arabic Language and Literature', isNew: false, aka: ['arabic'] },
  { name: 'Media Studies', dept: 'Department of Journalism and Media Studies', isNew: true, aka: ['journalism', 'media', 'mass communication'] },
  { name: 'Data Science', dept: 'Department of Mathematical Sciences', isNew: true, aka: ['data science major'] },
  { name: 'Artificial Intelligence', dept: 'Centre of Artificial Intelligence', isNew: true, aka: ['ai major', 'ai', 'machine learning'] },
  { name: 'Economics', dept: 'Department of Economics', isNew: true, aka: ['economics major', 'eco'] }
]

const majorEntries: Entry[] = MAJORS.map((m, i) => ({
  id: `major-${i}`,
  chip: `Major in ${m.name}`,
  examples: [`Can I major in ${m.name}`, `Is ${m.name} a major`, `${m.name} major in DYOD`, `Which department teaches ${m.name}`],
  keywords: [`major ${m.name.toLowerCase()}`, `${m.name.toLowerCase()} major`, ...m.aka],
  answer: `Yes, **${m.name}** is one of the DYOD Majors.

- Department: **${m.dept}**
- Type: ${m.isNew ? 'a **new** BS (Hons/Research) course' : 'joins an **existing** BS (Hons/Research) course'}
- You declare it **after Semester 3**.${
    ['Physics', 'Chemistry', 'Arabic Language and Literature'].includes(m.name)
      ? '\n\n*It was not in the April 2024 list, but is in the 2025 list.*'
      : ''
  }`,
  follow: ['majors', 'major-declare']
}))

export const ENTRIES: Entry[] = [
  ...core,
  ...chat,
  ...basketEntries,
  ...majorEntries,
  ...courseEntries
]

export const ENTRY_BY_ID = new Map(ENTRIES.map((e) => [e.id, e]))

/** Shown on the empty screen. */
export const STARTERS = ['about', 'structure', 'majors', 'baskets', 'evaluation', 'early-exit']

export const OUT_OF_SCOPE = {
  answer: `I can only help with the **Design Your Own Degree (DYOD)** programme at IUST, and I could not find an answer to that.

Try asking about:
- how the 4 years are planned
- majors and course baskets
- credits, projects and evaluation
- early exit and admission

Or write to the DIC: ${CONTACT}`,
  follow: ['about', 'structure', 'majors', 'evaluation']
}
