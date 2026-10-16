# Quote form → BeRocker lead save: звіт про відповідність (2026-10-16)

Гілка `feat/berocker-form-fit`, локальні коміти `aa66a57`, `01e4f4b`, `0bd1976` (плюс цей звіт). Без push і deploy, env не чіпав. На BeRocker API жодного запиту не було: читав тільки публічну доку на help.berocker.com.

Джерела (прочитано 2026-10-16):

- [Lead source API](https://help.berocker.com/integrations/lead-source-api.md): повний перелік полів save
- [Lead Source API with pickup windows](https://help.berocker.com/integrations/pickup-windows-api.md)
- [Build your own quote form](https://help.berocker.com/integrations/custom-quote-form.md)
- [Vehicle database API](https://help.berocker.com/integrations/vehicle-database-api.md)
- [Lead sources](https://help.berocker.com/settings/lead-sources.md)

## 1. Що приймає BeRocker (`POST …/lead/<key>/save`, JSON)

**Обов'язкові:** `first_name` (непорожній), `phone` ("будь-який поширений US-формат", нормалізується на їхньому боці), `vehicles` (мінімум одне авто).

**Клієнт і маршрут:** `last_name`, `email`, `additional_phone`, `origin_city`, `origin_state`, `origin_postal_code`, `origin_address`, `destination_city`, `destination_state`, `destination_postal_code`, `destination_address`, `origin_country`, `destination_country` (за замовчуванням `US`). Місто і штат BeRocker сам заповнює з ZIP.

**Перевезення:** `ship_date` (дата, у прикладах `YYYY-MM-DD`), `drop_off_date`, `transport_type` (`open` за замовчуванням або `enclosed`), `comment_from_shipper`, `customer_comments`, `secondary_id`, `booking_number`, `customer_id_type` (`passport`/`driver_license`/`national_id`), `customer_id_number`.

**Тільки в редакціях з Feature Flags → Pickup windows:** `pickup_window_start` / `pickup_window_end` (`YYYY-MM-DD`), `pickup_timeframe` (`asap`, `within_1_week`, `within_2_weeks`, `beyond_2_weeks`). В інших редакціях ці поля ігноруються, помилки не буде.

**Кожне авто:** `vehicle_model_year` (integer, alias `year`), `vehicle_make` (alias `make`), `vehicle_model` (alias `model`), `vehicle_type`, `vehicle_inop` (boolean), `vin`, `is_custom` (boolean: авто не з каталогу, тоді автоквоти немає і лід іде на ручну оцінку).

**`vehicle_type`:** `Car`, `sedan`, `Coupe`, `Convertible`, `SUV`, `Van`, `Pickup`, `pickup_2_doors`, `pickup_4_doors`, `Motorcycle`, `ATV`, `Boat`, `RV`, `Travel Trailer`, `Other`.

**Чого в API немає:** окремого поля `source` (лід атрибутується lead source, якому належить URL), поля "first available date" у базовій редакції (тільки `ship_date`), поля для consent і UTM. Ціна ліда береться з Per Lead Price джерела, не з payload.

**Відповіді:** `200` з `id`, `bookingLink`, `price` (зазвичай `null`), `leadProvider`. `422` з `message` і `errors` по полях. `403` "Invalid credentials" (ключ неправильний або source Disabled). Повторна така сама заявка (той самий контакт, маршрут, дата й авто) протягом 30 хв повертає вже створений лід, дубля не буде.

## 2. Мапінг: наша форма → BeRocker

| Наше поле                                      | Поле BeRocker                                                                               | Що шлемо                                                                                                                                              | Статус                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `firstName`                                    | `first_name`                                                                                | trim, в один рядок                                                                                                                                    | OK                       |
| `lastName`                                     | `last_name`                                                                                 | trim, в один рядок                                                                                                                                    | OK                       |
| `phone` (запис зберігає E.164)                 | `phone`                                                                                     | було `+13125550142`, тепер `3125550142`                                                                                                               | **Виправлено**           |
| `email`                                        | `email`                                                                                     | trim + lowercase                                                                                                                                      | **Виправлено** (дрібне)  |
| `pickupZip`                                    | `origin_postal_code`                                                                        | 5 цифр (валідація форми)                                                                                                                              | OK                       |
| `deliveryZip`                                  | `destination_postal_code`                                                                   | 5 цифр                                                                                                                                                | OK                       |
| —                                              | `origin_city/state`, `destination_city/state`                                               | не шлемо, BeRocker заповнює з ZIP                                                                                                                     | OK за докою              |
| —                                              | `*_address`, `*_country`                                                                    | не збираємо, країна за замовчуванням `US`                                                                                                             | n/a                      |
| `readyDate` ("Preferred pickup date")          | `ship_date`                                                                                 | `YYYY-MM-DD`                                                                                                                                          | OK                       |
| —                                              | `pickup_window_*`, `pickup_timeframe`                                                       | не шлемо                                                                                                                                              | рішення, див. п. 5       |
| `trailerType` `open`/`enclosed`                | `transport_type`                                                                            | той самий enum                                                                                                                                        | OK                       |
| `vehicleYear` `"2019"`                         | `vehicle_model_year`                                                                        | integer `2019`                                                                                                                                        | OK                       |
| `vehicleMake` / `vehicleModel`                 | `vehicle_make` / `vehicle_model`                                                            | trim, в один рядок                                                                                                                                    | OK                       |
| `bodyType`                                     | `vehicle_type`                                                                              | sedan→**`Car`** (було `sedan`), wagon/hatchback→`Car`, coupe→`Coupe`, convertible→`Convertible`, suv→`SUV`, pickup→`Pickup`, van→`Van`, other→`Other` | **Виправлено** sedan     |
| `vehicleCondition` `runs`/`inoperable`         | `vehicle_inop`                                                                              | `false`/`true`                                                                                                                                        | OK                       |
| `vin`                                          | `vin`                                                                                       | uppercase, тільки якщо заповнено                                                                                                                      | OK                       |
| —                                              | `is_custom`                                                                                 | не шлемо                                                                                                                                              | невідомо, п. 5           |
| `additionalDetails`                            | `comment_from_shipper` (блок "Customer notes")                                              | багаторядковий текст                                                                                                                                  | OK                       |
| `consentTcpa`, `consentVersion`, час отримання | `comment_from_shipper`                                                                      | рядки тексту                                                                                                                                          | OK (окремого поля немає) |
| `source` (`hero-mini`/`main-form`/`final-cta`) | `comment_from_shipper`                                                                      | рядок тексту                                                                                                                                          | OK                       |
| `landingPage`, `utm` (нові)                    | `comment_from_shipper`                                                                      | `Landing page: …`, `UTM: source=…, medium=…`                                                                                                          | **Додано**               |
| `bodyType` (точний)                            | `comment_from_shipper`                                                                      | `Website body type: …`                                                                                                                                | **Додано**               |
| `requestId` (UUID)                             | `secondary_id`                                                                              | той самий UUID                                                                                                                                        | OK                       |
| —                                              | `additional_phone`, `customer_comments`, `drop_off_date`, `booking_number`, `customer_id_*` | не шлемо                                                                                                                                              | n/a                      |

Формати, які просили перевірити окремо: дата `YYYY-MM-DD` збігається; ZIP 5 цифр збігається; коди штатів не шлемо (BeRocker бере їх із ZIP), тому нормалізувати нема чого; trailer enum збігається; operable = boolean `vehicle_inop` збігається; телефон і `sedan` виправлено.

## 3. Що змінено

1. **`aa66a57` Формати payload** (`lib/quote-crm.ts`)
   - Телефон іде в BeRocker 10 цифрами, як у всіх їхніх прикладах і в збережених лідах (`"phone": "3055550101"`). У нашому записі лишається E.164. Приймається будь-яке збережене US-написання (E.164, `+1 (312)…`, `312-555-…`), все інше дає skip, як і раніше.
   - `sedan` → `Car`. Сам BeRocker у прикладі шле Toyota Camry як `"Car"`, а їхній vehicle catalogue повертає `type: "Car"` з `body_type: "Sedan"`. Тобто автоквота рахує седан як `Car`. Точний тип кузова з сайту дублюється в коментарі.
   - Ім'я, make і model чистяться від керівних символів і переносів, пробіли схлопуються. Email у нижньому регістрі, щоб CRM матчила клієнта.
2. **`01e4f4b` Landing page + UTM** (`lib/quote-attribution.ts` новий, `instrumentation-client.ts`, `lib/validation.ts`, `QuoteForm.tsx`, `quote-crm.ts`, `quote-outbox.ts`, `app/privacy/page.tsx`)
   - Форма стоїть тільки на `/`, тож "сторінка відправки" завжди `/` і нічого не дає. Замість неї при кожному повному завантаженні сторінки в session storage вкладки пишеться перша відкрита сторінка і 5 стандартних UTM (`utm_source/medium/campaign/term/content`). Посилання з UTM перезаписує збережене, без UTM лишається перша сторінка вкладки.
   - Повний URL не зберігаю: у query бувають `gclid`, email та інше. Тільки path (до 200 символів) і UTM (до 100 символів на тег).
   - Сервер атрибуцію ніколи не відхиляє: невалідне значення просто відкидається (`.catch(undefined)`), заявка проходить.
   - Рядки `Landing page` / `UTM` є і в коментарі BeRocker, і в email оператору.
   - У Privacy Policy дописано, що з заявкою зберігаються landing page і UTM, що вони лежать у session storage і що їх отримує BeRocker.
3. **`0bd1976` Fixture-тести** (`app/api/quote/berocker-mapping.test.mts`): реалістичні ліди проходять реальний шлях: input браузера → `quoteSchema` → payload → lead. Кожен перевіряється проти документованих полів і типів BeRocker:
   - Camry з Google-реклами
   - неробочий F-100 1969 року з коротким legacy ID, enclosed
   - Tesla Model Y з VIN
   - усі 9 body types
   - стара заявка без телефону

**Форма для клієнта не змінилась**, жодного видимого поля не додано. Перевірив, що потрібне для ціни вже є: "Does it run?" (→ `vehicle_inop`), Open/Enclosed (→ `transport_type`), окремі First name і Last name (ділити повне ім'я не треба), body type. BeRocker обов'язково вимагає тільки `first_name`, `phone` і одне авто, а все це форма вже збирає.

**Кілька авто не додавав.** Форма збирає одне авто, payload шле масив з одного елемента. Друге авто клієнт пише в notes, і агент додає його вручну. Кнопка "Add another vehicle" подовжує форму для всіх заради рідкісного випадку. Варто повернутися до цього, якщо в лідах таких notes багато.

## 4. Перевірки

- `npm test`: **142/142 pass** (було 128). Нових 14: 5 fixture, 4 attribution, 3 у `crm.test.mts` (формати телефону; чистка імен, email і авто; attribution у коментарі та email), 1 у `validation.test.mts` (attribution опційна і не блокує заявку), 1 POST-тест (attribution доходить до ліда, сміттєва не блокує). Fetch скрізь замоканий.
- `npx tsc --noEmit`: 0 помилок. `npm run lint`: 0 помилок, 0 попереджень.
- `npm run build`: OK. Попередження про шрифт `Big Shoulders` було й до цих змін.
- Prettier: змінені файли чисті. Він скаржиться лише на CRLF у робочій копії (`core.autocrlf=true`), у коміти йде LF.

## 5. Що досі невідомо про BeRocker (рішення за Мішею)

1. **Чи дедупить BeRocker по `secondary_id`.** У доці це лише "your own reference". Задокументований дедуп: той самий контакт + маршрут + дата + авто протягом 30 хв. Ризик дубля після загубленої відповіді й пізнього ретраю лишається (див. `BEROCKER_REPORT.md`, п. 3). Спитати support.
2. **Куди потрапляє `comment_from_shipper`.** Невідомо, чи цей текст іде в пости на load board (Central Dispatch / Super Dispatch) і чи бачать його перевізники. Там зараз consent, UTM і request ID. Якщо бачать, службову частину краще перенести в `customer_comments` (у доці поле без опису, де воно відображається, невідомо). Перевірити на першому тестовому ліді в CRM і в `prepare-loadboard-post`.
3. **Pickup windows / timeframe.** Треба подивитися, чи є в нашому BeRocker **Settings → Feature Flags → Pickup windows**. Якщо є, "first available date" можна слати як `pickup_window_start`. Але BeRocker тоді сам ставить кінець вікна і записує його як вибір клієнта, а дати в минулому дають `422`, тобто лід не створиться (небезпечно для пізніх ретраїв). Тому поки шлемо тільки `ship_date`.
4. **`is_custom`.** Не шлемо: без ключа Vehicle database API (`bvk_…`) не знаємо, чи авто є в їхньому каталозі. Як BeRocker поводиться з make або model не з каталогу при `is_custom=false` (автоквота неправильна, без ціни чи щось інше), невідомо. Варіант: попросити ключ і робити `lookup` на сервері.
5. **`Coupe` / `Convertible` проти `Car`.** Обидва є в повному переліку типів, але немає в переліку на сторінці pickup windows. Чи рахує автоквота їх інакше, ніж `Car`, невідомо. Залишив документовані значення.
6. **`ship_date` у минулому.** Ретрай може піти до 23 год після прийому, тоді дата "сьогодні" стане вчорашньою. Для `ship_date` валідацію не задокументовано (для pickup window задокументовано). Перший `422` покаже, якщо це проблема.
7. **Телефон 10 цифрами** відповідає прикладам, але реального підтвердження від BeRocker немає. Те саме для `Car` замість `sedan`.
8. **Активація** (тільки після окремого "так"): окремий website lead source, `BEROCKER_LEAD_SAVE_URL` і `BEROCKER_ENABLED=true` у Vercel, один синтетичний лід. На ньому перевірити телефон, тип авто, де видно коментар, Secondary ID і чи заповнились місто й штат із ZIP. Потім прибрати цей лід.
