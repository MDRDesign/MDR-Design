import { useState, type FormEvent } from 'react';
import { useSearch } from 'wouter';
import { useCreateInquiry, type InquiryInput } from '@workspace/api-client-react';
import { Reveal, Lines } from '@/components/Reveal';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';

const NEEDS = ['Brand Starter', 'Website', 'Brand + Website', 'Not sure yet'];
const BUDGETS = ['Under $2,500', '$2,500 – $5,000', '$5,000 – $10,000', '$10,000+', 'Let’s discuss'];
const TIMELINES = ['As soon as possible', 'Within 1–2 months', 'Within 3–6 months', 'Just exploring'];

type Form = Omit<InquiryInput, 'website' | 'source' | 'honeypot'> & { website: string; honeypot: string };
type Errors = Partial<Record<keyof Form, string>>;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Please share your name.';
  if (!f.business.trim()) e.business = 'What’s the business called?';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'A valid email so I can reply.';
  if (!f.need) e.need = 'Pick the closest fit.';
  if (!f.budget) e.budget = 'A rough range helps.';
  if (!f.timeline) e.timeline = 'Choose a timeline.';
  if (f.message.trim().length < 10) e.message = 'A sentence or two about the business, please.';
  return e;
}

export default function Contact() {
  useSeo(routeMeta['/contact'], '/contact');
  const params = new URLSearchParams(useSearch());
  const presetNeed = params.get('need') ?? '';
  const source = params.get('source') ?? undefined;
  const client = params.get('client') ?? '';
  const [form, setForm] = useState<Form>({
    name: client,
    business: params.get('business') ?? '',
    email: '',
    website: '',
    need: NEEDS.includes(presetNeed) ? presetNeed : '',
    budget: '',
    timeline: '',
    message: '',
    honeypot: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const mutation = useCreateInquiry();

  const set = (k: keyof Form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) {
      document.getElementById(`f-${Object.keys(v)[0]}`)?.focus();
      return;
    }
    mutation.mutate(
      {
        data: {
          name: form.name.trim(), business: form.business.trim(), email: form.email.trim(),
          website: form.website.trim() || undefined,
          need: form.need, budget: form.budget, timeline: form.timeline, message: form.message.trim(),
          source: source ?? 'website', honeypot: form.honeypot,
        },
      },
      { onSuccess: (res) => { setSuccess(res.message); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    );
  };

  const err = (k: keyof Form) => errors[k] && (
    <p id={`e-${k}`} className="mt-2 text-sm accent" role="alert">{errors[k]}</p>
  );
  const aria = (k: keyof Form) => ({ id: `f-${k}`, 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `e-${k}` : undefined });

  if (success) {
    return (
      <Reveal as="section" immediate className="band band-blue wrap min-h-[80dvh] pt-40 pb-20">
        <p className="label fade d1"><span className="n">Received</span>Thank you</p>
        <h1 className="mega mt-8"><Lines lines={['Noted —', <em key="w">with care.</em>]} start={0.1} /></h1>
        <p className="mt-10 max-w-xl serif text-2xl leading-snug whitespace-pre-line fade d4" data-testid="text-success" role="status">{success}</p>
      </Reveal>
    );
  }

  const apiError = mutation.isError
    ? ((mutation.error as { data?: { error?: string } } | null)?.data?.error ?? 'Something went wrong sending your note. Please try again in a moment.')
    : null;

  return (
    <>
      <Reveal as="header" immediate className="band band-blue wrap pt-36 md:pt-44 pb-20">
        <p className="label fade d1"><span className="n">Contact</span>Start a conversation</p>
        <div className="grid12 mt-8 gap-y-8 items-end">
          <h1 className="col-span-4 md:col-span-9 mega !text-[clamp(3.4rem,13vw,15rem)]">
            <Lines lines={['Have a business', <>worth <em>noticing?</em></>, 'Let’s talk.']} start={0.15} />
          </h1>
          <p className="col-span-4 md:col-span-3 md:col-start-10 text-lg fade d4">
            {source?.startsWith('preview') ? `Following up on your concept preview${client ? `, ${client}` : ''}. Tell me what felt right.` : 'Tell me about it in your own words. I read every note personally. Let’s start with what matters to your business.'}
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="band band-ivory wrap pad">
        <div className="hr hr-ink draw" />
        <form noValidate onSubmit={submit} className="grid12 gap-y-10 pt-12" data-testid="form-inquiry">
          <div className="hidden" aria-hidden="true">
            <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={set('honeypot')} /></label>
          </div>

          {([['name', 'Your name', 'text', 'name'], ['business', 'Business', 'text', 'organization'], ['email', 'Email', 'email', 'email'], ['website', 'Current website (optional)', 'url', 'url']] as const).map(([k, l, t, ac], i) => (
            <div key={k} className={`field col-span-4 md:col-span-5 ${i % 2 ? 'md:col-start-7' : ''}`} data-invalid={!!errors[k]}>
              <label htmlFor={`f-${k}`} className="label">{String(i + 1).padStart(2, '0')} — {l}</label>
              <input type={t} autoComplete={ac} maxLength={{ name: 120, business: 180, email: 254, website: 500 }[k]} value={form[k]} onChange={set(k)} {...aria(k)} data-testid={`input-${k}`} placeholder={k === 'website' ? 'https://' : ''} />
              {err(k)}
            </div>
          ))}

          <fieldset className="col-span-4 md:col-span-11" aria-describedby={errors.need ? 'e-need' : undefined}>
            <legend className="label mb-4">05 — What do you need?</legend>
            <div className="flex flex-wrap gap-3">
              {NEEDS.map((n, i) => (
                <label key={n} className="inline-flex">
                  <input type="radio" name="need" value={n} checked={form.need === n} onChange={set('need')} className="sr-only" id={i === 0 ? 'f-need' : undefined} data-testid={`radio-need-${i}`} />
                  <span className="chip">{n}</span>
                </label>
              ))}
            </div>
            {err('need')}
          </fieldset>

          <div className="field col-span-4 md:col-span-5" data-invalid={!!errors.budget}>
            <label htmlFor="f-budget" className="label">06 — Budget range</label>
            <select value={form.budget} onChange={set('budget')} {...aria('budget')} data-testid="select-budget">
              <option value="">Select a range</option>
              {BUDGETS.map((b) => <option key={b}>{b}</option>)}
            </select>
            {err('budget')}
          </div>
          <div className="field col-span-4 md:col-span-5 md:col-start-7" data-invalid={!!errors.timeline}>
            <label htmlFor="f-timeline" className="label">07 — Timeline</label>
            <select value={form.timeline} onChange={set('timeline')} {...aria('timeline')} data-testid="select-timeline">
              <option value="">Select a timeline</option>
              {TIMELINES.map((b) => <option key={b}>{b}</option>)}
            </select>
            {err('timeline')}
          </div>
          <div className="field col-span-4 md:col-span-11" data-invalid={!!errors.message}>
            <label htmlFor="f-message" className="label">08 — Tell me about the business</label>
            <textarea value={form.message} onChange={set('message')} {...aria('message')} maxLength={5000} placeholder="What you do, who you serve, and what isn’t working yet." data-testid="input-message" />
            {err('message')}
          </div>

          <div className="col-span-4 md:col-span-11 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
            <div aria-live="polite" className="text-sm">
              {apiError && <p className="accent" data-testid="text-error">{apiError}</p>}
              {!apiError && <p className="muted">Fields marked by number are required, except the website.</p>}
            </div>
            <button type="submit" className="btn btn-solid justify-between md:min-w-[18rem]" disabled={mutation.isPending} data-testid="button-submit">
              {mutation.isPending ? 'Sending…' : 'Send inquiry'} <span className="arrow">→</span>
            </button>
          </div>
        </form>
      </Reveal>
    </>
  );
}
