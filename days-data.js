const DAYS = {
  A: {
    title: 'A nap — Váll + Mellkas + Muay Thai alapok',
    subtitle: '45–50 perc · pl. Hétfő',
    warmupHtml: '<p>Helyben futás magas térdemeléssel — 3 perc. Dinamikus vállkörzés előre-hátra — 20 ism. Mellkasnyitás (karok oldalra tárva, összecsukva) — 15 ism. Árnyékbox lazán, guardban — 2 perc.</p>',
    sections: [
      {
        title: 'Muay Thai technikaépítés — zsákon (8–22 perc)',
        rows: [
          { exercise: 'Jab + Cross — csípőrotációval', detail: '3×2 perc, 30 mp pihenő' },
          { exercise: 'Hook — könyök szögben, mellkasból indítva', detail: '2×2 perc, 30 mp pihenő' },
          { exercise: 'Teep (talpas rúgás) — távolságtartó', detail: '2×1 perc, 30 mp pihenő' }
        ]
      },
      {
        title: 'Váll + Mellkas erőkör — 3 forduló (22–42 perc, 60 mp pihenő fordulók között)',
        rows: [
          { exercise: 'Fekvőtámasz (lassú, 2-1-2 tempó)', detail: '12 ism.' },
          { exercise: 'Egykezes vállnyomás állva', detail: '10 ism./oldal' },
          { exercise: 'Pike fekvőtámasz (csípő fent, vállra terhelve)', detail: '10 ism.' },
          { exercise: 'Egykezes evezés (asztalra támaszkodva)', detail: '10 ism./oldal' }
        ]
      }
    ],
    cooldownHtml: '<p>Mellizom nyújtás ajtófélfánál — 30 mp/oldal. Válltok nyújtás (kar átfogva) — 30 mp/oldal. Rekeszlégzés — 2 perc.</p>',
    intervals: [
      { name: 'Jab+Cross (1/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Jab+Cross (2/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Jab+Cross (3/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Hook (1/2)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Hook (2/2)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Teep (1/2)', color: '#6666CC', seconds: 60 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Teep (2/2)', color: '#6666CC', seconds: 60 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Fekvőtámasz (kör 1/3)', color: '#00AABB', seconds: 90 },
      { name: 'Egykezes vállnyomás (kör 1/3)', color: '#FF6688', seconds: 90 },
      { name: 'Pike fekvőtámasz (kör 1/3)', color: '#22AA66', seconds: 90 },
      { name: 'Egykezes evezés (kör 1/3)', color: '#EE7722', seconds: 90 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 60 },
      { name: 'Fekvőtámasz (kör 2/3)', color: '#00AABB', seconds: 90 },
      { name: 'Egykezes vállnyomás (kör 2/3)', color: '#FF6688', seconds: 90 },
      { name: 'Pike fekvőtámasz (kör 2/3)', color: '#22AA66', seconds: 90 },
      { name: 'Egykezes evezés (kör 2/3)', color: '#EE7722', seconds: 90 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 60 },
      { name: 'Fekvőtámasz (kör 3/3)', color: '#00AABB', seconds: 90 },
      { name: 'Egykezes vállnyomás (kör 3/3)', color: '#FF6688', seconds: 90 },
      { name: 'Pike fekvőtámasz (kör 3/3)', color: '#22AA66', seconds: 90 },
      { name: 'Egykezes evezés (kör 3/3)', color: '#EE7722', seconds: 90 }
    ]
  },
  B: {
    title: 'B nap — Has + Rúgástechnikák + Kardio',
    subtitle: '50–55 perc · pl. Szerda',
    warmupHtml: '<p>Helyben futás magas térdemeléssel — 2 perc. Jumping jack — 2 perc. Csípőkörzés, bokamobilizáció — 2×1 perc.</p>',
    sections: [
      {
        title: 'Muay Thai rúgások — zsákon (8–28 perc)',
        rows: [
          { exercise: 'Low kick (combra, sípcsont belső éle)', detail: '3×2 perc, 30 mp pihenő' },
          { exercise: 'Middle kick (csípő nyitás, teljes rotáció)', detail: '3×2 perc, 30 mp pihenő' },
          { exercise: 'Kombó: Jab → Cross → Middle kick', detail: '2×2 perc, 30 mp pihenő' }
        ]
      },
      {
        title: 'Has erőkör — 4 forduló (28–46 perc, 45 mp pihenő fordulók között)',
        rows: [
          { exercise: 'Plank', detail: '40 mp' },
          { exercise: 'Bicycle crunch', detail: '20 ism./oldal' },
          { exercise: 'Lábemeléses hasprés (hanyatt fekve)', detail: '15 ism.' },
          { exercise: 'Egykezes súlyzós oldalhajlítás', detail: '15 ism./oldal' },
          { exercise: 'Mountain climber', detail: '30 mp' }
        ]
      },
      {
        title: 'Kardio finish — zsákon (46–54 perc)',
        rows: [
          { exercise: 'Zsákos intervall', detail: '4× (30 mp max intenzitás zsákon · 30 mp lassú árnyékbox)' }
        ]
      }
    ],
    cooldownHtml: '<p>Csípőhajlító nyújtás — 40 mp/oldal. Macska-tehén mozgás matacon — 1 perc.</p>',
    intervals: [
      { name: 'Low kick (1/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Low kick (2/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Low kick (3/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Middle kick (1/3)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Middle kick (2/3)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Middle kick (3/3)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó: Jab-Cross-Middle kick (1/2)', color: '#6666CC', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó: Jab-Cross-Middle kick (2/2)', color: '#6666CC', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Plank (kör 1/4)', color: '#00AABB', seconds: 40 },
      { name: 'Bicycle crunch (kör 1/4)', color: '#FF6688', seconds: 40 },
      { name: 'Lábemeléses hasprés (kör 1/4)', color: '#22AA66', seconds: 40 },
      { name: 'Oldalhajlítás (kör 1/4)', color: '#EE7722', seconds: 40 },
      { name: 'Mountain climber (kör 1/4)', color: '#FFA500', seconds: 30 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 45 },
      { name: 'Plank (kör 2/4)', color: '#00AABB', seconds: 40 },
      { name: 'Bicycle crunch (kör 2/4)', color: '#FF6688', seconds: 40 },
      { name: 'Lábemeléses hasprés (kör 2/4)', color: '#22AA66', seconds: 40 },
      { name: 'Oldalhajlítás (kör 2/4)', color: '#EE7722', seconds: 40 },
      { name: 'Mountain climber (kör 2/4)', color: '#FFA500', seconds: 30 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 45 },
      { name: 'Plank (kör 3/4)', color: '#00AABB', seconds: 40 },
      { name: 'Bicycle crunch (kör 3/4)', color: '#FF6688', seconds: 40 },
      { name: 'Lábemeléses hasprés (kör 3/4)', color: '#22AA66', seconds: 40 },
      { name: 'Oldalhajlítás (kör 3/4)', color: '#EE7722', seconds: 40 },
      { name: 'Mountain climber (kör 3/4)', color: '#FFA500', seconds: 30 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 45 },
      { name: 'Plank (kör 4/4)', color: '#00AABB', seconds: 40 },
      { name: 'Bicycle crunch (kör 4/4)', color: '#FF6688', seconds: 40 },
      { name: 'Lábemeléses hasprés (kör 4/4)', color: '#22AA66', seconds: 40 },
      { name: 'Oldalhajlítás (kör 4/4)', color: '#EE7722', seconds: 40 },
      { name: 'Mountain climber (kör 4/4)', color: '#FFA500', seconds: 30 },
      { name: 'Max intenzitás zsákon (1/4)', color: '#CC2222', seconds: 30 },
      { name: 'Lassú árnyékbox (1/4)', color: '#6666CC', seconds: 30 },
      { name: 'Max intenzitás zsákon (2/4)', color: '#CC2222', seconds: 30 },
      { name: 'Lassú árnyékbox (2/4)', color: '#6666CC', seconds: 30 },
      { name: 'Max intenzitás zsákon (3/4)', color: '#CC2222', seconds: 30 },
      { name: 'Lassú árnyékbox (3/4)', color: '#6666CC', seconds: 30 },
      { name: 'Max intenzitás zsákon (4/4)', color: '#CC2222', seconds: 30 },
      { name: 'Lassú árnyékbox (4/4)', color: '#6666CC', seconds: 30 }
    ]
  },
  C: {
    title: 'C nap — Teljes test kombók + Core integráció',
    subtitle: '50–55 perc · pl. Péntek / Szombat',
    warmupHtml: '<p>Burpee lassítva, bemelegítő tempóban — 2 perc. Dinamikus nyújtás: váll, csípő, boka. Árnyékbox wai kru stílusban — 3 perc.</p>',
    sections: [
      {
        title: 'Kombók zsákon (8–30 perc, minden kombó 2×2 perc, 30 mp pihenő)',
        rows: [
          { exercise: '1. Jab → Cross → Hook → Cross', detail: 'Alap 4 ütéses sorozat' },
          { exercise: '2. Teep → Jab → Cross → Middle kick', detail: 'Távolságváltás' },
          { exercise: '3. Hook → Body shot → Low kick', detail: '3. héttől' },
          { exercise: '4. Jab → Cross → Clinch → Térdütés', detail: '6. héttől (zsák megfogva)' }
        ]
      },
      {
        title: 'Komplex kondíciós kör — 3 forduló (30–48 perc, 90 mp munka, 60 mp pihenő fordulónként)',
        rows: [
          { exercise: 'Burpee', detail: '10 ism.' },
          { exercise: 'Fekvőtámasz → rögtön egykezes vállnyomás', detail: '8 + 8 ism.' },
          { exercise: 'Jumping squat (robbanékony guggolás)', detail: '12 ism.' },
          { exercise: 'Plank', detail: 'maradék idő' }
        ]
      },
      {
        title: 'Core + Levezetés — matacon (48–55 perc)',
        rows: [
          { exercise: 'Oblique crunch (ferde hasizom)', detail: '3×15 ism./oldal' },
          { exercise: 'Pigeon pose (csípő nyitás)', detail: '60 mp/oldal' },
          { exercise: 'Mellkas + vállnyújtás', detail: '2 perc' }
        ]
      }
    ],
    cooldownHtml: '',
    intervals: [
      { name: 'Kombó 1: Jab-Cross-Hook-Cross (1/2)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 1: Jab-Cross-Hook-Cross (2/2)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 2: Teep-Jab-Cross-Middle kick (1/2)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 2: Teep-Jab-Cross-Middle kick (2/2)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 3: Hook-Body shot-Low kick (1/2)', color: '#6666CC', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 3: Hook-Body shot-Low kick (2/2)', color: '#6666CC', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 4: Jab-Cross-Clinch-Térdütés (1/2)', color: '#00AABB', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 4: Jab-Cross-Clinch-Térdütés (2/2)', color: '#00AABB', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Burpee (kör 1/3)', color: '#FF6688', seconds: 90 },
      { name: 'Fekvőtámasz→vállnyomás (kör 1/3)', color: '#22AA66', seconds: 90 },
      { name: 'Jumping squat (kör 1/3)', color: '#EE7722', seconds: 90 },
      { name: 'Plank (kör 1/3)', color: '#FFA500', seconds: 90 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 60 },
      { name: 'Burpee (kör 2/3)', color: '#FF6688', seconds: 90 },
      { name: 'Fekvőtámasz→vállnyomás (kör 2/3)', color: '#22AA66', seconds: 90 },
      { name: 'Jumping squat (kör 2/3)', color: '#EE7722', seconds: 90 },
      { name: 'Plank (kör 2/3)', color: '#FFA500', seconds: 90 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 60 },
      { name: 'Burpee (kör 3/3)', color: '#FF6688', seconds: 90 },
      { name: 'Fekvőtámasz→vállnyomás (kör 3/3)', color: '#22AA66', seconds: 90 },
      { name: 'Jumping squat (kör 3/3)', color: '#EE7722', seconds: 90 },
      { name: 'Plank (kör 3/3)', color: '#FFA500', seconds: 90 }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DAYS };
}
