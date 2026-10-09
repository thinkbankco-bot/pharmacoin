/* Patient File #002 v4 (Council 10: DISCHARGED AGAINST MEDICAL ADVICE). Built by tools/patient002_v4_build.py.
   Same schema as the #002 record in site/data/patients.js plus goodbyes / vitals / readback / incident / yoy.
   consent: pending (not live). Every quote verbatim with its X status id; link https://x.com/imperooterxbt/status/<id>. */
window.PATIENT_002_V4 = {
 "no": "002",
 "version": "v4",
 "handle": "imperooterxbt",
 "name": "scooter",
 "formerly": "scooterxbt",
 "joined": "May 2020",
 "avatar": null,
 "consent": "pending",
 "kind": "discharge",
 "attending": "Dr. H. Fennwick (hon.)",
 "lab": "PHARMA Holdings Clinical Laboratory",
 "title": "PATIENT FILE #002: DISCHARGED AGAINST MEDICAL ADVICE (×8)",
 "intake": {
  "posts": 898,
  "from": "2026-08-09",
  "to": "2026-10-08",
  "source": "public timeline (X search sweep)"
 },
 "specimen": {
  "corpus": 3285,
  "days": 61,
  "from": "2026-08-09",
  "to": "2026-10-08",
  "method": "Internet Archive (Wayback Machine) + public timeline",
  "file": "raw/imperooter/CORPUS.txt",
  "note": "Goodbyes are drawn from the whole corpus (2022 – Oct 8 2026). Vitals use the 898 recent posts only. Archive-era stays are maximums."
 },
 "shift": {
  "days": 61,
  "daysOff": 0,
  "medianGapMin": 24,
  "longest": [
   {
    "h": 21.2,
    "date": "2026-09-08"
   }
  ],
  "quiet": {
   "from": 7,
   "to": 13,
   "posts": 107
  },
  "hours": [
   56,
   50,
   36,
   37,
   28,
   27,
   29,
   20,
   7,
   22,
   23,
   25,
   10,
   21,
   35,
   41,
   59,
   59,
   77,
   39,
   50,
   56,
   54,
   37
  ]
 },
 "vitals": {
  "posts": 898,
  "days": 61,
  "daysWithPost": 61,
  "daysOff": 0,
  "medianGapMin": 24,
  "longestGapH": 21.2,
  "longestGapStart": "2026-09-08 15:38",
  "quiet": {
   "fromUTC": 7,
   "toUTC": 13,
   "posts": 107
  },
  "daily": [
   [
    "2026-08-09",
    6
   ],
   [
    "2026-08-10",
    8
   ],
   [
    "2026-08-11",
    9
   ],
   [
    "2026-08-12",
    9
   ],
   [
    "2026-08-13",
    7
   ],
   [
    "2026-08-14",
    14
   ],
   [
    "2026-08-15",
    5
   ],
   [
    "2026-08-16",
    7
   ],
   [
    "2026-08-17",
    14
   ],
   [
    "2026-08-18",
    11
   ],
   [
    "2026-08-19",
    12
   ],
   [
    "2026-08-20",
    8
   ],
   [
    "2026-08-21",
    12
   ],
   [
    "2026-08-22",
    12
   ],
   [
    "2026-08-23",
    14
   ],
   [
    "2026-08-24",
    19
   ],
   [
    "2026-08-25",
    6
   ],
   [
    "2026-08-26",
    23
   ],
   [
    "2026-08-27",
    4
   ],
   [
    "2026-08-28",
    13
   ],
   [
    "2026-08-29",
    9
   ],
   [
    "2026-08-30",
    10
   ],
   [
    "2026-08-31",
    4
   ],
   [
    "2026-09-01",
    12
   ],
   [
    "2026-09-02",
    17
   ],
   [
    "2026-09-03",
    16
   ],
   [
    "2026-09-04",
    17
   ],
   [
    "2026-09-05",
    12
   ],
   [
    "2026-09-06",
    16
   ],
   [
    "2026-09-07",
    6
   ],
   [
    "2026-09-08",
    4
   ],
   [
    "2026-09-09",
    4
   ],
   [
    "2026-09-10",
    6
   ],
   [
    "2026-09-11",
    15
   ],
   [
    "2026-09-12",
    5
   ],
   [
    "2026-09-13",
    18
   ],
   [
    "2026-09-14",
    21
   ],
   [
    "2026-09-15",
    10
   ],
   [
    "2026-09-16",
    14
   ],
   [
    "2026-09-17",
    5
   ],
   [
    "2026-09-18",
    6
   ],
   [
    "2026-09-19",
    10
   ],
   [
    "2026-09-20",
    13
   ],
   [
    "2026-09-21",
    16
   ],
   [
    "2026-09-22",
    80
   ],
   [
    "2026-09-23",
    49
   ],
   [
    "2026-09-24",
    54
   ],
   [
    "2026-09-25",
    70
   ],
   [
    "2026-09-26",
    15
   ],
   [
    "2026-09-27",
    11
   ],
   [
    "2026-09-28",
    9
   ],
   [
    "2026-09-29",
    13
   ],
   [
    "2026-09-30",
    5
   ],
   [
    "2026-10-01",
    8
   ],
   [
    "2026-10-02",
    9
   ],
   [
    "2026-10-03",
    7
   ],
   [
    "2026-10-04",
    10
   ],
   [
    "2026-10-05",
    6
   ],
   [
    "2026-10-06",
    22
   ],
   [
    "2026-10-07",
    17
   ],
   [
    "2026-10-08",
    34
   ]
  ],
  "postsOver100Likes": 300,
  "postsAtLeast100Likes": 302,
  "flatlineDays": 0
 },
 "goodbyes": {
  "N": 8,
  "medianStayMin": 17,
  "completed": 0,
  "finalTweetGapDays": 22,
  "rows": [
   {
    "line": 294,
    "id": "1795768002043924568",
    "date": "2024-05-29",
    "out": "10:43",
    "backId": "1795768706049397045",
    "backLine": 295,
    "backDate": "2024-05-29",
    "back": "10:46",
    "stayMin": 3,
    "stay": "3 min",
    "max": true,
    "source": "Internet Archive (may be missing posts: stay is a maximum)",
    "link": "https://x.com/imperooterxbt/status/1795768002043924568",
    "note": "Explicit quit-the-app announcement (reply). Trimmed to the last sentence; earlier text names a third party.",
    "statement": "I AM QUITTING THIS APP"
   },
   {
    "line": 330,
    "id": "1795986010423075094",
    "date": "2024-05-30",
    "out": "01:10",
    "backId": "1795986584476520878",
    "backLine": 331,
    "backDate": "2024-05-30",
    "back": "01:12",
    "stayMin": 2,
    "stay": "2 min",
    "max": true,
    "source": "Internet Archive (may be missing posts: stay is a maximum)",
    "link": "https://x.com/imperooterxbt/status/1795986010423075094",
    "note": "\"My final tweet.\" #1 (opens a quit-this-site copypasta after a fake-launch bit). Only the three words are quoted.",
    "statement": "My final tweet."
   },
   {
    "line": 558,
    "id": "1799279575849160829",
    "date": "2024-06-08",
    "out": "03:17",
    "backId": "1799280713679958510",
    "backLine": 559,
    "backDate": "2024-06-08",
    "back": "03:22",
    "stayMin": 5,
    "stay": "5 min",
    "max": true,
    "source": "Internet Archive (may be missing posts: stay is a maximum)",
    "link": "https://x.com/imperooterxbt/status/1799279575849160829",
    "note": "Explicit break announcement.",
    "statement": "I am taking an extending break from twitter. … See you guys a few months from now"
   },
   {
    "line": 561,
    "id": "1799290831553298598",
    "date": "2024-06-08",
    "out": "04:02",
    "backId": "1799298381711384728",
    "backLine": 562,
    "backDate": "2024-06-08",
    "back": "04:32",
    "stayMin": 30,
    "stay": "30 min",
    "max": true,
    "source": "Internet Archive (may be missing posts: stay is a maximum)",
    "link": "https://x.com/imperooterxbt/status/1799290831553298598",
    "note": "Re-announced hiatus after replying at 03:22; a hiatus, not just a goodnight.",
    "statement": "It is time I take my hiatus goodbye and goodnight for now"
   },
   {
    "line": 795,
    "id": "1802506338204856774",
    "date": "2024-06-17",
    "out": "00:59",
    "backId": "1802506778783129855",
    "backLine": 796,
    "backDate": "2024-06-17",
    "back": "01:01",
    "stayMin": 2,
    "stay": "2 min",
    "max": true,
    "source": "Internet Archive (may be missing posts: stay is a maximum)",
    "link": "https://x.com/imperooterxbt/status/1802506338204856774",
    "note": "Announces his final public tweet; next public post 2 min later. Remainder of the post is crude and is cut.",
    "statement": "I will be going private again shortly. … As my final public tweet…"
   },
   {
    "line": 890,
    "id": "1804297026831606236",
    "date": "2024-06-21",
    "out": "23:35",
    "backId": "1804304433032958201",
    "backLine": 891,
    "backDate": "2024-06-22",
    "back": "00:04",
    "stayMin": 29,
    "stay": "29 min",
    "max": true,
    "source": "Internet Archive (may be missing posts: stay is a maximum)",
    "link": "https://x.com/imperooterxbt/status/1804297026831606236",
    "note": "\"My final tweet.\" #2, 22 days after #1 (same copypasta). Only the three words are quoted.",
    "statement": "My final tweet."
   },
   {
    "line": 1555,
    "id": "2006785110738366832",
    "date": "2026-01-01",
    "out": "17:50",
    "backId": "2006817450457968801",
    "backLine": 1556,
    "backDate": "2026-01-01",
    "back": "19:58",
    "stayMin": 128,
    "stay": "2 h 08 m",
    "max": true,
    "source": "Internet Archive (may be missing posts: stay is a maximum)",
    "link": "https://x.com/imperooterxbt/status/2006785110738366832",
    "note": "Explicit quit-social-media goodbye.",
    "statement": "My new year resolution is to quit social media. Goodbye everyone I won’t be seeing any of you again"
   },
   {
    "line": 2567,
    "id": "2092446068827152600",
    "date": "2026-08-26",
    "out": "02:56",
    "backId": "2092483588898136358",
    "backLine": 2568,
    "backDate": "2026-08-26",
    "back": "05:25",
    "stayMin": 149,
    "stay": "2 h 29 m",
    "max": false,
    "source": "X sweep",
    "link": "https://x.com/imperooterxbt/status/2092446068827152600",
    "note": "Announced departure, posted as an original post. Note: lowercase voice is unlike his usual style and may be a copypasta; it is still his post. Only X-sweep row (stay exact).",
    "statement": "…imma leave, gotta protect my energy. goodluck to everybody else."
   }
  ],
  "excluded": [
   {
    "line": 780,
    "id": "1802059315819520407",
    "date": "2024-06-15",
    "reason": "EXCLUDED: quitting crypto after a leveraged liquidation (trade content, names an exchange), not the app."
   },
   {
    "line": 1854,
    "id": "2019585054935249085",
    "date": "2026-02-06",
    "reason": "EXCLUDED: \"ITS OVER … Goodbye\" reads as market despair (next post: bitcoin down 30% in a week); not airtight as an app departure."
   },
   {
    "line": 1871,
    "id": "2020955896193708043",
    "date": "2026-02-09",
    "reason": "EXCLUDED: \"it was a good run\" is about his hate running out, and the same post says he will stay to \"retain relevancy on this app\". Used on the incident card instead."
   },
   {
    "line": 2875,
    "id": "2102271268347171180",
    "date": "2026-09-22",
    "reason": "EXCLUDED: \"I fucking quit\" is quitting the crypto space over a launchpad dump (\"I’m yet to make a dollar\"): trade-adjacent and not the app."
   }
  ],
  "file": "raw/imperooter/goodbyes_002.json"
 },
 "readback": [
  {
   "topic": "KOL status",
   "then": {
    "text": "I’m not a KOL don’t call me that or I will take YOU out",
    "id": "1794681439101006093",
    "date": "2024-05-26",
    "line": 229
   },
   "now": [
    {
     "text": "…As a kol myself who just seems to be excluded from these cabals…",
     "id": "2102845065303331013",
     "date": "2026-09-23",
     "line": 2993
    }
   ]
  },
  {
   "topic": "Blocks",
   "then": {
    "text": "…Anyone who blocks Scooterxbt cannot be trusted remember that.",
    "id": "1796394091325931827",
    "date": "2024-05-31",
    "line": 364
   },
   "now": [
    {
     "text": "I am blocked by half of the KOLs on this app.",
     "id": "2035157496894300386",
     "date": "2026-03-21",
     "line": 2311
    }
   ]
  },
  {
   "topic": "Likes",
   "then": {
    "text": "Not a single one of my tweets have amassed over 100 likes. I am disappointed",
    "id": "1804291602803745208",
    "date": "2024-06-21",
    "line": 887
   },
   "now": [
    {
     "count": 300,
     "text": "300 posts over 100 likes",
     "window": "Aug 9 – Oct 8 2026",
     "source": "raw/imperooter/x_posts.json, likes > 100",
     "atLeast100": 302
    }
   ]
  },
  {
   "topic": "Edits",
   "then": {
    "text": "I have blue mark on twitter why can’t I edit my tweet?",
    "id": "1800263308341018682",
    "date": "2024-06-10",
    "line": 649
   },
   "now": [
    {
     "text": "Typo I’m not fixing it",
     "id": "2027366018465591712",
     "date": "2026-02-27",
     "line": 2041
    }
   ]
  },
  {
   "topic": "Heroics",
   "then": {
    "text": "…I am the hero the casino needs",
    "id": "1812178640169247051",
    "date": "2024-07-13",
    "line": 1281
   },
   "now": [
    {
     "text": "…I am not a hero.",
     "id": "2032117492282167643",
     "date": "2026-03-12",
     "line": 2218
    },
    {
     "text": "There is nobody coming to save you. So always try to save yourself.",
     "id": "2105464446093038079",
     "date": "2026-10-01",
     "line": 3178
    }
   ]
  }
 ],
 "yoy": {
  "shadowban": {
   "2024": 25,
   "2026": 0,
   "regex": "shadow\\s?-?ban (case-insensitive, one per post)"
  },
  "goodnight": {
   "2024": 11,
   "2026": 0,
   "regex": "\\bgood\\s?night\\b (case-insensitive, one per post)"
  },
  "peanut": {
   "2024": 0,
   "2026": 12,
   "regex": "peanut gallery (case-insensitive, one per post)"
  },
  "postsPerYear": {
   "2024": 1467,
   "2026": 1736
  }
 },
 "incident": {
  "name": "Acute Hate Deficiency",
  "from": "2026-02-09",
  "to": "2026-02-10",
  "remission": "21 h 37 m",
  "timeline": [
   {
    "time": "FEB 9 · 20:20",
    "note": "Presenting complaint",
    "text": "I don’t have it in me to hate or fud anymore it was a good run. … I will be in search of finding unhappiness so I can retain relevancy on this app…",
    "id": "2020955896193708043",
    "date": "2026-02-09",
    "line": 1871
   },
   {
    "time": "FEB 9 · 21:05",
    "note": "Patient begins self-treatment",
    "text": "…I will find the strength within myself to hate again.",
    "id": "2020967327165190304",
    "date": "2026-02-09",
    "line": 1873
   },
   {
    "time": "FEB 9 · 21:56",
    "note": "Symptom peaks",
    "text": "I saw someone make a Fortnite edit of $5 profit on memecoin and I wanted to congratulate him for not losing. I have lost my ability to hate.",
    "id": "2020980230224216276",
    "date": "2026-02-09",
    "line": 1874
   },
   {
    "time": "FEB 10 · 17:57",
    "note": "Spontaneous remission",
    "text": "…I got visibly angry. Maybe there is hope for me after all",
    "id": "2021282492330680626",
    "date": "2026-02-10",
    "line": 1876
   }
  ],
  "attendingNote": "The hate is load-bearing. Do not remove.",
  "civic": {
   "line": 1664,
   "text": "a gently used 2001 Toyota Civic",
   "id": "2011539325549494319",
   "date": "2026-01-14"
  }
 },
 "quotes": {
  "quitordie": {
   "text": "until I quit or die",
   "id": "1797720407295885785",
   "date": "2024-06-03",
   "line": 461
  },
  "hate1": {
   "text": "I don’t have it in me to hate or fud anymore it was a good run. … I will be in search of finding unhappiness so I can retain relevancy on this app…",
   "id": "2020955896193708043",
   "date": "2026-02-09",
   "line": 1871
  },
  "hate2": {
   "text": "…I will find the strength within myself to hate again.",
   "id": "2020967327165190304",
   "date": "2026-02-09",
   "line": 1873
  },
  "hate3": {
   "text": "I saw someone make a Fortnite edit of $5 profit on memecoin and I wanted to congratulate him for not losing. I have lost my ability to hate.",
   "id": "2020980230224216276",
   "date": "2026-02-09",
   "line": 1874
  },
  "hate4": {
   "text": "…I got visibly angry. Maybe there is hope for me after all",
   "id": "2021282492330680626",
   "date": "2026-02-10",
   "line": 1876
  },
  "civic": {
   "text": "a gently used 2001 Toyota Civic",
   "id": "2011539325549494319",
   "date": "2026-01-14",
   "line": 1664
  },
  "kol24": {
   "text": "I’m not a KOL don’t call me that or I will take YOU out",
   "id": "1794681439101006093",
   "date": "2024-05-26",
   "line": 229
  },
  "kol26": {
   "text": "…As a kol myself who just seems to be excluded from these cabals…",
   "id": "2102845065303331013",
   "date": "2026-09-23",
   "line": 2993
  },
  "block24": {
   "text": "…Anyone who blocks Scooterxbt cannot be trusted remember that.",
   "id": "1796394091325931827",
   "date": "2024-05-31",
   "line": 364
  },
  "block26": {
   "text": "I am blocked by half of the KOLs on this app.",
   "id": "2035157496894300386",
   "date": "2026-03-21",
   "line": 2311
  },
  "likes24": {
   "text": "Not a single one of my tweets have amassed over 100 likes. I am disappointed",
   "id": "1804291602803745208",
   "date": "2024-06-21",
   "line": 887
  },
  "edit24": {
   "text": "I have blue mark on twitter why can’t I edit my tweet?",
   "id": "1800263308341018682",
   "date": "2024-06-10",
   "line": 649
  },
  "edit26": {
   "text": "Typo I’m not fixing it",
   "id": "2027366018465591712",
   "date": "2026-02-27",
   "line": 2041
  },
  "hero24": {
   "text": "…I am the hero the casino needs",
   "id": "1812178640169247051",
   "date": "2024-07-13",
   "line": 1281
  },
  "hero26a": {
   "text": "…I am not a hero.",
   "id": "2032117492282167643",
   "date": "2026-03-12",
   "line": 2218
  },
  "hero26b": {
   "text": "There is nobody coming to save you. So always try to save yourself.",
   "id": "2105464446093038079",
   "date": "2026-10-01",
   "line": 3178
  },
  "homerun": {
   "text": "Another Scooter home run.",
   "id": "2108209784373887249",
   "date": "2026-10-08",
   "line": 3290
  }
 },
 "quotesAll": [
  {
   "id": "1795768002043924568",
   "line": 294,
   "date": "2024-05-29",
   "texts": [
    "I AM QUITTING THIS APP"
   ]
  },
  {
   "id": "1795986010423075094",
   "line": 330,
   "date": "2024-05-30",
   "texts": [
    "My final tweet."
   ]
  },
  {
   "id": "1799279575849160829",
   "line": 558,
   "date": "2024-06-08",
   "texts": [
    "I am taking an extending break from twitter. … See you guys a few months from now",
    "See you guys a few months from now",
    "I am taking an extending break from twitter. I have gone insane, am have actually lost it. See you guys a few months from now"
   ]
  },
  {
   "id": "1799290831553298598",
   "line": 561,
   "date": "2024-06-08",
   "texts": [
    "It is time I take my hiatus goodbye and goodnight for now"
   ]
  },
  {
   "id": "1802506338204856774",
   "line": 795,
   "date": "2024-06-17",
   "texts": [
    "I will be going private again shortly. … As my final public tweet…"
   ]
  },
  {
   "id": "1804297026831606236",
   "line": 890,
   "date": "2024-06-21",
   "texts": [
    "My final tweet."
   ]
  },
  {
   "id": "2006785110738366832",
   "line": 1555,
   "date": "2026-01-01",
   "texts": [
    "My new year resolution is to quit social media. Goodbye everyone I won’t be seeing any of you again",
    "Goodbye everyone I won’t be seeing any of you again"
   ]
  },
  {
   "id": "2092446068827152600",
   "line": 2567,
   "date": "2026-08-26",
   "texts": [
    "…imma leave, gotta protect my energy. goodluck to everybody else.",
    "imma leave, gotta protect my energy."
   ]
  },
  {
   "id": "1797720407295885785",
   "line": 461,
   "date": "2024-06-03",
   "texts": [
    "until I quit or die",
    "I will continue posting on this app and hating on this app until I quit or die"
   ]
  },
  {
   "id": "2020955896193708043",
   "line": 1871,
   "date": "2026-02-09",
   "texts": [
    "I don’t have it in me to hate or fud anymore it was a good run. … I will be in search of finding unhappiness so I can retain relevancy on this app…",
    "I don’t have it in me to hate or fud anymore"
   ]
  },
  {
   "id": "2020967327165190304",
   "line": 1873,
   "date": "2026-02-09",
   "texts": [
    "…I will find the strength within myself to hate again."
   ]
  },
  {
   "id": "2020980230224216276",
   "line": 1874,
   "date": "2026-02-09",
   "texts": [
    "I saw someone make a Fortnite edit of $5 profit on memecoin and I wanted to congratulate him for not losing. I have lost my ability to hate.",
    "I have lost my ability to hate",
    "…I have lost my ability to hate. I don’t know what could bring it back. I am a shell of my former self"
   ]
  },
  {
   "id": "2021282492330680626",
   "line": 1876,
   "date": "2026-02-10",
   "texts": [
    "…I got visibly angry. Maybe there is hope for me after all",
    "Maybe there is hope for me after all"
   ]
  },
  {
   "id": "2011539325549494319",
   "line": 1664,
   "date": "2026-01-14",
   "texts": [
    "a gently used 2001 Toyota Civic"
   ]
  },
  {
   "id": "1794681439101006093",
   "line": 229,
   "date": "2024-05-26",
   "texts": [
    "I’m not a KOL don’t call me that or I will take YOU out",
    "I’m not a KOL don’t call me that"
   ]
  },
  {
   "id": "2102845065303331013",
   "line": 2993,
   "date": "2026-09-23",
   "texts": [
    "…As a kol myself who just seems to be excluded from these cabals…",
    "As a kol myself",
    "…As a kol myself who just seems to be excluded from these cabals and their launches that make them 7 figures a week. Ofcourse I am angry and bitter."
   ]
  },
  {
   "id": "1796394091325931827",
   "line": 364,
   "date": "2024-05-31",
   "texts": [
    "…Anyone who blocks Scooterxbt cannot be trusted remember that."
   ]
  },
  {
   "id": "2035157496894300386",
   "line": 2311,
   "date": "2026-03-21",
   "texts": [
    "I am blocked by half of the KOLs on this app."
   ]
  },
  {
   "id": "1804291602803745208",
   "line": 887,
   "date": "2024-06-21",
   "texts": [
    "Not a single one of my tweets have amassed over 100 likes. I am disappointed",
    "Not a single one of my tweets have amassed over 100 likes"
   ]
  },
  {
   "id": "1800263308341018682",
   "line": 649,
   "date": "2024-06-10",
   "texts": [
    "I have blue mark on twitter why can’t I edit my tweet?"
   ]
  },
  {
   "id": "2027366018465591712",
   "line": 2041,
   "date": "2026-02-27",
   "texts": [
    "Typo I’m not fixing it"
   ]
  },
  {
   "id": "1812178640169247051",
   "line": 1281,
   "date": "2024-07-13",
   "texts": [
    "…I am the hero the casino needs"
   ]
  },
  {
   "id": "2032117492282167643",
   "line": 2218,
   "date": "2026-03-12",
   "texts": [
    "…I am not a hero."
   ]
  },
  {
   "id": "2105464446093038079",
   "line": 3178,
   "date": "2026-10-01",
   "texts": [
    "There is nobody coming to save you. So always try to save yourself."
   ]
  },
  {
   "id": "2108209784373887249",
   "line": 3290,
   "date": "2026-10-08",
   "texts": [
    "Another Scooter home run."
   ]
  }
 ],
 "hook": "In 2024 he promised to keep posting “until I quit or die.” We pulled 61 days of vitals. He has done neither.",
 "complaint": {
  "quote": "until I quit or die",
  "id": "1797720407295885785",
  "date": "2024-06-03",
  "frame": "Patient signed his own contract."
 },
 "diagnosis": {
  "name": "Chronic Departure (benign)",
  "short": "Chronic Departure (benign)",
  "tag": "patient-announced · lab-confirmed",
  "text": "Patient has announced his departure from the app 8 times on file and has completed none. Median stay outside the facility: 17 minutes. In the last 61 days he posted 898 times, a median of 24 minutes apart, and never went a full day without a post."
 },
 "rx": [
  {
   "product": "workferdabagtin",
   "arm": "For Chronic Departure",
   "label": "Take as announced. Patient has announced it 8 times."
  }
 ],
 "rxProposal": {
  "name": "Hiatusin XR",
  "label": "Extended-release goodbye. Duration of effect: approx. 17 minutes. Side effects: posting.",
  "status": "proposal for the Pharmussy owner; not in data/formulary.js"
 },
 "homeruns": {
  "count": 6,
  "lines": [
   817,
   2356,
   3137,
   3240,
   3242,
   3290
  ],
  "next": "Homerun #7: ____ (pending)"
 },
 "cards": [
  {
   "file": "assets/cards/patient-002-v4-log.png",
   "role": "thread 1 · discharge log (lead)",
   "size": "1200x675"
  },
  {
   "file": "assets/cards/patient-002-v4-monitor.png",
   "role": "thread 2 · no flatline",
   "size": "1200x675"
  },
  {
   "file": "assets/cards/patient-002-v4-readback.png",
   "role": "thread 3 · read it back",
   "size": "1080x1350"
  },
  {
   "file": "assets/cards/patient-002-v4-incident.png",
   "role": "thread 4 · incident report + prognosis",
   "size": "1080x1350"
  }
 ],
 "cardPrognosis": "Per patient, June 2024: “until I quit or die.” He has not quit. Do not wait up.",
 "prognosis": "Chronic, stable, benign. Discharged against medical advice 8 times; readmitted 8 times. Per patient: “until I quit or die.” He has not quit. Do not wait up."
};
