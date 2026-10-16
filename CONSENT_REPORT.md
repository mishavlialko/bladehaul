# Consent і телефон: звіт (2026-10-16)

Гілка `feat/berocker-leads`, лише локальні коміти. Не було push, deploy, змін Vercel env, реальних лідів чи листів.

## Коміти

| Коміт      | Задача                                                     |
| ---------- | ---------------------------------------------------------- |
| `5c1b62c`  | 1. Чекбокс SMS/TCPA замінено на consent notice біля кнопки |
| `1fec3e8`  | 2. Телефон обов'язковий, нормалізація в E.164              |
| `f303ba6`  | 3. BeRocker у Privacy Policy як CRM-провайдер              |
| `5ead845`  | 4. `BEROCKER_REPORT.md`                                    |
| (цей файл) | 5. `CONSENT_REPORT.md`                                     |

## Що змінено

### 1. Consent при сабміті замість чекбокса

- Чекбокс SMS consent і його helper-текст прибрано з кроку Contact.
- Прямо над кнопкою сабміту стоїть notice дослівно за ТЗ: "By clicking Get Quote, you agree that BladeHaul Auto Transport may contact you ... Reply STOP to opt out. See our Privacy Policy and Terms." Privacy Policy і Terms є посиланнями на `/privacy` і `/terms` (відкриваються в новій вкладці, для screen reader є підпис).
- Стиль: 15px, `leading-relaxed`, основний темний колір тексту `text-text` (#1A1A1A), не бліде сіре. Посилання підкреслені. Кнопка має `aria-describedby` на notice, тож screen reader зачитує його разом з кнопкою.
- Кнопку перейменовано з "Get my quote" на **"Get Quote"**, щоб збігалася з текстом notice. Підпис "Retry" після помилки прибрано з тієї ж причини: кнопка, на яку тиснуть, завжди називається Get Quote. Тимчасові стани "Sending…" і "Try again in Ns" (кнопка disabled) лишились.
- Текст notice і підпис кнопки винесено в константи `QUOTE_CONSENT_NOTICE`, `QUOTE_CONSENT_TEXT`, `QUOTE_SUBMIT_LABEL` у `lib/validation.ts`. Тест фіксує точне формулювання, тому випадкова правка тексту зламає тест.
- Схема: `consentTcpa` тепер `z.literal(true)` (сабміт = згода), нова версія notice `2026-10-16-submit-v1`. Старі версії (`2026-10-03-sms-v1`, `2026-09-29`) не приймаються і не "апгрейдяться".
- Старі відкриті вкладки з чекбоксом отримують 400 і повідомлення "Refresh the page to see the current consent notice before sending your request." Нічого не зберігається.
- Запис ліда зберігає `consentTcpa: true`, `consentVersion` і `receivedAt` (UTC, час прийому сервером). Ті самі три рядки йдуть у нотатки BeRocker (`comment_from_shipper`) і в email-сповіщення:
  - `Contact consent by submitting the quote form (phone, email, SMS, including automated messages): Yes`
  - `Consent notice version: 2026-10-16-submit-v1`
  - `Consent recorded at (UTC, server receipt): <ISO час>`
- Старі записи в outbox не змінюються: ретраї шлють заморожене тіло email/ліда.
- Privacy і Terms переписано під новий flow (раніше там був "optional SMS checkbox"). SMS Terms тепер описують повідомлення "about your vehicle-shipping quote request". Додано альтернативу без згоди: запит квоти email-ом на info@bladehaul.com (підкріплює "Consent is not a condition of purchase"). Прибрано речення "Our website quote form does not enroll you in automated calls", бо новий notice покриває phone, включно з automated messages. Дати оновлення і `sitemap.ts` переставлено на 2026-10-16.

### 2. Телефон обов'язковий, E.164

- Поле "Phone" без "(optional)", helper "10-digit US number.", placeholder `+1 (555) 555-0123`.
- Спільна схема (клієнт через zodResolver і сервер) вимагає телефон і нормалізує його функцією `normalizeUSPhone`: приймає `+1 (312) 555-0142`, `(312) 555-0142`, `312-555-0142`, `312.555.0142`, `3125550142`, `1 312 555 0142`, `+13125550142` і повертає `+13125550142`.
- Відхиляє: менше/більше 10 цифр, не-US коди (`+44 ...`), area code чи exchange на 0/1 (правило NANP), літери/extension, понад 30 символів.
- Нормалізація відбувається до хешу, збереження, email і BeRocker. Повторний parse вже нормалізованого номера нічого не змінює, тому ретрай з тим самим requestId дає той самий payload hash.
- `buildBeRockerLead` і далі пропускає записи без телефону (`crm_phone_missing`), але тепер це можливо лише для старих записів.
- У Privacy телефон перенесено зі "optional" у список обов'язкових даних.

### 3. Privacy: BeRocker

У "Who receives your information" додано: BeRocker як CRM service provider отримує і зберігає quote request (контакти, маршрут, авто, дата, нотатки, consent record), щоб команда могла вести й відповідати на запит.

## Файли

`lib/validation.ts`, `lib/quote-crm.ts`, `lib/quote-outbox.ts`, `app/api/quote/route.ts`, `components/sections/QuoteForm.tsx`, `components/sections/QuoteStepContact.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/sitemap.ts`; тести `lib/validation.test.mts`, `app/api/quote/crm.test.mts`, `app/api/quote/outbox.test.mts`, `app/api/quote/route.test.mts`, `app/api/quote/test-runtime.mts`; `BEROCKER_REPORT.md`, `CONSENT_REPORT.md`.

## Перевірки

- `npm test`: **128/128 pass** (було 122). Нові: точний текст notice і підпис кнопки, consent false/відсутній відхиляється, старі версії consent відхиляються, телефон обов'язковий, нормалізація в E.164 з повторним parse, невалідні номери, POST зі старої вкладки дає 400 без збереження, POST без телефону чи з не-US номером дає 400 без збереження, POST з `(312) 555-0142` зберігає `+13125550142`. Fetch скрізь замоканий.
- `npx tsc --noEmit`: 0 помилок. `npm run lint`: 0.
- `npm run build`: OK після кожного кодового коміту. Попередження про шрифт `Big Shoulders` було й раніше.
- Prettier: змінені файли чисті (`--end-of-line auto`; CRLF у робочій копії через `core.autocrlf=true`).
- Production-сервер локально: `/privacy` віддає 200 з новим текстом; notice є в client chunk; URL BeRocker у `.next/static` немає.
- **Не перевірено візуально на 390px:** браузерні інструменти (Playwright/Chrome DevTools) у цій сесії без дозволу. Треба глянути крок Contact на мобільному вручну.

## Відкриті питання (рішення за Мішею)

1. **Маркетинг не покритий.** Старий чекбокс прямо згадував "marketing follow-ups", новий текст каже лише "about your request". Якщо BeRocker шлятиме маркетингові/дожимні SMS, у notice треба явно додати маркетинг і підняти версію. SMS Terms уже звужено до повідомлень про запит.
2. **Юридичний ризик click-wrap.** Згода, вшита в сабміт, поширена, але для automated telemarketing TCPA вимагає prior express written consent з чітким розкриттям. Я не юрист, тож перед активацією варто показати текст юристу.
3. **10DLC/carrier review.** Можливо, рев'юери SMS-кампаній (TCR/оператори) вимагають, щоб SMS opt-in на веб-формі був окремим і необов'язковим. Це не перевірено. Уточнити в BeRocker або SMS-провайдера до реєстрації кампанії, бо інакше її можуть відхилити.
4. **Назва.** Notice каже "BladeHaul Auto Transport" (дослівно за ТЗ), а Privacy/Terms юридичну назву "BladeHaul Auto Transport LLC". Якщо треба, додати "LLC" і в notice (з новою версією).
5. **Строга NANP-валідація** відсікає вигадані номери на кшталт `555-123-4567` (exchange на 1). Реальні номери проходять. Якщо це заважатиме, правило exchange можна послабити.
6. **Активація BeRocker** і далі тільки з окремого "так" (див. `BEROCKER_REPORT.md`, п. 8).

## Інше

- Git identity на цій машині не налаштований. Коміти зроблено через `git -c user.name/user.email` з тим самим автором, що й `1a4257a` (Mykhailo Vlialko). Глобальний конфіг не змінено.
- Untracked `claude_run.log`, `claude_run2.log`, `install.log` не чіпав і не комітив.
