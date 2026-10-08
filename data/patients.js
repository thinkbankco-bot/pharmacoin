/* The Patient Files — PHARMA Holdings plc clinical records.
   Each file is built ONLY from the patient's own public posts. Every quote is verbatim and carries its X status id
   (page links to https://x.com/<handle>/status/<id>). "Of N recovered public posts", never "every tweet".
   Nothing about wallets, holdings, trades, P&L or location. Files come down on request.
   rx[].product must be an id from data/formulary.js.
   consent: 'pending' | 'given' | 'public-figure'

   Schema (per record):
     specimen  { drawn, archived, pct, days, from, to, method, accession }   -> lab header + blood vial (filled to pct)
     labs[]    { test, sub?, result, unit?, detail?, ref, flag, note?, bar? } -> the blood panel
               flag: 'CRIT' | 'H' | 'L' | 'E' (elevated) | 'N' (normal) | '-' (no range)
               bar:  { v, lo, hi, max } -> range bar, reference band lo..hi on a 0..max scale, marker at v
     requests[] { date, text, amt, id }  -> itemized receipt of funding requests (text = patient's words, leading @mentions removed)

   consult[]  { at, handle, id, kind, quote? }  -> consultation notes: what the patient did after the file was posted (UTC times, verbatim)
   consent    'public participation <date>' + evidence[] { kind, handle, id } (links to the patient's own public posts)
   walkins[] (top-level window.WALKINS): prescription-only patients, no bloodwork. Handle + the line they replied with.

   File #001 is public: the patient engaged with his file on 2026-10-08 (see consent + evidence). Files still come down on request. */
