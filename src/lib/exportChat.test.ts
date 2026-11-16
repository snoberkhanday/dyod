import { describe, expect, it } from 'vitest'
import { chatToText } from './exportChat'

describe('chatToText', () => {
  it('writes a readable transcript without markdown symbols', () => {
    const text = chatToText('Exam', [
      { id: 1, role: 'user', text: 'How are marks given?', shown: 20, done: true, follow: [] },
      { id: 2, role: 'bot', text: 'Marks are split **50 / 50**:\n- CIA\n- End semester', shown: 0, done: true, follow: [] },
      { id: 3, role: 'bot', text: 'unfinished answer', shown: 4, done: false, follow: [] }
    ])
    expect(text).toContain('Dyod chat: Exam')
    expect(text).toContain('You:\nHow are marks given?')
    expect(text).toContain('Dyod:\nMarks are split 50 / 50:')
    expect(text).not.toContain('**')
    expect(text).not.toContain('unfinished')
  })
})
