import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { AttemptResult } from './learning';

export const getLearning = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const tasks = [];
  const attempts = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await context.supabase.from('tasks').select('*').eq('status', 'approved').order('id').range(offset, offset + 999);
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
  const leaders = await supabaseAdmin.rpc('learning_leaderboard_for_user', { p_user_id: context.userId });
  if (leaders.error) throw new Error('Neizdevās ielādēt līderu tabulu.');
  return { tasks, attempts, profile, leaders: leaders.data ?? [] };
});

export const saveAttempt = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ taskId: z.string().min(1), answer: z.string().trim().min(1).max(20000), seconds: z.number().int().min(0).max(10800), selfPoints: z.number().int().min(0).optional() }))
  .handler(async ({ data, context }) => {
    const ok = await context.supabase.from('tasks').select('id').eq('id', data.taskId).eq('status', 'approved').maybeSingle();
    if (ok.error || !ok.data) throw new Error('Uzdevums nav pieejams.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const result = await supabaseAdmin.rpc('record_attempt', { p_user_id: context.userId, p_task_id: data.taskId, p_answer: data.answer, p_time_spent_sec: data.seconds, ...(data.selfPoints === undefined ? {} : { p_self_points: data.selfPoints }) });
    if (result.error) throw new Error('Neizdevās saglabāt mēģinājumu. Iespējams, uzdevums jau atrisināts.');
    return result.data as unknown as AttemptResult;
  });
export const explainTask = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ taskId: z.string().min(1), answer: z.string().max(20000) }))
  .handler(async ({ data, context }) => {
    const { data: t } = await context.supabase.from('tasks').select('subject, topic, question, answer, explanation, steps').eq('id', data.taskId).eq('status', 'approved').maybeSingle();
    if (!t) throw new Error('Uzdevums nav pieejams.');
    const { generateResponse, GatewayError } = await import('@lovable.dev/ai-gateway');
    const prompt = `Tu esi pacietīgs pasniedzējs. Skolēns kļūdījās. Izskaidro risinājumu vienkāršāk latviešu valodā, soli pa solim, īsi (līdz 150 vārdiem), bez LaTeX. Norādi, kur, iespējams, bija kļūda.
Priekšmets: ${t.subject}. Tēma: ${t.topic}.
Uzdevums: ${t.question}
Pareizā atbilde: ${t.answer}
Esošais skaidrojums: ${t.explanation}
Skolēna atbilde: ${data.answer || '(nav)'}`;
    try {
      const res: any = await generateResponse({ model: 'openai/gpt-6-astra', input: prompt, reasoning: { effort: 'low' } } as any);
      const text = (res.output ?? []).flatMap((o: any) => o.content ?? []).filter((c: any) => c.type === 'output_text').map((c: any) => c.text).join('').trim();
      if (!text) throw new Error('AI neatbildēja.');
      return { text };
    } catch (e) {
      if (e instanceof GatewayError) { console.error(e.code, e.ids); throw new Error(e.httpStatus === 402 ? 'Beigušies AI kredīti.' : e.httpStatus === 429 ? 'Pārāk daudz pieprasījumu, mēģini vēlāk.' : 'Neizdevās iegūt skaidrojumu.'); }
      throw e;
    }
  });
