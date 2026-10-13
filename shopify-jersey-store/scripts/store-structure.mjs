// Store taxonomy: every collection is a *smart* collection driven by product tags,
// so a product appears in the right places just by tagging it (e.g. "premier-league", "home", "kids").

/** Tags/types that mark internal add-on products. They are excluded from every shop collection. */
export const ADDON_TYPE = 'Add-on';

const tag = (condition) => ({ column: 'TAG', relation: 'EQUALS', condition });
const notAddon = { column: 'TYPE', relation: 'NOT_EQUALS', condition: ADDON_TYPE };

export const COLLECTIONS = [
  // General
  { handle: 'shop-all', title: 'כל המוצרים', rules: [notAddon], sortOrder: 'CREATED_DESC' },
  { handle: 'new-arrivals', title: 'חדש במלאי', rules: [tag('new')], sortOrder: 'CREATED_DESC' },
  { handle: 'best-sellers', title: 'הנמכרים ביותר', rules: [notAddon], sortOrder: 'BEST_SELLING' },
  { handle: 'sale', title: 'מבצעים', rules: [{ column: 'IS_PRICE_REDUCED', relation: 'IS_SET', condition: '' }, notAddon] },

  // Football — current season
  { handle: 'world-cup-2026', title: 'מונדיאל 2026', rules: [tag('world-cup-2026')] },
  { handle: 'national-teams', title: 'נבחרות', rules: [tag('national-team')] },
  { handle: 'premier-league', title: 'פרמייר ליג', rules: [tag('premier-league')] },
  { handle: 'la-liga', title: 'לה ליגה', rules: [tag('la-liga')] },
  { handle: 'serie-a', title: 'סרייה A', rules: [tag('serie-a')] },
  { handle: 'bundesliga', title: 'בונדסליגה', rules: [tag('bundesliga')] },
  { handle: 'ligue-1', title: 'ליג 1', rules: [tag('ligue-1')] },
  { handle: 'rest-of-world', title: 'שאר העולם', rules: [tag('rest-of-world')] },
  { handle: 'israeli-league', title: 'ליגת העל', rules: [tag('israeli-league')] },
  { handle: 'kids', title: 'ילדים', rules: [tag('kids')] },

  // Football — retro (product has both "retro" and the league tag)
  { handle: 'retro', title: 'רטרו', rules: [tag('retro')] },
  { handle: 'retro-premier-league', title: 'רטרו – פרמייר ליג', rules: [tag('retro'), tag('premier-league')] },
  { handle: 'retro-la-liga', title: 'רטרו – לה ליגה', rules: [tag('retro'), tag('la-liga')] },
  { handle: 'retro-serie-a', title: 'רטרו – סרייה A', rules: [tag('retro'), tag('serie-a')] },
  { handle: 'retro-bundesliga', title: 'רטרו – בונדסליגה', rules: [tag('retro'), tag('bundesliga')] },
  { handle: 'retro-national-teams', title: 'רטרו – נבחרות', rules: [tag('retro'), tag('national-team')] },
  { handle: 'retro-rest-of-world', title: 'רטרו – שאר העולם', rules: [tag('retro'), tag('rest-of-world')] },

  // Football — training & lifestyle
  { handle: 'training', title: 'אימון', rules: [tag('training')] },
  { handle: 'pre-match', title: 'חולצות חימום', rules: [tag('pre-match')] },
  { handle: 'tracksuits', title: 'אימוניות חורף', rules: [tag('tracksuit')] },
  { handle: 'casual-tees', title: 'טישרטים', rules: [tag('casual-tee')] },
  { handle: 'balls', title: 'כדורי משחק', rules: [tag('ball')] },

  // Basketball
  { handle: 'basketball', title: 'כדורסל', rules: [tag('basketball')] },
  { handle: 'nba-jerseys', title: 'גופיות NBA', rules: [tag('nba'), tag('jersey')] },
  { handle: 'nba-shorts', title: 'מכנסי NBA', rules: [tag('nba'), tag('shorts')] },
  { handle: 'nba-tees', title: 'טישרטים NBA', rules: [tag('nba'), tag('tee')] }
];

