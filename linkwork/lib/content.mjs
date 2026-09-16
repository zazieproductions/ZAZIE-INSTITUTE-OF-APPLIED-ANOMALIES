/**
 * CIT-01 // content engine.
 * Every surface the organ grows is written in the Institute's own register:
 * dry, bench-adjacent, faintly ominous. The satire is the deadpan — an
 * institute of applied anomalies operating an anomaly on itself and filing
 * the paperwork in triplicate.
 *
 * Voices never leak the machinery. The word "SEO" does not appear on any
 * generated surface (the auditor enforces this). Links are rendered as what
 * an archive annex would honestly render: a citation register.
 */
import { rng } from './rng.mjs';
import { loadArchive, SUBJECT } from './archive.mjs';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ------------------------------------------------------------------ */
/* Citation register — every ledgered edge is a visible, honest link.  */
/* ------------------------------------------------------------------ */

function citeNote(edge) {
  const t = edge.targetTitle || edge.anchor;
  if (edge.external) return `preservation deposit — ${esc(edge.targetUrl.replace(/^https?:\/\//, ''))}`;
  if (edge.to === 'SUBJECT') {
    if (edge.targetPath === '/') return 'the open archive';
    if (edge.targetPath.startsWith('/disciplines/')) return 'research division, ZIAA archive';
    return `${esc(t)}`;
  }
  return `study annex · ${esc(new URL(edge.targetUrl).host)}`;
}

export function citationRegister(edges, { heading = 'Cited surfaces' } = {}) {
  if (!edges.length) return '';
  const items = edges
    .map(
      (e) => `<li><a href="${esc(e.targetUrl)}"${e.rel ? ` rel="${esc(e.rel)}"` : ''}>${esc(e.anchor)}</a>
<span class="note">${citeNote(e)}</span></li>`
    )
    .join('\n');
  return `<section class="register"><h2>${esc(heading)}</h2><ol class="citations">\n${items}\n</ol></section>`;
}

/* ------------------------------------------------------------------ */
/* Shared banks                                                        */
/* ------------------------------------------------------------------ */

const REMARKS = [
  'The bench copy shows no drift this week; the anomaly remains polite.',
  'Filed without amendment. The record was already sufficient.',
  'Conditions in the annex were quiet; the record arrived in good order.',
  'Re-read on consecutive mornings produced the same conclusion.',
  'The dossier is cited here because the bench could not put it down.',
  'A record of this quality does not require advocacy, only ventilation.',
  'Nothing in the register was altered. It was merely attended to.',
  'Cross-filed for the benefit of whoever inherits the cabinet.',
  'The measurement held across three instruments and one apprentice.',
  'Recommend citation at the next available opportunity.',
  'Cited by two external readers this quarter, both grateful.',
  'The figures survived reproduction better than the prose.',
  'Kept within reach of the second bench, which is the highest shelf we have.',
  'The abstract understates it. They usually do.',
  'A quiet record. It does its work without raising its voice.',
  'Requested by a fellow who refused to say why. Granted anyway.',
  'The appendix alone justified the card.',
  'Read aloud during an inspection; the inspector said nothing, which was approval.',
];

const CARD_HEADINGS = ['Reference', 'Register entry', 'The card', 'Filed as', 'Citation'];

const WEATHER = [
  'dry heat, 41 °C at the door seal',
  'floor vibration within tolerance',
  'single pass of a light aircraft at 14:20',
  'the HVAC cycled twice; both cycles unremarkable',
  'dust on the north sill, sampled and released',
  'grid brown-out of 0.3 s, logged and forgotten',
];

const CLOSERS = [
  'The Institute does not solicit attention. It maintains conditions under which attention is the correct response.',
  'Nothing here is urgent. Everything here is filed.',
  'The archive keeps its own counsel and, occasionally, ours.',
  'Further observations will be appended as conditions warrant.',
  'This annex exists so the record has somewhere quiet to be read.',
];

