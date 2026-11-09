import { describe, expect, it } from 'vitest';
import { leaderboardVisible, remainingTasks, summarize, type Attempt, type LearningTask } from '@/lib/learning';

const tasks: LearningTask[] = [{ id: 'm1', subject: 'Matemātika', grades: ['12. klase'], topic: 'Trigonometrija', type: 'short', question: '', options: [], answer: '1', explanation: '', steps: [], points: 2, difficulty: 2 }];
const attempt: Attempt = { task_id: 'm1', correct: true, points_earned: 2, time_spent_sec: 120, created_at: '2026-11-09T12:00:00Z' };
describe('Real learning data', () => {
  it('excludes correctly solved tasks', () => expect(remainingTasks(tasks, [attempt])).toHaveLength(0));
  it('keeps incorrectly solved tasks', () => expect(remainingTasks(tasks, [{ ...attempt, correct: false, points_earned: 0 }])).toHaveLength(1));
  it('shows no leaderboard below five real users', () => expect(leaderboardVisible(4)).toBe(false));
  it('shows leaderboard at five real users', () => expect(leaderboardVisible(5)).toBe(true));
  it('returns empty data without attempts', () => { const s = summarize([], tasks); expect(s.count).toBe(0); expect(s.projected).toEqual([]); expect(s.weakSpots).toEqual([]); });
  it('calculates subject and topic precision and time from attempts', () => {
    const s = summarize([attempt, { ...attempt, correct: false, points_earned: 0 }], tasks, new Date('2026-11-09T14:00:00Z'));
    expect(s.average).toBe(50); expect(s.projected[0]?.score).toBe(50); expect(s.weakSpots[0]?.value).toBe(50); expect(s.totalMin).toBe(4); expect(s.solved).toBe(1); expect(s.weekly.at(-1)?.score).toBe(50);
  });
});