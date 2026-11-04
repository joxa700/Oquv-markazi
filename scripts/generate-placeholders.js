import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Nur Ta'lim">
  <rect width="64" height="64" rx="18" fill="#0B1F3A"/>
  <path d="M14 43V22.5c7.8 0 13.2 2.3 18 6.1 4.8-3.8 10.2-6.1 18-6.1V43c-7.8 0-13.2 2.3-18 6.1-4.8-3.8-10.2-6.1-18-6.1Z" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M32 28.6V49" stroke="#7BB5FF" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="32" cy="14.5" r="3.6" fill="#7BB5FF"/>
</svg>`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#0B1F3A"/>
  <path d="M14 43V22.5c7.8 0 13.2 2.3 18 6.1 4.8-3.8 10.2-6.1 18-6.1V43c-7.8 0-13.2 2.3-18 6.1-4.8-3.8-10.2-6.1-18-6.1Z" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M32 28.6V49" stroke="#7BB5FF" stroke-width="3.2" stroke-linecap="round"/>
</svg>`;

const hero = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 920">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#E7F0FF"/><stop offset="1" stop-color="#C7DCFB"/></linearGradient>
    <linearGradient id="navy" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#123056"/><stop offset="1" stop-color="#07162A"/></linearGradient>
    <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5B9BFF"/><stop offset="1" stop-color="#2168D6"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#0B1F3A" flood-opacity=".18"/></filter>
  </defs>
  <rect width="900" height="920" fill="url(#bg)"/>
  <circle cx="740" cy="150" r="170" fill="#FFFFFF" opacity=".35"/>
  <circle cx="120" cy="780" r="220" fill="#FFFFFF" opacity=".26"/>
  <g opacity=".3" stroke="#0B1F3A" stroke-width="1">
    <path d="M0 115h900M0 230h900M0 345h900M0 460h900M0 575h900M0 690h900M0 805h900"/>
    <path d="M115 0v920M230 0v920M345 0v920M460 0v920M575 0v920M690 0v920M805 0v920"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="150" y="240" width="600" height="400" rx="36" fill="#FFFFFF"/>
    <rect x="190" y="280" width="520" height="280" rx="18" fill="#F4F8FF" stroke="#D8E4F5" stroke-width="2"/>
    <rect x="150" y="600" width="600" height="40" rx="0" fill="#E9F1FC"/>
    <rect x="420" y="620" width="60" height="14" rx="7" fill="#C3D8F3"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="220" y="320" width="205" height="200" rx="20" fill="url(#navy)"/>
    <circle cx="322" cy="390" r="38" fill="#7BB5FF"/>
    <path d="M258 484c8-38 32-58 64-58s56 20 64 58" fill="#7BB5FF" opacity=".9"/>
    <rect x="258" y="505" width="120" height="8" rx="4" fill="#FFFFFF" opacity=".55"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="465" y="320" width="205" height="200" rx="20" fill="#FFFFFF" stroke="#D8E4F5" stroke-width="2"/>
    <path d="M500 455V385l35-28 35 28v70" fill="none" stroke="#2168D6" stroke-width="8" stroke-linejoin="round"/>
    <path d="M530 455v-45h20v45" fill="#2168D6"/>
    <rect x="545" y="345" width="80" height="12" rx="6" fill="#BED6F5"/>
    <rect x="545" y="370" width="60" height="10" rx="5" fill="#D8E4F5"/>
    <rect x="500" y="425" width="125" height="8" rx="4" fill="#D8E4F5"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="270" y="585" width="360" height="24" rx="12" fill="#0B1F3A"/>
    <rect x="260" y="609" width="380" height="12" rx="6" fill="#123056"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="500" y="175" width="250" height="92" rx="24" fill="url(#blue)"/>
    <circle cx="542" cy="221" r="20" fill="#FFFFFF" opacity=".24"/>
    <path d="M536 213v16l12-8-12-8Z" fill="#FFFFFF"/>
    <rect x="575" y="203" width="130" height="12" rx="6" fill="#FFFFFF" opacity=".92"/>
    <rect x="575" y="226" width="90" height="9" rx="5" fill="#FFFFFF" opacity=".55"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="115" y="620" width="260" height="100" rx="24" fill="#FFFFFF"/>
    <circle cx="157" cy="670" r="20" fill="#E7F0FF"/>
    <path d="m148 670 7 7 12-15" fill="none" stroke="#2168D6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="190" y="650" width="130" height="11" rx="5" fill="#C4D8F1"/>
    <rect x="190" y="674" width="90" height="9" rx="4" fill="#DCE8F7"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="650" y="650" width="160" height="120" rx="20" fill="#FFFFFF"/>
    <path d="M685 735v-55h28v55M730 735v-38h28v38" fill="#DCEBFE" stroke="#2168D6" stroke-width="3"/>
    <rect x="680" y="750" width="100" height="8" rx="4" fill="#DCE8F7"/>
  </g>
  <circle cx="700" cy="795" r="10" fill="#7BB5FF"/>
  <circle cx="760" cy="805" r="6" fill="#2168D6" opacity=".45"/>
