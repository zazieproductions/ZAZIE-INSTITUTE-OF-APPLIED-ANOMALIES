import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { loadPrototypes, loadPatents, recordPath, monographPath, archiveStats } from '../data/archive';
import { useCollection } from '../lib/useCollection';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, collectionPageSchema, researchProjectSchema, faqPageSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PageHeader } from '../components/PageHeader';
import { DISCIPLINE_SLUGS, disciplineBySlug } from '../seo/site';
import { ArrowRight, FlaskConical, Layers, FileText, Users } from 'lucide-react';

interface DisciplineMeta {
  name: string;
  slug: string;
  longTitle: string;
  lede: string;
  description: string;
  editorial: string[];
  highlights: string[];
  keywords: string[];
  faqs: { q: string; a: string }[];
  monographLinks: { id: string; label: string }[];
}

// Canonical discipline editorial — each block is unique, ~380–520 words, no templated spam.
// Written to read as legitimate institute copy while embedding long-tail vectors
// for academic and curiosity SERPs (scholar, .edu-adjacent, AI Overviews).
const DISCIPLINE_META: Record<string, DisciplineMeta> = {
  'applied-anomalies': {
    name: 'Applied Anomalies',
    slug: 'applied-anomalies',
    longTitle: 'Applied Anomalies — Nonlinear Acoustics, Hysteresis & Perceptual Edge-Cases',
    lede: 'The founding division of ZIAA. Treats acoustic feedback, material hysteresis, room-mode anomalies and perceptual thresholds as design materials for instruments that sustain, remember and misbehave productively.',
    description: 'Applied Anomalies at ZIAA: nonlinear acoustic feedback, hysteresis-limited resonance and perceptual edge-case instruments. Prototypes, speculative patents and field notes from the anechoic chamber and spatial stage, 2021–2026.',
    editorial: [
      'Every enclosed space has a resonant fingerprint — standing frequencies set by dimensions, wall absorption and air temperature. Most audio engineering treats the moment those frequencies feed back as a failure to suppress. The Applied Anomalies studio inverts that premise: feedback is an instrument, hysteresis is a compositional parameter, and the room itself is a performer.',
      'Our bench work pairs directional hypercardioid and shotgun transducers with soft-clipping JFET optical limiters and fractional all-pass phase rotators. As loop gain approaches saturation, the limiter excites odd-order harmonics instead of collapsing into squeal, yielding self-regulating polyphonic drone that shifts with human movement and HVAC drift. PROT-001 (FEEDBACK-RES) and its successors have been calibrated in Studio A’s anechoic chamber, the Salton Vault’s 18.4-second reverberant bunker, and the Mojave desert array where wind and thermal gradients become part of the score.',
      'Research extends to mineral acoustics — 24-note basalt lithophones driven by solenoid actuators — and to boundary-induced phase inversions that allow two feedback voices to coexist in one room without cancellation. The division publishes failure post-mortems when containment fails (see post-mortems), because the edge of stability is where new instruments are discovered.'
    ],
    highlights: [
      'Self-regulating acoustic feedback with optical hysteresis limiting',
      'Room-mode equilibrium and fractional-delay spatial staging',
      'Mineral lithophone microtonal percussion and piezo harvesting',
      'Laser vibrometry of anomalous boundary reflections'
    ],
    keywords: ['applied anomalies', 'acoustic feedback', 'hysteresis', 'room acoustics', 'nonlinear resonance', 'ZIAA research division'],
    faqs: [
      { q: 'What is an “applied anomaly”?', a: 'At ZIAA an anomaly is a physical or perceptual edge-case — feedback, hysteresis, room-mode reinforcement — treated as a controllable design material rather than a defect to suppress.' },
      { q: 'How does ZIAA prevent runaway feedback?', a: 'Analog optical limiters and phase-compensated gain stages compress primary peaks while exciting harmonics, keeping closed-loop gain below unity at unstable nodes without notch filtering the music away.' },
      { q: 'Can I hear an Applied Anomalies instrument?', a: 'Yes — every prototype dossier includes a playable acoustic profile on the Acoustic Bench. PROT-001, PROT-025 and related resonators are browser-audible via the Web Audio API.' }
    ],
    monographLinks: [
      { id: 'ESSAY-2022-01', label: 'Nonlinear Acoustic Feedback in Architectural Spaces (2022)' },
      { id: 'ESSAY-2024-03', label: 'Spatial Psychoacoustics & Whole-Body Listening (2024)' }
    ]
  },
  'experimental-audio-systems': {
    name: 'Experimental Audio Systems',
    slug: 'experimental-audio-systems',
    longTitle: 'Experimental Audio Systems — Custom Synthesis Hardware & Wave-Terrain Instruments',
    lede: 'Designs and measures complete electroacoustic instruments: analog front-ends, conversion stages, transducer arrays and the code that binds them. From wave-terrain oscillators to 32-channel spatial diffusion engines.',
    description: 'Experimental Audio Systems at ZIAA: custom synthesis hardware, wave-terrain oscillators and spatial diffusion instruments. Bench-calibrated prototypes and defensive patent disclosures, 2021–2026.',
    editorial: [
      'This division builds instruments that do not yet have a product category. A single prototype may contain a discrete transistor VCO, a Teensy 4.1 Cortex-M7 supervisor, a Dante/AES67 network bridge and a machined aluminum acoustic horn — all tuned together, not partitioned into “hardware” and “software.”',
      'Wave-terrain synthesis, physical-modeled resonators and multi-head tape transports recur across the archive. PROT-007’s kinetic percussion automaton and PROT-011’s spinning speaker array translate abstract DSP into moving air with millimetre tolerances. Every bill of materials lists supplier, part number and tolerance because reproducibility is part of the research claim; every acoustic profile is measured on-bench before being offered as a playable preset.',
      'Work is staged between Studio B (Physical Computing) and the field vault, where 64-channel Genelec arrays and laser-Doppler vibrometry validate dispersion and inter-channel phase coherence. Patents in this cluster are defensive publications documenting topologies — e.g., multi-vector joystick morphing of neural latent spaces — so proprietary audio conglomerates cannot enclose them.'
    ],
    highlights: [
      'Wave-terrain and physical-modeling synthesis engines',
      '32- to 64-channel spatial diffusion hardware',
      'Kinetic percussion automata and motorized modulation',
      'Teensy/STM32F4 embedded DSP with Dante/MIDI 2.0'
    ],
    keywords: ['experimental audio systems', 'custom synthesizer', 'wave terrain synthesis', 'spatial audio hardware', 'ZIAA prototypes'],
    faqs: [
      { q: 'What is wave-terrain synthesis?', a: 'A synthesis method where an audio-rate trajectory scans a two-dimensional surface (“terrain”) to generate timbres ranging from harmonic tones to noise — first explored by Horner, Beauchamp and Roads, extended here with real-time GPU terrains.' },
      { q: 'Are ZIAA instruments available commercially?', a: 'No. Prototypes are research instruments, not products. Schematics, BOMs and playable browser models are published openly; physical builds are limited to the bench and field stations.' },
      { q: 'How do I cite a hardware dossier?', a: 'Each prototype page offers a “Cite” action with BibTeX/APA/IEEE and a persistent canonical URL under /prototypes/prot-xxx.' }
    ],
    monographLinks: [
      { id: 'ESSAY-2022-01', label: 'Nonlinear Acoustic Feedback in Architectural Spaces (2022)' },
      { id: 'ESSAY-2023-02', label: 'Media Archaeology of Inscribed Sound (2023)' }
    ]
  },
  'computational-creativity': {
    name: 'Computational Creativity',
    slug: 'computational-creativity',
    longTitle: 'Computational Creativity — Autonomous Musical Agents & Procedural Scoring',
    lede: 'Autonomous agents that compose, listen and negotiate with human performers. Real-time generative polyphony, neural audio resynthesis and adversarial creative search, evaluated as musical systems rather than demos.',
    description: 'Computational Creativity at ZIAA: autonomous musical agents, procedural scores and neural audio resynthesis. Research prototypes, software instruments and monographs on generative composition.',
    editorial: [
      'Computational creativity at ZIAA is practice-led and system-evaluated: an agent is not a metaphor but a persistent software entity with memory, taste, and failure modes. Early agents (2021–22) used Markov and constraint logic; later generations employ latent audio encoders that traverse learned timbre spaces under joystick or gestural control.',
      'The division’s signature artifact is the real-time neural latent audio resynthesizer — a multi-vector instrument that morphs continuously between source spectra without MIDI note quantization. Performers navigate a 2-D latent map; the system proposes voice-leading that the performer can accept, contest or redirect. A sister lineage explores autonomous procedural scoring for the Svalbard and Mojave arrays, where long-duration field recordings become training signals for site-specific generators.',
      'Evaluation privileges durational listening and peer critique over benchmark scores. Every generative prototype is documented with audio profiles, failure post-mortems when agents diverge, and monograph treatment of aesthetic commitments.'
    ],
    highlights: [
      'Neural latent audio resynthesis with multi-vector joystick',
      'Autonomous procedural scoring for field stations',
      'Constraint-based polyphony and real-time voice leading',
      'WebAssembly/WASM DSP with <2 ms round-trip via AudioWorklet'
    ],
    keywords: ['computational creativity', 'generative composition', 'neural audio resynthesis', 'autonomous music agent', 'ZIAA software research'],
    faqs: [
      { q: 'How is ZIAA’s generative music different from prompt-to-music AI?', a: 'Our agents are small, site-specific and instrument-like — they run locally, respond to continuous gesture, and are designed for live negotiation with a performer, not one-shot prompt rendering.' },
      { q: 'Can I run a ZIAA creative agent in the browser?', a: 'Yes. The Acoustic Bench and SYNTHESIS//SIGNAL host browser-native prototypes; many include a Playable Acoustic Emission Bench with published presets.' },
      { q: 'How does ZIAA evaluate creative autonomy?', a: 'Through sustained artistic use, peer review, and documented failure cases — not through proxy metrics alone. Monographs discuss aesthetic criteria explicitly.' }
    ],
    monographLinks: [
      { id: 'ESSAY-2025-05', label: 'Autonomous Audio Agents & Latent Composition (2025)' },
      { id: 'ESSAY-2024-03', label: 'Spatial Psychoacoustics (2024)' }
    ]
  },
  'speculative-engineering': {
    name: 'Speculative Engineering',
    slug: 'speculative-engineering',
    longTitle: 'Speculative Engineering — Design Fiction Hardware & Counterfactual Instruments',
    lede: 'Inventor’s-office meets design fiction: multi-head tape machines that never shipped, glass speakers that should not work, and the patents that would have protected them — written as research to keep them unownable.',
    description: 'Speculative Engineering at ZIAA: design-fiction hardware, mechanical tape systems and counterfactual instruments. Speculative patent dossiers and physical prototypes that keep topologies open.',
    editorial: [
      'Speculative engineering is not concept art. Every dossier in this division has a measured schematic, a tolerance-stamped bill of materials and an anomaly note where physics pushes back. The “speculative” qualifier signals temporal position — an instrument from an adjacent history — not a lack of bench reality.',
      'Artifacts include four-head kinetic tape transports that treat wow and flutter as modulation sources, ceramic transducers that excite glass resonance, and horizon-scale infrasound horns tested in the Atacama micro-barometer array. The patent archive is deliberately written in patent register (abstract, independent/dependent claims, prior-art critique, counsel memo) as a defensive publication tactic: by disclosing topologies openly, we prevent predatory enclosure by entities that did not build them.',
      'This division attracts the most ARG-curious attention — “lost” technologies, number-station aesthetics — and carries the strongest disclaimer obligations. All speculative disclosures are labeled as internal research disclosures, not issued patents, on both dossier and legal pages.'
    ],
    highlights: [
      'Design-fiction hardware with measured engineering specs',
      'Kinetic multi-head tape and ceramic transduction',
      'Defensive publication as open-hardware strategy',
      'Glass-resonance and infrasound horn field tests'
    ],
    keywords: ['speculative engineering', 'design fiction hardware', 'counterfactual instruments', 'defensive publication', 'ZIAA speculative patents'],
    faqs: [
      { q: 'Are ZIAA speculative patents real USPTO filings?', a: 'No. They are creative-technology disclosures written in patent register for research and defensive-publication purposes, as stated on every patent page and the institutional disclaimer.' },
      { q: 'Why publish in patent language at all?', a: 'To describe inventions with legal precision while deliberately dedicating them to the public domain, blocking predatory patent encumbrance on physical and software topologies developed at ZIAA.' },
      { q: 'Where can I see the hardware?', a: 'Prototype dossiers under /prototypes linked from each patent show photos/schematics, BOMs and a playable acoustic model where applicable.' }
    ],
    monographLinks: [
      { id: 'ESSAY-2023-02', label: 'Media Archaeology of Inscribed Sound (2023)' }
    ]
  },
  'perceptual-interfaces': {
    name: 'Perceptual Interfaces',
    slug: 'perceptual-interfaces',
    longTitle: 'Perceptual Interfaces — Haptic, Tactile & Whole-Body Listening Surfaces',
    lede: 'Interfaces that return sound to the body: motorized faders that push back, floor arrays that let you stand inside a filter, and microtonal keyboards that retune under your fingers.',
    description: 'Perceptual Interfaces at ZIAA: haptic controllers, tactile acoustic floors and microtonal touch surfaces. Bench studies on embodied listening and vibrotactile spatialization.',
    editorial: [
      'If loudspeakers put sound “over there,” perceptual interfaces put it “through here.” The division’s lineage begins with motorized resistance in microtonal keyboards — keys that re-weight as tuning shifts — and extends to a 128-point somatosensory floor array on which low-frequency content is rendered as standing-wave pressure underfoot.',
      'Technical work centers on closed-loop haptics with sub-millisecond latency, capacitive polyphonic pressure sensing, and psychoacoustic validation. The 128-floor was evaluated with whole-body categorical perception studies; results showed listeners can localize narrowband content via plantar vibration with accuracy comparable to interaural time differences below 80 Hz. The microtonal surface couples just-noticeable-difference pitch metrics to motor torque, so a performer feels when they are between tunings.',
      'Published interfaces are accompanied by task-based evaluations, hazard notes where actuators can pinch or overheat, and browser proxies where haptics are simulated via audio-reactive visuals in SPECTRA//LAB.'
    ],
    highlights: [
      '128-point tactile somatosensory floor for vibrotactile spatialization',
      'Motorized microtonal keyboards with per-key resistance',
      'Polyphonic capacitive pressure + WASM gesture tracking',
      'Psychoacoustic studies of whole-body low-frequency perception'
    ],
    keywords: ['perceptual interfaces', 'haptic audio', 'tactile sound interface', 'microtonal keyboard', 'embodied listening'],
    faqs: [
      { q: 'Can I test a tactile floor online?', a: 'The floor itself is site-specific, but its mapping is simulated in the browser: SPECTRA//LAB renders vibrotactile zones as audiovisual fields you can explore with pointer/touch.' },
      { q: 'What does “whole-body listening” mean?', a: 'Low-frequency sound (20–80 Hz) is perceived vibrotactilely through skin and bone, not only audition. ZIAA studies how spatial information can be delivered through floor and furniture transduction.' },
      { q: 'Are haptic interfaces safe?', a: 'Each dossier lists hazard warnings. Motor torque is current-limited and thermally protected; the archive documents containment protocols when actuators diverge.' }
    ],
    monographLinks: [
      { id: 'ESSAY-2024-03', label: 'Spatial Psychoacoustics & Whole-Body Listening (2024)' }
    ]
  },
  'generative-software': {
    name: 'Generative Software',
    slug: 'generative-software',
    longTitle: 'Generative Software — Low-Latency DSP, Spatialization & Live-Coding Engines',
    lede: 'The soft half of hard instruments: AudioWorklet kernels, ambisonic spatialization and WebAssembly live-coding environments that run with sub-millisecond jitter and survive on stage.',
    description: 'Generative Software at ZIAA: real-time DSP engines, ambisonic spatialization and browser-native live-coding systems. Source-audible research tools with open DSP topologies.',
    editorial: [
      'Generative software at ZIAA is performance infrastructure, not plugin commodity. The audio graph runs on dedicated AudioWorklet threads with zero-allocation loops, pooled buffers and explicit GC exclusion, verified under Chrome’s real-time tracing. Pitch detection, granular time-stretching and convolution reverbs operate at 64–128 sample frames to keep performer-perceived latency under 3 ms.',
      'Signature outputs include a 64-point ambisonic decoder calibrated in the Salton Vault, a WebAssembly wavetable interpolator that withstands live code hot-swaps without glitches, and the SYNTHESIS//SIGNAL Three.js environment where geometry and sound share one clock. Each software prototype documents CPU load, memory ceiling and browser matrix (Chromium baseline, Firefox/Safari advisory).',
      'This stack also powers the archive’s curiosity engine: the four browser instruments are its most linked and longest-dwell pages. Their SoftwareApplication JSON-LD, live consoles and shareable presets give search engines and recommendation systems durable behavioral signals that generic text pages cannot.'
    ],
    highlights: [
      'AudioWorklet DSP with zero-allocation real-time kernels',
      '64-point ambisonic spatialization calibrated in-field',
      'WebAssembly wavetable & granular engines',
      'Live-coding environments with hot-swap-safe audio graphs'
    ],
    keywords: ['generative software', 'Web Audio DSP', 'AudioWorklet', 'ambisonic spatialization', 'live coding audio'],
    faqs: [
      { q: 'Do ZIAA browser instruments require installation?', a: 'No. They run entirely in the browser (Chromium recommended) via Web Audio, Canvas and WebGL. No account or download is required.' },
      { q: 'Are the DSP sources available?', a: 'Topologies are disclosed in dossiers and monographs under the open-research charter. Production source for hosted instruments is released as browser-native code, not as a packaged SDK.' },
      { q: 'What is ambisonic spatialization?', a: 'A mathematical framework for encoding and decoding soundfields to arbitrary speaker layouts, preserving directional information independent of channel count. ZIAA calibrates up to 64-channel decodes.' }
    ],
    monographLinks: [
      { id: 'ESSAY-2025-05', label: 'Autonomous Audio Agents (2025)' }
    ]
  },
  'signal-archaeology': {
    name: 'Signal Archaeology',
    slug: 'signal-archaeology',
    longTitle: 'Signal Archaeology — Optical Recovery & Media Forensics for Fragile Sound Carriers',
    lede: 'Sound from stone, glass and wax without touching them. Laser triangulation, confocal profilometry and artifact-isolation that recovers audio from surfaces previously considered unplayable.',
    description: 'Signal Archaeology at ZIAA: optical laser recovery of fragile historical audio carriers, artifact-isolation and non-contact groove reconstruction. Field and lab research 2021–2026.',
    editorial: [
      'Mechanical playback destroys what it preserves: a stylus exerts grams of force on grooves already fractured by age, mold and heat. Signal archaeology decouples recovery from wear. The division’s core apparatus — a 405 nm blue semiconductor laser projecting a knife-edge across a groove wall, captured by a high-speed linear CMOS sensor at 200 kfps — extracts stereo audio directly from surface geometry.',
      'The raw scan contains music and damage together: dust fibers, mold pitting and handling fissures all modulate the sensor. Our contribution is artifact isolation via curvature invariants — intentional acoustic cuts obey acceleration limits set by original recording horns, while damage exhibits steep vertical edges. That distinction lets us flag and bridge faults without dulling transients. Case studies include 1898–1912 wax cylinders with indigenous oral poetry and laboratory tuning-fork tests recovered after being listed as “unplayable.”',
      'Field deployments tie lab forensics to landscape listening: VLF radio loops at the Mojave and Atacama arrays monitor the electromagnetic sky, while optical scanning is tested on ceramic and glass fragments that were never intended to hold sound at all. Peer dossier ESSAY-2023-02 documents the method and four full restorations.'
    ],
    highlights: [
      '405 nm laser triangulation at 200,000 frames/sec',
      'Artifact-isolation via groove-curvature invariants',
      'Restoration of 1898–1912 cylinders & fragmented carriers',
      'VLF/atmospheric listening at desert and high-Atacama arrays'
    ],
    keywords: ['signal archaeology', 'optical audio recovery', 'laser groove scanning', 'archival audio restoration', 'media archaeology sound'],
    faqs: [
      { q: 'How does optical audio recovery work?', a: 'A laser measures micron-scale lateral displacement of groove walls without contact; software converts geometric displacement into an audio waveform and separates damage by curvature analysis.' },
      { q: 'What kinds of carriers can be recovered?', a: 'Wax cylinders, acetate discs, lacquer and even fractured ceramic/glass surfaces with accidental acoustic impressions. The limit is geometric legibility, not original playability.' },
      { q: 'Is the recovered audio high fidelity?', a: 'Yes where the groove wall survives. Our 192 kHz-equivalent reconstructions preserve transients and stereo geometry; severely fractured regions are bridged algorithmically with documented provenance.' }
    ],
    monographLinks: [
      { id: 'ESSAY-2023-02', label: 'Media Archaeology of Inscribed Sound (2023)' }
    ]
  },
  'acoustic-architecture': {
    name: 'Acoustic Architecture',
    slug: 'acoustic-architecture',
    longTitle: 'Acoustic Architecture — Spatial Listening Stations, Resonant Vaults & Sonic Pavilions',
    lede: 'Buildings that are instruments and landscapes that are archives. Multi-channel domes, subterranean vaults and coastal pavilions where space is tuned as deliberately as circuitry.',
    description: 'Acoustic Architecture at ZIAA: spatial speaker domes, subterranean vaults and field-station listening pavilions. Sound installations and architectural-acoustic research.',
    editorial: [
      'Acoustic architecture at ZIAA spans two scales: the constructed listening room and the found landscape as listening room. Both are measured, not metaphorized. The Salton Subterranean Vault — a 2,400 m² reinforced bunker with an 18.4-second RT60 — serves as an instrument for feedback and ambisonic staging experiments that would destroy a normal room. At the other extreme, desert and coastal field stations are “buildings” with kilometre-scale footprints — distributed microphone, geophone and VLF arrays that turn wind, seismic and atmospheric activity into compositional material.',
      'Built work includes a 32-channel desert sanctuary geodesic array, a sub-glacial 16-channel hydrophone string in Svalbard fjords, and a low-impact coastal pavilion tuned for 1–24 kHz field work. Each station dossier publishes channel count, bandwidth, footprint, coordinates (DMS + GeoCoordinates JSON-LD), instrumentation list and public-access protocol — not as travel brochure but as replication spec for researchers and artists who need to know what a site can hear.',
      'The division closed the loop between architecture and software: vault impulse responses are sampled for convolution engines that let any browser instrument briefly inhabit the vault. This tight cross-link — place ↔ prototype ↔ software — is the entity’s strongest topical cluster for “spatial audio,” “acoustic architecture” and long-tail field-recording queries.'
    ],
    highlights: [
      'Subterranean vault with 18.4 s RT60 and 64-channel Genelec array',
      'Distributed desert, Arctic and Atacama field stations',
      'Architectural impulse responses as convolution reverbs',
      'Kilometre-scale VLF and geophone listening arrays'
    ],
    keywords: ['acoustic architecture', 'spatial audio installation', 'listening station', 'reverberant vault', 'field station design'],
    faqs: [
      { q: 'Can I visit a ZIAA field station?', a: 'Some stations host seasonal fellowships (Mojave, coastal pavilion); others are classified engineering sites. Each station page lists its public-access protocol.' },
      { q: 'What is the Salton Vault?', a: 'A subterranean concrete installation vault under ZIAA stewardship with extreme natural reverberation, used for feedback, ambisonic and physical-modeling calibration.' },
      { q: 'How accurate are station coordinates?', a: 'Coordinates are published in DMS and as GeoCoordinates JSON-LD for transparency. Precision is limited for safety-sensitive sites; see each dossier for the maintained coordinate vs. obfuscated public view.' }
    ],
    monographLinks: [
      { id: 'ESSAY-2024-03', label: 'Spatial Psychoacoustics (2024)' },
      { id: 'ESSAY-2022-01', label: 'Nonlinear Acoustic Feedback (2022)' }
    ]
  }
};