// Pages. `templateSuffix` selects templates/page.<suffix>.json in the theme.
export const PAGES = [
  {
    handle: 'order-tracking',
    title: 'מעקב הזמנה',
    templateSuffix: 'order-tracking',
    body: ''
  },
  {
    handle: 'contact',
    title: 'צור קשר',
    templateSuffix: 'contact',
    body: '<p>יש שאלה על מידה, הזמנה או משלוח? כתבו לנו ונחזור אליכם תוך יום עסקים.</p>'
  },
  {
    handle: 'size-chart',
    title: 'טבלת מידות',
    body: `<table>
<thead><tr><th>מידה</th><th>רוחב (ס״מ)</th><th>אורך (ס״מ)</th><th>גובה מומלץ</th></tr></thead>
<tbody>
<tr><td>S</td><td>49</td><td>69</td><td>160–168</td></tr>
<tr><td>M</td><td>52</td><td>71</td><td>168–175</td></tr>
<tr><td>L</td><td>55</td><td>73</td><td>175–180</td></tr>
<tr><td>XL</td><td>58</td><td>75</td><td>180–185</td></tr>
<tr><td>XXL</td><td>61</td><td>77</td><td>185–190</td></tr>
</tbody></table>
<p>גרסת שחקן (Player) צמודה יותר – מומלץ לעלות מידה אחת. הטבלה היא דוגמה: עדכנו אותה לפי המידות של הספק שלכם.</p>`
  },
  {
    handle: 'shipping-returns',
    title: 'משלוחים והחזרות',
    body: `<h3>משלוחים</h3>
<p>משלוח חינם בהזמנה מעל ₪299. זמן אספקה משוער: 7–14 ימי עסקים. מספר מעקב נשלח במייל וב-SMS עם יציאת ההזמנה.</p>
<h3>החלפות והחזרות</h3>
<p>ניתן להחליף או להחזיר מוצר תוך 14 יום מקבלתו, כשהוא חדש ובאריזתו המקורית. חולצות עם הדפסה אישית (שם/מספר) אינן ניתנות להחזרה, אלא אם יש פגם.</p>
<p>הטקסט הוא דוגמה בלבד: התאימו אותו למדיניות שלכם ולחוק הגנת הצרכן.</p>`
  }
];

// Add-on products that carry the price of personalization. They are hidden from search,
// excluded from every collection, and only reach the cart through the product page JS.
export const ADDON_PRODUCTS = [
  { handle: 'personalization-name-number', title: 'הדפסת שם ומספר', price: '40.00', setting: 'personalization_product' },
  { handle: 'personalization-patch', title: 'פאץ\' ליגה', price: '20.00', setting: 'patch_product' }
];

// Navigation. `collection` / `page` reference handles above; children nest up to 3 levels.
const c = (title, collection, items) => ({ title, collection, items });
const p = (title, page) => ({ title, page });

