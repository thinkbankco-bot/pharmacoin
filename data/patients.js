/* The Patient Files — PHARMA Holdings plc clinical records.
   Each file is built ONLY from the patient's own public posts. Every quote is verbatim and carries its X status id
   (page links to https://x.com/<handle>/status/<id>). "Of N recovered public posts", never "every tweet".
   Nothing about wallets, holdings, trades, P&L or location. Files come down on request.
   rx[].product must be an id from data/formulary.js.
   consent: 'pending' | 'given' | 'public-figure'   ('pending' records are skipped by js/patients.js: the live page ignores them)
   lab flag 'NOTE' = noted, no range (renders as NOTED)

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

  /* @@002 BEGIN: generated by tools/patient002_v5_build.py (write_ward). Edit the build, not this block. */
  /* FILE #002 · HELD · v5.1: THE DNA REPORT (Council 11, fence open; v5.1 = one card, one joke).
     consent: 'pending' -> js/patients.js skips this record and bed #002 stays "name withheld".
     GO = flip consent to 'public participation <date>' (or 'given'); js/patients.js then renders the DNA Report from genome{}.
     Every quote verbatim with its X status id (tools/patient002_v5_build.py Q gate). Full quote index: data/patients_002_v5.js quotesAll.
     legacy.v3 = the v3 Occupational Health record, verbatim, kept so nothing is lost (old card builders read it). */
  {
   "no": "002",
   "version": "v5.1",
   "handle": "imperooterxbt",
   "name": "scooter",
   "formerly": "scooterxbt",
   "joined": "May 2020",
   "avatar": null,
   "consent": "public-figure",
   "consentNote": "Posted 2026-10-08 by the owner; patient is a public account with 3,285 public posts on file. Files come down on request.",
   "thread": "https://x.com/PharmaCoinSol/status/2108346295358284169",
   "posted": "2026-10-08",
   "kind": "genomics",
   "attending": "Dr. H. Fennwick (hon.)",
   "lab": "PHARMA Holdings Genomics",
   "title": "PATIENT FILE #002: THE DNA REPORT",
   "intake": {
    "posts": 898,
    "from": "2026-08-09",
    "to": "2026-10-08",
    "source": "public timeline (X search sweep)"
   },
   "specimen": {
    "corpus": 3285,
    "from": "2022-12-11",
    "to": "2026-10-08",
    "byYear": {
     "2022": 1,
     "2023": 11,
     "2024": 1467,
     "2025": 70,
     "2026": 1736
    },
    "method": "Internet Archive (Wayback Machine) + public timeline",
    "file": "raw/imperooter/CORPUS.txt",
    "note": "Fence open (Council 11): names, feuds, family bits, crude posts. Floor: no slur, no post on race or religion; PROFILE not-for-quoting ids never quoted."
   },
   "counts": "raw/imperooter/counts_002_v5.json",
   "genome": {
    "age": {
     "records": [
      {
       "text": "I am early twenties bro",
       "id": "1798764000295178728",
       "date": "2024-06-06",
       "link": "https://x.com/imperooterxbt/status/1798764000295178728"
      },
      {
       "text": "I am a 36 year ol virgin",
       "id": "2034714744460804260",
       "date": "2026-03-19",
       "link": "https://x.com/imperooterxbt/status/2034714744460804260"
      },
      {
       "text": "I’m 36",
       "id": "2101351846073782563",
       "date": "2026-09-19",
       "link": "https://x.com/imperooterxbt/status/2101351846073782563"
      }
     ],
     "rate": 7.3,
     "rateRule": "(36 − 23) / years between Jun 6 2024 and Mar 19 2026; \"early twenties\" read as 23",
     "card": {
      "left": [
       {
        "text": "I am early twenties bro",
        "id": "1798764000295178728",
        "date": "2024-06-06",
        "link": "https://x.com/imperooterxbt/status/1798764000295178728"
       },
       {
        "text": "I am a 36 year ol virgin",
        "id": "2034714744460804260",
        "date": "2026-03-19",
        "link": "https://x.com/imperooterxbt/status/2034714744460804260"
       }
      ],
      "right": [
       {
        "text": "My 16 year old son",
        "id": "1801316487551983754",
        "date": "2024-06-13",
        "link": "https://x.com/imperooterxbt/status/1801316487551983754"
       },
       {
        "text": "My 13 year old son",
        "id": "2011787754477142142",
        "date": "2026-01-15",
        "link": "https://x.com/imperooterxbt/status/2011787754477142142"
       }
      ]
     },
     "son": {
      "records": [
       {
        "text": "My 16 year old son",
        "id": "1801316487551983754",
        "date": "2024-06-13",
        "link": "https://x.com/imperooterxbt/status/1801316487551983754"
       },
       {
        "text": "My 13 year old son",
        "id": "2011787754477142142",
        "date": "2026-01-15",
        "link": "https://x.com/imperooterxbt/status/2011787754477142142"
       }
      ],
      "alt16": {
       "text": "My son is 16 year old is a pumpfun trader",
       "id": "1801014080703983780",
       "date": "2024-06-12",
       "link": "https://x.com/imperooterxbt/status/1801014080703983780"
      },
      "rate": -1.9,
      "rateRule": "(13 − 16) / years between Jun 13 2024 and Jan 15 2026"
     },
     "line": "Father and son are ageing in opposite directions.",
     "stableDays": 184,
     "projectedNow": 40
    },
    "tree": {
     "headline": "Children reported: 1 → 12. Sightings: 0.",
     "headlineNote": "Children: 1 (son, Jun 2024) → 12 (Feb 25 2026). Sightings = posts in the text corpus that show or name a child by anything but a count: 0 (images not reviewed).",
     "title": "PHARMA Holdings Genomics · Patient #002 · DNA Relatives & Family Tree (self-reported)",
     "cardNote": "v5.1 card shows 11 nodes; Parents and The oldest son (card:false) live here only. Blocked and unrequited moved to the relatives card.",
     "nodes": [
      {
       "label": "Wife",
       "posts": 18,
       "regex": "\\bmy (?:bitch |beautiful )?wife\\b",
       "ids": [
        "1642257400747925505",
        "1792050518283399575",
        "1794815759970869657",
        "1801361730922062308",
        "1805169276644380998",
        "1811680218542678339",
        "2026384034822070752",
        "2030318634728329469",
        "2034714744460804260",
        "2087654170434142281",
        "2091602644343332877",
        "2092368191574122503",
        "2092588895665791037",
        "2092676908164973051",
        "2092691616918073579",
        "2095285267833688455",
        "2097023599668261100",
        "2099893648158519455"
       ],
       "cardLine": "My bitch wife packed me this…",
       "cardId": "2092368191574122503",
       "group": "marriage",
       "card": true
      },
      {
       "label": "Wife’s boyfriend",
       "group": "marriage",
       "card": true,
       "quote": {
        "text": "locks me out the house at night",
        "id": "2099893648158519455",
        "date": "2026-09-15",
        "link": "https://x.com/imperooterxbt/status/2099893648158519455"
       }
      },
      {
       "label": "The Bull",
       "group": "marriage",
       "card": true,
       "quote": {
        "text": "left me for the bull",
        "id": "2097023599668261100",
        "date": "2026-09-07",
        "link": "https://x.com/imperooterxbt/status/2097023599668261100"
       }
      },
      {
       "label": "Boyfriend of 7 yrs",
       "group": "partners",
       "card": true,
       "quote": {
        "text": "This is scooters boyfriend of 7 years.",
        "id": "2030877207002816898",
        "date": "2026-03-09",
        "link": "https://x.com/imperooterxbt/status/2030877207002816898"
       }
      },
      {
       "label": "French girlfriend",
       "descriptor": "restaurant spreadsheet",
       "quoted": false,
       "group": "partners",
       "card": true,
       "note": "Post is on PROFILE’s not-for-quoting list (broad detector: the word \"French\"). Label only, never quoted.",
       "id": "2031437832812704079",
       "date": "2026-03-10",
       "link": "https://x.com/imperooterxbt/status/2031437832812704079"
      },
      {
       "label": "London girlfriend",
       "group": "partners",
       "card": true,
       "quote": {
        "text": "my girlfriend from London",
        "id": "2036172871727456534",
        "date": "2026-03-23",
        "link": "https://x.com/imperooterxbt/status/2036172871727456534"
       }
      },
      {
       "label": "Orangie",
       "group": "partners",
       "card": true,
       "quote": {
        "text": "a new man (Orangie) who loves me",
        "id": "2087598448497271279",
        "date": "2026-08-12",
        "link": "https://x.com/imperooterxbt/status/2087598448497271279"
       }
      },
      {
       "label": "New boyfriend",
       "group": "partners",
       "card": true,
       "quote": {
        "text": "Just finished a date with my new boyfriend.",
        "id": "2105099350531604954",
        "date": "2026-09-30",
        "link": "https://x.com/imperooterxbt/status/2105099350531604954"
       }
      },
      {
       "label": "Son 16 → 13",
       "also": {
        "text": "My 13 year old son",
        "id": "2011787754477142142",
        "date": "2026-01-15",
        "link": "https://x.com/imperooterxbt/status/2011787754477142142"
       },
       "group": "dependents",
       "card": true,
       "quote": {
        "text": "My 16 year old son",
        "id": "1801316487551983754",
        "date": "2024-06-13",
        "link": "https://x.com/imperooterxbt/status/1801316487551983754"
       }
      },
      {
       "label": "12 abandoned kids",
       "group": "dependents",
       "card": true,
       "quote": {
        "text": "abandoned all 12 of my kids",
        "id": "2026652289922891904",
        "date": "2026-02-25",
        "link": "https://x.com/imperooterxbt/status/2026652289922891904"
       }
      },
      {
       "label": "Lamborghini (leased, listed as dependent)",
       "group": "dependents",
       "card": true,
       "quote": {
        "text": "my lambo lease",
        "id": "2028484084024897957",
        "date": "2026-03-02",
        "link": "https://x.com/imperooterxbt/status/2028484084024897957"
       }
      },
      {
       "label": "The oldest son",
       "group": "dependents",
       "card": false,
       "quote": {
        "text": "My oldest son will ask me why I’m so poor.",
        "id": "2087654170434142281",
        "date": "2026-08-12",
        "link": "https://x.com/imperooterxbt/status/2087654170434142281"
       }
      },
      {
       "label": "Parents",
       "group": "household",
       "card": false,
       "quote": {
        "text": "walked back to my parents house",
        "id": "2031388410791789046",
        "date": "2026-03-10",
        "link": "https://x.com/imperooterxbt/status/2031388410791789046"
       }
      }
     ],
     "blocked": [
      {
       "label": "Lexapro",
       "posts": 60,
       "quote": {
        "text": "I ratio’d Lexapro so bad he blocked me",
        "id": "2036261725176053777",
        "date": "2026-03-24",
        "link": "https://x.com/imperooterxbt/status/2036261725176053777"
       }
      },
      {
       "label": "Unipcs",
       "posts": 44,
       "quote": {
        "text": "Finally got the theunipcs block",
        "id": "2099556498057691147",
        "date": "2026-09-14",
        "link": "https://x.com/imperooterxbt/status/2099556498057691147"
       }
      },
      {
       "label": "TeTheGamer",
       "posts": 18,
       "quote": {
        "text": "I was going to start a fight with TeTheGamer on his new account and I was blocked.",
        "id": "2035157496894300386",
        "date": "2026-03-21",
        "link": "https://x.com/imperooterxbt/status/2035157496894300386"
       }
      }
     ],
     "unrequited": [
      {
       "label": "MoonCarl",
       "quote": {
        "text": "Please Carl follow me back I’m naming my first born after you",
        "id": "1620048556878098434",
        "date": "2023-01-30",
        "link": "https://x.com/imperooterxbt/status/1620048556878098434"
       }
      },
      {
       "label": "Loomdart",
       "quote": {
        "text": "if Loomdart have only one fan and that is me",
        "id": "2100123369525878983",
        "date": "2026-09-16",
        "link": "https://x.com/imperooterxbt/status/2100123369525878983"
       }
      }
     ],
     "budget": {
      "xPerWeek": {
       "usd": 50,
       "id": "2095245690444087694",
       "alt": "2095176210569404621"
      },
      "solpumpPerWeek": {
       "usd": 200,
       "id": "2095245690444087694"
      },
      "incomePerMonth": 1083,
      "incomeRule": "($50 + $200) x 52 / 12",
      "lamboLeasePerMonth": {
       "usd": 7500,
       "id": "2028484084024897957"
      },
      "lifeSavings": {
       "usd": 20,
       "id": "2092301822862209086"
      },
      "netWorth": {
       "value": "4",
       "id": "2095245690444087694"
      },
      "line": "HOUSEHOLD BUDGET (per patient): income $1,083/mo · lambo lease $7,500/mo · life savings $20 · net worth 4",
      "quotes": [
       {
        "text": "X pays me $50 a week to post",
        "id": "2095245690444087694",
        "date": "2026-09-02",
        "link": "https://x.com/imperooterxbt/status/2095245690444087694"
       },
       {
        "text": "solpump pays me $200 a week",
        "id": "2095245690444087694",
        "date": "2026-09-02",
        "link": "https://x.com/imperooterxbt/status/2095245690444087694"
       },
       {
        "text": "I countered with 7.5k a month. … That is literally my lambo lease cope harder.",
        "id": "2028484084024897957",
        "date": "2026-03-02",
        "link": "https://x.com/imperooterxbt/status/2028484084024897957"
       },
       {
        "text": "bet my life savings ($20) on Rainbet WNBA parlays",
        "id": "2092301822862209086",
        "date": "2026-08-25",
        "link": "https://x.com/imperooterxbt/status/2092301822862209086"
       },
       {
        "text": "I have 4 networth",
        "id": "2095245690444087694",
        "date": "2026-09-02",
        "link": "https://x.com/imperooterxbt/status/2095245690444087694"
       }
      ]
     },
     "fennwick": "Patient appears to be supporting more people than he has met."
    },
    "ancestry": {
     "composition": {
      "scooter": {
       "pct": 69,
       "posts": 33,
       "ids": [
        "1788841003811557700",
        "1790476600686805148",
        "1796394091325931827",
        "1796807021636862302",
        "1802902764638392479",
        "1803589046486085767",
        "1804287508039242216",
        "1804636459598569885",
        "1807167985213382766",
        "1807512934316151253",
        "1814089716012118188",
        "1814092590784106504",
        "1814460235752583570",
        "1814466622683525515",
        "1814471627633008811",
        "1814477600611291270",
        "2004080596033982916",
        "2005026550518034776",
        "2009073081420308863",
        "2012276258730819955",
        "2012277719497678937",
        "2030788267918987399",
        "2030877207002816898",
        "2035070608237805884",
        "2094189504051495100",
        "2094297923886387297",
        "2094635060699803960",
        "2102344959592476883",
        "2102407583529316818",
        "2102991031876592000",
        "2104147005496852649",
        "2107424181306700174",
        "2108209784373887249"
       ]
      },
      "imperator": {
       "pct": 25,
       "posts": 12,
       "ids": [
        "1633607412102967296",
        "1790473387774447892",
        "1790476600686805148",
        "1796743552606539913",
        "1796750641609502758",
        "1803045591716344117",
        "1803581009998356672",
        "1804274132550377505",
        "1804274388797403507",
        "1807071114557862158",
        "1815816223378268479",
        "2036289464243548597"
       ]
      },
      "imperooter": {
       "pct": 6,
       "posts": 3,
       "ids": [
        "2103959109850865875",
        "2107641275709321238",
        "2107644231905149320"
       ]
      }
     },
     "compositionRule": "post body with @handles and links removed, then \\b<name> (case-insensitive); one hit per post",
     "n": 48,
     "councilFigure": "70/23/6 (n=47) in COUNCIL11; recount with one regex gives 69/25/6 (n=48): imperator 12 not 11.",
     "timeline": [
      {
       "label": "Dec 11 2022",
       "quote": {
        "text": "Me to my phone everytime Kyle Davies tweets",
        "id": "1601785030531252228",
        "date": "2022-12-11",
        "link": "https://x.com/imperooterxbt/status/1601785030531252228"
       }
      },
      {
       "label": "2022 (posted Jul 5 2024)",
       "quote": {
        "text": "In 2022 I lost almost everything after ftx crash",
        "id": "1809215409129656321",
        "date": "2024-07-05",
        "link": "https://x.com/imperooterxbt/status/1809215409129656321"
       }
      },
      {
       "label": "Mar 8 2023",
       "quote": {
        "text": "I’m currently stuck as imperator until twitter lets me change back",
        "id": "1633607412102967296",
        "date": "2023-03-08",
        "link": "https://x.com/imperooterxbt/status/1633607412102967296"
       }
      },
      {
       "label": "May 16 2024",
       "quote": {
        "text": "I lost all my solana in the pumpfun exploit.",
        "id": "1791238169087664296",
        "date": "2024-05-16",
        "link": "https://x.com/imperooterxbt/status/1791238169087664296"
       }
      },
      {
       "label": "May 16 2024 (+14 min)",
       "quote": {
        "text": "I just sold the house",
        "id": "1791241574338167088",
        "date": "2024-05-16",
        "link": "https://x.com/imperooterxbt/status/1791241574338167088"
       }
      },
      {
       "label": "Jun 1 2024",
       "quote": {
        "text": "being imperator on this app actually gave me a personality disorder.",
        "id": "1796743552606539913",
        "date": "2024-06-01",
        "link": "https://x.com/imperooterxbt/status/1796743552606539913"
       }
      },
      {
       "label": "Jun 6 2024",
       "quote": {
        "text": "I lost 10.5 ETH not 8.4.",
        "id": "1798551830345216434",
        "date": "2024-06-06",
        "link": "https://x.com/imperooterxbt/status/1798551830345216434"
       }
      },
      {
       "label": "Jul 23 2024",
       "quote": {
        "text": "Imperator until my account is out of the gulag",
        "id": "1815816223378268479",
        "date": "2024-07-23",
        "link": "https://x.com/imperooterxbt/status/1815816223378268479"
       }
      },
      {
       "label": "Dec 23 2025",
       "quote": {
        "text": "Real",
        "id": "2003296530460213554",
        "date": "2025-12-23",
        "link": "https://x.com/imperooterxbt/status/2003296530460213554"
       }
      },
      {
       "label": "Sep 23 2026",
       "quote": {
        "text": "As a kol myself",
        "id": "2102845065303331013",
        "date": "2026-09-23",
        "link": "https://x.com/imperooterxbt/status/2102845065303331013"
       }
      }
     ],
     "shadowban": {
      "regex": "shadow\\s?-?ban",
      "y2024": 25,
      "y2026": 0,
      "from": "2024-05-17",
      "to": "2024-07-22"
     },
     "gap": {
      "lastBefore": "1815816223378268479",
      "firstAfter": "2003296530460213554",
      "from": "2024-07-23 18:28",
      "to": "2025-12-23 02:48",
      "days": 517,
      "exact": "517 days 8 h 20 m",
      "note": "longest silence in the corpus; corpus is Wayback-limited before Aug 2026"
     },
     "kol2024": {
      "text": "Call me a KOL again and it’s gonna be a Life takeover",
      "id": "1793928059802013781",
      "date": "2024-05-24",
      "link": "https://x.com/imperooterxbt/status/1793928059802013781"
     },
     "homeruns": {
      "regex": "home ?run",
      "n": 6,
      "list": [
       {
        "id": "1803045591716344117",
        "at": "2024-06-18 12:42",
        "phrase": "Another IMPERATOR HOMERUN",
        "surname": "IMPERATOR"
       },
       {
        "id": "2036289464243548597",
        "at": "2026-03-24 03:50",
        "phrase": "Another Imperator homerun",
        "surname": "Imperator"
       },
       {
        "id": "2103959109850865875",
        "at": "2026-09-26 21:25",
        "phrase": "Another imperooter homerun",
        "surname": "imperooter"
       },
       {
        "id": "2107641275709321238",
        "at": "2026-10-07 01:16",
        "phrase": "Another Imperooter homerun",
        "surname": "Imperooter"
       },
       {
        "id": "2107644231905149320",
        "at": "2026-10-07 01:28",
        "phrase": "Another imperooter home run",
        "surname": "imperooter"
       },
       {
        "id": "2108209784373887249",
        "at": "2026-10-08 14:55",
        "phrase": "Another Scooter home run",
        "surname": "Scooter"
       }
      ],
      "surnames": [
       "imperator",
       "imperooter",
       "scooter"
      ],
      "intervals": [
       "644 days",
       "187 days",
       "10 days",
       "12 min",
       "37 h"
      ],
      "inLast13Days": 4,
      "next": {
       "rule": "last homerun + median of the last three intervals",
       "median": "37 h",
       "due": "2026-10-10 04:22 UTC"
      }
     },
     "report": "A",
     "thread": false
    },
    "genes": {
     "stamp": "DISCORDANT · SOURCE OF CONTAMINATION: PATIENT",
     "withheld": [
      "Not-a-lot-of-money threshold",
      "Badge deflation"
     ],
     "rows": [
      {
       "gene": "Age-drift",
       "A": [
        {
         "text": "I am early twenties bro",
         "id": "1798764000295178728",
         "date": "2024-06-06",
         "link": "https://x.com/imperooterxbt/status/1798764000295178728"
        },
        {
         "text": "He’s 40 partying at raves with no kids",
         "id": "1807105052571558318",
         "date": "2024-06-29",
         "link": "https://x.com/imperooterxbt/status/1807105052571558318"
        }
       ],
       "B": [
        {
         "text": "I am a 36 year ol virgin",
         "id": "2034714744460804260",
         "date": "2026-03-19",
         "link": "https://x.com/imperooterxbt/status/2034714744460804260"
        },
        {
         "text": "life doesn’t start until you are in your 40s",
         "id": "2091678233079271894",
         "date": "2026-08-24",
         "link": "https://x.com/imperooterxbt/status/2091678233079271894"
        }
       ],
       "tag": "+13 yrs in 21 months",
       "code": "ADA-36",
       "card": true,
       "labelA": "Jun 2024",
       "labelB": "Mar–Aug 2026"
      },
      {
       "gene": "Relationship superposition",
       "A": [
        {
         "text": "Lost my virginity in jail",
         "id": "1811652607070334998",
         "date": "2024-07-12",
         "link": "https://x.com/imperooterxbt/status/1811652607070334998"
        }
       ],
       "B": [
        {
         "text": "I’ve never had a girlfriend to break up with me",
         "id": "2030709263874892178",
         "date": "2026-03-08",
         "link": "https://x.com/imperooterxbt/status/2030709263874892178"
        },
        {
         "text": "My girlfriend woke up thinking today was gonna be about her",
         "id": "2030717366951100687",
         "date": "2026-03-08",
         "link": "https://x.com/imperooterxbt/status/2030717366951100687"
        }
       ],
       "tag": "18 wife · 5 girlfriend · 3 boyfriend",
       "counts": {
        "wife": {
         "regex": "\\bmy (?:bitch |beautiful )?wife\\b",
         "posts": 18,
         "posts61": 9,
         "days61": 7,
         "byYear": {
          "2023": 1,
          "2024": 5,
          "2026": 12
         },
         "first": "1642257400747925505",
         "last": "2099893648158519455",
         "lastDate": "2026-09-15",
         "sinceLastDays": 23,
         "p7": 64,
         "p7model": "Poisson, 9 posts in 61 days -> 1 - e^-(9/61*7)",
         "ids": [
          "1642257400747925505",
          "1792050518283399575",
          "1794815759970869657",
          "1801361730922062308",
          "1805169276644380998",
          "1811680218542678339",
          "2026384034822070752",
          "2030318634728329469",
          "2034714744460804260",
          "2087654170434142281",
          "2091602644343332877",
          "2092368191574122503",
          "2092588895665791037",
          "2092676908164973051",
          "2092691616918073579",
          "2095285267833688455",
          "2097023599668261100",
          "2099893648158519455"
         ],
         "note": "\"my future wife\" (2036178727340745143) is excluded by the regex; it is not the wife."
        },
        "girlfriend": {
         "regex": "\\bmy girlfriend\\b",
         "posts": 5,
         "ids": [
          "2030475197178896679",
          "2030717366951100687",
          "2031437832812704079",
          "2033720428988919993",
          "2036172871727456534"
         ],
         "broad": {
          "regex": "girlfriend|\\bgf\\b",
          "posts": 19
         }
        },
        "boyfriend": {
         "regex": "\\b(?:my|scooters) (?:new )?boyfriend\\b(?! trades? memecoins)",
         "posts": 3,
         "ids": [
          "2030877207002816898",
          "2087598448497271279",
          "2105099350531604954"
         ],
         "broad": {
          "regex": "boyfriend|\\bbf\\b",
          "posts": 13
         }
        }
       },
       "gapMin": 32,
       "code": "REL-∞",
       "card": true,
       "labelA": "Jul 2024",
       "labelB": "Mar 8 2026"
      },
      {
       "gene": "Gay-porn denial window",
       "A": [
        {
         "text": "I have never ever tweeted gay porn",
         "id": "2090915691872526634",
         "date": "2026-08-21",
         "link": "https://x.com/imperooterxbt/status/2090915691872526634"
        }
       ],
       "B": [
        {
         "text": "I tweeted gay porn 20 minutes ago twice",
         "id": "2090926660702933480",
         "date": "2026-08-21",
         "link": "https://x.com/imperooterxbt/status/2090926660702933480"
        }
       ],
       "tag": "43 minutes",
       "gapMin": 43,
       "code": "GPD-43",
       "card": true,
       "labelA": "Aug 21 2026 · 21:35",
       "labelB": "22:18"
      },
      {
       "gene": "Deletion paradox",
       "A": [
        {
         "text": "I have never deleted a tweet",
         "id": "1805622998608564591",
         "date": "2024-06-25",
         "link": "https://x.com/imperooterxbt/status/1805622998608564591"
        }
       ],
       "B": [
        {
         "text": "99% of my deleted tweets are literal gay porn.",
         "id": "2107994208854298685",
         "date": "2026-10-08",
         "link": "https://x.com/imperooterxbt/status/2107994208854298685"
        }
       ],
       "tag": "the other 1%: respect for women",
       "tagQuote": {
        "text": "Deleted my last tweet because I respect women.",
        "id": "1794427398647398756",
        "date": "2024-05-25",
        "link": "https://x.com/imperooterxbt/status/1794427398647398756"
       },
       "code": "DEL-99",
       "card": true,
       "labelA": "Jun 2024",
       "labelB": "Oct 2026"
      },
      {
       "gene": "KOL-denial allele",
       "A": [
        {
         "text": "Call me a KOL again and it’s gonna be a Life takeover",
         "id": "1793928059802013781",
         "date": "2024-05-24",
         "link": "https://x.com/imperooterxbt/status/1793928059802013781"
        }
       ],
       "B": [
        {
         "text": "As a kol myself",
         "id": "2102845065303331013",
         "date": "2026-09-23",
         "link": "https://x.com/imperooterxbt/status/2102845065303331013"
        }
       ],
       "tag": "fully expressed",
       "code": "KOL-1",
       "card": true,
       "labelA": "May 2024",
       "labelB": "Sep 2026"
      },
      {
       "gene": "Edit-button deficiency",
       "A": [
        {
         "text": "Me personally I love DICKS",
         "id": "1800263102673629469",
         "date": "2024-06-10",
         "link": "https://x.com/imperooterxbt/status/1800263102673629469"
        }
       ],
       "B": [
        {
         "text": "Chicks*",
         "id": "1800263156285202496",
         "date": "2024-06-10",
         "link": "https://x.com/imperooterxbt/status/1800263156285202496"
        },
        {
         "text": "I have blue mark on twitter why can’t I edit my tweet?",
         "id": "1800263308341018682",
         "date": "2024-06-10",
         "link": "https://x.com/imperooterxbt/status/1800263308341018682"
        }
       ],
       "tag": "untreated",
       "code": "EDT-0",
       "card": true,
       "labelA": "Jun 10 2024 · 20:25",
       "labelB": "20:25 → 20:26"
      },
      {
       "gene": "Fomo-app sensitivity",
       "A": {
        "posts2024": 5
       },
       "B": {
        "posts61": 98,
        "days61": 46
       },
       "tag": "chronic",
       "regex": "\\bfomo",
       "code": "FMO-98",
       "card": false,
       "labelA": "2024",
       "labelB": "last 61 days",
       "summaryA": "5 posts",
       "summaryB": "98 posts on 46 of 61 days"
      },
      {
       "gene": "Rainbet gene",
       "A": [
        {
         "text": "Rainbet was around 5k per tweet … So 30k total",
         "id": "2031952734010675372",
         "date": "2026-03-12",
         "link": "https://x.com/imperooterxbt/status/2031952734010675372"
        }
       ],
       "B": [
        {
         "text": "I turned down 60k a month to partner with Rainbet.",
         "id": "2087654170434142281",
         "date": "2026-08-12",
         "link": "https://x.com/imperooterxbt/status/2087654170434142281"
        },
        {
         "text": "bet my life savings ($20) on Rainbet WNBA parlays",
         "id": "2092301822862209086",
         "date": "2026-08-25",
         "link": "https://x.com/imperooterxbt/status/2092301822862209086"
        }
       ],
       "tag": "0 of 26 paid · $130,000 free at his own rate",
       "counts": {
        "regex": "rainbet",
        "posts": 26,
        "days": 25,
        "posts61": 25,
        "days61": 24,
        "pct": 39,
        "adRegex": "#ad\\b|#sponsored|paid partnership|use (?:my )?code|promo code|\\bref(?:erral)? ?link|rainbet\\.com/\\S*\\?",
        "ads": 0,
        "adNote": "No Rainbet post carries an ad disclosure, a promo code or a referral link. \"Life after you take a Rainbet sponsorship\" (2086832414890856738) is a meme about other people, not a disclosure.",
        "ratePerTweet": 5000,
        "rateId": "2031952734010675372",
        "freeAdsUSD": 130000,
        "first": "2031952734010675372",
        "last": "2107456661543919682",
        "lastAt": "2026-10-06 13:03",
        "ids": [
         "2031952734010675372",
         "2086507218275291516",
         "2086832414890856738",
         "2087654170434142281",
         "2088817094624235949",
         "2089707645955408067",
         "2090846309016281516",
         "2091389747163971623",
         "2091893945622278583",
         "2092301822862209086",
         "2093023812308635705",
         "2094852980830851340",
         "2095273542333968792",
         "2095578512761496050",
         "2096065307861254581",
         "2097856902109470985",
         "2098862698758861198",
         "2099611834298888644",
         "2100052819873071524",
         "2100472888415416541",
         "2101828155526795489",
         "2103169109412233462",
         "2104006346991366468",
         "2104417858654495080",
         "2107269246929834493",
         "2107456661543919682"
        ]
       },
       "code": "RNB-26",
       "card": true,
       "labelA": "Mar 2026",
       "labelB": "Aug 2026"
      },
      {
       "gene": "Goodbye reflex",
       "A": [
        {
         "text": "See you guys a few months from now",
         "id": "1799279575849160829",
         "back": "≤5 min"
        }
       ],
       "B": [
        {
         "text": "imma leave, gotta protect my energy.",
         "id": "2092446068827152600",
         "back": "2 h 29 m"
        }
       ],
       "tag": "8 goodbyes · median 17 min",
       "code": "BYE-17",
       "card": true,
       "labelA": "Jun 2024",
       "labelB": "Aug 2026"
      },
      {
       "gene": "Homerun gene",
       "A": [
        {
         "id": "1803045591716344117",
         "at": "2024-06-18 12:42",
         "phrase": "Another IMPERATOR HOMERUN",
         "surname": "IMPERATOR"
        }
       ],
       "B": [
        {
         "id": "2108209784373887249",
         "at": "2026-10-08 14:55",
         "phrase": "Another Scooter home run",
         "surname": "Scooter"
        }
       ],
       "tag": "6 by 3 batters · 4 in 13 days",
       "code": "HR-6",
       "card": false,
       "labelA": "Jun 2024",
       "labelB": "Oct 8 2026",
       "summaryA": "“Another IMPERATOR HOMERUN”",
       "summaryB": "“Another Scooter home run”"
      },
      {
       "gene": "Peanut gallery / shadowban",
       "A": {
        "shadowban": 25,
        "peanutGallery": 0
       },
       "B": {
        "shadowban": 0,
        "peanutGallery": 12
       },
       "tag": "inverted",
       "code": "PNT-12",
       "card": false,
       "labelA": "2024",
       "labelB": "2026",
       "summaryA": "shadowban 25 · peanut gallery 0",
       "summaryB": "shadowban 0 · peanut gallery 12"
      },
      {
       "gene": "Biggest-hit anomaly",
       "A": {
        "id": "2095960848833380371",
        "likes": 1281
       },
       "B": {
        "id": "2101530171341774935",
        "likes": 35834,
        "text": "Promoting this to minors should be treated the same as grooming.",
        "words": 11,
        "quote": {
         "text": "Promoting this to minors should be treated the same as grooming.",
         "id": "2101530171341774935",
         "date": "2026-09-20",
         "link": "https://x.com/imperooterxbt/status/2101530171341774935"
        }
       },
       "tag": "11 words · no insult · 28×",
       "code": "BIG-28×",
       "card": false,
       "labelA": "runner-up",
       "labelB": "Sep 20 2026",
       "summaryA": "1,281 likes",
       "summaryB": "35,834 likes · “Promoting this to minors should be treated the same as grooming.”"
      }
     ],
     "cardGenes": 8,
     "note": "card:true = on the gene-panel card (8, quote vs quote). card:false = ward page only (numbers)."
    },
    "relatives": {
     "rankBy": "posts naming the match (PROFILE.md entity table; Finnbags/TeTheGamer counted in this build)",
     "rows": [
      {
       "rank": 1,
       "name": "Lexapro",
       "posts": 60,
       "extra": "",
       "status": "BLOCKED YOU",
       "note": "fight agreement unsigned · day 254",
       "lines": [
        {
         "text": "Lexapro woke up in good health again today Incase anyway wanted to know why I’m in a bad mood today",
         "id": "2011561082654245267",
         "date": "2026-01-14",
         "link": "https://x.com/imperooterxbt/status/2011561082654245267"
        }
       ]
      },
      {
       "rank": 2,
       "name": "Iggy Azalea",
       "posts": 50,
       "extra": "in 11 days",
       "status": "RECONCILED",
       "note": "public apology, Jun 1 2024",
       "lines": [
        {
         "text": "Thanks to your token I finally got evicted",
         "id": "1795766623107727822",
         "date": "2024-05-29",
         "link": "https://x.com/imperooterxbt/status/1795766623107727822"
        }
       ]
      },
      {
       "rank": 3,
       "name": "Unipcs",
       "posts": 44,
       "extra": "41 on 14 days",
       "status": "BLOCKED YOU",
       "note": "he called it “Finally.”",
       "lines": [
        {
         "text": "Finally got the theunipcs block",
         "id": "2099556498057691147",
         "date": "2026-09-14",
         "link": "https://x.com/imperooterxbt/status/2099556498057691147"
        }
       ]
      },
      {
       "rank": 4,
       "name": "Rasmr",
       "posts": 35,
       "extra": "",
       "status": "IN A FOLDER",
       "note": "",
       "lines": [
        {
         "text": "I have it in my Rasmr folder",
         "id": "2107129887538758012",
         "date": "2026-10-05",
         "link": "https://x.com/imperooterxbt/status/2107129887538758012"
        }
       ]
      },
      {
       "rank": 5,
       "name": "Kazumi",
       "posts": 33,
       "extra": "in 5 days",
       "status": "COST: HOUSE + KIDS",
       "note": "",
       "lines": [
        {
         "text": "My wife saw me arguing with Kazumi and scrolling porn pics on pumpfun and thought I was cheating on her. She took the house and kids.",
         "id": "1801361730922062308",
         "date": "2024-06-13",
         "link": "https://x.com/imperooterxbt/status/1801361730922062308"
        }
       ]
      },
      {
       "rank": 6,
       "name": "Orangie",
       "posts": 31,
       "extra": "",
       "status": "HUSBAND (PER PATIENT)",
       "note": "",
       "lines": [
        {
         "text": "a new man (Orangie) who loves me",
         "id": "2087598448497271279",
         "date": "2026-08-12",
         "link": "https://x.com/imperooterxbt/status/2087598448497271279"
        }
       ]
      },
      {
       "rank": 7,
       "name": "Marcell",
       "posts": 29,
       "extra": "",
       "status": "PAYS FOR “DAD”",
       "note": "",
       "lines": [
        {
         "text": "Marcell paid his reply bots to call him dad.",
         "id": "2013306817208819887",
         "date": "2026-01-19",
         "link": "https://x.com/imperooterxbt/status/2013306817208819887"
        }
       ]
      },
      {
       "rank": 8,
       "name": "Kook Capital",
       "posts": 27,
       "extra": "in 7 days",
       "status": "SAID HE’D STOP",
       "note": "then 19 more posts",
       "lines": [
        {
         "text": "I’m actually not gonna interact with you anymore",
         "id": "1799488052529684776",
         "date": "2024-06-08",
         "link": "https://x.com/imperooterxbt/status/1799488052529684776"
        }
       ]
      },
      {
       "rank": 9,
       "name": "BLESSEDJINGTAO",
       "posts": 23,
       "extra": "in 3 h 31 m",
       "status": "TONIGHT’S RELATIVE",
       "note": "12 posts in, 10 after",
       "lines": [
        {
         "text": "Notice I don’t care to argue with you.",
         "id": "2108002813171179834",
         "date": "2026-10-08",
         "link": "https://x.com/imperooterxbt/status/2108002813171179834"
        }
       ]
      },
      {
       "rank": 10,
       "name": "Finnbags",
       "posts": 20,
       "extra": "",
       "status": "RECONCILED",
       "note": "",
       "lines": [
        {
         "text": "Finnbags hid trading_axe and my reply",
         "id": "2015285543836278971",
         "date": "2026-01-25",
         "link": "https://x.com/imperooterxbt/status/2015285543836278971"
        },
        {
         "text": "Support the OG creat Finn himself",
         "id": "2103673150550806558",
         "date": "2026-09-26",
         "link": "https://x.com/imperooterxbt/status/2103673150550806558"
        }
       ]
      },
      {
       "rank": 11,
       "name": "TeTheGamer",
       "posts": 18,
       "extra": "",
       "status": "BLOCKED YOU",
       "note": "then Miami",
       "lines": [
        {
         "text": "Me and TeTheGamer getting lit in Miami right now.",
         "id": "2089940133290103075",
         "date": "2026-08-19",
         "link": "https://x.com/imperooterxbt/status/2089940133290103075"
        }
       ]
      },
      {
       "rank": 12,
       "name": "Dan123",
       "posts": 17,
       "extra": "",
       "status": "FORGOTTEN",
       "note": "",
       "lines": [
        {
         "text": "I can make it 20 Dan I have nothing better to do",
         "id": "2028503143198118171",
         "date": "2026-03-02",
         "link": "https://x.com/imperooterxbt/status/2028503143198118171"
        },
        {
         "text": "Who are you again?",
         "id": "2105082880347316250",
         "date": "2026-09-29",
         "link": "https://x.com/imperooterxbt/status/2105082880347316250"
        }
       ]
      }
     ],
     "bestLines": {
      "Lexapro": {
       "text": "Lexapro woke up in good health again today Incase anyway wanted to know why I’m in a bad mood today",
       "id": "2011561082654245267",
       "date": "2026-01-14",
       "link": "https://x.com/imperooterxbt/status/2011561082654245267"
      },
      "Iggy Azalea": {
       "text": "Thanks to your token I finally got evicted",
       "id": "1795766623107727822",
       "date": "2024-05-29",
       "link": "https://x.com/imperooterxbt/status/1795766623107727822"
      },
      "Unipcs": {
       "text": "Finally got the theunipcs block",
       "id": "2099556498057691147",
       "date": "2026-09-14",
       "link": "https://x.com/imperooterxbt/status/2099556498057691147"
      },
      "Rasmr": {
       "text": "I have it in my Rasmr folder",
       "id": "2107129887538758012",
       "date": "2026-10-05",
       "link": "https://x.com/imperooterxbt/status/2107129887538758012"
      },
      "Kazumi": {
       "text": "My wife saw me arguing with Kazumi and scrolling porn pics on pumpfun and thought I was cheating on her. She took the house and kids.",
       "id": "1801361730922062308",
       "date": "2024-06-13",
       "link": "https://x.com/imperooterxbt/status/1801361730922062308"
      },
      "Orangie": {
       "text": "a new man (Orangie) who loves me",
       "id": "2087598448497271279",
       "date": "2026-08-12",
       "link": "https://x.com/imperooterxbt/status/2087598448497271279"
      },
      "Marcell": {
       "text": "Marcell paid his reply bots to call him dad.",
       "id": "2013306817208819887",
       "date": "2026-01-19",
       "link": "https://x.com/imperooterxbt/status/2013306817208819887"
      },
      "Kook Capital": {
       "text": "I’m actually not gonna interact with you anymore",
       "id": "1799488052529684776",
       "date": "2024-06-08",
       "link": "https://x.com/imperooterxbt/status/1799488052529684776"
      },
      "BLESSEDJINGTAO": {
       "text": "Notice I don’t care to argue with you.",
       "id": "2108002813171179834",
       "date": "2026-10-08",
       "link": "https://x.com/imperooterxbt/status/2108002813171179834"
      },
      "Finnbags": [
       {
        "text": "Finnbags hid trading_axe and my reply",
        "id": "2015285543836278971",
        "date": "2026-01-25",
        "link": "https://x.com/imperooterxbt/status/2015285543836278971"
       },
       {
        "text": "Support the OG creat Finn himself",
        "id": "2103673150550806558",
        "date": "2026-09-26",
        "link": "https://x.com/imperooterxbt/status/2103673150550806558"
       }
      ],
      "TeTheGamer": {
       "text": "Me and TeTheGamer getting lit in Miami right now.",
       "id": "2089940133290103075",
       "date": "2026-08-19",
       "link": "https://x.com/imperooterxbt/status/2089940133290103075"
      },
      "Dan123": [
       {
        "text": "I can make it 20 Dan I have nothing better to do",
        "id": "2028503143198118171",
        "date": "2026-03-02",
        "link": "https://x.com/imperooterxbt/status/2028503143198118171"
       },
       {
        "text": "Who are you again?",
        "id": "2105082880347316250",
        "date": "2026-09-29",
        "link": "https://x.com/imperooterxbt/status/2105082880347316250"
       }
      ]
     },
     "proof": {
      "lexBlock": {
       "text": "I ratio’d Lexapro so bad he blocked me",
       "id": "2036261725176053777",
       "date": "2026-03-24",
       "link": "https://x.com/imperooterxbt/status/2036261725176053777"
      },
      "lexFight": {
       "text": "it has been over 24hrs and he hasn’t responded to the fight agreement",
       "id": "2016259135122108577",
       "date": "2026-01-27",
       "link": "https://x.com/imperooterxbt/status/2016259135122108577"
      },
      "iggyApology": {
       "text": "Congrats Iggy I will apologize",
       "id": "1796806093026292075",
       "date": "2024-06-01",
       "link": "https://x.com/imperooterxbt/status/1796806093026292075"
      },
      "teBlock": {
       "text": "I was going to start a fight with TeTheGamer on his new account and I was blocked.",
       "id": "2035157496894300386",
       "date": "2026-03-21",
       "link": "https://x.com/imperooterxbt/status/2035157496894300386"
      },
      "kook": {
       "text": "Your mullet is running from your scalp",
       "id": "1799489280676360401",
       "date": "2024-06-08",
       "link": "https://x.com/imperooterxbt/status/1799489280676360401"
      }
     },
     "counts": {
      "Lexapro": {
       "posts": 60,
       "regex": "lexapro",
       "source": "PROFILE.md entity table",
       "fightAgreementDay": 254,
       "afterBlock": 7
      },
      "Iggy Azalea": {
       "posts": 50,
       "regex": "\\biggy|azalea",
       "source": "PROFILE.md entity table",
       "days": 11
      },
      "Unipcs": {
       "posts": 44,
       "regex": "unipcs",
       "source": "PROFILE.md entity table"
      },
      "Rasmr": {
       "posts": 35,
       "regex": "rasmr",
       "source": "PROFILE.md entity table"
      },
      "Kazumi": {
       "posts": 33,
       "regex": "kazumi",
       "source": "PROFILE.md entity table",
       "days": 5
      },
      "Orangie": {
       "posts": 31,
       "regex": "orangie",
       "source": "PROFILE.md entity table"
      },
      "Marcell": {
       "posts": 29,
       "regex": "marcell",
       "source": "PROFILE.md entity table"
      },
      "Kook Capital": {
       "posts": 27,
       "regex": "\\bkook(capital)?",
       "source": "PROFILE.md entity table",
       "days": 7,
       "afterPromise": 19
      },
      "BLESSEDJINGTAO": {
       "posts": 24,
       "regex": "blessedjingtao|jingtao",
       "source": "PROFILE.md entity table",
       "night": {
        "posts": 23,
        "from": "00:08",
        "to": "03:39",
        "span": "3 h 31 m",
        "beforeNotice": 12,
        "afterNotice": 10,
        "rule": "posts naming him (jingtao) on Oct 8 00:00-03:39 UTC, plus the unaddressed \"Notice I don’t care to argue with you.\" post"
       }
      },
      "Finnbags": {
       "posts": 20,
       "regex": "finnbags|\\bfinn\\b",
       "source": "counted in this build",
       "days": 11
      },
      "TeTheGamer": {
       "posts": 18,
       "regex": "tethegamer",
       "source": "counted in this build",
       "days": 18
      },
      "Dan123": {
       "posts": 17,
       "regex": "dan123",
       "source": "PROFILE.md entity table"
      },
      "MoonCarl": {
       "posts": 1,
       "regex": "mooncarl",
       "source": "counted in this build",
       "days": 1
      },
      "spacey_monkee": {
       "posts": 3,
       "regex": "spacey",
       "source": "counted in this build",
       "days": 1
      },
      "Loomdart": {
       "posts": 12,
       "regex": "loomdart",
       "source": "PROFILE.md entity table"
      },
      "Shaw": {
       "posts": 4,
       "regex": "\\bshaw(makesmagic)?\\b",
       "source": "PROFILE.md entity table"
      }
     },
     "unipcsBlock": {
      "regex": "unipcs",
      "posts": 44,
      "posts61": 41,
      "days61": 14,
      "blockId": "2099556498057691147",
      "blockAt": "2026-09-14 17:50",
      "before": 12,
      "sameMinute": 2,
      "after": 30,
      "ratio": 2.5,
      "daysSinceSep5": 34,
      "pctDay": 41,
      "rule": "before/after = strictly earlier/later minute than the block post; the block post and one reply share its minute (17:50) and are in neither."
     },
     "unrequited": [
      {
       "label": "MoonCarl",
       "quote": {
        "text": "Please Carl follow me back I’m naming my first born after you",
        "id": "1620048556878098434",
        "date": "2023-01-30",
        "link": "https://x.com/imperooterxbt/status/1620048556878098434"
       }
      },
      {
       "label": "spacey_monkee",
       "quote": {
        "text": "can’t even get a follow me back",
        "id": "1810139904388534761",
        "date": "2024-07-08",
        "link": "https://x.com/imperooterxbt/status/1810139904388534761"
       }
      },
      {
       "label": "Loomdart",
       "quote": {
        "text": "if Loomdart have only one fan and that is me",
        "id": "2100123369525878983",
        "date": "2026-09-16",
        "link": "https://x.com/imperooterxbt/status/2100123369525878983"
       }
      },
      {
       "label": "Shaw",
       "quote": {
        "text": "Shaw should unblock me",
        "id": "2014439028183945450",
        "date": "2026-01-22",
        "link": "https://x.com/imperooterxbt/status/2014439028183945450"
       }
      }
     ],
     "blockedBy": [
      {
       "text": "blocked me and hid my reply",
       "id": "2012585817680859484",
       "date": "2026-01-17",
       "link": "https://x.com/imperooterxbt/status/2012585817680859484"
      },
      {
       "text": "Sophie Rain blocked me for telling the truth.",
       "id": "2013311372407513319",
       "date": "2026-01-19",
       "link": "https://x.com/imperooterxbt/status/2013311372407513319"
      },
      {
       "text": "I ratio’d Lexapro so bad he blocked me",
       "id": "2036261725176053777",
       "date": "2026-03-24",
       "link": "https://x.com/imperooterxbt/status/2036261725176053777"
      },
      {
       "text": "Finally got the theunipcs block",
       "id": "2099556498057691147",
       "date": "2026-09-14",
       "link": "https://x.com/imperooterxbt/status/2099556498057691147"
      },
      {
       "text": "I was going to start a fight with TeTheGamer on his new account and I was blocked.",
       "id": "2035157496894300386",
       "date": "2026-03-21",
       "link": "https://x.com/imperooterxbt/status/2035157496894300386"
      },
      {
       "text": "I am blocked by half of the KOLs on this app.",
       "id": "2035157496894300386",
       "date": "2026-03-21",
       "link": "https://x.com/imperooterxbt/status/2035157496894300386"
      }
     ]
    },
    "health": {
     "organs": [
      {
       "organ": "sleep",
       "quote": {
        "text": "I don’t sleep I blink for a few minutes and keep clicking",
        "id": "1810671933794443274",
        "date": "2024-07-09",
        "link": "https://x.com/imperooterxbt/status/1810671933794443274"
       }
      },
      {
       "organ": "mind",
       "quote": {
        "text": "The tickers have started to speak to me",
        "id": "1806407657047162919",
        "date": "2024-06-27",
        "link": "https://x.com/imperooterxbt/status/1806407657047162919"
       }
      },
      {
       "organ": "skin",
       "quote": {
        "text": "My skin hasn’t felt the touch of the sun in months",
        "id": "1805794174064566398",
        "date": "2024-06-26",
        "link": "https://x.com/imperooterxbt/status/1805794174064566398"
       }
      },
      {
       "organ": "lifestyle",
       "quote": {
        "text": "get up at 4pm everyday after being unemployed for a year just to jerkoff and gamble $15 on Rainbet",
        "id": "2093023812308635705",
        "date": "2026-08-27",
        "link": "https://x.com/imperooterxbt/status/2093023812308635705"
       }
      },
      {
       "organ": "heart",
       "quote": {
        "text": "There isn’t any room for love in the darkness of my heart",
        "id": "1808680059722461349",
        "date": "2024-07-04",
        "link": "https://x.com/imperooterxbt/status/1808680059722461349"
       },
       "note": "Theo’s “only ever mentioned in opponents” is wrong: 1808680059722461349 is his own heart. Opponent version: 2108003240889454633"
      },
      {
       "organ": "bowel",
       "quote": {
        "text": "the smallest piece of poop known to man",
        "id": "2034331161657250055",
        "date": "2026-03-18",
        "link": "https://x.com/imperooterxbt/status/2034331161657250055"
       }
      },
      {
       "organ": "rectum",
       "quotes": [
        {
         "text": "hiding shanks inside my asshole",
         "id": "1791490909403492756",
         "date": "2024-05-17",
         "link": "https://x.com/imperooterxbt/status/1791490909403492756"
        },
        {
         "text": "I can almost fit a few snacks in there",
         "id": "2009355607967715702",
         "date": "2026-01-08",
         "link": "https://x.com/imperooterxbt/status/2009355607967715702"
        }
       ]
      },
      {
       "organ": "penis",
       "quote": {
        "text": "I’m still tissue soft",
        "id": "1814482773232546208",
        "date": "2024-07-20",
        "link": "https://x.com/imperooterxbt/status/1814482773232546208"
       },
       "indexCase": [
        {
         "text": "Rasmr has openly admitted to having erectile dysfunction",
         "id": "2035544565504151591",
         "date": "2026-03-22",
         "link": "https://x.com/imperooterxbt/status/2035544565504151591"
        },
        {
         "text": "who suffers from erectile dysfunction",
         "id": "2108016006643732892",
         "date": "2026-10-08",
         "link": "https://x.com/imperooterxbt/status/2108016006643732892"
        }
       ]
      },
      {
       "organ": "sexual history",
       "quotes": [
        {
         "text": "the last time I had sex was in jail",
         "id": "1799249732608684474",
         "date": "2024-06-08",
         "link": "https://x.com/imperooterxbt/status/1799249732608684474"
        },
        {
         "text": "Lost my virginity in jail",
         "id": "1811652607070334998",
         "date": "2024-07-12",
         "link": "https://x.com/imperooterxbt/status/1811652607070334998"
        },
        {
         "text": "I am a 36 year ol virgin",
         "id": "2034714744460804260",
         "date": "2026-03-19",
         "link": "https://x.com/imperooterxbt/status/2034714744460804260"
        }
       ]
      }
     ],
     "dropped": "Education (\"Middle school drop out\", 2009633489193521619) dropped: a bare reply, unclear whether it describes him.",
     "incident": {
      "name": "Acute Hate Deficiency",
      "from": "2026-02-09",
      "to": "2026-02-10",
      "remission": "21 h 37 m",
      "timeline": [
       {
        "time": "2026-02-09 20:20",
        "text": "I don’t have it in me to hate or fud anymore it was a good run.",
        "id": "2020955896193708043",
        "date": "2026-02-09",
        "link": "https://x.com/imperooterxbt/status/2020955896193708043"
       },
       {
        "time": "2026-02-09 21:05",
        "text": "I will find the strength within myself to hate again.",
        "id": "2020967327165190304",
        "date": "2026-02-09",
        "link": "https://x.com/imperooterxbt/status/2020967327165190304"
       },
       {
        "time": "2026-02-09 21:56",
        "text": "I have lost my ability to hate.",
        "id": "2020980230224216276",
        "date": "2026-02-09",
        "link": "https://x.com/imperooterxbt/status/2020980230224216276"
       },
       {
        "time": "2026-02-10 17:57",
        "text": "I got visibly angry. Maybe there is hope for me after all",
        "id": "2021282492330680626",
        "date": "2026-02-10",
        "link": "https://x.com/imperooterxbt/status/2021282492330680626"
       }
      ],
      "attendingNote": "The hate is load-bearing. Do not remove."
     },
     "hate61": {
      "regex": "\\bhat(?:e|es|ed|er|ers|ing|red)\\b",
      "occurrences": 25,
      "posts": 21
     },
     "prognosis": {
      "quote": {
       "text": "We regret to inform you … woke up alive and well this morning",
       "id": "2098824941051187659",
       "date": "2026-09-12",
       "link": "https://x.com/imperooterxbt/status/2098824941051187659"
      },
      "tag": "His words. We concur."
     }
    },
    "predictions": {
     "filed": "2026-10-08",
     "trackDays": 14,
     "scorecard": "2026-10-22",
     "rows": [
      {
       "n": 1,
       "prediction": "Posts about the fomo app in the next 24 h",
       "probability": "75%",
       "base": "98 posts on 46 of 61 days"
      },
      {
       "n": 2,
       "prediction": "Mentions Rainbet in the next 24 h",
       "probability": "39%",
       "base": "25 posts on 24 of 61 days · last: Oct 6 ’26, “Rainbet is saving her life”"
      },
      {
       "n": 3,
       "prediction": "…and that mention is a paid ad",
       "probability": "0%",
       "base": "0 of 26 mentions carry a disclosure, code or reflink"
      },
      {
       "n": 4,
       "prediction": "Posts about Unipcs in the next 24 h",
       "probability": "41%",
       "base": "14 of 34 days since Sep 5 · do not block the patient"
      },
      {
       "n": 5,
       "prediction": "Homerun #7 by Oct 10, ~04:00 UTC",
       "probability": "DUE",
       "base": "intervals: 644 days → 187 days → 10 days → 12 min → 37 h · median of last 3"
      },
      {
       "n": 6,
       "prediction": "Calls this account “the peanut gallery” if he replies 3+ times",
       "probability": "71%",
       "base": "5 of 7 recent 3+-reply fights (named in file)"
      },
      {
       "n": 7,
       "prediction": "A “my wife” bit within 7 days",
       "probability": "64%",
       "base": "9 in 61 days (Poisson) · 0 since Sep 15 ’26 · the wife allele may have switched to the boyfriend allele"
      },
      {
       "n": 8,
       "prediction": "If he says goodbye: back in",
       "probability": "17 min",
       "base": "median of 8 · 8 of 8 back within 3 h · max 149 min"
      },
      {
       "n": 9,
       "prediction": "Posts about Proxima in the next 24 h",
       "probability": "67%",
       "base": "10 of 15 days since Sep 24"
      },
      {
       "n": 10,
       "prediction": "Next stated age",
       "probability": "36",
       "base": "stable 184 days (Mar 19 → Sep 19) · expect a correction"
      }
     ],
     "support": {
      "fomo": {
       "regex": "\\bfomo",
       "posts61": 98,
       "days61": 46,
       "pct": 75,
       "postsAll": 106,
       "byYear": {
        "2024": 5,
        "2026": 101
       }
      },
      "rainbet": {
       "regex": "rainbet",
       "posts": 26,
       "days": 25,
       "posts61": 25,
       "days61": 24,
       "pct": 39,
       "adRegex": "#ad\\b|#sponsored|paid partnership|use (?:my )?code|promo code|\\bref(?:erral)? ?link|rainbet\\.com/\\S*\\?",
       "ads": 0,
       "adNote": "No Rainbet post carries an ad disclosure, a promo code or a referral link. \"Life after you take a Rainbet sponsorship\" (2086832414890856738) is a meme about other people, not a disclosure.",
       "ratePerTweet": 5000,
       "rateId": "2031952734010675372",
       "freeAdsUSD": 130000,
       "first": "2031952734010675372",
       "last": "2107456661543919682",
       "lastAt": "2026-10-06 13:03",
       "ids": [
        "2031952734010675372",
        "2086507218275291516",
        "2086832414890856738",
        "2087654170434142281",
        "2088817094624235949",
        "2089707645955408067",
        "2090846309016281516",
        "2091389747163971623",
        "2091893945622278583",
        "2092301822862209086",
        "2093023812308635705",
        "2094852980830851340",
        "2095273542333968792",
        "2095578512761496050",
        "2096065307861254581",
        "2097856902109470985",
        "2098862698758861198",
        "2099611834298888644",
        "2100052819873071524",
        "2100472888415416541",
        "2101828155526795489",
        "2103169109412233462",
        "2104006346991366468",
        "2104417858654495080",
        "2107269246929834493",
        "2107456661543919682"
       ]
      },
      "unipcs": {
       "regex": "unipcs",
       "posts": 44,
       "posts61": 41,
       "days61": 14,
       "blockId": "2099556498057691147",
       "blockAt": "2026-09-14 17:50",
       "before": 12,
       "sameMinute": 2,
       "after": 30,
       "ratio": 2.5,
       "daysSinceSep5": 34,
       "pctDay": 41,
       "rule": "before/after = strictly earlier/later minute than the block post; the block post and one reply share its minute (17:50) and are in neither."
      },
      "homeruns": {
       "rule": "last homerun + median of the last three intervals",
       "median": "37 h",
       "due": "2026-10-10 04:22 UTC"
      },
      "peanutFights": {
       "rule": "the seven 3+-reply fights named by the council (Rogan); each verified here at >= 3 replies in x_posts.json",
       "fights": [
        {
         "handle": "monke_",
         "replies": 7,
         "peanutGallery": true
        },
        {
         "handle": "dragonsdennnn",
         "replies": 5,
         "peanutGallery": true
        },
        {
         "handle": "serbobross",
         "replies": 4,
         "peanutGallery": true
        },
        {
         "handle": "0xPunishedFren",
         "replies": 3,
         "peanutGallery": true
        },
        {
         "handle": "BLESSEDJINGTAO",
         "replies": 19,
         "peanutGallery": true
        },
        {
         "handle": "cheemp_hl",
         "replies": 4,
         "peanutGallery": false
        },
        {
         "handle": "memeologist99",
         "replies": 5,
         "peanutGallery": false
        }
       ],
       "peanut": 5,
       "of": 7,
       "pct": 71
      },
      "wife": {
       "regex": "\\bmy (?:bitch |beautiful )?wife\\b",
       "posts": 18,
       "posts61": 9,
       "days61": 7,
       "byYear": {
        "2023": 1,
        "2024": 5,
        "2026": 12
       },
       "first": "1642257400747925505",
       "last": "2099893648158519455",
       "lastDate": "2026-09-15",
       "sinceLastDays": 23,
       "p7": 64,
       "p7model": "Poisson, 9 posts in 61 days -> 1 - e^-(9/61*7)",
       "ids": [
        "1642257400747925505",
        "1792050518283399575",
        "1794815759970869657",
        "1801361730922062308",
        "1805169276644380998",
        "1811680218542678339",
        "2026384034822070752",
        "2030318634728329469",
        "2034714744460804260",
        "2087654170434142281",
        "2091602644343332877",
        "2092368191574122503",
        "2092588895665791037",
        "2092676908164973051",
        "2092691616918073579",
        "2095285267833688455",
        "2097023599668261100",
        "2099893648158519455"
       ],
       "note": "\"my future wife\" (2036178727340745143) is excluded by the regex; it is not the wife."
      },
      "goodbyes": {
       "file": "raw/imperooter/goodbyes_002.json",
       "N": 8,
       "medianStayMin": 17,
       "stays": [
        2,
        2,
        3,
        5,
        29,
        30,
        128,
        149
       ],
       "maxStayMin": 149,
       "backWithin3h": 8,
       "completed": 0
      },
      "proxima": {
       "regex": "proxima",
       "posts": 19,
       "days": 10,
       "first": "2026-09-24",
       "spanDays": 15,
       "pct": 67
      },
      "age": {
       "records": [
        {
         "id": "1798764000295178728",
         "date": "2024-06-06",
         "value": "early twenties"
        },
        {
         "id": "2034714744460804260",
         "date": "2026-03-19",
         "value": 36
        },
        {
         "id": "2101351846073782563",
         "date": "2026-09-19",
         "value": 36
        }
       ],
       "earlyTwentiesReadAs": 23,
       "rate": 7.3,
       "yearsGained": 13,
       "months": 21,
       "stableDays": 184,
       "son": [
        {
         "id": "1801316487551983754",
         "date": "2024-06-13",
         "value": 16
        },
        {
         "id": "2011787754477142142",
         "date": "2026-01-15",
         "value": 13
        }
       ],
       "sonRate": -1.9,
       "sonAlt16": "1801014080703983780",
       "projectedNow": 40
      },
      "clock": {
       "peakHourUTC": 18,
       "peakHourPosts": 77,
       "days": 61,
       "daysWithPost1800to1824": 20,
       "pct1800": 33
      }
     },
     "openQuestion": "Patient #002 — for the file, please confirm your age. We have three on record.",
     "openQuestionRecords": [
      {
       "id": "1798764000295178728",
       "date": "2024-06-06",
       "value": "early twenties"
      },
      {
       "id": "2034714744460804260",
       "date": "2026-03-19",
       "value": 36
      },
      {
       "id": "2101351846073782563",
       "date": "2026-09-19",
       "value": 36
      }
     ]
    },
    "cards": [
     {
      "file": "assets/cards/patient-002-v5-age.png",
      "role": "thread 1 · age (lead)",
      "size": "1200x675",
      "report": "1"
     },
     {
      "file": "assets/cards/patient-002-v5-tree.png",
      "role": "thread 2 · family tree",
      "size": "1080x1350",
      "report": "2"
     },
     {
      "file": "assets/cards/patient-002-v5-genes.png",
      "role": "thread 3 · gene panel: two swabs (8 genes)",
      "size": "1080x1350",
      "report": "3"
     },
     {
      "file": "assets/cards/patient-002-v5-relatives.png",
      "role": "thread 4 · relatives: DNA matches",
      "size": "1080x1350",
      "report": "4"
     },
     {
      "file": "assets/cards/patient-002-v5-health.png",
      "role": "thread 5 · health: the body on file + incident",
      "size": "1080x1350",
      "report": "5"
     },
     {
      "file": "assets/cards/patient-002-v5-predictions.png",
      "role": "thread 6 · genetic risk report + open question",
      "size": "1080x1350",
      "report": "6"
     },
     {
      "file": "assets/cards/patient-002-v5-ancestry.png",
      "role": "ward page only · report A: ancestry (not a thread post)",
      "size": "1080x1350",
      "report": "A"
     }
    ],
    "consultation": {
     "notes": [],
     "placeholder": "Consultation notes open when the thread runs. What the patient does after his file is posted goes here, times in UTC, every quote linked."
    }
   },
   "hook": "Age, June 2024: “early twenties.” Age, March 2026: 36. Son, same period: 16, then 13. Father and son are ageing in opposite directions.",
   "diagnosis": {
    "name": "Self-Reported Pedigree Disorder",
    "short": "Self-Reported Pedigree Disorder",
    "tag": "patient-reported · lab-sequenced",
    "text": "Every relative in this file is a post the patient wrote. He has reported one son (who is getting younger), twelve children, a wife (18 posts), her boyfriend, a boyfriend of seven years and a leased Lamborghini. Income on file: $1,083 a month. Lease: $7,500."
   },
   "prognosis": "Per patient: “We regret to inform you … woke up alive and well this morning.” His words. We concur.",
   "legacy": { v3:
/* @@002 LEGACY v3 BEGIN */
  /* ---------- FILE #002 · HELD · v3: OCCUPATIONAL HEALTH REPORT (Council 9 cut, council/round9-comedy/COUNCIL9.md) ----------
     consent: 'pending' -> js/patients.js skips this record; the ward board keeps bed #002 as "name withheld".
     Flip consent to 'public participation <date>' (or 'given') when the owner says go.
     Every number: tools/patient002_v3_build.py (method + regex in its docstring); `python tools/patient002_v3_build.py --check` re-verifies
     (incl. every patient line of rounds[]). v2 kept for reference: tools/patient002_v2_build.py + raw/imperooter/counts_002_v2.json.
     shift/labs/timesheet = the 898 recent posts only (X search sweep, UTC). Specimen adds the Wayback history, incl. the older archive
     drawn under his previous handle (same account id 1262818098035462144).
     NO third-party names anywhere: apps, KOLs, launchpads, streamers are "one app", "one KOL", ...; the status link carries the rest.
     Nothing about wallets, trades or family. quotes.console is cut with '…' on purpose: the omitted half mentions family; never show it.
     Quotes are verbatim excerpts ('…' = text omitted). */
  {
    no: '002',
    handle: 'imperooterxbt',
    name: 'scooter',
    formerly: 'scooterxbt',
    joined: 'May 2020',
    avatar: null,           // drop a local copy at assets/patients/imperooterxbt.jpg and set this before go
    consent: 'pending',
    kind: 'occupational',   // Dept. of Occupational Health: the patient is assessed as an employee (unpaid, on shift)
    attending: 'Dr. H. Fennwick (hon.)',
    lab: 'PHARMA Holdings Clinical Laboratory',
    intake: { posts: 898, from: '2026-08-09', to: '2026-10-08', source: 'public timeline (X search sweep)' },
    specimen: {
      // drawn = snapshot; the @imperooterxbt Wayback recovery is still running (--check prints the latest)
      drawn: 3094, archived: 14414, pct: 21.5, days: 61, from: '2026-08-09', to: '2026-10-08',
      parts: [
        { posts: 1612, from: '2022-12-11', to: '2024-07-23', src: 'Internet Archive, as @scooterxbt' },
        { posts: 584, from: '2026-02-16', to: '2026-05-31', src: 'Internet Archive, as @imperooterxbt' },
        { posts: 898, from: '2026-08-09', to: '2026-10-08', src: 'public timeline (X search sweep)' },
      ],
      method: 'Internet Archive (Wayback Machine) + public timeline',
      note: 'Older sample (1,612 posts, Dec 2022 – Jul 2024) drawn under the patient’s previous handle, @scooterxbt. Same patient, same account. Panel, clock and timesheet use the 898 recent posts only.',
      accession: 'PHL-002-0920',
    },
    /* Shift record (UTC). hours[] = posts per UTC hour 00..23; quiet = the 6-hour window with the fewest posts; longest = the two longest gaps.
       subjects = posts (and distinct days) naming the subject, @-tags included; words = cleaned text (no handles/links). */
    shift: {"days": 61, "daysOff": 0, "medianGapMin": 24, "longest": [{"h": 21.2, "date": "2026-09-08"}, {"h": 18.4, "date": "2026-08-31"}], "hours": [56, 50, 36, 37, 28, 27, 29, 20, 7, 22, 23, 25, 10, 21, 35, 41, 59, 59, 77, 39, 50, 56, 54, 37], "quiet": {"from": 7, "to": 13, "posts": 107}, "maxDay": {"date": "2026-09-22", "posts": 80}, "replies": 418, "words": {"hate": 25, "grift": 19, "vamp": 21, "farm": 35, "gambling": 32, "thanks": 11}, "subjects": {"one app": {"posts": 98, "days": 46}, "one KOL": {"posts": 41, "days": 14}, "a streamer": {"posts": 25, "days": 14}, "one launchpad": {"posts": 54, "days": 9}, "another launchpad": {"posts": 36, "days": 19}, "one casino": {"posts": 25, "days": 24}, "one tool": {"posts": 19, "days": 10}}},
    coverage: 'Sweep coverage is uneven: 49–80 posts/day were recovered Sep 22–25 (mostly replies) vs about 11/day elsewhere.',
    /* Timesheet: 9 weeks from Aug 9 (last row Oct 4–8, 5 days). maxBreak = longest gap starting that week (h). subject = most-posted-about label that week.
       archive:true rows carry a 2024 quote from the old handle (dated by its own post, labelled "from the archive" on the card). No row is flagged. */
    timesheet: [{"from": "2026-08-09", "to": "2026-08-15", "posts": 58, "replies": 15, "maxBreak": 14.9, "subject": "one app", "subjectPosts": 11, "quote": "I wake up make a few posts about fud and ragebait a few people…", "id": "2087258003137282218"}, {"from": "2026-08-16", "to": "2026-08-22", "posts": 76, "replies": 22, "maxBreak": 16.3, "subject": "one app", "subjectPosts": 15, "quote": "…I’m not nice I’m a hater", "id": "1796807382573461729", "archive": true, "date": "2024-06-01"}, {"from": "2026-08-23", "to": "2026-08-29", "posts": 88, "replies": 33, "maxBreak": 13.8, "subject": "one app", "subjectPosts": 13, "quote": "I don’t know how y’all do that 9-5 shit", "id": "2092664235750793288"}, {"from": "2026-08-30", "to": "2026-09-05", "posts": 88, "replies": 33, "maxBreak": 18.4, "subject": "one app", "subjectPosts": 13, "quote": "KOLs are getting paid 100k a week for shilling 20 token charts that look exactly like this.", "id": "2095700401207079173"}, {"from": "2026-09-06", "to": "2026-09-12", "posts": 56, "replies": 11, "maxBreak": 21.2, "subject": "everyone, equally", "subjectPosts": 2, "quote": "I will continue posting on this app and hating on this app until I quit or die", "id": "1797720407295885785", "archive": true, "date": "2024-06-03"}, {"from": "2026-09-13", "to": "2026-09-19", "posts": 84, "replies": 31, "maxBreak": 13.6, "subject": "one KOL", "subjectPosts": 19, "quote": "…We do not hate them enough.", "id": "2099899330312180101"}, {"from": "2026-09-20", "to": "2026-09-26", "posts": 297, "replies": 206, "maxBreak": 11.1, "subject": "one launchpad", "subjectPosts": 51, "quote": "Never piss off someone on CT who is petty and has unlimited time on their hands.", "id": "2102552446639997247"}, {"from": "2026-09-27", "to": "2026-10-03", "posts": 62, "replies": 21, "maxBreak": 13.3, "subject": "one app", "subjectPosts": 6, "quote": "…I’m built different.", "id": "2104734441432134099"}, {"from": "2026-10-04", "to": "2026-10-08", "posts": 89, "replies": 46, "maxBreak": 14.9, "subject": "one tool", "subjectPosts": 11, "quote": "…I will work my entire life to own a home gaming console.", "id": "2107831157874376945"}],
    timesheetFoot: { hours: 'all of them', overtime: 'unpaid', wage: '$0 on file · career goal, per patient: “own a home gaming console.”', employer: 'none on file',
                     supervisor: 'none (patient-reported, 2024)', pull: 'ninefive', footer: 'getajob' },
    /* The patient's own words. Each verbatim, linked by id (x.com/imperooterxbt/status/<id> redirects for both handles). */
    quotes: {"quit": {"text": "I will continue posting on this app and hating on this app until I quit or die", "id": "1797720407295885785", "date": "2024-06-03"}, "blink": {"text": "I don’t sleep I blink for a few minutes and keep clicking", "id": "1810671933794443274", "date": "2024-07-09"}, "boss": {"text": "I came to crypto because I am too mentally unstable to have a boss tell me what to do…", "id": "1802459743727808638", "date": "2024-06-16"}, "hater": {"text": "…I’m not nice I’m a hater", "id": "1796807382573461729", "date": "2024-06-01"}, "petty": {"text": "Never piss off someone on CT who is petty and has unlimited time on their hands.", "id": "2102552446639997247", "date": "2026-09-23"}, "lastvoice": {"text": "…I was the last voice on CT…", "id": "2102446193179594857", "date": "2026-09-22"}, "hateenough": {"text": "…We do not hate them enough.", "id": "2099899330312180101", "date": "2026-09-15"}, "built": {"text": "…I’m built different.", "id": "2104734441432134099", "date": "2026-09-29"}, "console": {"text": "…I will work my entire life to own a home gaming console.", "id": "2107831157874376945", "date": "2026-10-07"}, "ninefive": {"text": "I don’t know how y’all do that 9-5 shit", "id": "2092664235750793288", "date": "2026-08-26"}, "getajob": {"text": "Get a job maybe", "id": "2103057318573191661", "date": "2026-09-24"}, "morning": {"text": "I wake up make a few posts about fud and ragebait a few people…", "id": "2087258003137282218", "date": "2026-08-11"}},
    labs: [{"test": "Days Off", "result": "0", "unit": "days", "detail": "in 61 days on shift", "ref": "1 per week", "flag": "CRIT", "note": "All 61 days have posts on them.", "card": true}, {"test": "Posting Rate", "sub": "median interval", "result": "24", "unit": "min", "detail": "between posts · 898 posts", "ref": "4–8 h", "flag": "H", "note": "Patient skips lunch.", "card": true}, {"test": "Longest Break", "result": "21.2", "unit": "h", "detail": "Sep 8", "ref": "—", "flag": "NOTE", "note": "Lab assumes he blinked.", "card": true}, {"test": "Sleep", "result": "not on file", "detail": "quietest 6 h (07–13 UTC): 107 posts", "ref": "7–9 h", "flag": "L", "note": "Patient reports blinking.", "card": true}, {"test": "Hate Reserve", "result": "25", "unit": "“hate”s", "detail": "hate, hating, hater, hatred", "ref": "any", "flag": "N", "note": "Patient says supply is low. Lab found 25.", "card": true}, {"test": "Subject Fixation", "result": "98", "unit": "posts", "detail": "one app · on 46 of 61 days", "ref": "under 10", "flag": "CRIT", "note": "Three days out of four. Same app.", "card": true}, {"test": "Gratitude", "result": "11", "unit": "thank-yous", "detail": "in 898 posts", "ref": "any", "flag": "N", "note": "Courteous on shift.", "card": true}],
    hook: '61 days. 0 days off. His quietest six hours of the day still clocked 107 posts.',
    complaint: { quote: "Never piss off someone on CT who is petty and has unlimited time on their hands.", id: '2102552446639997247', date: '2026-09-23', frame: 'Patient issued his own safety notice.' },
    diagnosis: {
      name: 'Chronic Unlimited-Time Syndrome',
      short: 'Chronic Unlimited-Time Syndrome',
      tag: 'patient-reported · lab-confirmed',
      text: 'Patient presents as a full-time hater with no employer, no supervisor and no days off. In 61 days on shift he posted 898 times, a median of 24 minutes apart, and never once went a full day without clocking in. His quietest six hours of the day still produced 107 posts. Patient-reported since 2024. Lab-confirmed.',
    },
    rx: [
      { product: 'workferdabagtin', arm: 'For Chronic Unlimited-Time Syndrome', label: 'Take before your shift, after your shift, during your shift. Patient has one shift.' },
      { product: 'conspiraspirin', arm: 'For Occupational Hatred', label: 'For when the theories keep turning out to be true. Dosage unchanged.' },
    ],
    rxCard: {                 // share card only (walk-ins, reply ammo); not in the thread
      cond: 'Chronic Unlimited-Time Syndrome',
      sig: 'Take before your shift, after your shift, during your shift. Patient has one shift.',
      warns: ['Do not operate a timeline while drowsy.', 'May cause posting at 3 a.m. Already does.'],
      date: '10/08/2026',
    },
    /* Retirement Plan (thread closer). quote = quotes.console, shown with its ellipsis and nothing else. */
    retirement: { goal: 'home gaming console.', eta: 'entire life.', status: 'on track.', quote: 'console' },
    /* Form PTO-002 (held: reply to his response, or a 5th post 24 h later if he is silent). Blank fields stay blank. */
    pto: { form: 'PTO-002', employee: '#002', position: 'Hater', supervisor: 'none', accrued: 0, taken: 0, blank: ['Days requested', 'Reason', 'Employee signature'],
           stamp: 'NEVER FILED', footer: 'Form held on file. The lab will wait. The patient will not.' },
    /* Radiology (held: second reply, or day three). */
    xray: { accession: 'PHL-002-THUMB', view: 'Right thumb, PA view',
            findings: 'Right thumb. Load-bearing. Bone density consistent with 898 posts. Thumb appears to be on shift independently of patient.',
            impression: 'Fit for duty. Thumb did not consent to the 21.2 h break and is filing separately.' },
    /* ROUNDS pilot, "Consultation, Room 2" (day two, text screenshot). Every PATIENT line is his verbatim post (id); the doctor's lines are ours. */
    rounds: [{"who": "DR. FENNWICK", "text": "Come in, sit. How are we sleeping?"}, {"who": "PATIENT", "text": "I don’t sleep I blink for a few minutes and keep clicking", "id": "1810671933794443274"}, {"who": "DR. FENNWICK", "text": "(writes for a long time) Lovely. And who do you report to?"}, {"who": "PATIENT", "text": "I came to crypto because I am too mentally unstable to have a boss tell me what to do", "id": "1802459743727808638"}, {"who": "DR. FENNWICK", "text": "Self-employed. Good, good. Walk me through a typical morning."}, {"who": "PATIENT", "text": "I wake up make a few posts about fud and ragebait a few people…", "id": "2087258003137282218"}, {"who": "DR. FENNWICK", "text": "And would you describe yourself as a nice person?"}, {"who": "PATIENT", "text": "I’m not nice I’m a hater", "id": "1796807382573461729"}, {"who": "DR. FENNWICK", "text": "That’s on the form, actually, thank you. Are we getting enough hate?"}, {"who": "PATIENT", "text": "We do not hate them enough.", "id": "2099899330312180101"}, {"who": "DR. FENNWICK", "text": "I’ll note “requests higher dose.” Ever considered regular hours? A lanyard?"}, {"who": "PATIENT", "text": "I don’t know how y’all do that 9-5 shit", "id": "2092664235750793288"}, {"who": "DR. FENNWICK", "text": "Neither do I. Long-term goals?"}, {"who": "PATIENT", "text": "…I will work my entire life to own a home gaming console.", "id": "2107831157874376945"}, {"who": "DR. FENNWICK", "text": "(puts down pen, moved) That’s beautiful. And how long do you plan to keep this up?"}, {"who": "PATIENT", "text": "I will continue posting on this app and hating on this app until I quit or die", "id": "1797720407295885785"}, {"who": "DR. FENNWICK", "text": "So, a career. Fit for duty."}, {"who": "PATIENT", "dir": "(on his way out, unprompted)", "text": "Never piss off someone on CT who is petty and has unlimited time on their hands", "id": "2102552446639997247"}, {"who": "DR. FENNWICK", "text": "(to nurse) Cancel my two o’clock. I want to watch him work."}],
    /* Roast set (held, text screenshot). Council 9 trimmed the unverifiable "works longer hours" line. Every number is in shift/labs. */
    roast: "@imperooterxbt.\n\nSixty-one days. Zero days off.\nOne post every 24 minutes. That’s not a poster. That’s a smoke detector.\n\nHis quietest six hours of the day? 107 posts.\nThat’s his nap.\n\nIn his words: “I don’t sleep I blink for a few minutes and keep clicking.”\nThe lab checked. Longest blink: 21.2 hours. September 8th.\nWe assume he blinked.\n\n98 posts about one app. On 46 of 61 days.\n\nWage on file: $0.\n“I don’t know how y’all do that 9-5 shit.”\nBrother, you’re doing a 0-to-24.\nRetirement plan, his words: “…I will work my entire life to own a home gaming console.”\n\nHe said he’d keep posting “until I quit or die.”\n\nPatient has not quit.\n\nAnd another thing: 11 thank-yous in 898 posts.\nThe lab flagged it. Out of character.",
    cards: [
      { file: 'assets/cards/patient-002-chart.png', role: 'thread 1 · punch clock', size: '1200x675' },
      { file: 'assets/cards/patient-002-receipt.png', role: 'thread 2 · timesheet', size: '1080x1350' },
      { file: 'assets/cards/patient-002.png', role: 'thread 3 · panel', size: '1080x1350' },
      { file: 'assets/cards/patient-002-retirement.png', role: 'thread 4 · retirement plan (closer)', size: '1200x675' },
      { file: 'assets/cards/patient-002-consult.png', role: 'day two · ROUNDS, Consultation Room 2', size: '1080x1350' },
      { file: 'assets/cards/patient-002-xray.png', role: 'day three / 2nd reply · radiology', size: '1080x1350' },
      { file: 'assets/cards/patient-002-pto.png', role: 'held · Form PTO-002', size: '1080x1350' },
      { file: 'assets/cards/patient-002-roast.png', role: 'held · roast set', size: '1080x1350' },
      { file: 'assets/cards/patient-002-rx.png', role: 'share card only (not in thread)', size: '1080x1350' },
    ],
    cardPrognosis: 'Per patient: “until I quit or die.” Patient has not quit.',
    prognosis: 'Stable. Per patient: “until I quit or die.” Patient has not quit. Retirement plan, per patient: a home gaming console. Status: on track.',
  }
  /* @@002 LEGACY v3 END */
  }
  },
  /* @@002 END */
  /* @@003 BEGIN: generated by tools/patient003_build.py (write_ward). Edit the build, not this block. */
  /* FILE #003 · HELD · walk-in: @Clive_99. consent 'pending' -> js/patients.js skips this record.
     Every quote verbatim with its X status id (Q gate). Counts: raw/clive_99/counts_003.json. */
  {
   "no": "003",
   "version": "v1",
   "tier": "walk-in",
   "handle": "clive_99",
   "name": "Clive",
   "joined": null,
   "avatar": null,
   "consent": "pending",
   "consentNote": "Held. Not posted. Flip to 'public participation <date>' or 'public-figure' on the owner's word. NOTE: js/patients.js has no walk-in renderer yet (it renders #001 labs and #002 genome); add one before flipping.",
   "thread": null,
   "posted": null,
   "kind": "walk-in",
   "attending": "Dr. H. Fennwick (hon.)",
   "lab": "PHARMA Holdings Clinical Laboratory",
   "referredBy": {
    "dept": "Plague Desk",
    "page": "plague.html"
   },
   "title": "PATIENT FILE #003: WALK-IN",
   "intake": {
    "posts": 4480,
    "from": "2026-05-29",
    "to": "2026-10-09",
    "source": "public timeline (profile + replies pull)"
   },
   "specimen": {
    "corpus": 4480,
    "from": "2026-05-29",
    "to": "2026-10-09",
    "days": 134,
    "method": "public timeline",
    "file": "raw/clive_99/profile_pull.json",
    "note": "Fence open: names, crude posts. Floor: no slur, no post on race or religion; nothing on wallets, holdings, trades or P&L."
   },
   "counts": "raw/clive_99/counts_003.json",
   "walkin": {
    "vitals": {
     "postsPerDay": 33.4,
     "days": 134,
     "daysOff": 0,
     "longestSilence": "23 h 47 m",
     "medianGapMin": 15.3,
     "peakET": "9 am–1 pm (28%)",
     "quiet3to6ET": 20,
     "imagePct": 51,
     "imagePosts": 2288,
     "videoPosts": 1274,
     "chiefComplaintLikes": 4240
    },
    "complaint": {
     "text": "My Covid antibodies preparing to fight the pneumonic plague",
     "id": "2107190474289144103",
     "date": "2026-10-05",
     "link": "https://x.com/Clive_99/status/2107190474289144103",
     "frame": "Flagged by the Plague Desk, Oct 5 2026.",
     "likes": 4240,
     "views": 82371
    },
    "plague": [
     {
      "text": "crypto to explode… Lets ride",
      "id": "2107170129855353040",
      "date": "2026-10-05",
      "link": "https://x.com/Clive_99/status/2107170129855353040"
     },
     {
      "text": "big pharma company board rooms",
      "id": "2107173155827814445",
      "date": "2026-10-05",
      "link": "https://x.com/Clive_99/status/2107173155827814445"
     },
     {
      "text": "My Covid antibodies preparing to fight the pneumonic plague",
      "id": "2107190474289144103",
      "date": "2026-10-05",
      "link": "https://x.com/Clive_99/status/2107190474289144103"
     },
     {
      "text": "What’s left of the Covid vaccine in my body trying to fight the pneumonic plague",
      "id": "2107263197262574034",
      "date": "2026-10-06",
      "link": "https://x.com/Clive_99/status/2107263197262574034"
     }
    ],
    "labs": [
     {
      "test": "Serum Ansem",
      "result": "319",
      "unit": "posts",
      "detail": "7.1% of all posts · 356 uses · on 83 of 128 days since first mention",
      "ref": "0 per day",
      "flag": "CRIT",
      "regex": "ansem",
      "quotes": [
       {
        "text": "Can you believe Ansem still doesn't even follow me?",
        "id": "2071113541818466326",
        "date": "2026-06-28",
        "link": "https://x.com/Clive_99/status/2071113541818466326"
       },
       {
        "text": "Day 2 of not getting an airdrop from Ansem",
        "id": "2071701020162343113",
        "date": "2026-06-29",
        "link": "https://x.com/Clive_99/status/2071701020162343113"
       },
       {
        "text": "Did anyone even get an Ansem airdrop? … I’ll go first. No.",
        "id": "2099871950361288804",
        "date": "2026-09-15",
        "link": "https://x.com/Clive_99/status/2099871950361288804"
       }
      ],
      "card": true
     },
     {
      "test": "Bagworking",
      "result": "563",
      "unit": "posts",
      "detail": "648 uses · 4.2 posts a day · self-title “The Prince of Bagworking” ×5",
      "ref": "—",
      "flag": "H",
      "regex": "bagwork",
      "quotes": [
       {
        "text": "Bagworking is simply attacking the timeline relentlessly without regard or concern for what other people think",
        "id": "2073070332244631998",
        "date": "2026-07-03",
        "link": "https://x.com/Clive_99/status/2073070332244631998"
       },
       {
        "text": "We are all The Bagworker.",
        "id": "2071134192746787288",
        "date": "2026-06-28",
        "link": "https://x.com/Clive_99/status/2071134192746787288"
       }
      ],
      "card": true
     },
     {
      "test": "Ansem Airdrop Posts",
      "result": "53",
      "unit": "posts",
      "detail": "received, per patient: none",
      "ref": "0",
      "flag": "H",
      "regex": "ansem AND (airdrop|stimmy|\\bdrop\\b)",
      "quotes": [
       {
        "text": "Ansem never sent me a cent",
        "id": "2097308923556516286",
        "date": "2026-09-08",
        "link": "https://x.com/Clive_99/status/2097308923556516286"
       },
       {
        "text": "Day 5 of no Ansem stimmy for Clive",
        "id": "2073216097868742816",
        "date": "2026-07-04",
        "link": "https://x.com/Clive_99/status/2073216097868742816"
       },
       {
        "text": "How I’m starting to treat my kids after day 28 of no $ANSEM drop",
        "id": "2080860501366510040",
        "date": "2026-07-25",
        "link": "https://x.com/Clive_99/status/2080860501366510040"
       },
       {
        "text": "Imagine if Ansem doesn’t airdrop me.",
        "id": "2071627978442748075",
        "date": "2026-06-29",
        "link": "https://x.com/Clive_99/status/2071627978442748075"
       }
      ],
      "card": true
     },
     {
      "test": "Most-tagged account",
      "result": "@blknoiz06",
      "detail": "26 tags",
      "ref": "n/a",
      "flag": "-",
      "card": true
     },
     {
      "test": "$CLIVE (own coin)",
      "result": "61",
      "unit": "mentions",
      "ref": "n/a",
      "flag": "NOTE",
      "card": false
     },
     {
      "test": "Lloyd",
      "result": "27",
      "unit": "posts",
      "detail": "“Lil Lloyd”: a meme character with its own token ($Lloyd), posted mostly Aug 19-23 2026; riffs on Lloyd Christmas. Images not reviewed.",
      "quote": {
       "text": "That new Lloyd just dropped",
       "id": "2090291685506810011",
       "date": "2026-08-20",
       "link": "https://x.com/Clive_99/status/2090291685506810011"
      },
      "ref": "n/a",
      "flag": "NOTE",
      "card": false
     }
    ],
    "bagworkingDefinition": {
     "text": "Bagworking is simply attacking the timeline relentlessly without regard or concern for what other people think",
     "id": "2073070332244631998",
     "date": "2026-07-03",
     "link": "https://x.com/Clive_99/status/2073070332244631998"
    },
    "princeTitle": [
     {
      "text": "The Prince of Bagworking",
      "id": "2073196133627711598",
      "date": "2026-07-04",
      "link": "https://x.com/Clive_99/status/2073196133627711598"
     },
     {
      "text": "just made a custom pnl card for the Prince of Bagworking",
      "id": "2099909632160305377",
      "date": "2026-09-15",
      "link": "https://x.com/Clive_99/status/2099909632160305377"
     }
    ],
    "topPost": {
     "text": "Solana traders coming to fuck up robinhood chain",
     "id": "2094837131843682371",
     "date": "2026-09-01",
     "link": "https://x.com/Clive_99/status/2094837131843682371",
     "likes": 7352,
     "views": 578448
    }
   },
   "diagnosis": {
    "name": "Chronic Bagworking, Ansem-dependent",
    "lines": [
     "Presents with 33.4 posts a day. Has not taken a day off since May 29.",
     "Sleep window 3–6 am ET. Posted in it 20 times anyway.",
     "Ansem appears in 319 posts. Airdrops received, per patient: none.",
     "Calls the condition “bagworking” (563 posts) and himself its Prince.",
     "Oct 5: told of a pneumonic plague outbreak, replied “crypto to explode… Lets ride”",
     "Immune status: Covid antibodies, self-reported, on standby."
    ]
   },
   "rx": [
    {
     "product": "workferdabagtin",
     "arm": "For Chronic Bagworking",
     "label": "Patient already exceeds the maximum dose."
    }
   ],
   "cards": [
    {
     "file": "assets/cards/patient-003-intake.png",
     "role": "thread 1 · intake sheet (lead)",
     "size": "1200x675"
    },
    {
     "file": "assets/cards/patient-003-vitals.png",
     "role": "thread 2 · lab values: Serum Ansem + Bagworking",
     "size": "1200x675"
    },
    {
     "file": "assets/cards/patient-003-note.png",
     "role": "thread 3 · physician’s note + Rx",
     "size": "1200x675"
    }
   ],
   "cardCounts": {
    "intake": {
     "postsPerDay": 33.4,
     "days": 134,
     "daysOff": 0,
     "longestSilence": "23 h 47 m",
     "medianGapMin": 15.3,
     "peakET": "9 am–1 pm (28%)",
     "quiet3to6ET": 20,
     "imagePct": 51,
     "imagePosts": 2288,
     "videoPosts": 1274,
     "chiefComplaintLikes": 4240
    },
    "vitals": {
     "ansemPosts": 319,
     "ansemPct": 7.1,
     "ansemDays": 83,
     "ansemSpanDays": 128,
     "blknoiz06Tags": 26,
     "bagPosts": 563,
     "bagPerDay": 4.2,
     "bagUses": 648,
     "princePosts": 5,
     "airdropPosts": 53
    },
    "note": {
     "postsPerDay": 33.4,
     "quiet3to6ET": 20,
     "ansemPosts": 319,
     "bagPosts": 563
    }
   },
   "consultation": {
    "notes": [],
    "placeholder": "Consultation notes open when the thread runs. Times in UTC, every quote linked."
   },
   "hook": "The Plague Desk flagged him on Oct 5: “My Covid antibodies preparing to fight the pneumonic plague.” Bloodwork: 33.4 posts a day, 0 days off in 134, 7% Ansem.",
   "prognosis": "Will post through it. Has posted every day since May 29 (134 of 134)."
  },
  /* @@003 END */
];

/* Walk-in clinic: replied asking for their own file on 2026-10-08 and got a Pharmussy label instead. Prescription only, no bloodwork. */
window.WALKINS = [
  { handle: 'CryptoTroy_', said: 'show me how much of a legend am i', condition: 'Asked a pharmacy if he is a legend', drug: 'FOMA®', card: 'assets/cards/walkin-CryptoTroy_.png' },
  { handle: 'n00dlefry', said: 'draw me', condition: 'Replied “draw me” to a stranger', drug: 'Copium Mist®', card: 'assets/cards/walkin-n00dlefry.png' },
  { handle: 'Looke_web3', said: 'draw me', condition: 'Replied “draw me” to a stranger', drug: 'Rugburn®', card: 'assets/cards/walkin-Looke_web3.png' },
];
