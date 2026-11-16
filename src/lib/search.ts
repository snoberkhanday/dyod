import { BASKETS } from './courses'
import { ENTRIES, ENTRY_BY_ID, OUT_OF_SCOPE, type Entry } from './knowledge'

/**
 * A tiny retrieval engine. No network, no model: it scores the question against
 * every knowledge entry (BM25-style) and answers with the best one, or says it
 * does not know. This keeps answers exact (nothing is invented) and instant.
 */

const STOP = new Set(
  'a an the of in to for is are was were be been am it its this that these those on at by with and or as from into any some get give show tell me my i please about there their them our us if so than then just also very really need needs needed required necessary want'.split(
    ' '
  )
)

/** Question words matter little on their own: nearly every question has one. */
const WEAK = new Set(
  'what how who can do does did when which where why you your will would should could have has'.split(' ')
)

/** Words that mean the same thing for our purposes. */
const SYNONYMS: Record<string, string> = {
  program: 'programme',
  programs: 'programme',
  programmes: 'programme',
  course: 'course',
  classes: 'course',
  class: 'course',
  module: 'course',
  specialisation: 'major',
  specialization: 'major',
  specialise: 'major',
  specialize: 'major',
  speciality: 'major',
  stream: 'major',
  quit: 'exit',
  leave: 'exit',
  leaving: 'exit',
  dropout: 'exit',
  drop: 'exit',
  stop: 'exit',
  exams: 'exam',
  examination: 'exam',
  assess: 'evaluation',
  assessed: 'evaluation',
  assessment: 'evaluation',
  evaluate: 'evaluation',
  evaluated: 'evaluation',
  grading: 'evaluation',
  marking: 'evaluation',
  judged: 'evaluation',
  graded: 'evaluation',
  apply: 'admission',
  applying: 'admission',
  application: 'admission',
  admit: 'admission',
  admitted: 'admission',
  admissions: 'admission',
  enroll: 'admission',
  enrol: 'admission',
  enrolment: 'admission',
  enrollment: 'admission',
  join: 'admission',
  eligible: 'eligibility',
  criteria: 'eligibility',
  requirement: 'eligibility',
  requirements: 'eligibility',
  fees: 'fee',
  cost: 'fee',
  costs: 'fee',
  price: 'fee',
  tuition: 'fee',
  expensive: 'fee',
  charges: 'fee',
  semesters: 'semester',
  sem: 'semester',
  sems: 'semester',
  years: 'year',
  credits: 'credit',
  baskets: 'basket',
  majors: 'major',
  projects: 'project',
  teach: 'taught',
  teaching: 'taught',
  teacher: 'taught',
  teachers: 'taught',
  lecturer: 'taught',
  professors: 'taught',
  faculty: 'taught',
  jobs: 'job',
  careers: 'career',
  placements: 'placement',
  seats: 'seat',
  subjects: 'subject',
  topics: 'subject',
  syllabus: 'subject',
  curriculum: 'subject',
  hi: 'hello',
  hey: 'hello',
  hii: 'hello',
  salam: 'hello',
  namaste: 'hello',
  thanks: 'thank',
  thx: 'thank',
  thankyou: 'thank',
  centre: 'center',
  e: 'email',
  mail: 'email',
  telephone: 'phone',
  mobile: 'phone'
}

const NUMBER_WORDS: Record<string, string> = {
  one: '1',
  first: '1',
  i: '1',
  two: '2',
  second: '2',
  ii: '2',
  three: '3',
  third: '3',
  iii: '3',
  four: '4',
  fourth: '4',
  iv: '4',
  five: '5',
  fifth: '5',
  six: '6',
  sixth: '6',
  seven: '7',
  seventh: '7',
  eight: '8',
  eighth: '8'
}

function stem(w: string): string {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y'
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3)
  if (w.length > 4 && w.endsWith('es') && /(s|x|ch|sh)es$/.test(w)) return w.slice(0, -2)
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us')) return w.slice(0, -1)
  return w
}