const ALL_SLUGS = Object.keys(DISCIPLINE_META);

export const DisciplineHub: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const key = slug?.toLowerCase() ?? '';
  const meta = DISCIPLINE_META[key];

  const prototypes = useCollection(loadPrototypes);
  const patents = useCollection(loadPatents);

  if (!slug) return <Navigate to="/disciplines" replace />;
  if (!meta) return <Navigate to="/404" replace />;

  const protoInDiscipline = prototypes.filter(p => p.discipline === meta.name);
  const patentInDiscipline = patents.filter(p => p.primaryDiscipline === meta.name);

  // Descriptive cross-links — long-tail anchor text is intentional for topical capture
  const crumbs = [
    { name: 'ZIAA', path: '/' },
    { name: 'Research Divisions', path: '/disciplines' },
    { name: meta.name, path: `/disciplines/${meta.slug}` }
  ];

  const totalRecords = protoInDiscipline.length + patentInDiscipline.length;
  const title = `${meta.name} — Research Division & Laboratory Systems`;
  const description = meta.description;
  const keywords = [...meta.keywords, `${meta.name} research`, 'ZIAA', 'Zazie Institute'];

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title={title}
        description={description}
        path={`/disciplines/${meta.slug}`}
        keywords={keywords}
        jsonLd={[
          breadcrumbSchema(crumbs),
          researchProjectSchema({
            path: `/disciplines/${meta.slug}`,
            name: `${meta.name} — ${meta.longTitle}`,
            description: `${meta.lede} ${meta.editorial[0]}`,
            keywords: meta.keywords
          }),
          collectionPageSchema({
            name: `${meta.name} — Prototype & Patent Archive`,
            description,
            path: `/disciplines/${meta.slug}`,
            about: meta.keywords,
            items: [
              ...protoInDiscipline.map(p => ({
                name: `${p.id} ${p.codeName} — ${p.title}`,
                path: recordPath('prototype', p.id)
              })),
              ...patentInDiscipline.map(p => ({
                name: `${p.id} — ${p.title}`,
                path: recordPath('patent', p.id)
              }))
            ],
            maxItems: 200
          }),
          faqPageSchema(meta.faqs)
        ]}
      />

      <PageHeader
        crumbs={crumbs}
        stamp={`RESEARCH DIVISION // ${meta.name.toUpperCase()}`}
        kicker="INTERDISCIPLINARY LABORATORY & ARCHIVAL CLUSTER"
        title={<>{meta.longTitle}</>}
        lede={meta.lede}
        aside={
          <div className="text-right text-xs font-mono text-zinc-300 bg-[#020509] px-3.5 py-2.5 border border-[#1b2636] rounded-md shrink-0 space-y-1">
            <div>
              <span className="text-zinc-400">PROTOTYPES:</span>{' '}
              <strong className="text-[#dfb76c]">{protoInDiscipline.length}</strong> ·{' '}
              <span className="text-zinc-400">PATENTS:</span>{' '}
              <strong className="text-cyan-300">{patentInDiscipline.length}</strong>
            </div>
            <div className="text-[11px] text-zinc-400">{totalRecords} indexed records · 2021–2026</div>
          </div>
        }
      />

      {/* Editorial */}
      <section aria-labelledby="division-editorial" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 md:p-7 space-y-4 leading-relaxed">
        <h2 id="division-editorial" className="text-lg font-bold text-white tracking-wide">Division overview & research program</h2>
        <div className="space-y-3.5 text-sm text-zinc-300">
          {meta.editorial.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="bg-[#03060a] border border-[#1b2738] rounded-lg p-4">
            <h3 className="text-[11px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" /> Core investigations
            </h3>
            <ul className="space-y-1.5 text-xs text-zinc-300">
              {meta.highlights.map(h => (
                <li key={h} className="flex items-start gap-2">
                  <span className="mt-1 w-1 h-1 bg-[#dfb76c] rounded-full shrink-0" aria-hidden="true" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#03060a] border border-[#1b2738] rounded-lg p-4">
            <h3 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Related treatises
            </h3>
            <ul className="space-y-2 text-xs">
              {meta.monographLinks.map(m => (
                <li key={m.id}>
                  <Link to={monographPath(m.id)} className="text-cyan-300 hover:text-white hover:underline underline-offset-2">
                    {m.label} — {m.id}
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-[#1b2636] text-[11px] font-mono text-zinc-500">
                Full series: <Link to="/monographs" className="text-zinc-300 hover:text-white underline">ZIAA Transactions (8 volumes)</Link> ·{' '}
                <Link to="/research-notes" className="text-zinc-300 hover:text-white underline">{archiveStats.totalLogs} research notes</Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Prototype cluster */}
      <section aria-labelledby="proto-cluster" className="bg-[#05080f] border border-[#213045] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1b2636] pb-3">
          <h2 id="proto-cluster" className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#dfb76c]" aria-hidden="true" />
            Prototypes in {meta.name} — {protoInDiscipline.length} instrument systems
          </h2>
          <Link to={`/prototypes?discipline=${encodeURIComponent(meta.name)}`} className="text-xs font-mono text-zinc-400 hover:text-[#dfb76c]">
            Filtered prototype view →
          </Link>
        </div>
        {protoInDiscipline.length === 0 ? (
          <p className="text-sm text-zinc-400">No prototypes indexed under this discipline — see adjacent divisions.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-label={`${meta.name} prototypes`}>
            {protoInDiscipline.map(p => (
              <li key={p.id} className="bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/60 rounded-lg p-4 transition-all group">
                <Link to={recordPath('prototype', p.id)} className="block space-y-1.5">
                  <div className="text-[11px] font-mono font-bold text-[#dfb76c] group-hover:text-white">
                    {p.id} // {p.codeName} · {p.operationalBandwidth} · {p.clearance}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-[#dfb76c] leading-snug">{p.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{p.abstract}</p>
                  <div className="text-[11px] font-mono text-zinc-500 pt-1">
                    {p.leadResearcher} · {p.year} · {p.status.replace(/_/g, ' ')}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Patent cluster */}
      <section aria-labelledby="patent-cluster" className="bg-[#05080f] border border-[#213045] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1b2636] pb-3">
          <h2 id="patent-cluster" className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            Speculative patent disclosures — {patentInDiscipline.length} defensive publications
          </h2>
          <Link to="/patents" className="text-xs font-mono text-zinc-400 hover:text-cyan-300">Full patent archive →</Link>
        </div>
        {patentInDiscipline.length === 0 ? (
          <p className="text-sm text-zinc-400">No patent disclosures assigned to this division — see cross-linked prototypes.</p>
        ) : (
          <ul className="space-y-2.5" aria-label={`${meta.name} patents`}>
            {patentInDiscipline.map(p => (
              <li key={p.id} className="bg-[#03060a] border border-[#1b2738] hover:border-cyan-500/50 rounded-lg p-4 transition-all group">
                <Link to={recordPath('patent', p.id)} className="block">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-cyan-400 group-hover:text-white">{p.id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#0b1522] border border-cyan-800/50 text-cyan-300 rounded">{p.patentNumber}</span>
                    <span className="text-[11px] font-mono text-zinc-500">{p.filingDate} · {p.status.replace(/_/g, ' ')}</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-300 leading-snug">{p.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">{p.abstract}</p>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1.5">Inventors: {p.inventors.join(', ')}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* FAQ — PAA & AI-Overview capture */}
      <section aria-labelledby="division-faq" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
        <h2 id="division-faq" className="text-sm font-bold text-white tracking-wide">Frequently asked — {meta.name} at ZIAA</h2>
        <dl className="space-y-4 text-sm">
          {meta.faqs.map(f => (
            <div key={f.q} className="border-l-2 border-[#dfb76c]/60 pl-4">
              <dt className="font-bold text-zinc-100">{f.q}</dt>
              <dd className="text-zinc-300 leading-relaxed mt-1">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Cross-division navigation — distributes PageRank and topical adjacency */}
      <nav aria-label="Related research divisions" className="bg-[#05080f] border border-[#1b2738] rounded-xl p-5">
        <h2 className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">Explore adjacent research divisions</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {Object.entries(DISCIPLINE_SLUGS)
            .filter(([, s]) => s !== meta.slug)
            .slice(0, 8)
            .map(([name, s]) => (
              <li key={s}>
                <Link to={`/disciplines/${s}`} className="block p-3 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/50 rounded-lg group">
                  <div className="font-bold text-zinc-200 group-hover:text-[#dfb76c]">{name}</div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1">/disciplines/{s}</div>
                </Link>
              </li>
            ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-mono border-t border-[#1b2636] pt-3">
          <Link to="/disciplines" className="text-zinc-300 hover:text-white underline">All 8 research divisions →</Link>
          <span className="text-zinc-600">·</span>
          <Link to="/prototypes" className="text-[#dfb76c] hover:underline">Prototype archive ({archiveStats.totalPrototypes}) →</Link>
          <span className="text-zinc-600">·</span>
          <Link to="/monographs" className="text-cyan-400 hover:underline">Monographs →</Link>
          <span className="text-zinc-600">·</span>
          <Link to="/field-stations" className="text-amber-400 hover:underline">Field stations →</Link>
        </div>
      </nav>

      {/* Instrument tools — dwell-time anchors */}
      <p className="text-[11px] font-mono text-zinc-500 text-center border-t border-[#1b2636] pt-4">
        Interactive instruments: <Link to="/acoustic-bench" className="text-emerald-400 hover:underline">Acoustic Bench — Web Audio DSP workstation</Link> ·{' '}
        <Link to="/spectra-lab" className="text-cyan-400 hover:underline">SPECTRA//LAB — 64-band spectral console</Link> ·{' '}
        <Link to="/synthesis-signal" className="text-violet-300 hover:underline">SYNTHESIS//SIGNAL — audio-reactive Three.js</Link> ·{' '}
        <Link to="/void-oculus" className="text-violet-300 hover:underline">VOID//OCULUS — spatial canvas</Link>
      </p>
    </div>
  );
};

export default DisciplineHub;