</svg>`;

const coursePalettes = [
  ['#0B1F3A', '#2168D6', 'Aa'],
  ['#083344', '#0891B2', 'IDP'],
  ['#0B1F3A', '#7C3AED', '</>'],
  ['#052E2B', '#059669', 'Py'],
  ['#1E1B4B', '#6366F1', '∑'],
  ['#3B0A2A', '#DB2777', 'Я'],
  ['#422006', '#F59E0B', 'ABC'],
  ['#0F172A', '#F43F5E', 'Fx'],
  ['#172554', '#2563EB', 'SAT']
];

const courseSymbols = [
  'M180 420c70-55 140-55 210 0v230c-70-55-140-55-210 0V420Z',
  'M270 510V350l120-70 120 70v160l-120 70-120-70Z',
  'M210 410 300 330m0 0 90 80m-90-80v100',
  'M240 440h180M240 490h130M300 360v210',
  'M220 450c0-55 45-90 100-90s100 35 100 90M220 540h200',
  'M260 370h120v190H260zM280 390h80M280 420h80M340 500h40',
  'M220 480c0-60 50-110 110-110s110 50 110 110M240 520h180',
  'M220 410h180v170H220zM260 480h100',
  'M230 530V370l90-50 90 50v160l-90 50-90-50Z'
];

const courseImages = courseSymbols.map((symbol, index) => {
  const [dark, accent, rawLabel] = coursePalettes[index];
  const label = rawLabel.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750">
  <defs>
    <linearGradient id="g${index}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${dark}"/><stop offset="1" stop-color="${accent}"/></linearGradient>
    <radialGradient id="r${index}" cx=".8" cy=".15" r=".7"><stop stop-color="#FFFFFF" stop-opacity=".18"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#g${index})"/>
  <rect width="1200" height="750" fill="url(#r${index})"/>
  <g opacity=".12" stroke="#FFFFFF" stroke-width="1"><path d="M0 75h1200M0 150h1200M0 225h1200M0 300h1200M0 375h1200M0 450h1200M0 525h1200M0 600h1200M0 675h1200"/><path d="M75 0v750M150 0v750M225 0v750M300 0v750M375 0v750M450 0v750M525 0v750M600 0v750M675 0v750M750 0v750M825 0v750M900 0v750M975 0v750M1050 0v750M1125 0v750"/></g>
  <circle cx="980" cy="120" r="220" fill="#FFFFFF" opacity=".06"/>
  <circle cx="160" cy="680" r="260" fill="#FFFFFF" opacity=".05"/>
  <g transform="translate(360 180) scale(1.55)">
    <path d="${symbol}" fill="none" stroke="#FFFFFF" stroke-opacity=".9" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <g opacity=".92">
    <circle cx="960" cy="590" r="52" fill="#FFFFFF" opacity=".12"/>
    <circle cx="1050" cy="630" r="22" fill="#FFFFFF" opacity=".18"/>
    <circle cx="890" cy="650" r="12" fill="#FFFFFF" opacity=".35"/>
  </g>
  <text x="120" y="115" fill="#FFFFFF" opacity=".85" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="8">${label}</text>
</svg>`;
});