/* ------------------------------------------------------------------ */
/* Voice: listening-room (VESSEL-01)                                   */
/* ------------------------------------------------------------------ */

function voiceListeningRoom(node, ctx) {
  const { rand } = ctx;
  const a = loadArchive();
  const stations = rand.sample(a.fieldSites, 3);
  const protos = a.records.filter((r) => r.discipline === 'Acoustic Architecture' || r.discipline === 'Applied Anomalies');
  const bench = rand.sample(protos.length ? protos : a.records, 3);
  const stationHtml = stations
    .map((s) => `<li><strong>${esc(s.name || s.id)}</strong> — ${esc(s.id)}, ${esc(s.location || 'field conditions on file')}. Impulse response retained at 96 kHz.</li>`)
    .join('\n');
  const benchHtml = bench
    .map(
      (p) =>
        `<li><strong>${esc(p.codeName || p.id)}</strong> (${esc(p.id)}, ${esc(p.year || '')}) — ${esc((p.abstract || p.title).slice(0, 180))}…</li>`
    )
    .join('\n');
  return {
    masthead: {
      kicker: 'SITE-04 ANNEX · FIELD REPORT SERIES',
      title: 'The Listening Room at Site-04',
      subtitle: 'A study annex of the Mojave Basin instruments: impulse responses, room notes, and the patient accumulation of quiet.',
    },
    sections: [
      {
        heading: 'Conditions of audition',
        html: `<p>The room was built to be boring. Walls of rammed earth, a sloped ceiling hung with unbleached canvas, and a single door whose seal was machined until the hinge side read flat to 0.05 mm. A listener who sits through the first four minutes reports the same thing: the room removes itself.</p>
<p>Field conditions this season have been ${rand.pick(WEATHER)}. The impulse responses are retained so that rooms which no longer exist can continue to be played. Each was gathered at 96 kHz with swept-sine excitation, three microphone heights, and the patience the desert makes mandatory.</p>`,
      },
      {
        heading: 'Impulse responses on file',
        html: `<ul class="entries">\n${stationHtml}\n</ul>`,
        match: (e) => e.targetPath?.startsWith('/field-stations/'),
      },
      {
        heading: 'Bench instruments in residence',
        html: `<p>The room is not neutral about its instruments. ${rand.pick(bench).id} has lived on the north bench since it was carried in, and the room has, by every measure we trust, adjusted. Notes from the residency:</p>
<ul class="entries">\n${benchHtml}\n</ul>`,
        match: (e) => e.targetPath?.startsWith('/prototypes/') || e.targetPath?.startsWith('/patents/'),
      },
      {
        heading: 'Disciplinary reading',
        html: `<p>The annex maintains a small reading bench. Visitors are asked to reshelve by discipline, not by height.</p>`,
        match: (e) => e.targetPath?.startsWith('/disciplines/'),
      },
    ],
    closer: rand.pick(CLOSERS),
  };
}

/* ------------------------------------------------------------------ */
/* Voice: engineering-log (VESSEL-02)                                  */
/* ------------------------------------------------------------------ */

