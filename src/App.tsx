import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { scrollTimeline } from './components/three/timeline';

const MuseScene = lazy(() => import('./components/three/MuseScene'));
const image = (id: string, width = 1600) => `photo-${id}?auto=format&fit=crop&w=${width}&q=85`;
const photos = {
  house: image('1600210492486-724fe5c67fb0', 1800),
  suite: image('1616486338812-3dadae4b4ace'),
  water: image('1519046904884-53103b34b206', 1800),
  detail: image('1600607687939-ce8a6c25118c'),
  landscape: image('1470770841072-f978cf4d019e', 1800),
  dining: image('1414235077428-338989a2e8c0'),
  wellness: image('1540555700478-4be289fbecef'),
  garden: image('1416879595882-3373a0480b5b'),
  stone: image('1600566753086-00f18fb6b3ea'),
};
const links = [['STAYS','/stays'],['EXPERIENCE','/experience'],['THE HOUSE','/house'],['LOCATION','/location'],['RESERVE','/reserve']];

function Nav({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    if (!open) return () => document.body.classList.remove('menu-open');
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => { window.removeEventListener('keydown', closeOnEscape); document.body.classList.remove('menu-open'); };
  }, [open]);
  return <>
    <header className="nav"><a className="wordmark" href="/" aria-label="MUSE home">MUSE<span>LAKE COMO</span></a>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-controls="site-menu" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? 'CLOSE' : 'MENU'} <i /></button>
      <nav className="nav-links" aria-label="Main navigation">{links.map(([label, href]) => <a href={href} key={label} aria-current={path === href ? 'page' : undefined}>{label}</a>)}</nav>
    </header>
    {open && <nav id="site-menu" className="menu-overlay" aria-label="Mobile navigation"><button className="menu-close" onClick={() => setOpen(false)}>CLOSE <span aria-hidden="true">&times;</span></button><div className="menu-note">A FICTIONAL STAY &#183; LAKE COMO, ITALY</div>{links.map(([label, href], i) => <a href={href} key={label} onClick={() => setOpen(false)} aria-current={path === href ? 'page' : undefined}><span>0{i + 1}</span>{label}</a>)}<div className="menu-foot">DESIGNED FOR AN UNHURRIED KIND OF ARRIVAL</div></nav>}
  </>;
}
function Footer() { return <footer className="footer"><a className="wordmark" href="/">MUSE<span>LAKE COMO</span></a><span>FICTIONAL CONCEPT · LAKE COMO, ITALY</span><div><a href="/privacy">PRIVACY</a><a href="/terms">TERMS</a></div></footer>; }
function Photo({ src, alt, className = '', eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [failed, setFailed] = useState(false);
  const variant = Array.from(src).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3;
  useEffect(() => {
    const image = ref.current;
    if (!image) return;
    image.dataset.revealPending = 'true';
    if (!('IntersectionObserver' in window)) { image.dataset.revealed = 'true'; return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { image.dataset.revealed = 'true'; observer.disconnect(); }
    }, { threshold: .12, rootMargin: '0px 0px -24px 0px' });
    observerRef.current = observer;
    observer.observe(image);
    return () => { observer.disconnect(); observerRef.current = null; }
  }, []);
  const imageId = src.split('?')[0];
  const source = (width: number) => 'https://images.unsplash.com/' + imageId + '?auto=format&fit=crop&w=' + width + '&q=82';
  const srcSet = [480, 768, 1200, 1600, 2000].map(width => source(width) + ' ' + width + 'w').join(', ');
  if (failed) return <span className={'photo-placeholder ' + className} role="img" aria-label={alt} data-reveal-variant={variant}/>;
  return <img ref={ref} className={'editorial-image ' + className} src={source(1600)} srcSet={srcSet} sizes="(max-width: 760px) 92vw, (max-width: 1280px) 76vw, 66vw" alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" data-reveal-variant={variant} onError={() => { observerRef.current?.disconnect(); setFailed(true); }} />;
}
function ArrowLink({ href, children }: { href: string; children: string }) { return <a className="arrow-link" href={href}>{children}<span aria-hidden="true">↗</span></a>; }

