import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Code2 as GitHub, Compass, Download, ExternalLink, Headphones, Mail, Map, Moon, Settings, Sun, Volume2, VolumeX, X, Zap } from "lucide-react";
import { ambientAudio, type AudioBus } from "./audio";
import { certifications, destinationById, destinations, projects, skillGroups, timeline } from "./content";
import { gameEvents } from "./game/events";
import type { DestinationId, ThemeMode, UserPreferences, VisitMode } from "./types";

const PREFS_KEY = "sandip-world-preferences-v2";
const defaults: UserPreferences = { theme: "auto", sound: false, reducedEffects: window.matchMedia("(prefers-reduced-motion: reduce)").matches, returning: false, lastVisited: "home", visited: [], musicVolume: .32, natureVolume: .42, sfxVolume: .55 };
type NearbyInteraction = { kind: "portal" | "board" | "exit" | "exhibit"; destination: DestinationId; project?: string };
type LocationId = "village" | DestinationId;

function loadPreferences(): UserPreferences {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") }; }
  catch { return defaults; }
}

function routeFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [destination, project] = hash.split("/");
  const valid = destinations.some((item) => item.id === destination);
  return { destination: (valid ? destination : "home") as DestinationId, project: destination === "projects" ? project : undefined };
}

export default function App() {
  const gameHost = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);
  const [prefs, setPrefs] = useState(loadPreferences);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<VisitMode>("explore");
  const [panel, setPanel] = useState<DestinationId | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [nearby, setNearby] = useState<NearbyInteraction | null>(null);
  const [location, setLocation] = useState<LocationId>("village");
  const [portalActive, setPortalActive] = useState(false);
  const [playerState, setPlayerState] = useState({ tile: { x: 30, y: 22 }, facing: "down", moving: false });
  const [viewportState, setViewportState] = useState({ width: 0, height: 0, zoom: 1 });
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [toast, setToast] = useState("World ready. Choose a journey.");
  const [nightAmount, setNightAmount] = useState(0);

  const activeDestination = destinationById(panel);
  const visited = prefs.visited;

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    if (!started || !gameHost.current || gameRef.current) return;
    let cancelled = false;
    void import("./game/createGame").then(({ createGame }) => {
      if (!cancelled && gameHost.current) gameRef.current = createGame(gameHost.current);
    });
    const openContent = ({ destination }: { destination: DestinationId }) => {
      const route = routeFromHash();
      openDestination(destination, !window.location.hash.startsWith(`#${destination}`));
      if (destination === "projects" && route.project) setSelectedProject(route.project);
    };
    const openProject = ({ destination, project }: { destination: DestinationId; project: string }) => { openDestination(destination); setSelectedProject(project); history.pushState(null, "", `#projects/${project}`); };
    const proximity = ({ interaction }: { interaction: NearbyInteraction | null }) => setNearby(interaction);
    const locationChanged = ({ location: next }: { location: LocationId }) => {
      setLocation(next); setPanel((current) => window.location.hash ? current : null); setNearby(null);
      ambientAudio.applyMix("village", false);
      setToast(next === "village" ? "Returned to the Village / World Map." : `${destinationById(next).worldName} selected.`);
    };
    const portalState = ({ active }: { active: boolean }) => { setPortalActive(active); if (active) ambientAudio.playSfx("portal"); };
    const updatePlayer = (state: typeof playerState) => setPlayerState(state);
    const updateViewport = (state: typeof viewportState) => setViewportState(state);
    gameEvents.on("open-content", openContent);
    gameEvents.on("open-project", openProject);
    gameEvents.on("proximity", proximity);
    gameEvents.on("location-changed", locationChanged);
    gameEvents.on("portal-state", portalState);
    gameEvents.on("player-state", updatePlayer);
    gameEvents.on("viewport-state", updateViewport);
    return () => {
      gameEvents.off("open-content", openContent);
      gameEvents.off("open-project", openProject);
      gameEvents.off("proximity", proximity);
      gameEvents.off("location-changed", locationChanged);
      gameEvents.off("portal-state", portalState);
      gameEvents.off("player-state", updatePlayer);
      gameEvents.off("viewport-state", updateViewport);
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [started]);

  useEffect(() => {
    const update = () => {
      const route = routeFromHash();
      if (window.location.hash) {
        setPanel(route.destination);
        setSelectedProject(route.project ?? null);
      }
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const cycle = (Date.now() % 480_000) / 480_000;
      const amount = (1 - Math.cos(cycle * Math.PI * 2)) / 2;
      setNightAmount(amount);
      gameRef.current?.scene.getScene("world")?.events.emit("set-theme", prefs.theme, amount);
    }, 1000);
    return () => clearInterval(interval);
  }, [prefs.theme, started]);

  useEffect(() => {
    gameRef.current?.scene.getScene("world")?.events.emit("reduced-effects", prefs.reducedEffects);
    document.documentElement.dataset.effects = prefs.reducedEffects ? "reduced" : "full";
  }, [prefs.reducedEffects, started]);

  useEffect(() => {
    const handler = () => ambientAudio.setMuted(document.hidden || !prefs.sound);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [prefs.sound]);

  useEffect(() => {
    ambientAudio.setBusVolume("music", prefs.musicVolume);
    ambientAudio.setBusVolume("nature", prefs.natureVolume);
    ambientAudio.setBusVolume("sfx", prefs.sfxVolume);
  }, [prefs.musicVolume, prefs.natureVolume, prefs.sfxVolume]);

  useEffect(() => { ambientAudio.applyMix("village", prefs.theme === "night" || (prefs.theme === "auto" && nightAmount > .62)); }, [location, prefs.theme, nightAmount]);

  useEffect(() => ambientAudio.onStatus((status, message) => { if (message) setToast(message); else if (status === "playing") setToast("Music and nature ambience enabled."); }), []);

  useEffect(() => {
    const closeTopLayer = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (settingsOpen) setSettingsOpen(false);
      else if (navigatorOpen) setNavigatorOpen(false);
      else if (panel) closePanel();
      else if (dialogueOpen) setDialogueOpen(false);
    };
    window.addEventListener("keydown", closeTopLayer);
    return () => window.removeEventListener("keydown", closeTopLayer);
  });

  const openDestination = useCallback((id: DestinationId, updateHash = true) => {
    setPanel(id);
    setDialogueOpen(false);
    setNavigatorOpen(false);
    setSelectedProject(null);
    setPrefs((current) => ({ ...current, returning: true, lastVisited: id, visited: current.visited.includes(id) ? current.visited : [...current.visited, id] }));
    if (updateHash && window.location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
    setToast(`${destinationById(id).worldName} opened.`);
  }, []);

  const teleport = (id: DestinationId) => {
    setNavigatorOpen(false);
    setDialogueOpen(false);
    setToast(`Travelling to ${destinationById(id).worldName}…`);
    setPanel(null);
    const world = gameRef.current?.scene.getScene("world");
    if (world) world.events.emit("travel-to", id);
  };

  const returnToVillage = () => {
    setNavigatorOpen(false); setDialogueOpen(false); setPanel(null); setSelectedProject(null);
    history.pushState(null, "", window.location.pathname + window.location.search);
    gameRef.current?.scene.getScene("world")?.events.emit("return-village");
  };

  const closePanel = () => {
    setPanel(null);
    setSelectedProject(null);
    history.pushState(null, "", window.location.pathname + window.location.search);
    setToast("Returned outside the building. Continue exploring the village.");
  };

  const activatePrompt = () => {
    if (!nearby) return;
    if (nearby.kind === "board") openDestination(nearby.destination);
    else if (nearby.kind === "exhibit") {
      openDestination("projects");
      if (nearby.project) { setSelectedProject(nearby.project); history.pushState(null, "", `#projects/${nearby.project}`); }
    } else if (nearby.kind === "exit") returnToVillage();
    else teleport(nearby.destination);
  };

  const begin = async (visitMode: VisitMode, withSound: boolean) => {
    setMode(visitMode);
    setPrefs((current) => ({ ...current, sound: withSound, returning: true }));
    if (withSound) await ambientAudio.start();
    await document.fonts?.load("16px 'Pixelify Sans'");
    setStarted(true);
    setDialogueOpen(true);
    const route = routeFromHash();
    if (window.location.hash) window.setTimeout(() => {
      gameRef.current?.scene.getScene("world")?.events.emit("travel-to", route.destination);
      window.setTimeout(() => {
        openDestination(route.destination, false);
        setSelectedProject(route.project ?? null);
      }, 1300);
    }, 900);
  };

  const toggleSound = async () => {
    const next = !prefs.sound;
    if (next) await ambientAudio.start(); else ambientAudio.setMuted(true);
    setPrefs((current) => ({ ...current, sound: next }));
  };

  const remainingDestinations = useMemo(() => destinations.filter((item) => item.id !== panel).sort((a, b) => Number(visited.includes(a.id)) - Number(visited.includes(b.id))), [panel, visited]);

  if (!started) return <StartScreen prefs={prefs} onBegin={begin} />;

  return (
    <main className={`app-shell theme-${prefs.theme}`} id="portfolio-content" tabIndex={-1}>
      <a className="skip-link" href="#portfolio-content" onClick={() => setNavigatorOpen(true)}>Skip the game world</a>
      <div className="world-stage" aria-label="Interactive top-down pixel-art portfolio village">
        <div ref={gameHost} className="game-host" data-location={location} data-facing={playerState.facing} data-moving={playerState.moving} data-tile={`${playerState.tile.x},${playerState.tile.y}`} data-portal={portalActive} data-layers="ground decoration collision above-player portal spawn interaction" data-boundaries="pentagon walls trees rocks water fences" data-map-layout="pentagon" data-character="24x32-eight-direction-eight-frame-transparent" data-sign-placement="above-door" data-door-facing="center" data-portal-size="large" data-entry-flow="direct-content" data-entry-keys="E Enter" data-viewport={`${viewportState.width}x${viewportState.height}`} data-camera-zoom={viewportState.zoom} />
        <div className="world-vignette" aria-hidden="true" />
      </div>
      <p className="sr-only world-description">A bounded pixel village with signed buildings, paths, trees, rocks, fences, and water. Use navigation to bypass movement at any time.</p>

      <header className="world-header">
        <button className="brand-crest" onClick={returnToVillage} aria-label="Return to Village / World Map"><span>SS</span><b>Sandip's World</b></button>
        <nav aria-label="Portfolio navigation">
          <button onClick={() => setNavigatorOpen(true)}><Map size={18} /> Navigate</button>
          <a href="./sandip-sapkota-resume.pdf" download><Download size={18} /> Résumé</a>
          <button onClick={() => setSettingsOpen(true)} aria-label="Open settings"><Settings size={18} /></button>
        </nav>
      </header>

      <aside className="quest-card" aria-label="Journey progress">
        <span className="eyebrow">{mode === "tour" ? "Quick tour" : "Free exploration"}</span>
        <strong>{visited.length} / {destinations.length} destinations visited</strong>
        <div className="progress-track"><i style={{ width: `${(visited.length / destinations.length) * 100}%` }} /></div>
      </aside>

      <div className="control-hint" aria-hidden="true"><kbd>WASD</kbd><span>move</span><kbd>Click</kbd><span>travel</span><kbd>Enter / E</kbd><span>enter</span></div>

      {nearby && !panel && (
        <button className="portal-prompt" onClick={activatePrompt}>
          <Zap size={20} /> Enter {destinationById(nearby.destination).worldName} <kbd>Enter / E</kbd>
        </button>
      )}

      {dialogueOpen && !panel && (
        <section className="dialogue-box manga-dialogue" aria-label="Sandip's greeting" aria-live="polite">
          <div className="speech-bubble">
            <span className="speaker">Sandip</span>
            <p>{prefs.visited.length ? "Welcome back. Where would you like to travel next?" : "Namaste! I’m Sandip. How may I help you explore my work?"}</p>
            <div className="dialogue-actions">
              {destinations.filter((d) => d.id !== "home").slice(0, 4).map((d) => <button key={d.id} onClick={() => teleport(d.id)}>{d.title}</button>)}
              <button onClick={returnToVillage}>Village / World Map</button>
              <button className="ghost" onClick={() => setDialogueOpen(false)}>Let me roam</button>
            </div>
          </div>
          <button className="icon-close dialogue-close" onClick={() => setDialogueOpen(false)} aria-label="Close greeting"><X /></button>
        </section>
      )}

      {navigatorOpen && <Navigator visited={visited} onTravel={teleport} onWorldMap={returnToVillage} onClose={() => setNavigatorOpen(false)} />}
      {settingsOpen && <SettingsPanel prefs={prefs} nightAmount={nightAmount} setPrefs={setPrefs} onSound={toggleSound} onClose={() => setSettingsOpen(false)} />}
      {panel && (
        <ContentPanel
          destination={panel}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          remaining={remainingDestinations}
          onTravel={teleport}
          onWorldMap={returnToVillage}
          onClose={closePanel}
        />
      )}
      {portalActive && <div className="portal-status" role="status" aria-live="assertive">Travelling through the pixel portal…</div>}
      <div className="sr-status" role="status" aria-live="polite">{toast}</div>
    </main>
  );
}