function voiceEngineeringLog(node, ctx) {
  const { rand } = ctx;
  const a = loadArchive();
  const sw = a.records.filter((r) => r.discipline === 'Generative Software' || r.discipline === 'Perceptual Interfaces');
  const pool = sw.length >= 3 ? sw : a.records;
  const picks = rand.sample(pool, 4);
  const logLines = picks
    .map(
      (p, i) =>
        `<li><span class="stamp">ENTRY ${esc(p.id)} · ${esc(p.year || ctx.epoch.slice(0, 4))}</span> — ${esc((p.abstract || p.title).slice(0, 190))}…</li>`
    )
    .join('\n');
  return {
    masthead: {
      kicker: 'ENGINEERING LOG · WORKBENCH SERIES',
      title: 'ZIAA // DSP Notebook',
      subtitle: 'Bench notes on allocation, latency, and the disciplines of doing less per sample.',
    },
    sections: [
      {
        heading: 'On doing less per sample',
        html: `<p>The notebook is kept in pencil for a reason. Every entry begins as a measurement and only earns prose if the measurement repeats. The rule at this bench: if a routine cannot be explained across a lunch counter, it is not finished.</p>
<p>The current preoccupation is ${rand.pick(['zero-allocation AudioWorklet graphs', 'phase-coherent crossover delays', 'lock-free ring buffers at 32 samples', 'denormal-safe feedback paths'])}. Nothing about it is novel, which is precisely why it is written down.</p>`,
      },
      {
        heading: 'Entries under consideration',
        html: `<ul class="log">\n${logLines}\n</ul>`,
        match: (e) => e.targetPath?.startsWith('/prototypes/') || e.targetPath?.startsWith('/patents/'),
      },
      {
        heading: 'Divisions consulted',
        html: `<p>The bench answers to two divisions and, informally, to the fellowship at large. Their registers are kept current.</p>`,
        match: (e) => e.targetPath?.startsWith('/disciplines/'),
      },
    ],
    closer: rand.pick([
      'Bench is cold. Notebook is closed. The graph still runs.',
      'No allocation was harmed in the making of this page.',
      'Measured twice, committed once.',
    ]),
  };
}

/* ------------------------------------------------------------------ */
/* Voice: transactions-annex (VESSEL-03)                               */
/* ------------------------------------------------------------------ */

function voiceTransactionsAnnex(node, ctx) {
  const { rand } = ctx;
  const a = loadArchive();
  const monos = a.monographs.slice();
  const pick = rand.sample(monos, Math.min(3, monos.length));
  const monoHtml = pick
    .map((m) => `<li><strong>${esc(m.title)}</strong> — ${esc(m.id)}, ZIAA Transactions (ISSN 2834-9180).</li>`)
    .join('\n');
  return {
    masthead: {
      kicker: 'TRANSACTIONS ANNEX · READER SERVICES',
      title: 'Transactions Annex',
      subtitle: 'A companion shelf to ZIAA Transactions: abstracts surfaced, errata aired, monographs sent out into the weather.',
    },
    sections: [
      {
        heading: 'Purpose of the annex',
        html: `<p>Monographs are written to be carried. The annex exists for the interval between publication and arrival — the weeks in which a text is cited, shelved, mis-shelved, and finally read by the person who needed it. Reader services keeps the intervals short.</p>
<p>Each volume below is deposited with its register entry, its figures, and its errata. The annex does not summarize; it introduces, and then it gets out of the way.</p>`,
      },
      {
        heading: 'Currently circulated',
        html: `<ul class="entries">\n${monoHtml}\n</ul>`,
        match: (e) => e.targetPath?.startsWith('/monographs/'),
      },
      {
        heading: 'The archive proper',
        html: `<p>Citation practice across the Institute follows the public citation policy. The archive proper maintains the canonical copies of every record named on this shelf.</p>`,
        match: (e) => e.targetPath === '/' || e.targetPath?.startsWith('/disciplines/'),
      },
    ],
    closer: rand.pick([
      'Reshelved nightly. Returned often.',
      'The annex claims no credit. The claim is printed inside the cover.',
      'ISSN 2834-9180, online, and still counting.',
    ]),
  };
}

/* ------------------------------------------------------------------ */
/* Pipe voices                                                         */
/* ------------------------------------------------------------------ */