window.PATIENTS = [
  {
    no: '001',
    handle: 'faceofsol',
    name: 'RaRa 💭',
    joined: 'Nov 2024',
    avatar: 'assets/patients/faceofsol.jpg',
    consent: 'public participation 2026-10-08',
    evidence: [
      { kind: 'quote post', handle: 'faceofsol', id: '2108056670849081578' },
      { kind: 'reply', handle: 'faceofsol', id: '2108069623191204304' },
      { kind: 'reply', handle: 'faceofsol', id: '2108069754447827263' },
      { kind: 'reply', handle: 'faceofsol', id: '2108097378121335239' },
      { kind: 'reply', handle: 'faceofsol', id: '2108131479494828389' },
      { kind: 'thanks', handle: 'faceofsol', id: null }, // thanked the account in replies; status id not yet recorded
    ],
    thread: { handle: 'PharmaCoinSol', id: '2107988744594718864', posted: '2026-10-08T00:17Z', posts: 4 },
    attending: 'Dr. H. Fennwick (hon.)',
    lab: 'PHARMA Holdings Clinical Laboratory',
    intake: { posts: 3211, from: '2026-08-08', to: '2026-10-04', source: 'Internet Archive (Wayback Machine) + public timeline' },
    specimen: { drawn: 3211, archived: 49918, pct: 6.4, days: 58, from: '2026-08-08', to: '2026-10-04', method: 'Internet Archive (Wayback Machine) + public timeline', accession: 'PHL-001-0817' },
    labs: [
      { test: 'Serum Twin', result: '431', unit: '“twin”s', detail: 'in 416 posts · 7.4 per day', ref: '0–1 per day', flag: 'CRIT', note: 'Highest reading this lab has recorded. Does not count the 121 tags of accounts with “twin” in the name.', bar: { v: 7.4, lo: 0, hi: 1, max: 10 }, card: true },
      { test: 'Reply Saturation', result: '90', unit: '%', detail: '2,887 of 3,211 posts are replies', ref: '20–40%', flag: 'H', note: 'Patient mostly exists in other people’s mentions.', bar: { v: 90, lo: 20, hi: 40, max: 100 }, card: true },
      { test: 'Lacrimal Index', sub: '😭 + 🤣', result: '308', unit: 'emoji', detail: '162 😭 · 146 🤣', ref: 'occasional', flag: 'H', note: 'Specimen arrived damp.' },
      { test: 'Post Length, median', result: '23', unit: 'characters', ref: '80–140', flag: 'L', note: 'Shorter than this sentence.', bar: { v: 23, lo: 80, hi: 140, max: 160 }, card: true },
      { test: 'Peak Output', result: '148', unit: 'posts', detail: 'in one day (Aug 31)', ref: 'under 20', flag: 'H', note: 'About one every ten minutes, around the clock.', bar: { v: 148, lo: 0, hi: 20, max: 160 }, card: true },
      { test: 'Unsolicited Funding Requests', result: '20', unit: 'requests', ref: '0', flag: 'H', note: 'e.g. “Hey bro can u send me 42k”', card: true },
      { test: 'Total Amount Requested', result: '$3,505,450', detail: '+ £84,000 + 2,047 SOL + “a tenner”', ref: '$0', flag: 'CRIT', note: 'Amount received: not on file.', card: true },
      { test: 'Preferred Request Size', result: '$42,000', detail: 'asked 5 times (twice more in pounds)', ref: 'n/a', flag: '-', note: 'Will accept forty one thousand.' },
      { test: 'KOL Status Inquiries', result: '4', unit: 'inquiries', ref: '0', flag: 'E', note: 'e.g. “Really im a kol?”', card: true },
      { test: 'Gratitude', result: '73', unit: 'thank-yous', detail: '+ 37 “legend”s', ref: 'any', flag: 'N', note: 'Patient is polite.', card: true },
      { test: 'Daily Silence Window', result: '~5', unit: 'hours', ref: '7–9 hours', flag: 'L', note: 'We assume this is sleep.', bar: { v: 5, lo: 7, hi: 9, max: 12 } },
      { test: 'One-word Affirmations', sub: '“Yes”, “Facts”', result: '52', unit: 'posts', ref: '—', flag: 'N' },
    ],
    complaint: { quote: 'If you’re trading memecoins you are truly a psychopath', id: '2089279257407291509', date: '2026-08-17', frame: 'Patient self-diagnosed on Aug 17.' },
    symptoms: [
      { label: 'Acute Twinitis', count: 416, of: 3211, quote: 'Be delusional twin', id: '2087220688180658481', date: '2026-08-11' },
      { label: 'Recurrent Funding Requests', count: 20, of: 3211, quote: 'Hey bro can u give me $321,450', id: '2100963739277406522', date: '2026-09-18' },
      { label: 'KOL Identity Questioning', count: 4, of: 3211, quote: 'Really im a kol? 😳😳🥹', id: '2088617579770507354', date: '2026-08-15' },
      { label: 'Lacrimal Discharge', count: 308, of: 3211, unit: 'emoji in', quote: 'Son 😭😭😭', id: '2088669302614561004', date: '2026-08-15' },
    ],
    clarity: { lines: ['i think if we make more money we can be richer', 'OMGMFHSHSHWUEUYSSYSHHSSHSHSHDH IM A VISIONARY'], id: '2101568425764307186', date: '2026-09-20' },
    funfact: { text: 'The patient also asked for “42,000 great British pounds.” Commitment to the number holds across currencies.', id: '2088225990241829268', date: '2026-08-14' },
    /* Every explicit request for a stated amount, Aug 8 – Oct 4. Excluded: asks with no amount ("slide us some bread", "every penny"),
       a 1-SOL ask that offered 2 back (a trade, not a request), and replies that may have been quoting a price. 1 band = $1,000. */
    requests: [
      { date: '2026-08-10', text: 'Lend us a tenner mushy p', amt: 'a tenner', id: '2086721770812592528' },
      { date: '2026-08-10', text: 'Hey bro can you give me 12 thousand dollars', amt: '$12,000', id: '2086729035531661511' },
      { date: '2026-08-11', text: 'Hey bro im in a bit of bad luck can you give me  sixty four thousand dollars', amt: '$64,000', id: '2087040796847742996' },
      { date: '2026-08-11', text: 'Hey sol Brunson would u mind lending me 42 thousand dollars', amt: '$42,000', id: '2087065345324654951' },
      { date: '2026-08-11', text: 'Bro can u lend me 42 thousand pounds', amt: '£42,000', id: '2087158444864483601' },
      { date: '2026-08-12', text: 'Give me forty two thousand dollars or forty one thousand is fine please', amt: '$42,000', id: '2087414607795421675' },
      { date: '2026-08-13', text: 'Hey bro im in a tough spot can you give me 2,000 solana', amt: '2,000 SOL', id: '2087754910540628205' },
      { date: '2026-08-14', text: 'Hey bro im in a tough spot can u send me 42k', amt: '$42,000', id: '2088146148683120855' },
      { date: '2026-08-14', text: 'Hey bro can u send me 42k im in a rough spot', amt: '$42,000', id: '2088187808322355549' },
      { date: '2026-08-14', text: 'Give me 42,000 great British pounds im in a rough spot', amt: '£42,000', id: '2088225990241829268' },
      { date: '2026-08-18', text: 'Roy shut the fuck up and give me 47 sol', amt: '47 SOL', id: '2089574902835896819' },
      { date: '2026-08-24', text: 'Net hurry up and give me 42k', amt: '$42,000', id: '2091799974271205776' },
      { date: '2026-09-17', text: 'Slide me five hundred bands twin', amt: '$500,000', id: '2100690299500851318' },
      { date: '2026-09-18', text: 'Hey bro can u give me $321,450', amt: '$321,450', id: '2100963739277406522' },
      { date: '2026-09-20', text: 'Hey bro send me 94k asap', amt: '$94,000', id: '2101683469332176980' },
      { date: '2026-09-22', text: 'Hey bro can I have 90 bands', amt: '$90,000', id: '2102273174167859220' },
      { date: '2026-09-22', text: 'That’s cute, slide me 500 bands asap', amt: '$500,000', id: '2102383771458920616' },
      { date: '2026-09-26', text: 'Bro can you give me 13 bands', amt: '$13,000', id: '2103739770191106175' },
      { date: '2026-09-28', text: 'Hey bro I’m in a rough spot can u slide me 1.7 million dollars', amt: '$1,700,000', id: '2104585004697399399' },
      { date: '2026-10-04', text: 'Tweeling quick quick quick slide me a band twin', amt: '$1,000', id: '2106603115697025317' },
    ],
    totals: { usd: '$3,505,450', gbp: '£84,000', sol: '2,047 SOL', other: '1 tenner', received: 'NOT ON FILE' },
    diagnosis: {
      name: 'Acute Twinitis with Chronic Reply Discharge and Recurrent 42K Requests',
      text: 'Patient presents with a twin level more than seven times the upper limit of normal and a reply rate that leaves little room for original posts, which, at a median of 23 characters, were not going to be long anyway. Twenty separate funding requests were logged, most opening with “Hey bro.” The preferred dose is a stable $42,000, with flexibility down to forty-one. No payments were found. The patient said thank you 73 times regardless. Condition is chronic, non-contagious and extremely visible.',
    },
    rx: [
      { product: 'raids', arm: 'For Acute Twinitis', label: 'Patient already self-dosing.' },
      { product: 'workferdabagtin', arm: 'For the 42K Requests', label: 'Earn it. Asking went 0 for 20.' },
      { product: 'gaslightra', arm: 'For KOL Identity Questioning', label: 'You are a KOL. You never were. 0 mg.' },
    ],
    /* Consultation notes: the patient's public responses to his own file, Oct 8 2026 (UTC, decoded from status ids). Quotes verbatim. */
    consult: [
      { at: '2026-10-08T00:17Z', handle: 'PharmaCoinSol', id: '2107988744594718864', kind: 'File #001 posted as a 4-post thread' },
      { at: '2026-10-08T04:47Z', handle: 'faceofsol', id: '2108056670849081578', kind: 'Patient quote-posted his own file', quote: 'what the fuck are they doing to me' },
      { at: '2026-10-08T05:38Z', handle: 'faceofsol', id: '2108069623191204304', kind: 'Patient confirmed the receipt', quote: '$0 received' },
      { at: '2026-10-08T05:39Z', handle: 'faceofsol', id: '2108069754447827263', kind: 'Patient described symptoms', quote: "they're testing my digital blood i need help" },
      { at: '2026-10-08T07:29Z', handle: 'faceofsol', id: '2108097378121335239', kind: 'Patient asked a reply guy for money (item 21)', quote: 'Hey man can i have 3,427 dollers', item21: true },
      { at: '2026-10-08T09:44Z', handle: 'faceofsol', id: '2108131479494828389', kind: 'Patient questioned his MRN', quote: 'it feels creepy why i am 001' },
      { at: '2026-10-08', handle: 'faceofsol', id: null, kind: 'Patient thanked the account' },
    ],
    item21: { amt: '$3,427', text: 'Hey man can i have 3,427 dollers', id: '2108097378121335239', runningUsd: '$3,508,877' },
    prognosis: 'Stable. Patient remains polite (73 thank-yous). Expected to keep posting. Still waiting on the 42k.',
  },
];

/* Walk-in clinic: replied asking for their own file on 2026-10-08 and got a Pharmussy label instead. Prescription only, no bloodwork. */
window.WALKINS = [
  { handle: 'CryptoTroy_', said: 'show me how much of a legend am i', condition: 'Asked a pharmacy if he is a legend', drug: 'FOMA®', card: 'assets/cards/walkin-CryptoTroy_.png' },
  { handle: 'n00dlefry', said: 'draw me', condition: 'Replied “draw me” to a stranger', drug: 'Copium Mist®', card: 'assets/cards/walkin-n00dlefry.png' },
  { handle: 'Looke_web3', said: 'draw me', condition: 'Replied “draw me” to a stranger', drug: 'Rugburn®', card: 'assets/cards/walkin-Looke_web3.png' },
];