function StartScreen({ prefs, onBegin }: { prefs: UserPreferences; onBegin: (mode: VisitMode, sound: boolean) => void }) {
  const [sound, setSound] = useState(false);
  return (
    <main className="start-screen" id="portfolio-content" tabIndex={-1}>
      <a className="skip-link" href="#portfolio-content">Skip to entry choices</a>
      <div className="start-art pixel-start-art" aria-hidden="true" style={{ backgroundImage: "linear-gradient(rgba(4,22,29,.22), rgba(4,22,29,.68)), url('./assets/pixel/forchild-village-preview.png')" }} />
      <section className="start-card">
        <div className="crest">SS</div>
        <p className="overline">An interactive portfolio by</p>
        <h1>Sandip Sapkota</h1>
        <p className="lead">Full-stack developer building web systems, AI-integrated experiences, and self-hosted infrastructure.</p>
        <div className="sound-choice" role="group" aria-label="Sound preference">
          <button className={!sound ? "active" : ""} onClick={() => setSound(false)}><VolumeX size={18}/> Enter silently</button>
          <button className={sound ? "active" : ""} onClick={() => setSound(true)}><Headphones size={18}/> Enter with ambience</button>
        </div>
        <div className="entry-actions">
          <button className="primary" onClick={() => onBegin("tour", sound)}><Compass /> Quick tour <ChevronRight /></button>
          <button onClick={() => onBegin("explore", sound)}><Map /> Explore freely</button>
        </div>
        {prefs.returning && <p className="returning-note">Welcome back. Your journey progress is saved on this device.</p>}
      </section>
      <p className="start-footnote">Use keyboard, mouse, touch, or the always-available navigation menu.</p>
    </main>
  );
}