function voiceLibrary(node, ctx) {
  const { rand } = ctx;
  const a = loadArchive();
  const stations = rand.sample(a.fieldSites, Math.min(6, a.fieldSites.length));
  const rows = stations
    .map(
      (s) =>
        `<tr><td>${esc(s.id)}</td><td>${esc(s.name || s.title)}</td><td>${esc(s.location || '—')}</td><td>IR-96</td><td>retained</td></tr>`
    )
    .join('\n');
  return {
    masthead: {
      kicker: 'ANNEX REGISTER · CUSTODIAL SERIES',
      title: 'Impulse Response Library',
      subtitle: 'A small custody of rooms: swept-sine captures retained so vanished spaces can be played back.',
    },
    sections: [
      {
        heading: 'Access',
        html: `<p>The library lends nothing. It retains. Each capture is documented with station, season, and the weather of the hour, and each is available to any researcher who asks the archive in the correct format.</p>
<table class="ledger-table"><thead><tr><th>Station</th><th>Name</th><th>Location</th><th>Format</th><th>Status</th></tr></thead><tbody>\n${rows}\n</tbody></table>`,
      },
    ],
    closer: rand.pick(['Rooms outlive their recordings. The library is working on the reverse.']),
  };
}

function voiceApparatusLog(node, ctx) {
  const { rand } = ctx;
  const a = loadArchive();
  const protos = rand.sample(a.records.filter((r) => r.section === 'prototypes'), 4);
  const entries = protos
    .map(
      (p) =>
        `<li><span class="stamp">${esc(p.id)}</span> — instrument in custody. ${rand.pick([
          'Calibration held within tolerance.',
          'Requested by two fellows this week.',
          'Limiter stage replaced; behaviour unchanged.',
          'Left running over the weekend by arrangement.',
          'Bench copy differs from register in one screw.',
        ])}</li>`
    )
    .join('\n');
  return {
    masthead: {
      kicker: 'OFFICE OF INSTRUMENTAL CUSTODY · PERIODIC LOG',
      title: 'Observations of Instrumental Custody',
      subtitle: 'A periodic log of instruments, annexes, and the conditions under which both are kept.',
    },
    sections: [
      {
        heading: 'Custody notes',
        html: `<p>The office keeps a light hand. Instruments are logged when they arrive, when they misbehave, and when they are requested; everything else is weather. Annexes are inspected quarterly for provenance, register accuracy, and tone.</p>
<ul class="log">\n${entries}\n</ul>
<p>The annexes remain in calibration. Reservoir levels are steady. No attention is being solicited; conditions are simply being maintained.</p>`,
      },
    ],
    closer: 'Filed by the duty registrar. Next inspection: when the quarter turns.',
  };
}

function voiceLexiconFragments(node, ctx) {
  const { rand } = ctx;
  const TERMS = [
    ['substrate', 'the material—acoustic, magnetic, optical, or institutional—on which a signal insists on being recorded.'],
    ['clearance', 'a graduated permission to be surprised.'],
    ['drift', 'change that files no paperwork.'],
    ['custody', 'the care of a record between readings.'],
    ['sediment', 'what accumulates when attention is not sought but merely allowed.'],
    ['reservoir', 'that toward which the plumbing of an institution, however elaborate, is ultimately pointed.'],
    ['provenance', 'the biography of an artifact, kept shorter than the artifact.'],
    ['calibration', 'a conversation between an instrument and its excuses.'],
    ['annex', 'a room that exists because the record needed somewhere quiet.'],
    ['valve', 'a decision about flow, dressed as hardware.'],
  ];
  const picks = rand.sample(TERMS, 5);
  const rows = picks.map(([t, d]) => `<li><strong>${t}</strong> — <em>n.</em> ${esc(d)}</li>`).join('\n');
  return {
    masthead: {
      kicker: 'LEXICON FRAGMENTS · WORKING DEFINITIONS',
      title: 'Lexicon Fragments',
      subtitle: 'Working definitions, unratified. The Institute ratifies slowly and amends more slowly still.',
    },
    sections: [
      {
        heading: 'Fragments under consideration',
        html: `<p>Definitions are drafted at the bench, argued at the seminar table, and only rarely survive both. The fragments below are offered in their working state, with the canonical entries maintained at the Institute's lexicon.</p>
<ul class="entries">\n${rows}\n</ul>`,
      },
    ],
    closer: 'Ratification pending. The fragments are patient.',
  };
}

