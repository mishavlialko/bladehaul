# BeRocker leads: звіт (2026-10-16)

Гілка `feat/berocker-leads`, локальний коміт `1a4257a`. Не було ні push, ні deploy, ні змін Vercel env, ні реальних лідів.

## Що зроблено

- **Окремий крок outbox `crm`** поруч з email у тому самому private Blob записі. Email і CRM не блокують і не ретраять один одного.
- **Ідемпотентність.** Тіло ліда заморожується в записі при прийомі заявки, `secondary_id` = `requestId`. Спершу записується lease, потім іде POST. Після `created` лід більше ніколи не відправляється. Ретраї шлють те саме тіло без змін. Паралельні after() і cron створюють лід рівно один раз.
- **Ретраї.** 5xx/408/429/мережа/timeout (10 с) вважаються тимчасовими: існуючий cron ретраїть за тим самим графіком, що й email (5, 15, 60 хв, далі щогодини до 23 год), потім `manual_review`. 422/403 та інші 4xx одразу йдуть у `manual_review`. Текст помилок BeRocker не зберігається, лише код `berocker_http_<status>`.
- **Merge при збереженні.** Якщо email і CRM пишуть запис одночасно, кожен крок накладає лише свою секцію (поки тримає свій lease). Раніше другий writer міг би затерти результат першого.
- **Мапінг.** `firstName/lastName`, `phone` -> E.164 (`+15551234567`), `email`, ZIP -> `origin/destination_postal_code`, `readyDate` -> `ship_date`, `trailerType` -> `transport_type`. Vehicle: рік як число, make, model, `bodyType` -> `vehicle_type` (sedan->sedan, suv->SUV, pickup->Pickup, van->Van, coupe->Coupe, convertible->Convertible, wagon/hatchback->Car, other->Other), `inoperable` -> `vehicle_inop`, VIN тільки якщо є. У `comment_from_shipper` йдуть SMS consent Yes/No, версія notice, час (UTC, server receipt), source, request ID і нотатки клієнта.
- **Квитанція BeRocker.** У запис зберігаються `leadId` і `bookingLink` (тільки https).
- **Env.** `BEROCKER_ENABLED` (вмикає лише точне `"true"`) і `BEROCKER_LEAD_SAVE_URL`. URL тільки серверний, перевіряється як `https://.../save`. Помилки конфігу не містять URL. У логах лише `quoteId`; URL/key і PII не логуються. У client bundle URL немає (перевірено в `.next/static`).
- **Health cron.** `manualReviewIds` включає CRM-збої. Новий прапорець `crmUnavailable` спрацьовує, коли є pending CRM-кроки, а BeRocker вимкнено або URL битий.
- **`.env.example`.** Оновлено (без реальних значень), коментар "no BeRocker integration" замінено.

## Файли

`lib/quote-crm.ts` (новий), `lib/quote-outbox.ts`, `lib/quote-intake.ts`, `lib/quote-config.ts`, `lib/quote-maintenance.ts`, `app/api/quote/delivery.ts`, `app/api/quote/route.ts`, `app/api/internal/quote-maintenance/route.ts`, `.env.example`, тести `app/api/quote/crm.test.mts` (новий) і `app/api/quote/route.test.mts`.

## Перевірки

- `npm test`: 122/122 pass. Нових 18: 16 у `crm.test.mts` (success, 422, 403, 5xx/408/429/мережа з ретраєм через cron, idempotency, паралельні воркери, втрачене збереження, конкурентні email+CRM, без телефону, вимкнено, конфіг, відсутність логів) і 2 через реальний POST handler. Fetch скрізь замоканий.
- `npx tsc --noEmit`: 0 помилок. `npm run lint`: 0.
- `npm run build`: OK. Попередження про шрифт `Big Shoulders` було й до цих змін.
- Prettier: змінені файли чисті. Ще 37 файлів у робочій копії мають CRLF через `core.autocrlf=true`, це не з цієї гілки.

## Відкриті питання (рішення за Мішею)

1. **Телефон на формі необов'язковий, а BeRocker без нього лід не приймає.** Такі заявки отримують `crm.state=skipped` (`crm_phone_missing`) і приходять лише email-ом. Чи робити phone обов'язковим?
2. **Автоматизації BeRocker.** Save запускає distribution і, якщо Auto Price ON, автоматичну відправку quote. Follow-up SMS теж можливі. Клієнти з `consentTcpa=false` потраплять у CRM з телефоном, а consent у коментарі автоматизації не читають. Перед увімкненням треба перевірити налаштування source і templates (SMS за A-11 вимкнено).
3. **Ідемпотентність на стороні BeRocker не задокументована.** `secondary_id` не описаний як ключ дедупу; дедуп є лише для однакових contact+route+date+vehicles протягом 30 хв. Залишковий ризик: BeRocker створив лід, відповідь загубилась (timeout), а ретрай пішов уже після 30 хв, тоді можливий дубль. Варто спитати support, чи дедупить `secondary_id`.
4. **Неперевірені формати.** Телефон у E.164 і `vehicle_model_year` числом. Якщо BeRocker не прийме, перший тестовий лід покаже 422, і запис піде в `manual_review`.
5. **`is_custom` не відправляється.** За докою custom vehicle віддає весь лід на manual quote, а Vehicle API key, щоб визначати custom, у нас немає.
6. **Прапорець фіксується в момент прийому заявки.** Заявки, прийняті при `BEROCKER_ENABLED=false`, після увімкнення в CRM не догружаються.
7. **Використовується `/save`, не `/save/hot`.** Hot-лід сповіщає агента, це окреме рішення.
8. **Активація (тільки з окремого "так").** Створити окремий website lead source у BeRocker, задати `BEROCKER_LEAD_SAVE_URL` і `BEROCKER_ENABLED=true` у Vercel. Для preview брати окремий source або лишити вимкненим, бо інакше тести на preview створюватимуть реальні ліди. Потім один синтетичний лід і прибрати його в CRM.