function Navigator({ visited, onTravel, onWorldMap, onClose }: { visited: DestinationId[]; onTravel: (id: DestinationId) => void; onWorldMap: () => void; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="navigator panel-surface" role="dialog" aria-modal="true" aria-labelledby="nav-title">
        <header><div><span className="eyebrow">Portal network</span><h2 id="nav-title">Choose a destination</h2></div><button className="icon-close" onClick={onClose} aria-label="Close navigation"><X /></button></header>
        <button className="world-map-tile" onClick={onWorldMap}><span className="world-map-icon"><Map /></span><span><strong>Village / World Map</strong><small>Return to the world</small><p>Close the portfolio layer and continue exploring the village.</p></span><ChevronRight /></button>
        <div className="destination-grid">
          {destinations.map((d, index) => (
            <button key={d.id} className="destination-tile" onClick={() => onTravel(d.id)} style={{ "--accent": d.accent } as React.CSSProperties}>
              <span className="destination-number">0{index + 1}</span><i /><div><strong>{d.worldName}</strong><small>{d.title}</small><p>{d.description}</p></div>
              <span className="visited-badge">{visited.includes(d.id) ? "Visited" : "Unvisited"}</span><ChevronRight />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsPanel({ prefs, nightAmount, setPrefs, onSound, onClose }: { prefs: UserPreferences; nightAmount: number; setPrefs: React.Dispatch<React.SetStateAction<UserPreferences>>; onSound: () => void; onClose: () => void }) {
  const volume = (bus: AudioBus, key: "musicVolume" | "natureVolume" | "sfxVolume", label: string) => <label className="volume-control">{label}<span>{Math.round(prefs[key] * 100)}%</span><input aria-label={`${label} volume`} type="range" min="0" max="1" step="0.05" value={prefs[key]} onChange={(event) => setPrefs((p) => ({ ...p, [key]: Number(event.target.value) }))} onInput={(event) => ambientAudio.setBusVolume(bus, Number((event.target as HTMLInputElement).value))}/></label>;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="settings panel-surface" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header><div><span className="eyebrow">World controls</span><h2 id="settings-title">Settings</h2></div><button className="icon-close" onClick={onClose} aria-label="Close settings"><X /></button></header>
        <label>Time of day <span>{prefs.theme === "auto" ? `Auto · ${Math.round(nightAmount * 100)}% night` : prefs.theme}</span></label>
        <div className="segmented">
          {(["auto", "day", "night"] as ThemeMode[]).map((theme) => <button key={theme} className={prefs.theme === theme ? "active" : ""} onClick={() => setPrefs((p) => ({ ...p, theme }))}>{theme === "auto" ? <Zap/> : theme === "day" ? <Sun/> : <Moon/>}{theme}</button>)}
        </div>
        <div className="setting-row"><div><strong>World audio</strong><small>Licensed music, birds, wind, river, and portal effects</small></div><button className="toggle" aria-label="World audio" aria-pressed={prefs.sound} onClick={onSound}>{prefs.sound ? <Volume2/> : <VolumeX/>}<span>{prefs.sound ? "On" : "Off"}</span></button></div>
        <div className="volume-grid">{volume("music", "musicVolume", "Music")}{volume("nature", "natureVolume", "Nature")}{volume("sfx", "sfxVolume", "SFX")}</div>
        <div className="setting-row"><div><strong>Reduced effects</strong><small>Short fades and fewer animated particles</small></div><button className="toggle" aria-pressed={prefs.reducedEffects} onClick={() => setPrefs((p) => ({ ...p, reducedEffects: !p.reducedEffects }))}><span>{prefs.reducedEffects ? "On" : "Off"}</span></button></div>
      </section>
    </div>
  );
}

function ContentPanel({ destination, selectedProject, setSelectedProject, remaining, onTravel, onWorldMap, onClose }: { destination: DestinationId; selectedProject: string | null; setSelectedProject: (id: string | null) => void; remaining: ReturnType<typeof destinationById>[]; onTravel: (id: DestinationId) => void; onWorldMap: () => void; onClose: () => void }) {
  const d = destinationById(destination);
  return (
    <div className="content-backdrop">
      <section className="content-panel" role="dialog" aria-modal="true" aria-labelledby="section-title">
        <header className="content-header" style={{ "--accent": d.accent } as React.CSSProperties}>
          <button className="back-to-world" onClick={onClose}><ArrowLeft/> Return outside</button>
          <div><span className="eyebrow">{d.worldName}</span><h2 id="section-title">{d.title}</h2><p>{d.description}</p></div>
          <button className="icon-close" onClick={onClose} aria-label={`Close ${d.title}`}><X /></button>
        </header>
        <div className="content-scroll">
          {destination === "home" && <HomeContent />}
          {destination === "about" && <AboutContent />}
          {destination === "skills" && <SkillsContent />}
          {destination === "projects" && <ProjectsContent selected={selectedProject} setSelected={setSelectedProject} />}
          {destination === "contact" && <ContactContent />}
          <JourneyPrompt destinations={remaining} onTravel={onTravel} onWorldMap={onWorldMap} onStay={() => document.querySelector(".content-scroll")?.scrollTo({ top: 0, behavior: "smooth" })} />
        </div>
      </section>
    </div>
  );
}

function HomeContent() {
  return <div className="bulletin home-bulletin"><span className="pin"/><p className="kicker">Namaste, I’m Sandip.</p><h3>I build dependable systems—and the worlds around them.</h3><p className="large-copy">I’m a full-stack developer in Kathmandu, currently working with Django backend systems while growing into applied AI/ML, game development, and self-hosted infrastructure.</p><div className="home-actions"><a className="action" href="./sandip-sapkota-resume.pdf" download><Download/> Download résumé</a><a className="action secondary" href="#projects"><Compass/> See selected work</a></div><dl className="signal-grid"><div><dt>Current focus</dt><dd>Django · Full stack</dd></div><div><dt>Exploring</dt><dd>AI/ML · Game development</dd></div><div><dt>Based in</dt><dd>Kathmandu, Nepal</dd></div></dl></div>;
}

function AboutContent() {
  return <><div className="two-column"><article className="bulletin"><span className="pin"/><span className="kicker">Character profile</span><h3>Curious across the stack, grounded in practical delivery.</h3><p>I enjoy turning broad problems into working software—from interfaces and APIs to databases, deployment, and the infrastructure beneath them.</p><p>My current professional foundation is backend development with Django. Alongside it, I’m deliberately building deeper full-stack capability and experimenting with applied AI, game systems, and private-cloud infrastructure.</p></article><figure className="profile-frame"><img src="./images/profile pic.jpeg" alt="Sandip Sapkota"/><figcaption>Sandip Sapkota · Kathmandu</figcaption></figure></div><section className="timeline-section"><span className="kicker">Journey log</span><h3>Education & direction</h3><div className="timeline-list">{timeline.map((entry) => <article key={entry.title}><time>{entry.period}</time><div><h4>{entry.title}</h4>{entry.place && <strong>{entry.place}</strong>}<p>{entry.description}</p></div></article>)}</div></section></>;
}

function SkillsContent() {
  return <><div className="section-intro"><span className="kicker">Working inventory</span><h3>Skills tied to evidence, not percentages.</h3><p>Each discipline points back to something built, tested, organized, or deployed.</p></div><div className="skill-grid">{skillGroups.map((group) => <article key={group.title}><span className="skill-rune">{group.title.slice(0, 1)}</span><h4>{group.title}</h4><ul>{group.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul><p><b>Evidence:</b> {group.evidence}</p></article>)}</div><section className="cert-board"><span className="kicker">Certificates earned</span>{certifications.map((certificate) => <p key={certificate}>{certificate}</p>)}</section></>;
}

function ProjectsContent({ selected, setSelected }: { selected: string | null; setSelected: (id: string | null) => void }) {
  const project = projects.find((item) => item.id === selected);
  if (project) return <ProjectDetail project={project} onBack={() => { setSelected(null); history.pushState(null, "", "#projects"); }} />;
  return <><div className="section-intro"><span className="kicker">Selected work</span><h3>Artifacts from the workshop.</h3><p>Open an exhibit for the problem, approach, stack, and available links.</p></div><div className="project-grid">{projects.map((item) => <button key={item.id} className="project-exhibit" onClick={() => { setSelected(item.id); history.pushState(null, "", `#projects/${item.id}`); }}>{item.image ? <img src={item.image} alt="" loading="lazy"/> : <div className="coming-soon"><Zap/><span>Next build</span></div>}<div><span className={`status ${item.status === "In development" ? "building" : ""}`}>{item.status}</span><small>{item.type}</small><h4>{item.title}</h4><p>{item.summary}</p><span className="inspect">Inspect exhibit <ChevronRight/></span></div></button>)}</div></>;
}

function ProjectDetail({ project, onBack }: { project: (typeof projects)[number]; onBack: () => void }) {
  return <article className="project-detail"><button className="text-back" onClick={onBack}><ArrowLeft/> All projects</button><div className="project-detail-grid"><div>{project.image ? <img src={project.image} alt={`${project.title} preview`}/> : <div className="detail-placeholder"><Zap/><span>Case study coming soon</span></div>}</div><div><span className="kicker">{project.type}</span><h3>{project.title}</h3><p className="large-copy">{project.summary}</p><ul className="detail-points">{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul><div className="tech-list">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div><div className="project-links">{project.liveUrl && <a className="action" href={project.liveUrl} target="_blank" rel="noreferrer"><ExternalLink/> View live project</a>}{project.codeUrl && <a className="action secondary" href={project.codeUrl} target="_blank" rel="noreferrer"><GitHub/> View source</a>}</div></div></div></article>;
}

function ContactContent() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setState("sending");
    try {
      const response = await fetch("https://formspree.io/f/xgopjlnz", { method: "POST", body: new FormData(event.currentTarget), headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error();
      event.currentTarget.reset(); setState("success");
    } catch { setState("error"); }
  };
  return <div className="contact-layout"><div><span className="kicker">Open a channel</span><h3>Have a role, system, or unusual idea in mind?</h3><p className="large-copy">I’m interested in full-stack and backend opportunities, thoughtful collaborations, and projects that reward learning.</p><div className="contact-links"><a href="mailto:sandipsapkota001@gmail.com"><Mail/> sandipsapkota001@gmail.com</a><a href="https://github.com/Sandip-1-1" target="_blank" rel="noreferrer"><GitHub/> github.com/Sandip-1-1</a><a href="https://www.linkedin.com/in/sandip-sapkota" target="_blank" rel="noreferrer"><ExternalLink/> LinkedIn</a></div></div><form className="contact-form" onSubmit={submit}><label>Name<input name="name" autoComplete="name" required /></label><label>Email<input type="email" name="email" autoComplete="email" required /></label><label>Message<textarea name="message" rows={5} required /></label><input className="honeypot" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true"/><button className="action" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}<ChevronRight/></button><p className={`form-state ${state}`} role="status">{state === "success" ? "Message sent. I’ll reply as soon as I can." : state === "error" ? "The portal flickered. Please email me directly instead." : "Your details are sent securely through Formspree."}</p></form></div>;
}

function JourneyPrompt({ destinations: next, onTravel, onWorldMap, onStay }: { destinations: ReturnType<typeof destinationById>[]; onTravel: (id: DestinationId) => void; onWorldMap: () => void; onStay: () => void }) {
  return <section className="journey-prompt"><div><span className="kicker">Where next?</span><h3>Continue the journey</h3><p>Travel instantly, return to the village, or stay here a little longer.</p></div><div>{next.slice(0, 4).map((d) => <button key={d.id} onClick={() => onTravel(d.id)}>{d.title}<ChevronRight/></button>)}<button onClick={onWorldMap}>Village / World Map<Map/></button><button className="stay" onClick={onStay}>Stay here</button></div></section>;
}
