import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { AttemptResult } from './learning';

export const getLearning = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const tasks = [];
  const attempts = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await context.supabase.from('tasks').select('*').order('id').range(offset, offset + 999);
    if (error) throw new Error('Neizdevās ielādēt uzdevumus.');
    tasks.push(...(data ?? [])); if (!data || data.length < 1000) break;
  }
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await context.supabase.from('attempts').select('*').eq('user_id', context.userId).order('created_at').order('id').range(offset, offset + 999);
    if (error) throw new Error('Neizdevās ielādēt mēģinājumus.');
    attempts.push(...(data ?? [])); if (!data || data.length < 1000) break;
  }
  const { data: profile, error } = await context.supabase.from('profiles').select('*').eq('id', context.userId).single();
  if (error) throw new Error('Neizdevās ielādēt profilu.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const leaders = await supabaseAdmin.rpc('learning_leaderboard');
  if (leaders.error) throw new Error('Neizdevās ielādēt līderu tabulu.');
  return { tasks, attempts, profile, leaders: leaders.data ?? [] };
});

export const saveAttempt = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ taskId: z.string().min(1), answer: z.string().trim().min(1).max(20000), seconds: z.number().int().min(0).max(10800), selfPoints: z.number().int().min(0).optional() }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const result = await supabaseAdmin.rpc('record_attempt', { p_user_id: context.userId, p_task_id: data.taskId, p_answer: data.answer, p_time_spent_sec: data.seconds, ...(data.selfPoints === undefined ? {} : { p_self_points: data.selfPoints }) });
    if (result.error) throw new Error('Neizdevās saglabāt mēģinājumu. Iespējams, uzdevums jau atrisināts.');
    return result.data as unknown as AttemptResult;
  });