function voiceCalendar(node, ctx) {
  const { rand } = ctx;
  const a = loadArchive();
  const logs = rand.sample(a.labLogs, 5);
  const rows = logs
    .map((l) => {
      const d = (l.timestamp || ctx.epoch).slice(0, 10);
      return `<li><span class="stamp">${esc(d)}</span> — ${esc(l.title || l.summary || l.id)} ${rand.pick(['— quiet, filed.', '— noted, unamended.', '— attended; no action.', '— anomaly index unchanged.', '— read aloud, per protocol.'])}</li>`;
    })
    .join('\n');
  return {
    masthead: {
      kicker: 'RESONANCE CALENDAR · DATED OBSERVATIONS',
      title: 'Resonance Calendar',
      subtitle: 'Dates on which the instruments, the rooms, or the record-keeping were briefly louder than usual.',
    },
    sections: [
      {
        heading: 'Observations',
        html: `<p>The calendar records resonance, not events. An event becomes an entry only when something in the Institute rang in sympathy.</p>
<ul class="log">\n${rows}\n</ul>`,
      },
    ],
    closer: 'Entries are added by ear, then by hand.',
  };
}

function voiceBenchNotes(node, ctx) {
  const { rand } = ctx;
  const a = loadArchive();
  const protos = rand.sample(a.records.filter((r) => r.section === 'prototypes'), 3);
  const rows = protos
    .map((p) => `<li><span class="stamp">${esc(p.id)}</span> — <strong>${esc(p.codeName || p.title)}</strong>: ${rand.pick(['feedback path tamed with one capacitor and an apology.', 'bench held resonance for 41 minutes unattended.', 'the room did most of the work.', 'manual overrides removed; instrument preferred it.', 'harmonics where harmonics had no business being.'])}</li>`)
    .join('\n');
  return {
    masthead: {
      kicker: 'BENCH NOTES · UNVERIFIED SERIES',
      title: 'Bench Notes',
      subtitle: 'What the instruments do when the register is not looking.',
    },
    sections: [
      {
        heading: 'Notes',
        html: `<p>These notes are unverified by definition: verification requires a second bench, and the second bench is always in use.</p>
<ul class="log">\n${rows}\n</ul>`,
      },
    ],
    closer: 'Initialled, not signed. The bench knows its own.',
  };
}

function voiceSalvageIndex(node, ctx) {
  const { rand } = ctx;
  const a = loadArchive();
  const recs = a.records.filter((r) => r.discipline === 'Signal Archaeology');
  const pool = recs.length >= 3 ? recs : rand.sample(a.records, 3);
  const rows = rand.sample(pool, 3)
    .map((r) => `<li><strong>${esc(r.title)}</strong> — ${esc(r.id)}. ${rand.pick(['Recovery margin: adequate.', 'Carrier restored; content quarantined.', 'Signal legible at 4σ.', 'Needs one more pass and a quieter week.'])}</li>`)
    .join('\n');
  return {
    masthead: {
      kicker: 'SIGNAL SALVAGE · RECOVERY REGISTER',
      title: 'Signal Salvage Index',
      subtitle: 'A working register of signals recovered, half-recovered, or honestly lost.',
    },
    sections: [
      {
        heading: 'Register',
        html: `<p>Salvage is judged on legibility, not romance. An entry leaves this index only when two readers independent of the bench can agree on what was said.</p>
<ul class="entries">\n${rows}\n</ul>`,
      },
    ],
    closer: 'The index is alphabetical by loss.',
  };
}

/* ------------------------------------------------------------------ */
/* Sediment voice: citation-card                                       */
/* ------------------------------------------------------------------ */