export const MENUS = [
  {
    handle: 'main-menu',
    title: 'Main menu',
    items: [
      { title: 'בית', url: '/' },
      c('מונדיאל 2026', 'world-cup-2026'),
      c('כדורגל', 'shop-all', [
        c('ליגות', 'shop-all', [
          c('פרמייר ליג', 'premier-league'),
          c('לה ליגה', 'la-liga'),
          c('סרייה A', 'serie-a'),
          c('בונדסליגה', 'bundesliga'),
          c('ליג 1', 'ligue-1'),
          c('ליגת העל', 'israeli-league'),
          c('שאר העולם', 'rest-of-world')
        ]),
        c('נבחרות', 'national-teams'),
        c('ילדים', 'kids'),
        c('אימון וחימום', 'training', [
          c('חולצות אימון', 'training'),
          c('חולצות חימום', 'pre-match'),
          c('אימוניות חורף', 'tracksuits')
        ]),
        c('טישרטים', 'casual-tees'),
        c('כדורי משחק', 'balls')
      ]),
      c('רטרו', 'retro', [
        c('פרמייר ליג', 'retro-premier-league'),
        c('לה ליגה', 'retro-la-liga'),
        c('סרייה A', 'retro-serie-a'),
        c('בונדסליגה', 'retro-bundesliga'),
        c('נבחרות', 'retro-national-teams'),
        c('שאר העולם', 'retro-rest-of-world')
      ]),
      c('כדורסל', 'basketball', [
        c('גופיות NBA', 'nba-jerseys'),
        c('מכנסי NBA', 'nba-shorts'),
        c('טישרטים NBA', 'nba-tees')
      ]),
      c('מבצעים', 'sale'),
      p('מעקב הזמנה', 'order-tracking')
    ]
  },
  {
    handle: 'footer',
    title: 'Footer',
    items: [
      c('מונדיאל 2026', 'world-cup-2026'),
      c('נבחרות', 'national-teams'),
      c('רטרו', 'retro'),
      c('ילדים', 'kids'),
      c('כדורסל', 'basketball')
    ]
  },
  {
    handle: 'footer-help',
    title: 'Footer help',
    items: [
      p('מעקב הזמנה', 'order-tracking'),
      p('משלוחים והחזרות', 'shipping-returns'),
      p('טבלת מידות', 'size-chart'),
      p('צור קשר', 'contact')
    ]
  }
];

// Optional demo products (no images) so the theme can be previewed end to end.
const ADULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const KIDS_SIZES = ['16 (3-4)', '18 (4-5)', '20 (6-7)', '22 (8-9)', '24 (10-11)', '26 (12-13)'];

export const SAMPLE_PRODUCTS = [
  { title: 'חולצת בית 26/27 – קבוצה לדוגמה (פרמייר ליג)', type: 'Football Jersey', vendor: 'Demo', tags: ['premier-league', 'home', 'new', 'personalizable', 'patch-available'], sizes: ADULT_SIZES, price: '249.00', compareAt: '299.00' },
  { title: 'חולצת חוץ 26/27 – קבוצה לדוגמה (לה ליגה)', type: 'Football Jersey', vendor: 'Demo', tags: ['la-liga', 'away', 'new', 'personalizable', 'patch-available'], sizes: ADULT_SIZES, price: '249.00' },
  { title: 'חולצת נבחרת מונדיאל 2026 – נבחרת לדוגמה', type: 'Football Jersey', vendor: 'Demo', tags: ['world-cup-2026', 'national-team', 'home', 'personalizable'], sizes: ADULT_SIZES, price: '259.00' },
  { title: 'סט ילדים (חולצה + מכנס) – קבוצה לדוגמה', type: 'Kids Kit', vendor: 'Demo', tags: ['kids', 'premier-league', 'personalizable'], sizes: KIDS_SIZES, price: '199.00' },
  { title: 'חולצת רטרו 1998 – נבחרת לדוגמה', type: 'Football Jersey', vendor: 'Demo', tags: ['retro', 'national-team', 'personalizable'], sizes: ADULT_SIZES, price: '229.00' },
  { title: 'חולצת אימון 26/27 – קבוצה לדוגמה', type: 'Training Top', vendor: 'Demo', tags: ['training', 'serie-a', 'new'], sizes: ADULT_SIZES, price: '179.00' },
  { title: 'גופיית NBA – קבוצה לדוגמה', type: 'Basketball Jersey', vendor: 'Demo', tags: ['basketball', 'nba', 'jersey', 'personalizable'], sizes: ADULT_SIZES, price: '239.00' },
  { title: 'מכנס NBA – קבוצה לדוגמה', type: 'Basketball Shorts', vendor: 'Demo', tags: ['basketball', 'nba', 'shorts'], sizes: ADULT_SIZES, price: '149.00' }
];
