import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

type Ctx = { supabase: any; userId: string };
async function assertAdmin(ctx: Ctx) {
  const { data, error } = await ctx.supabase.rpc('has_role', { _user_id: ctx.userId, _role: 'admin' });
  if (error || !data) throw new Error('Piekļuve liegta.');
}

export const checkAdmin = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  return { isAdmin: !!data };
});

export const listDrafts = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context);
  const { data, error } = await context.supabase.from('tasks').select('*').eq('status', 'draft').order('created_at', { ascending: false });
  if (error) throw new Error('Neizdevās ielādēt melnrakstus.');
  return data ?? [];
});

const taskShape = z.object({
  topic: z.string().min(1).max(200), type: z.enum(['mc', 'short', 'open']), question: z.string().min(1).max(5000),
  options: z.array(z.string().max(1000)).max(6), answer: z.string().max(5000), explanation: z.string().max(8000),
  steps: z.array(z.string().max(2000)).max(12), points: z.number().int().min(1).max(20), difficulty: z.number().int().min(1).max(3),
});

export const updateDraft = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(taskShape.extend({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const { error } = await context.supabase.from('tasks').update(rest).eq('id', id).eq('status', 'draft');
    if (error) throw new Error('Neizdevās saglabāt.');
    return { ok: true };
  });

export const approveDraft = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from('tasks').update({ status: 'approved' }).eq('id', data.id);
    if (error) throw new Error('Neizdevās apstiprināt.');
    return { ok: true };
  });

export const deleteDraft = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from('tasks').delete().eq('id', data.id).eq('status', 'draft');
    if (error) throw new Error('Neizdevās dzēst.');
    return { ok: true };
  });

const genSchema = {
  type: 'object', additionalProperties: false, required: ['tasks'],
  properties: { tasks: { type: 'array', items: { type: 'object', additionalProperties: false,
    required: ['question', 'options', 'answer', 'explanation', 'steps', 'points'],
    properties: { question: { type: 'string' }, options: { type: 'array', items: { type: 'string' } }, answer: { type: 'string' },
      explanation: { type: 'string' }, steps: { type: 'array', items: { type: 'string' } }, points: { type: 'integer' } } } } },
} as const;

export const generateDrafts = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ subject: z.string().min(1).max(100), grade: z.string().min(1).max(50), topic: z.string().trim().min(1).max(200),
    type: z.enum(['mc', 'short', 'open']), difficulty: z.number().int().min(1).max(3), count: z.number().int().min(5).max(20) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { generateResponse, GatewayError } = await import('@lovable.dev/ai-gateway');
    const typeDesc = { mc: '1. daļas izvēles jautājums ar tieši 4 atbilžu variantiem (options); answer ir precīzs pareizā varianta teksts; steps tukšs', short: 'īsās atbildes uzdevums; answer ir viens skaitlis vai īss vārds/frāze; options un steps tukši', open: '2. daļas atvērtais uzdevums; answer ir pilns paraugrisinājums; steps ir vērtēšanas kritēriji, katrs ar punktu skaitu (piem. "1 p. — ..."); points = soļu punktu summa; options tukšs' }[data.type];
    const prompt = `Izveido ${data.count} jaunus, oriģinālus uzdevumus latviešu valodā Latvijas centralizētā eksāmena (CE) / valsts pārbaudes darba formātā.
Priekšmets: ${data.subject}. Klase: ${data.grade}. Tēma: ${data.topic}. Grūtība: ${data.difficulty} no 3.
Tips: ${typeDesc}.
Neizmanto un nepārfrāzē reālus VISC eksāmenu uzdevumus — tikai to formātu un stilu. Katram uzdevumam pievieno skaidru skaidrojumu (explanation). Uzdevumiem jābūt faktoloģiski pareiziem un savstarpēji atšķirīgiem.`;
    let res;
    try {
      res = await generateResponse({ model: 'openai/gpt-6-astra', input: prompt, reasoning: { effort: 'low' },
        text: { format: { type: 'json_schema', name: 'tasks', strict: true, schema: genSchema } } } as any);
    } catch (e) {
      if (e instanceof GatewayError) { console.error(e.code, e.ids); throw new Error(e.httpStatus === 402 ? 'Beigušies AI kredīti.' : e.httpStatus === 429 ? 'Pārāk daudz pieprasījumu, mēģini vēlāk.' : 'AI ģenerēšana neizdevās.'); }
      throw e;
    }
    const text = ((res as any).output ?? []).flatMap((o: any) => o.content ?? []).filter((c: any) => c.type === 'output_text').map((c: any) => c.text).join('');
    let parsed: { tasks: any[] };
    try { parsed = JSON.parse(text); } catch { throw new Error('AI atbilde nebija derīga.'); }
    const stamp = Date.now().toString(36);
    const rows = parsed.tasks.slice(0, data.count).map((t, i) => ({
      id: `ai-${stamp}-${i}`, subject: data.subject, grades: [data.grade], topic: data.topic, type: data.type,
      question: String(t.question), options: data.type === 'mc' ? (t.options ?? []).slice(0, 4) : [], answer: String(t.answer),
      explanation: String(t.explanation), steps: data.type === 'open' ? (t.steps ?? []) : [], points: Math.max(1, Math.min(20, Number(t.points) || 1)),
      difficulty: data.difficulty, status: 'draft', source: 'ai',
    }));
    const { error } = await context.supabase.from('tasks').insert(rows);
    if (error) throw new Error('Neizdevās saglabāt melnrakstus.');
    return { created: rows.length };
  });
