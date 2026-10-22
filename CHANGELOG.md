## 1.6.4 — мобільні каруселі без вертикального прокручування

- Усунуто випадковий вертикальний scroll у всіх горизонтальних каруселях, спричинений 66px анімацією появи карток.
- Прокручування пальцем вгору/вниз передається сторінці; горизонтальне гортання й анімація карток залишаються.
- Додано мобільні регресійні тести жестів touch для переваг, залів, оснащення, відгуків та вибору часу.
- WordPress, адмінка та серверна логіка не входять до збірки.

## 1.6.3 — безперервний градієнт у картках залів

- Усунуто чітку горизонтальну межу між двома шарами затемнення на картках залів.
- Затемнення тепер малюється одним безперервним градієнтом поверх усієї фотографії під текстом.
- Текст, розміри, радіуси, зображення та інші секції залишено без змін.
- Перевірка окремо для світлої/темної тем і різних ширин екрана.

## 1.6.2 — HTML/CSS/JS-only release

- Removed right-side pagination and its JavaScript entirely; re-centered all sections at mobile, tablet and desktop widths.
- Raised the existing bottom-up neutral darkening gradients on benefits, rooms and gear cards (no separate top shade), preserving photo-first design.
- Made approved motion visible: fade and 66px upward reveal of sections, headers, cards; consecutive delays; 16px desktop photo parallax; soft gallery image transitions; responsive glass and hover states.
- Preserved accessible reduced-motion behavior, Light/Dark, and all existing interactions.
- No WordPress theme, admin panel or booking backend is included.

## 1.6.1 — Centered layout and stronger card readability

- Removed the fixed right-side section pagination.
- Re-centered the main sections and benefits panel on tablet and desktop breakpoints.
- Raised and strengthened the bottom-up darkening gradients on benefits, halls and equipment cards so the upper text remains readable over bright photos.
- Bumped static asset query strings to reduce browser cache issues.

## 1.6.0 — High-resolution photography and unobstructed content

- Replaced blurry low-resolution demo imagery with optimized 1000–1448 px AI-generated WebP scenes. Existing approved hero remains unchanged.
- Distinct neutral photographic overlays with contrast and no hard grey slabs; preserved original section geometry.
- Floating booking control yields while an interactive photo gallery or tour strip lies underneath.
- Explicit transparency: pictures are illustrative AI-generated demo images, not real studio photos.
- Extended browser QA for image dimensions and overlay intersections.

## 1.5.1 (visual corrections in progress)
- Restored visible photographic cards, neutral translucent overlays, continuous hall imagery, neutral equipment perks and pager spacing.
- Existing low-resolution gallery source files require original media assets.

# BRAND Studio v1.5.0 — затверджені правки

## Реалізовано
- Фіксована пагінація: номери за кількістю семантичних секцій, рухомий активний індикатор, контрастні кольори Light/Dark, відсутність на телефонах.
- Єдині відступи та радіуси заокруглень; окремий заокруглений фон секції залів; заокруглення всіх чотирьох кутів фінального CTA та рівномірний відступ до футера.
- «Всі зали»: зрозуміла текстова кнопка без стрілки.
- Напівпрозорі сіруваті матові плашки карток замість коричневих; підсилена читабельність інформаційних карток у світлій темі.
- Висота банера туру оснащення узгоджена з банерами інших секцій; збалансований відступ до каталогу.
- Заголовки секцій: letter-spacing 1.5px.
- Плавна поява секцій/карток знизу з opacity, послідовною затримкою, плавніші переходи/hover і делікатний паралакс; prefers-reduced-motion.
- Фото галереї залишено без вбудованих стрілок; навігація залишається окремо у модальному перегляді.
- Відеотури більше не відкривають фотогалерею і не показують чорні бокові поля; за відсутності відео показують честний постер з повідомленням.
- Перегляд фотокарток оснащення відкриває окрему галерею, не відео.
- Шість доступних іконок соцмереж (без вигаданих посилань), кнопка «Прокласти маршрут» до демонстраційної адреси.
- Власний браузерний QA на ширинах 320, 390, 640, 768, 834, 900, 901, 1200, 1536, 1920, 2560 px + теми та reduced-motion.

## Потребує вихідних матеріалів
- Якісні оригінали фотографій галереї, щоб усунути справжнє розмиття джерел (наявні файли 162–347 px).
- Справжні файли відеотурів.
- Справжні посилання на соцмережі та адресу для маршруту.

Статус: фронтенд-демоверсія, не WordPress і не бронювання. Піксельна тотожність усім макетам не заявляється.