function Home() {
  return <main>
    <section className="hero scene-section"><div className="hero-location">LAKE COMO <span>ITALY</span></div><div className="hero-copy"><p className="eyebrow">A PRIVATE STAY ON THE WATER</p><h1>MUSE</h1><p className="hero-line">Stay somewhere that changes<br />the way you see the landscape.</p><a href="#arrive" className="enter-link">ENTER <span aria-hidden="true">↓</span></a></div><div className="hero-bottom"><span>AN ARCHITECTURAL RETREAT</span><span>SCROLL TO EXPLORE</span><span>01 — 06</span></div><div className="scene-caption">A study in stone, light and water</div></section>
    <ChapterProgress />
    <section id="arrive" className="chapter-intro light"><div className="section-index">01 / ARRIVE</div><div><p className="eyebrow">THE APPROACH</p><h2>Arrival is<br />part of the stay.</h2><p className="body-copy">A quiet lane ends at the water. The house opens slowly, giving the lake time to find you.</p><ArrowLink href="/experience">DISCOVER THE EXPERIENCE</ArrowLink></div><span className="side-caption">A PLACE APART, WITHOUT BEING FAR AWAY</span></section>
    <section className="image-feature"><Photo src={photos.house} alt="Editorial reference of stone and timber in a calm contemporary interior"/><div className="image-label">THE HOUSE, IN ITS LANDSCAPE <span>01 / 05 · VISUAL REFERENCE</span></div></section>
    <section id="suites" className="split-story"><div className="split-image"><Photo src={photos.suite} alt="Editorial reference showing natural materials and considered furnishings"/><span>02 — THE SUITES · VISUAL REFERENCE</span></div><div className="split-copy"><div className="section-index">02 / THE SUITES</div><p className="eyebrow">ROOM TO EXHALE</p><h2>Space to<br />be elsewhere.</h2><p className="body-copy">Three imagined suites, each shaped by its aspect, its light and the changing line of the shore.</p><ArrowLink href="/stays">EXPLORE THE SUITES</ArrowLink></div></section>
    <section id="light" className="light-section"><div className="section-index">03 / LIGHT</div><div className="light-copy"><p className="eyebrow">THE DAY, UNFOLDING</p><h2>Light makes<br />its own itinerary.</h2><p className="body-copy">Morning arrives on pale stone. By late afternoon, long shadows draw the garden toward the water.</p><ArrowLink href="/experience#light">FOLLOW THE LIGHT</ArrowLink></div><div className="light-orb" aria-hidden="true"/></section>
    <section id="water" className="water-feature"><Photo src={photos.water} alt="Editorial reference of quiet water at the edge of a lakeside setting"/><div><p className="eyebrow">04 / THE WATER</p><h2>The lake is<br />never a backdrop.</h2><ArrowLink href="/experience#water">FIND YOUR WAY TO THE WATER</ArrowLink></div></section>
    <section id="house" className="house-note"><div className="section-index">05 / THE HOUSE</div><div><p className="eyebrow">A HOUSE WITH A POINT OF VIEW</p><h2>Made to belong<br />to this shore.</h2><p className="body-copy">Stone, timber and deep-set openings give the landscape a frame without taking it over. The architecture is a way of paying attention.</p><ArrowLink href="/house">DISCOVER THE HOUSE</ArrowLink></div><Photo src={photos.detail} alt="Editorial reference of architectural detail and natural light"/></section>
    <section id="location" className="location-band"><Photo src={photos.landscape} alt="Editorial reference of a mountain landscape reflected in water"/><div><p className="eyebrow">06 / LOCATION</p><h2>Como, at<br />your own pace.</h2><p className="body-copy">A landscape of water, mountain and village. MUSE is an imagined place within it.</p><ArrowLink href="/location">EXPLORE THE SETTING</ArrowLink></div></section>
    <section className="final-cta"><div className="final-copy"><p className="eyebrow">MUSE · LAKE COMO</p><h2>Stay for the place.<br /><i>Remember the feeling.</i></h2><a className="text-button" href="/reserve">RESERVE YOUR STAY <span aria-hidden="true">↗</span></a><small>A FICTIONAL CONCEPT · RESERVATIONS ARE A DEMONSTRATION</small></div></section>
  </main>;
}

const progressChapters = [['ARRIVE','#arrive'],['SUITES','#suites'],['LIGHT','#light'],['WATER','#water'],['THE HOUSE','#house'],['LOCATION','#location']];
function ChapterProgress() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const p = scrollTimeline.current;
        const index = p < .36 ? 0 : p < .55 ? 1 : p < .72 ? 2 : p < .9 ? 3 : p < .96 ? 4 : 5;
        setActive(index);
      });
    };
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); };
  }, []);
  return <nav className="chapter-progress" aria-label="Homepage chapters">{progressChapters.map(([label, href], i) => <a href={href} className={active === i ? 'active' : ''} key={label} aria-label={`Chapter ${i + 1}: ${label}`}><span>{label}</span><i /></a>)}</nav>;
}