/** Lowercase, plain words, "semester three" -> "semester3", "basket 2" -> "basket2". */
export function normalize(text: string): string {
  let t = text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/10\s*\+\s*2/g, ' tenplustwo ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  t = t.replace(
    /\b(semester|sem|basket|year)\s*(\d|one|two|three|four|five|six|seven|eight|first|second|third|fourth|fifth|sixth|seventh|eighth|iv|iii|ii|i)\b/g,
    (_m, k: string, n: string) => `${k === 'sem' ? 'semester' : k}${NUMBER_WORDS[n] ?? n}`
  )
  t = t.replace(
    /\b(first|second|third|fourth)\s+(semester|basket|year)\b/g,
    (_m, n: string, k: string) => `${k}${NUMBER_WORDS[n]}`
  )
  return t
}

function stemWord(w: string): string {
  return stem(SYNONYMS[w] ?? w)
}

/** Normalised text with every word reduced to its root; used for phrase matching. */
function rooted(text: string): string {
  return normalize(text).split(' ').filter(Boolean).map((w) => SYNONYMS[stemWord(w)] ?? stemWord(w)).join(' ')
}

export function tokens(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter(Boolean)
    .filter((w) => !STOP.has(w))
    .map((w) => stem(SYNONYMS[w] ?? w))
    .map((w) => SYNONYMS[w] ?? w)
}

interface Doc {
  entry: Entry
  /** weighted term frequency */
  tf: Map<string, number>
  /** normalised phrases that count as a strong hit when found in the question */
  phrases: string[]
  /** normalised full questions, for exact-match shortcuts */
  exact: Set<string>
}

const docs: Doc[] = []
const df = new Map<string, number>()

function add(tf: Map<string, number>, words: string[], weight: number) {
  for (const w of words) tf.set(w, (tf.get(w) ?? 0) + weight)
}

for (const entry of ENTRIES) {
  const tf = new Map<string, number>()
  const phrases: string[] = []
  const exact = new Set<string>()
  for (const ex of entry.examples) {
    add(tf, tokens(ex), 1.6)
    exact.add(normalize(ex))
    phrases.push(rooted(ex))
  }
  for (const kw of entry.keywords) {
    const ws = tokens(kw)
    add(tf, ws, 2)
    const n = rooted(kw)
    if (n.includes(' ') || n.length > 5) phrases.push(n)
  }
  add(tf, tokens(entry.chip), 1.6)
  // Generated entries (courses, baskets, majors) share wording; keep them out of the idf noise.
  if (!/^(course|basket|major)-/.test(entry.id)) add(tf, tokens(entry.answer).slice(0, 80), 0.2)
  for (const w of tf.keys()) df.set(w, (df.get(w) ?? 0) + 1)
  docs.push({ entry, tf, phrases, exact })
}

const N = docs.length
const vocab = [...df.keys()]

/** Edit distance, stopping early once it is certain to exceed `max`. */
function within(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let low = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
      low = Math.min(low, cur[j]!)
    }
    if (low > max) return max + 1
    prev = cur
  }
  return prev[b.length]!
}

/** "evalution" -> "evaluation". Only touches words we have never seen. */
function fixTypos(words: string[]): string[] {
  return words.map((w) => {
    if (w.length < 4 || df.has(w) || /\d/.test(w)) return w
    const max = w.length >= 8 ? 2 : 1
    let best = w
    let bestD = max + 1
    for (const v of vocab) {
      const d = within(w, v, max)
      if (d < bestD || (d === bestD && (df.get(v) ?? 0) > (df.get(best) ?? 0))) {
        best = v
        bestD = d
      }
    }
    return bestD <= max ? best : w
  })
}
const idf = (w: string) => Math.log(1 + (N - (df.get(w) ?? 0) + 0.5) / ((df.get(w) ?? 0) + 0.5))

export interface Match {
  entry: Entry | null
  score: number
  /** Standard "I don't know" reply when entry is null. */
  fallback?: typeof OUT_OF_SCOPE
}

