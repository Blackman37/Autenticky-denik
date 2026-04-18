const { useState, useEffect, useRef, useMemo, useCallback } = React;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function useContactForm(t) {
  const [values, setValues] = useState({
    name: '', company: '', email: '', budget: '', timeline: '', message: '',
  });
  const [touched, setTouched] = useState({});
  const [state, setState] = useState('idle');

  const errors = useMemo(() => {
    const e = {};
    if (!values.name.trim()) e.name = t.errors.name;
    if (!EMAIL_RE.test(values.email)) e.email = t.errors.email;
    if (values.message.trim().length < 10) e.message = t.errors.message;
    return e;
  }, [values, t]);

  const onField = (k) => (ev) => setValues(v => ({ ...v, [k]: ev.target.value }));
  const onBlur = (k) => () => setTouched(x => ({ ...x, [k]: true }));
  const showErr = (k) => touched[k] && errors[k];

  const onSubmit = (ev) => {
    ev.preventDefault();
    setTouched({ name: true, email: true, message: true, company: true, budget: true, timeline: true });
    if (Object.keys(errors).length) return;
    setState('sending');
    setTimeout(() => setState('sent'), 900);
  };

  return { values, errors, touched, showErr, onField, onBlur, onSubmit, state };
}

function Placeholder({ label, ratio = '16 / 10', tone = 'neutral' }) {
  const id = React.useId();
  const palette = tone === 'dark'
    ? { a: '#1a1a1c', b: '#222226', fg: '#8a8a93' }
    : tone === 'accent'
    ? { a: 'color-mix(in oklab, var(--accent) 10%, var(--bg))', b: 'color-mix(in oklab, var(--accent) 18%, var(--bg))', fg: 'color-mix(in oklab, var(--accent) 70%, var(--fg))' }
    : { a: 'color-mix(in oklab, var(--fg) 5%, var(--bg))', b: 'color-mix(in oklab, var(--fg) 9%, var(--bg))', fg: 'color-mix(in oklab, var(--fg) 55%, var(--bg))' };
  return (
    <div className="placeholder" style={{ aspectRatio: ratio, position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="none" viewBox="0 0 100 60">
        <defs>
          <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <rect width="6" height="6" fill={palette.a} />
            <line x1="0" y1="0" x2="0" y2="6" stroke={palette.b} strokeWidth="3" />
          </pattern>
        </defs>
        <rect width="100" height="60" fill={`url(#${id})`} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'flex-end', padding: '14px 16px',
        fontFamily: 'ui-monospace, monospace', fontSize: 11,
        letterSpacing: '.02em', color: palette.fg, textWrap: 'pretty',
      }}>
        <span style={{ opacity: .85 }}>{'// '}{label}</span>
      </div>
    </div>
  );
}

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, .2, .5, 1] });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [ids.join(',')]);
  return active;
}

function scrollToId(id, ev) {
  if (ev) ev.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top: y, behavior: 'smooth' });
  history.replaceState(null, '', '#' + id);
}