const suites = [
  { name: 'The Lake Suite', tag: 'OPEN WATER \u00b7 QUIET MORNINGS', description: 'The day begins with an uninterrupted line to the lake. Pale stone and considered timber make a quiet frame for the changing water.', detail: 'OPEN WATER / PALE STONE / MORNING LIGHT', image: photos.suite, alt: 'Editorial reference for a quiet suite with natural materials' },
  { name: 'The Garden Suite', tag: 'GREEN SHADE \u00b7 FILTERED LIGHT', description: 'A softer relationship with the landscape: imagined planting, moving shade and a palette that draws the garden indoors.', detail: 'GARDEN SHADE / NATURAL TEXTURE / SLOW AFTERNOONS', image: photos.garden, alt: 'Editorial reference for a private garden setting' },
  { name: 'The Stone Suite', tag: 'DEEP REVEALS \u00b7 SOFT LIGHT', description: 'An intimate study in stone and timber, composed around deep openings and the shapes made by the passing light.', detail: 'LOCAL MATERIALS / DEEP REVEALS / EVENING LIGHT', image: photos.stone, alt: 'Editorial reference for a warm stone interior' },
];
function Stays() {
  return <main className="inner-page stays-page"><div className="inner-heading"><p className="eyebrow">STAYS &#183; THREE SUITE CONCEPTS</p><h1>A room of your own,<br />and a view that stays.</h1><p className="body-copy">Three imagined ways to be here. Each is a fictional design concept, not a real accommodation offer.</p></div>
    {suites.map((suite, i) => <section className={`suite-spread ${i % 2 ? 'reverse' : ''}`} key={suite.name}><div className="suite-spread-image"><Photo src={suite.image} alt={suite.alt} eager={i === 0}/><span>0{i + 1} / 03 &#183; VISUAL REFERENCE</span></div><div className="suite-spread-copy"><p className="eyebrow">{suite.tag}</p><h2>{suite.name}</h2><p className="body-copy">{suite.description}</p><p className="suite-spec">{suite.detail}</p><ArrowLink href={`/reserve?suite=${encodeURIComponent(suite.name)}`}>IMAGINE THIS SUITE</ArrowLink></div></section>)}
    <div className="concept-note">Suite names and descriptions are illustrative fictional concepts. Photography is editorial reference imagery.</div>
  </main>;
}

const experiences = [
  { id: 'water', n: '01', title: 'WATER', heading: 'Take the day to the edge.', copy: 'A threshold between architecture and open water. In this imagined setting, the lake keeps changing the light and the pace of the day.', photo: photos.water, alt: 'Editorial reference of a calm lakeside setting' },
  { id: 'dining', n: '02', title: 'DINING', heading: 'Gather around the table.', copy: 'A seasonal table imagined around the region: thoughtful ingredients, long lunches and room for the evening to linger.', photo: photos.dining, alt: 'Editorial reference of a set dining table' },
  { id: 'wellness', n: '03', title: 'WELLNESS', heading: 'Make space for quiet.', copy: 'A slower rhythm imagined through warmth, quiet rooms and time outdoors. No schedule required.', photo: photos.wellness, alt: 'Editorial reference of a serene wellness space' },
  { id: 'light', n: '04', title: 'ARCHITECTURE', heading: 'Follow the light indoors.', copy: 'Deep openings, shaded thresholds and materials that soften as the day moves from brightness into evening.', photo: photos.detail, alt: 'Editorial reference of natural light falling across architecture' },
];
function Experience() { return <main className="inner-page experience-page"><div className="inner-heading"><p className="eyebrow">EXPERIENCE · THE RHYTHM</p><h1>Nothing to keep<br />up with.</h1><p className="body-copy">A collection of imagined rituals shaped by the house, the water and the time between.</p></div>{experiences.map(item => <section id={item.id} className="experience-row" key={item.id}><div className="experience-photo"><Photo src={item.photo} alt={item.alt}/><span>{item.n} / 04 · VISUAL REFERENCE</span></div><div className="experience-copy"><p className="eyebrow">{item.n} / {item.title}</p><h2>{item.heading}</h2><p className="body-copy">{item.copy}</p></div></section>)}<div className="experience-end"><ArrowLink href="/reserve">IMAGINE A STAY</ArrowLink></div></main>; }

function House() { return <main className="inner-page house-page"><div className="inner-heading"><p className="eyebrow">THE HOUSE &#183; ARCHITECTURE</p><h1>Architecture designed<br />around stillness.</h1><p className="body-copy">MUSE is a fictional architectural study. Material, light, landscape and privacy shape a home imagined for its setting.</p></div><Photo src={photos.house} alt="Editorial reference of a contemporary interior in warm natural materials" className="inner-photo" eager/><div className="inner-note"><span>STONE &#183; SHADE &#183; SHORE &#183; VISUAL REFERENCE</span><ArrowLink href="/#arrive">ENTER THE HOUSE</ArrowLink></div><section className="house-principles">{[['MATERIAL','Stone, timber and quiet finishes give the imagined rooms a tactile connection to the landscape.',photos.stone],['LIGHT','Deep openings let daylight shift across surfaces, marking the hours without asking for attention.',photos.detail],['LANDSCAPE','The lake, hillside and garden shape the outlook and the rhythm of the house.',photos.landscape],['PRIVACY','Sheltered thresholds and considered sightlines offer a sense of retreat within the imagined architecture.',photos.garden]].map(([title, copy, src], i) => <article className="house-principle" key={title as string}><div className="house-principle-image"><Photo src={src as string} alt={`Editorial reference for ${String(title).toLowerCase()} in the imagined house`}/></div><div><p className="eyebrow">0{i + 1} / {title}</p><p className="body-copy">{copy}</p></div></article>)}</section><div className="house-transition"><div className="threshold-mark" aria-hidden="true"><i/><i/><i/></div><p className="eyebrow">A STUDY IN ARRIVAL</p><ArrowLink href="/#arrive">STEP INTO THE HOUSE</ArrowLink></div><div className="concept-note">MUSE is a fictional hospitality concept. Architecture and imagery shown here are illustrative references.</div></main>; }
function LocationPage() { return <main className="inner-page location-page"><div className="inner-heading"><p className="eyebrow">LOCATION &#183; LAKE COMO</p><h1>A landscape to<br />move through slowly.</h1><p className="body-copy">Water, mountain and village form the imagined setting for MUSE. This concept celebrates the landscape without claiming a real property address or itinerary.</p></div><Photo src={photos.landscape} alt="Editorial reference of a mountain lake landscape" className="inner-photo" eager/><div className="inner-note"><span>A CONCEPTUAL SETTING &#183; LAKE COMO</span><span>VISUAL REFERENCE</span></div><section className="location-stories"><article><p className="eyebrow">THE APPROACH</p><h2>Arrival, without a pin.</h2><p className="body-copy">An imagined passage from village paths to water's edge, with the landscape gradually opening around the house. No real address or route is represented.</p></article><article><p className="eyebrow">NEARBY, IN SPIRIT</p><h2>Water. Gardens. Village life.</h2><p className="body-copy">The wider setting suggests shoreline walks, garden shade and the unhurried texture of lakeside villages. These are moods of the region, not listed or promised activities.</p></article><article><p className="eyebrow">THE SEASONS</p><h2>A different light, each time.</h2><p className="body-copy">Spring greens soften the shore; summer holds the long evenings; autumn deepens the stone; winter gives the water a quieter clarity.</p></article></section><div className="concept-note">MUSE is a fictional concept. No real address, nearby business, itinerary or guest service is represented.</div></main>; }
function Reserve() {
  const [submitted, setSubmitted] = useState(false);
  const requestedSuite = new URLSearchParams(window.location.search).get('suite') || '';
  return <main className="reserve-page"><div className="section-index">MUSE / RESERVE</div><div className="reserve-wrap"><div><p className="eyebrow">A NOTE TO THE HOUSE</p><h1>Begin with<br /><i>a conversation.</i></h1><p className="body-copy">Imagine a stay at MUSE. This concept form is for demonstration only; reservations are not sent or stored.</p></div><form onSubmit={e => { e.preventDefault(); const form = e.currentTarget; const arrival = form.elements.namedItem('arrival') as HTMLInputElement; const departure = form.elements.namedItem('departure') as HTMLInputElement; departure.setCustomValidity(''); if (departure.value <= arrival.value) { departure.setCustomValidity('Choose a departure date after arrival.'); departure.reportValidity(); return; } setSubmitted(true); }}><div className="form-row"><label>Arrival<input required name="arrival" type="date" onChange={e => { const departure = e.currentTarget.form?.elements.namedItem('departure') as HTMLInputElement | null; if (departure) { departure.min = e.currentTarget.value; departure.setCustomValidity(''); } }} /></label><label>Departure<input required name="departure" type="date" onChange={e => e.currentTarget.setCustomValidity('')} /></label></div><div className="form-row"><label>Guests<select required defaultValue="2"><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select></label><label>Suite<select required defaultValue={requestedSuite}><option value="">Choose a suite</option>{suites.map(s => <option key={s.name}>{s.name}</option>)}</select></label></div><div className="form-row"><label>Name<input required type="text" autoComplete="name" /></label><label>Email<input required type="email" autoComplete="email" /></label></div><button className="text-button" type="submit">REQUEST A DEMONSTRATION STAY <span aria-hidden="true">↗</span></button><small>This is a fictional portfolio concept. No payment is taken. No reservation is created.</small>{submitted && <p className="form-success" role="status">This is a concept experience. No reservation has been submitted or stored.</p>}</form></div></main>;
}

function Legal({ terms = false }: { terms?: boolean }) { return <main className="legal-page"><p className="eyebrow">MUSE · LAKE COMO</p><h1>{terms ? 'Terms & Conditions' : 'Privacy Policy'}</h1><p className="body-copy">Last updated October 2026</p><article><h2>{terms ? 'A concept property' : 'About this demonstration'}</h2><p>MUSE is a fictional hospitality concept created for portfolio and design demonstration purposes. It does not represent an operating hotel, accept bookings, or offer accommodation or services.</p><h2>{terms ? 'Use of this website' : 'Information and forms'}</h2><p>{terms ? 'Website content is illustrative and provided for demonstration only. No offer to provide hospitality services is made.' : 'This website does not operate analytics, booking or contact submission services. The reservation form is a visual demonstration and does not store or transmit the information entered.'}</p><h2>{terms ? 'Images and content' : 'Images and content'}</h2><p>Images are editorial references used to demonstrate the design direction. MUSE has no real guests, reviews, awards, business history or booking inventory. The domain muse.example is a placeholder.</p></article></main>; }

const metadata: Record<string, { title: string; description: string }> = {
  '/': { title: 'MUSE — Lake Como', description: 'Stay somewhere that changes the way you see the landscape. MUSE is a fictional architectural retreat concept for Lake Como.' },
  '/stays': { title: 'The Suites — MUSE, Lake Como', description: 'Explore three imagined suite concepts for MUSE, a fictional hospitality concept on Lake Como.' },
  '/experience': { title: 'The Experience — MUSE, Lake Como', description: 'Water, dining, wellness and architecture in an imagined Lake Como retreat.' },
  '/house': { title: 'The House — MUSE, Lake Como', description: 'A fictional architectural study in stone, timber, light and landscape.' },
  '/location': { title: 'Location — MUSE, Lake Como', description: 'Discover the imagined setting for MUSE within the landscape of Lake Como.' },
  '/reserve': { title: 'Reserve — MUSE, Lake Como', description: 'Explore the reservation concept for MUSE. This fictional demonstration does not create bookings.' },
  '/privacy': { title: 'Privacy Policy — MUSE', description: 'Privacy information for the fictional MUSE hospitality concept website.' },
  '/terms': { title: 'Terms — MUSE', description: 'Terms for the fictional MUSE hospitality concept website.' },
};
function setMeta(name: string, content: string, property = false) { const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`; let tag = document.head.querySelector<HTMLMetaElement>(selector); if (!tag) { tag = document.createElement('meta'); if (property) tag.setAttribute('property', name); else tag.name = name; document.head.append(tag); } tag.content = content; }
export default function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  useEffect(() => {
    const update = () => {
      scrollTimeline.current = Math.min(1, Math.max(0, window.scrollY / Math.max(document.documentElement.scrollHeight - innerHeight, 1)));
      const ctaReveal = Math.min(1, Math.max(0, (scrollTimeline.current - .9) / .1));
      document.documentElement.style.setProperty('--muse-cta-reveal', ctaReveal.toFixed(3));
    };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); scrollTimeline.current = 0; };
  }, []);
  useEffect(() => { const data = metadata[path] || metadata['/']; document.title = data.title; setMeta('description', data.description); setMeta('og:title', data.title, true); setMeta('og:description', data.description, true); setMeta('og:url', `https://muse.example${path === '/' ? '/' : path}`, true); const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]'); if (canonical) canonical.href = `https://muse.example${path === '/' ? '/' : path}`; }, [path]);
  return <div className={'site-shell ' + (path === '/' ? 'home-shell' : 'inner-shell')}>{path === '/' && <Suspense fallback={<div className="scene-fallback"/>}><MuseScene/></Suspense>}<Nav path={path}/>{path === '/' ? <Home/> : path === '/stays' ? <Stays/> : path === '/experience' ? <Experience/> : path === '/house' ? <House/> : path === '/location' ? <LocationPage/> : path === '/reserve' ? <Reserve/> : path === '/privacy' || path === '/terms' ? <Legal terms={path === '/terms'}/> : <Home/>}<Footer/><div className="concept-badge">FICTIONAL CONCEPT</div></div>;
}