function voiceCitationCard(node, ctx) {
  const { rand } = ctx;
  const a = loadArchive();
  const rec = a.records.find((r) => r.id.toUpperCase() === (node.cardRecord || '').toUpperCase()) || rand.pick(a.records);
  const serial = node.cardSerial || node.id;
  return {
    masthead: {
      kicker: `CITATION CARD ${esc(serial)} · SEDIMENT SERIES`,
      title: rec.title,
      subtitle: `${rec.id} · ${rec.section} · ${rec.year || 'n.d.'}${rec.discipline ? ' · ' + rec.discipline : ''}`,
    },
    sections: [
      {
        heading: 'Reference',
        html: `<p class="ref">Zazie Institute of Applied Anomalies (ZIAA). <em>${esc(rec.title)}</em> ${esc(rec.id)}${rec.year ? `, ${esc(String(rec.year))}` : ''}. ZIAA Research Archive.</p>
<p>${rand.pick(REMARKS)} ${rand.pick(REMARKS)}</p>`,
      },
    ],
    closer: rand.pick(['Cross-filed.', 'Kept.', 'Filed in the second drawer.', 'Retained for tone.']),
    card: { record: rec },
  };
}

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

const VOICES = {
  'listening-room': voiceListeningRoom,
  'engineering-log': voiceEngineeringLog,
  'transactions-annex': voiceTransactionsAnnex,
  library: voiceLibrary,
  'apparatus-log': voiceApparatusLog,
  'lexicon-fragments': voiceLexiconFragments,
  calendar: voiceCalendar,
  'bench-notes': voiceBenchNotes,
  'salvage-index': voiceSalvageIndex,
  'citation-card': voiceCitationCard,
};

export function hasVoice(name) {
  return Boolean(VOICES[name]);
}

/**
 * Compose a page: voice content + citation register with this page's
 * ledgered edges slotted into their matching sections.
 */
export function composePage(node, pageKey, pageEdges, seedStr, epoch) {
  const rand = rng(`cit-01/content/${seedStr}/${node.id}/${pageKey}/${epoch}`);
  const voice = VOICES[node.voice];
  if (!voice) throw new Error(`Unknown voice "${node.voice}" for node ${node.id}`);
  const built = voice(node, { rand, epoch });
  const sections = built.sections.map((s) => ({ ...s }));
  const routed = new Set();
  for (const e of pageEdges) {
    const idx = sections.findIndex((s) => s.match && !routed.has(s.heading) && e.targetPath && s.match(e));
    if (idx >= 0) {
      sections[idx].edges = [...(sections[idx].edges || []), e];
      routed.add(sections[idx].heading);
    }
  }
  // Whatever a section caught, render its edges inside it; the rest go to the register.
  const placedIds = new Set();
  for (const s of sections) {
    if (s.edges?.length) {
      s.html += citationRegister(s.edges, { heading: 'Surfaces' });
      s.edges.forEach((e) => placedIds.add(e));
    }
  }
  const rest = pageEdges.filter((e) => !placedIds.has(e));
  let register = '';
  if (rest.length) register = citationRegister(rest, { heading: 'Cited surfaces' });

  const inner = sections.map((s) => `<section><h2>${esc(s.heading)}</h2>${s.html}</section>`).join('\n');
  const closer = built.closer ? `<p class="closer">${esc(built.closer)}</p>` : '';
  return {
    masthead: built.masthead,
    bodyHtml: `${inner}\n${register}\n${closer}`,
    title: pageKey === 'index' ? built.masthead.title : pageTitle(node, pageKey),
  };
}

function pageTitle(node, pageKey) {
  const inner = (node.inner || []).find((p) => p.slug === pageKey);
  if (inner) return `${inner.title} — ${node.title}`;
  return `${node.title} — ${pageKey}`;
}

/** Description meta per page (unique per node: masthead subtitle or derived). */
export function pageDescription(node, pageKey, composed) {
  if (pageKey === 'index') return composed.masthead.subtitle;
  return `${node.title}: ${stripTags(composed.bodyHtml).slice(0, 150).trim()}…`.slice(0, 165);
}

export function stripTags(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