function VariantA({ lang, setLang, theme, setTheme }) {
  const t = window.CONTENT[lang];
  const sectionIds = ['a-about', 'a-services', 'a-work', 'a-testimonials', 'a-pricing', 'a-blog', 'a-contact'];
  const active = useActiveSection(sectionIds);
  const navMap = [
    ['a-about', t.nav.about], ['a-services', t.nav.services], ['a-work', t.nav.portfolio],
    ['a-testimonials', t.nav.testimonials], ['a-pricing', t.nav.pricing], ['a-blog', t.nav.blog],
  ];

  return (
    <div className="v-variant-a">
      <nav className="a-nav">
        <div className="v-shell row">
          <div className="logo">Jan&nbsp;<em>Černoušek</em></div>
          <ul>
            {navMap.map(([id, label]) => (
              <li key={id}>
                <a href={'#' + id} onClick={(e) => scrollToId(id, e)} className={active === id ? 'active' : ''}>{label}</a>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
            <button
              onClick={() => { const next = lang === 'cs' ? 'en' : 'cs'; setLang(next); localStorage.setItem('lang', next); document.documentElement.lang = next; }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '6px 10px', border: '1px solid var(--rule)', borderRadius: 999, color: 'var(--fg-2)', cursor: 'pointer' }}
            >
              {lang === 'cs' ? 'EN' : 'CS'}
            </button>
            <button
              onClick={() => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); localStorage.setItem('theme', next); document.documentElement.dataset.theme = next; }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 13, padding: '6px 10px', border: '1px solid var(--rule)', borderRadius: 999, color: 'var(--fg-2)', cursor: 'pointer' }}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <a href="#a-contact" className="a-btn nav-cta" onClick={(e) => scrollToId('a-contact', e)}>
              {t.nav.cta} <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </nav>

      <div className="v-shell">
        {/* Hero */}
        <header className="a-hero section" style={{ borderTop: 0 }}>
          <div className="a-status"><span className="dot" />{t.hero.status}</div>
          <h1>
            {lang === 'cs' ? (
              <>Stavím AI, která firmě šetří <em>čas</em> — ne&nbsp;tu, co dělá <em>dojem</em>.</>
            ) : (
              <>I build AI that saves your team <em>hours</em> — not the kind that looks <em>impressive</em> in a demo.</>
            )}
          </h1>
          <p className="lead">{t.hero.lead}</p>
          <div className="a-cta-row">
            <a className="a-btn" href="#a-contact" onClick={(e) => scrollToId('a-contact', e)}>
              {t.hero.ctaPrimary} <span className="arrow">→</span>
            </a>
            <a className="a-btn ghost" href="#a-work" onClick={(e) => scrollToId('a-work', e)}>
              {t.hero.ctaSecondary} <span className="arrow">↓</span>
            </a>
          </div>
          <div className="a-hero-grid">
            {t.hero.stats.map((s, i) => (
              <div className="a-stat" key={i}>
                <div className="k">{s.k}</div>
                <div className="v">{s.v}</div>
              </div>
            ))}
          </div>
        </header>

        {/* About */}
        <section className="section a-about anchor" id="a-about">
          <div className="kicker">{t.about.kicker}</div>
          <div className="a-about-grid" style={{ marginTop: 32 }}>
            <h2>{t.about.title}</h2>
            <div>
              {t.about.body.map((p, i) => <p key={i}>{p}</p>)}
              <div className="a-stack">
                {t.about.stack.map((s) => <span key={s} className="a-chip">{s}</span>)}
              </div>
            </div>
          </div>
          <div className="a-principles">
            {t.about.principles.map((p, i) => (
              <div className="a-principle" key={i}>
                <h4>{p.t}</h4>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="section a-services anchor" id="a-services">
          <div className="a-services-head">
            <div className="kicker">{t.services.kicker}</div>
            <h2>{t.services.title}</h2>
          </div>
          <div className="a-services-list">
            {t.services.items.map((s) => (
              <div className="a-service" key={s.n}>
                <div className="n">{s.n}</div>
                <div>
                  <h3>{s.t}</h3>
                  <div className="tags">
                    {s.tags.map((tg) => <span key={tg} className="tag">{tg}</span>)}
                  </div>
                </div>
                <p>{s.d}</p>
                <div className="price">{s.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Work */}
        <section className="section a-work-section anchor" id="a-work">
          <div className="kicker">{t.portfolio.kicker}</div>
          <h2 style={{ marginTop: 24, maxWidth: 760 }}>{t.portfolio.title}</h2>
          <div className="a-work">
            {t.portfolio.items.map((c, i) => (
              <article className="a-case" key={i}>
                <div>
                  <div className="sector">{c.sector}</div>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                  <div className="metric-row">
                    <div className="metric">{c.metric}</div>
                    <div className="metric-label">{c.metricLabel}</div>
                  </div>
                  <div className="a-stack">
                    {c.stack.map((s) => <span key={s} className="a-chip">{s}</span>)}
                  </div>
                </div>
                <div className="a-case-img">
                  <Placeholder label={c.img} ratio="4 / 3" tone="dark" />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="section anchor" id="a-testimonials">
          <div className="kicker">{t.testimonials.kicker}</div>
          <div className="a-testi-grid">
            {t.testimonials.items.map((x, i) => (
              <div className="a-testi" key={i}>
                <p className="q">{x.q}</p>
                <div className="author"><strong>{x.a}</strong>{x.r}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="section anchor" id="a-pricing">
          <div className="kicker">{t.pricing.kicker}</div>
          <h2 style={{ marginTop: 24, maxWidth: 640 }}>{t.pricing.title}</h2>
          <div className="a-pricing-grid">
            {t.pricing.tiers.map((tier, i) => (
              <div className={'a-tier' + (tier.featured ? ' featured' : '')} key={i}>
                <h3>{tier.t}</h3>
                <div>
                  <span className="price-num">{tier.p}</span>
                  <span className="price-unit">{tier.u}</span>
                </div>
                <p>{tier.d}</p>
                <button onClick={(e) => scrollToId('a-contact', e)}><span>{tier.cta} →</span></button>
              </div>
            ))}
          </div>
          <div className="a-pricing-note">{t.pricing.sub}</div>
        </section>

        {/* Blog */}
        <section className="section anchor" id="a-blog">
          <div className="kicker">{t.blog.kicker}</div>
          <h2 style={{ marginTop: 24, maxWidth: 640 }}>{t.blog.title}</h2>
          <div className="a-blog-list">
            {t.blog.items.map((it, i) => (
              <div className="a-blog-item" key={i}>
                <div className="tag">{it.tag}</div>
                <div className="date">{it.date}</div>
                <div>
                  <h3>{it.t}</h3>
                  <p>{it.d}</p>
                </div>
                <div className="read">{it.read} →</div>
              </div>
            ))}
          </div>
        </section>

        <ContactSectionA t={t} />

        <footer className="a-footer">
          <div>{t.footer.tagline}</div>
          <div>{t.footer.colophon}</div>
        </footer>
      </div>
    </div>
  );
}

function ContactSectionA({ t }) {
  const f = useContactForm(t.contact.form);
  return (
    <section className="section anchor a-contact" id="a-contact">
      <div className="kicker">{t.contact.kicker}</div>
      <h2 style={{ marginTop: 24, maxWidth: 800 }}>{t.contact.title}</h2>
      <div className="a-contact-grid">
        <div>
          <p className="lead">{t.contact.lead}</p>
          <div className="a-direct">
            {t.contact.direct.map((d) => (
              <div className="row" key={d.l}>
                <div className="l">{d.l}</div>
                <div>{d.v}</div>
              </div>
            ))}
          </div>
        </div>
        {f.state === 'sent' ? (
          <div className="a-sent">→ {t.contact.form.sent}</div>
        ) : (
          <form className="a-form" onSubmit={f.onSubmit} noValidate>
            <div className="row-2">
              <div className={'a-field' + (f.showErr('name') ? ' has-error' : '')}>
                <label>{t.contact.form.name}</label>
                <input value={f.values.name} onChange={f.onField('name')} onBlur={f.onBlur('name')} />
                <div className="err">{f.showErr('name') ? f.errors.name : '\u00a0'}</div>
              </div>
              <div className="a-field">
                <label>{t.contact.form.company}</label>
                <input value={f.values.company} onChange={f.onField('company')} />
                <div className="err">&nbsp;</div>
              </div>
            </div>
            <div className={'a-field' + (f.showErr('email') ? ' has-error' : '')}>
              <label>{t.contact.form.email}</label>
              <input type="email" value={f.values.email} onChange={f.onField('email')} onBlur={f.onBlur('email')} />
              <div className="err">{f.showErr('email') ? f.errors.email : '\u00a0'}</div>
            </div>
            <div className="row-2">
              <div className="a-field">
                <label>{t.contact.form.budget}</label>
                <select value={f.values.budget} onChange={f.onField('budget')}>
                  <option value="">—</option>
                  {t.contact.form.budgetOpts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="a-field">
                <label>{t.contact.form.timeline}</label>
                <select value={f.values.timeline} onChange={f.onField('timeline')}>
                  <option value="">—</option>
                  {t.contact.form.timelineOpts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className={'a-field' + (f.showErr('message') ? ' has-error' : '')}>
              <label>{t.contact.form.message}</label>
              <textarea rows={4} placeholder={t.contact.form.messagePh}
                value={f.values.message} onChange={f.onField('message')} onBlur={f.onBlur('message')} />
              <div className="err">{f.showErr('message') ? f.errors.message : '\u00a0'}</div>
            </div>
            <button type="submit" className="a-form-submit" disabled={f.state === 'sending'}>
              {f.state === 'sending' ? t.contact.form.sending : t.contact.form.submit} →
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'cs');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <VariantA lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