const teacherPalettes = [
  ['#DCEAFE', '#7BA8E8', '#16345C', '#F4D6BE', '#0B1F3A'],
  ['#E8E2FB', '#9B87E8', '#31245A', '#E7BA98', '#1F2A44'],
  ['#DDF5EA', '#6BC5A0', '#154535', '#F3D6C2', '#173E36'],
  ['#FCE7D7', '#E7A577', '#5A2F1C', '#EBC0A0', '#4A2B1A'],
  ['#E1EFFC', '#73B2E8', '#173E5E', '#F6D9C4', '#12314F'],
  ['#FBE3ED', '#E48FB2', '#57233B', '#E8B795', '#3D1D2E']
];

const teachers = teacherPalettes.map(([bg, blob, hair, skin, shirt], index) => {
  const variant = index % 3;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 780">
  <rect width="700" height="780" fill="${bg}"/>
  <circle cx="560" cy="130" r="180" fill="${blob}" opacity=".35"/>
  <circle cx="110" cy="690" r="210" fill="#FFFFFF" opacity=".3"/>
  <g opacity=".16" stroke="${hair}" stroke-width="1"><path d="M0 65h700M0 130h700M0 195h700M0 260h700M0 325h700M0 390h700M0 455h700M0 520h700M0 585h700M0 650h700M0 715h700"/></g>
  <g>
    <path d="M150 780c8-165 86-258 200-258s192 93 200 258H150Z" fill="${shirt}"/>
    <path d="M310 535h80v105c0 22-18 40-40 40s-40-18-40-40V535Z" fill="${skin}"/>
    <ellipse cx="350" cy="390" rx="126" ry="150" fill="${skin}"/>
    ${variant === 0 ? `<path d="M226 372c0-92 55-155 124-155s124 63 124 155c-20-35-55-56-100-62-46 40-95 55-148 62Z" fill="${hair}"/>` : ''}
    ${variant === 1 ? `<path d="M222 395c-8-118 46-185 128-185 83 0 136 67 128 185-17-60-45-95-84-111-31 38-86 58-172 111Z" fill="${hair}"/><path d="M238 312c20-86 76-130 146-119 66 10 105 57 102 132-20-40-49-66-95-80-56 4-102 24-153 67Z" fill="${hair}"/>` : ''}
    ${variant === 2 ? `<path d="M224 430c-20-116 32-202 126-202s146 86 126 202c-12-65-30-109-67-131-37-22-84-16-119 15-30 26-50 65-66 116Z" fill="${hair}"/><path d="M250 260c50-60 143-68 203-10-65-20-139-16-203 10Z" fill="${hair}"/>` : ''}
    <circle cx="310" cy="392" r="7" fill="${hair}"/>
    <circle cx="390" cy="392" r="7" fill="${hair}"/>
    <path d="M328 450c14 12 30 12 44 0" fill="none" stroke="${hair}" stroke-width="6" stroke-linecap="round"/>
    <path d="M284 345c13-7 27-8 41-3M375 342c14-5 28-4 41 3" fill="none" stroke="${hair}" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    ${index % 2 === 0 ? `<path d="M285 470c42 22 86 22 130 0l-10 45c-37 17-74 17-110 0l-10-45Z" fill="#FFFFFF" opacity=".3"/>` : ''}
  </g>
  <circle cx="580" cy="660" r="34" fill="#FFFFFF" opacity=".18"/>
  <circle cx="620" cy="710" r="14" fill="#FFFFFF" opacity=".3"/>
</svg>`;
});

const studentPalettes = [
  ['#FDE7D6', '#E7A16B'],
  ['#DCEAFE', '#6B9FE0'],
  ['#E4F6EC', '#65B58A'],
  ['#F5E5FB', '#B17BD4'],
  ['#FFEFD8', '#D9A246'],
  ['#E0F5F8', '#56AFC2']
];

const students = studentPalettes.map(([bg, accent], index) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${bg}"/>
  <circle cx="100" cy="80" r="36" fill="${accent}" opacity=".85"/>
  <path d="M35 200c4-54 28-84 65-84s61 30 65 84H35Z" fill="${accent}"/>
  <path d="M66 78c0-26 15-44 34-44s34 18 34 44c-10-12-21-18-34-18s-24 6-34 18Z" fill="${index % 2 ? '#3B2A21' : '#1F2937'}"/>
  <circle cx="87" cy="80" r="3" fill="#2A1A12"/>
  <circle cx="113" cy="80" r="3" fill="#2A1A12"/>
  <path d="M92 95c5 4 11 4 16 0" stroke="#2A1A12" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;
});

const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#07162A"/><stop offset="1" stop-color="#123056"/></linearGradient><radialGradient id="glow" cx=".82" cy=".18" r=".7"><stop stop-color="#2168D6" stop-opacity=".55"/><stop offset="1" stop-color="#2168D6" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#glow)"/>
  <g opacity=".12" stroke="#FFFFFF"><path d="M0 70h1200M0 140h1200M0 210h1200M0 280h1200M0 350h1200M0 420h1200M0 490h1200M0 560h1200M70 0v630M140 0v630M210 0v630M280 0v630M350 0v630M420 0v630M490 0v630M560 0v630M630 0v630M700 0v630M770 0v630M840 0v630M910 0v630M980 0v630M1050 0v630M1120 0v630"/></g>
  <g transform="translate(100 110) scale(1.1)">
    <rect width="64" height="64" rx="18" fill="#FFFFFF" fill-opacity=".1" stroke="#FFFFFF" stroke-opacity=".2"/>
    <path d="M14 43V22.5c7.8 0 13.2 2.3 18 6.1 4.8-3.8 10.2-6.1 18-6.1V43c-7.8 0-13.2 2.3-18 6.1-4.8-3.8-10.2-6.1-18-6.1Z" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M32 28.6V49" stroke="#7BB5FF" stroke-width="3.2" stroke-linecap="round"/>
  </g>
  <text x="192" y="163" fill="#7BB5FF" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="7">NUR TA’LIM</text>
  <text x="100" y="320" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="76" font-weight="800">Learn today.</text>
  <text x="100" y="405" fill="#A9C7F2" font-family="Inter, Arial, sans-serif" font-size="76" font-weight="800">Lead tomorrow.</text>
  <text x="104" y="483" fill="#C5D8F1" font-family="Inter, Arial, sans-serif" font-size="27">English • IT • Mathematics • Russian</text>
  <g transform="translate(970 410)">
    <circle cx="0" cy="0" r="105" fill="#FFFFFF" opacity=".08"/>
    <path d="M-60 35V-55l60-38 60 38v90l-60 38-60-38Z" fill="none" stroke="#7BB5FF" stroke-width="5" opacity=".8"/>
  </g>
  <rect x="100" y="525" width="180" height="7" rx="3.5" fill="#2168D6"/>
</svg>`;

fs.writeFileSync(path.join(root, 'public/logo.svg'), logo);
fs.writeFileSync(path.join(root, 'public/favicon.svg'), favicon);
fs.writeFileSync(path.join(root, 'public/hero-illustration.svg'), hero);
fs.writeFileSync(path.join(root, 'public/og-image.svg'), og);

const courseSlugs = [
  'english',
  'ielts',
  'frontend',
  'python',
  'math',
  'russian',
  'kids-english',
  'design',
  'sat-math'
];
courseImages.forEach((svg, index) => {
  fs.writeFileSync(path.join(root, `public/images/courses/${courseSlugs[index]}.svg`), svg);
});

teachers.forEach((svg, index) => {
  fs.writeFileSync(path.join(root, `public/images/teachers/teacher-${index + 1}.svg`), svg);
});

students.forEach((svg, index) => {
  fs.writeFileSync(path.join(root, `public/images/testimonials/student-${index + 1}.svg`), svg);
});

console.log('Placeholder assets generated.');