const MIN_SCORE = 2.6
const GENERIC = new Set(['dyod', 'degree', 'programme', 'iust', 'own', 'bs', 'design'])

/** Questions that name something exact are answered by rule, before scoring. */
function byRule(raw: string, norm: string): Entry | null {
  const basket = norm.match(/\bbasket([1-8])\b/)
  if (basket && !/\bhow many\b/.test(norm)) return ENTRY_BY_ID.get(`basket-${basket[1]}`) ?? null

  if (/\bafter semester3\b/.test(norm)) return ENTRY_BY_ID.get('major-declare') ?? null

  // "design basket", "computing basket": a basket named by its first word
  const root = ` ${rooted(norm)} `
  for (const b of BASKETS) {
    if (root.includes(` ${rooted(b.name.split(/[ ,]/)[0]!)} basket `)) return ENTRY_BY_ID.get(`basket-${b.n}`) ?? null
  }

  const sem = norm.match(/\bsemester([1-8])\b/)
  if (sem && !/\bhow many semester/.test(norm)) {
    const n = Number(sem[1])
    if (n === 1) return ENTRY_BY_ID.get('sem1') ?? null
    if (n === 2) return ENTRY_BY_ID.get('sem2') ?? null
    if (n === 3) return ENTRY_BY_ID.get('sem3') ?? null
    if (n === 4) return ENTRY_BY_ID.get('bridge') ?? null
    return ENTRY_BY_ID.get('structure') ?? null
  }

  // A full course name in the question: longest name wins.
  let best: Entry | null = null
  let bestLen = 0
  if (/\b(syllabus|content|module|week|outcome|objective|taught|topic)/.test(norm)) return null
  for (const d of docs) {
    if (!d.entry.id.startsWith('course-')) continue
    const name = normalize(d.entry.examples[0]!)
    if (name.length > bestLen && ` ${norm} `.includes(` ${name} `)) {
      best = d.entry
      bestLen = name.length
    }
  }
  void raw
  return best
}

export function ask(question: string): Match {
  const norm = normalize(question)
  if (!norm) return { entry: null, score: 0, fallback: OUT_OF_SCOPE }

  const ruled = byRule(question, norm)
  if (ruled) return { entry: ruled, score: 99 }

  for (const d of docs) if (d.exact.has(norm)) return { entry: d.entry, score: 50 }

  const q = [...new Set(fixTypos(tokens(question)))]
  const strong = q.filter((w) => !WEAK.has(w))
  // Only generic words ("dyod", "degree", "iust"): the best answer is the overview.
  const known = strong.filter((w) => df.has(w))
  if (known.length > 0 && known.every((w) => GENERIC.has(w))) return { entry: ENTRY_BY_ID.get('about')!, score: 10 }
  if (strong.length === 0) return { entry: null, score: 0, fallback: OUT_OF_SCOPE }

  const padded = ` ${rooted(question)} `
  let top: { d: Doc; score: number } | null = null

  for (const d of docs) {
    let score = 0
    let hits = 0
    for (const w of q) {
      const f = d.tf.get(w)
      if (!f) continue
      const weak = WEAK.has(w) ? 0.15 : 1
      score += idf(w) * (f / (f + 1.2)) * weak
      if (weak === 1) hits++
    }
    if (hits === 0) continue
    // A phrase of the entry that appears word-for-word is the strongest signal.
    for (const p of d.phrases) {
      if (p.length > 4 && padded.includes(` ${p} `)) score += 1.2 + p.split(' ').length * 0.9
    }
    // Reward covering most of what was asked.
    score *= 0.55 + 0.45 * (hits / strong.length)
    if (!top || score > top.score) top = { d, score }
  }

  if (!top || top.score < MIN_SCORE) return { entry: null, score: top?.score ?? 0, fallback: OUT_OF_SCOPE }
  return { entry: top.d.entry, score: top.score }
}
