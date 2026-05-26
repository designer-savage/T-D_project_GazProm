# Анализ рынка: корпоративные AI-экосистемы для T&D
> Кейс: ИТ-кластер «Газпром Нефти» × HSCC — создание AI-экосистемы на базе агентов для обучения и развития сотрудников

---

## Содержание

1. [Контекст и метрики рынка](#1-контекст-и-метрики-рынка)
2. [SAP SuccessFactors + Joule](#2-sap-successfactors--joule)
3. [Workday Learning + Sana Agents](#3-workday-learning--sana-agents)
4. [Cornerstone Workforce AI (Galaxy)](#4-cornerstone-workforce-ai-galaxy)
5. [Degreed + Maestro](#5-degreed--maestro)
6. [Docebo + Harmony](#6-docebo--harmony)
7. [Microsoft Viva Suite](#7-microsoft-viva-suite)
8. [Oracle Fusion Cloud HCM + AI Agents](#8-oracle-fusion-cloud-hcm--ai-agents)
9. [Российский рынок](#9-российский-рынок)
10. [Сравнительная таблица](#10-сравнительная-таблица)
11. [Архитектурные паттерны](#11-архитектурные-паттерны)
12. [Выводы для кейса](#12-выводы-для-кейса)

---

## 1. Контекст и метрики рынка

| Показатель | Значение | Источник |
|---|---|---|
| Мировой рынок HR Tech | ~$94 млрд | 451 Research |
| Рынок AI-ассистентов (2025) | $3,35 млрд | Predefence Research |
| Рынок AI-ассистентов (2030, прогноз) | $21,11 млрд | Predefence Research |
| CAGR рынка AI-ассистентов | 44,5% | Predefence Research |
| Рынок AI-персонализации (2024) | $1,84 млрд | — |
| Рынок AI-персонализации (2034, прогноз) | $24,8 млрд | — |
| CAGR AI-персонализации | 29,7% | — |
| Рост производительности от AI-ассистентов | +20–25% | — |
| Устаревание IT-навыков | ~2,5 года | Данные кейса |

**Ключевой тренд:** компании уходят от отдельных LMS-систем к комплексным платформам, объединяющим обучение, коммуникацию, аналитику, KPI и карьерные треки в одном продукте с AI-агентами внутри.

---

## 2. SAP SuccessFactors + Joule

**Сайт:** https://www.sap.com/products/hcm/learning.html  
**Тип:** Enterprise HCM suite с AI-копилотом  
**Аудитория:** Fortune 500, нефтегазовые корпорации, банки, государственные структуры  
**Цена:** от $10/пользователь/месяц, кастомно для enterprise  
**Клиенты:** более 10 000 компаний, 200+ млн пользователей данных

### Что умеет

- Обучение (LMS/LXP)
- Performance & Goals Management
- Talent Marketplace (внутренняя мобильность)
- Succession Planning
- Workforce Analytics
- Рекрутинг с AI-подсказками
- Персонализированные карьерные треки

### AI-движок: SAP Joule

**Joule** — генеративный AI-копилот, встроенный во весь SAP-портфель.

**Архитектура (слои):**

```
[Experience Layer]     — Joule UI (diamond icon), Teams, Mobile
         ↓
[Orchestration Layer]  — SAP BTP (Cloud Foundry), intent recognition
         ↓
[Grounding Layer]      — RAGe (Retrieval-Augmented Generation for enterprise),
                         Knowledge Catalog, SharePoint, SAP-документы
         ↓
[LLM Layer]            — SAP-оптимизированные LLM (включая ABAP-специфичный),
                         поддержка сторонних моделей через SAP AI Core
         ↓
[Execution Layer]      — OData API → SuccessFactors, S/4HANA, Ariba, Concur
```

**Как работает технически:**
- Joule запущен как сервис на SAP BTP в Cloud Foundry
- Перед отправкой промпта в LLM — обогащение анонимизированными SAP-данными (контекст пользователя, роль, разрешения, транзакции)
- RAGe извлекает релевантный контекст из Knowledge Catalog
- Joule знает, в каком SAP-приложении находится пользователь и какие приложения активированы
- Результат фильтруется, проверяется на соответствие политикам безопасности
- Данные клиентов **не используются** для обучения LLM третьих сторон

**AI-фичи в SuccessFactors:**
- **Opportunity Marketplace** — ML анализирует KPI, 360°, грейды и рекомендует курсы, роли, наставников, проекты
- **AI-assisted Person Insights** — для менеджеров: инсайты о сотруднике перед разговором о зарплате/развитии
- **Performance and Goals Agent** (oct 2025) — автономный агент для постановки целей и отслеживания прогресса
- **Joule Studio / Agent Builder** — low-code конструктор кастомных агентов и воркфлоу
- **Deep Research** (2025) — синтез больших объёмов структурированных и неструктурированных данных

**Интеграция с Microsoft:**
- Microsoft Viva Learning + Copilot: сотрудник делает natural language запрос → получает рекомендации из SuccessFactors → прогресс обновляется автоматически

### Как сотрудник взаимодействует с системой

1. Открывает SAP-приложение (Teams, веб, мобильное)
2. Нажимает иконку Joule (diamond, правый верхний угол)
3. Пишет на естественном языке: "Хочу стать тимлидом через год. Какие курсы пройти?"
4. Joule анализирует профиль, данные KPI, 360°, карьерный грейд
5. Возвращает персонализированный трек: конкретные курсы + менторы + внутренние вакансии + временные рамки
6. Сотрудник принимает рекомендации → назначения фиксируются автоматически

### Технический стек

| Компонент | Технология |
|---|---|
| Runtime | SAP BTP, Cloud Foundry |
| LLM | SAP-оптимизированные модели (с ABAP-специализацией), Azure OpenAI (партнёрство) |
| RAG | RAGe (SAP's enterprise RAG), embeddings for context retrieval |
| API | OData v4, REST |
| Auth | SAP Cloud Identity Services (SAML, OAuth 2.0) |
| Интеграция | Microsoft 365 Copilot, Azure OpenAI Service API |
| Данные | SAP Datasphere, SAP Analytics Cloud |

---

## 3. Workday Learning + Sana Agents

**Сайт:** https://www.workday.com/en-us/products/human-capital-management/learning.html  
**Sana Labs:** https://www.sanalabs.com  
**Тип:** HCM + AI-native learning platform  
**Сделка:** Workday приобрёл Sana Labs за **$1,1 млрд** (сентябрь 2025, закрыта ноябрь 2025) — крупнейшая сделка в истории Workday  
**Цена Sana standalone:** от $13/пользователь/месяц (минимум 300 пользователей, ~$47k/год)

### Что умеет

- AI-native LMS + LXP + authoring tool + virtual classroom (всё в одном)
- Управление навыками и карьерными треками
- Граф знаний компании (агрегация из всех корпоративных систем)
- Агентная платформа для HR-воркфлоу
- Workforce planning + аналитика

### AI-движок: Sana Agents + Workday AI

**Архитектура:**

```
[Employee Interface]     — Web, Mobile, Teams
         ↓
[Sana Agent Layer]       — Multi-agent orchestration, workflow builder
         ↓
[Knowledge Graph]        — Индексация: Slack, GitHub, Salesforce, SharePoint,
                           Notion, Jira, Confluence, внутренние документы
         ↓
[RAG Pipeline]           — Data labeling, LLM optimization, vector search
         ↓
[LLM Layer]              — OpenAI, Anthropic, кастомные fine-tuned модели
         ↓
[Workday Business Rules] — Безопасность, разрешения, GDPR над Sana
```

**Sana Agent Builder (workflow):**
- Drag-and-drop конструктор "шагов" (prompt paths)
- Инструмент для создания суб-агентов (у Josh Bersin's Galileo — 400+ HR суб-агентов)
- Агенты могут действовать автономно: назначать курсы, отправлять уведомления, обновлять профили

**Ключевые фичи:**
- **AI Tutor** — персонализированный ИИ-тьютор внутри каждого курса
- **Semantic Search** — векторный поиск по всему контенту компании
- **Spaced Repetition** — адаптивные оценки с алгоритмами интервального повторения
- **Neural Search (Docebo style)** — разговорные запросы к неструктурированным знаниям
- **Автоматизация воркфлоу** — интеграция с HRIS, CRM

**Как сотрудник взаимодействует:**
1. Открывает портал или Teams
2. Sana индексирует историю обучения, проекты в Jira, код в GitHub, переписку в Slack
3. AI выстраивает динамический профиль навыков на основе реальной активности (не только пройденных курсов)
4. Сотрудник спрашивает тьютора внутри курса или ищет знания через Natural Language Search
5. Агенты автоматически назначают следующие модули, уведомляют менеджера о прогрессе

### Технический стек

| Компонент | Технология |
|---|---|
| AI Platform | Sana Labs (AI-first, основана 2016) |
| LLM | OpenAI GPT-4, Anthropic Claude, собственные fine-tuned модели |
| Knowledge Graph | Векторная БД + граф знаний компании |
| Индексируемые источники | Slack, GitHub, Salesforce, SharePoint, Notion, Jira, Confluence |
| RAG | Продвинутые RAG-пайплайны, data labeling |
| Workflow | Drag-and-drop agent builder (MCP-совместимый) |
| Интеграция | HRIS коннекторы, SSO, SCIM, Open API |
| Безопасность | Workday security layer над Sana |

---

## 4. Cornerstone Workforce AI (Galaxy)

**Сайт:** https://www.cornerstoneondemand.com  
**Тип:** AI-native Workforce Agility Platform  
**Анонс:** Cornerstone Workforce AI™ запущен **20 мая 2026**  
**Аудитория:** Enterprise, 45+ млн пользователей за 20 лет, крупные корпорации и государственные структуры  
**Клиент-кейс:** SNCF (французские ж/д) — 20 000+ сотрудников с чёткими карьерными треками

### Что умеет

- Полный цикл T&D: обучение → навыки → планирование карьеры → succession
- Skills-based talent marketplace
- Workforce Intelligence (аналитика готовности)
- Compliance training
- Performance management

### AI-движок: Cornerstone Galaxy AI + People Graph + Skills Engine

**Архитектура:**

```
[Employee/Manager Interface]  — Web, Mobile, портал
         ↓
[Agent Orchestration]         — Cornerstone Galaxy AI (AI-native, agentic-first)
         ↓
[People Graph™]               — Динамический граф: реальные сигналы работы,
                                системы коллаборации, системы учёта
         ↓
[Skills Engine]               — 55 000+ навыков, 35 языков, 1B+ профилей
         ↓
[SkyHive Intelligence]        — 40+ TB/день внешних данных рынка труда,
                                250M ролей, обновление модели ежедневно
         ↓
[LLM + Inference Layer]       — Собственные модели + внешние LLM
```

**Cornerstone People Graph™:**
- Непрерывно получает сигналы из систем: где работает сотрудник, как коллаборирует
- Не зависит от self-reported данных — данные выводятся из реальной активности
- Обновляется в реальном времени

**Cornerstone Skills Architect:**
- Автоматически строит и поддерживает архитектуру должностей (job architecture)
- Выводит компетенции сотрудника из реальных рабочих сигналов и истории обучения
- Строит gap map на уровне: сотрудник → команда → организация

**AI-агенты (Galaxy AI, апрель 2025):**
- Персонализированные рекомендации курсов
- Генерация job content metadata
- Автокурирование learning collections для закрытия skill gap
- Workforce planning агент

**Как сотрудник взаимодействует:**
1. Открывает портал Galaxy
2. Skills Engine автоматически формирует/обновляет профиль навыков (на основе активности, не анкет)
3. Сотрудник видит gap: "Тебе не хватает этих 3 навыков до роли Senior Engineer"
4. AI рекомендует конкретные курсы + внутренние проекты + менторов
5. Менеджер в своём дашборде видит карту готовности всей команды

### Технический стек

| Компонент | Технология |
|---|---|
| AI Platform | Cornerstone Galaxy AI (proprietary, AI-native) |
| Skills Data | SkyHive by Cornerstone (40+ TB/день рынок труда) |
| People Graph | Real-time graph DB (сигналы из всех систем) |
| Skills Taxonomy | 55 000+ навыков, 35 языков |
| Data Scale | 45M пользователей, 1B+ профилей, 20 лет данных |
| Интеграция | Workday, SAP, LinkedIn Learning, Skillsoft + open API |
| Протоколы | Agent-to-agent, graph-to-graph interoperability |

---

## 5. Degreed + Maestro

**Сайт:** https://degreed.com  
**Тип:** LXP (Learning Experience Platform), skills-first подход  
**Основана:** 2012, Pleasanton, California  
**Позиция:** Упор на неформальное обучение и skills intelligence, а не на курсы  
**Награда:** Degreed Maestro — HR Tech Product of the Year (2025)

### Что умеет

- Skills-based learning paths
- Агрегация любого контента (курсы, YouTube, подкасты, статьи, книги — всё попадает в профиль навыков)
- Skill gap analysis vs. целевая роль
- AI-коучинг и ролевые игры
- MCP Server для интеграции с любой AI-системой

### AI-движок: Degreed Maestro

**Maestro** — AI-агент, специально построенный для обучения (не general-purpose).

**Сценарий онбординга (реальный кейс — Acme Inc.):**
1. Сотрудник Mark присоединяется как Sales Director
2. Дegreed определяет навыки из предыдущих ролей — автоматически наполняет профиль
3. Mark открывает Maestro: "Какие 5 навыков критичны для Sales Director?"
4. Maestro отвечает, сверяясь с определениями навыков для роли, которые L&D-команда заранее настроила
5. Mark признаёт слабость в Strategic Planning → Maestro создаёт персонализированный план
6. Maestro инициирует skill assessment (адаптивные вопросы, не тест "галочки")
7. По результатам — рекомендации курсов с объяснением, почему именно они

**Ключевые AI-фичи:**
- **Adaptive Role-play** — имитация реальных рабочих ситуаций для отработки навыков
- **Real-time Skill Feedback** — обратная связь в процессе, не после
- **AI Content Generation** — автогенерация курсов под конкретные цели организации
- **MCP Server** — корпоративный фреймворк, который доставляет контекст (навыки, роль, обучение) в любую AI-систему реального времени
- **Label Harmonization** — нормализация названий навыков между разными системами

**Как сотрудник взаимодействует:**
- Conversational AI внутри платформы
- Любой учебный материал из любого источника засчитывается в профиль навыков
- Skill Review Coach — интерактивная оценка через диалог, не тест
- Геймификация: newsfeed, gamification mechanics

### Технический стек

| Компонент | Технология |
|---|---|
| AI Agent | Degreed Maestro (purpose-built для обучения) |
| Skill Intelligence | Проприетарный skills graph |
| Интеграция | HRIS, LMS, talent systems; MCP Server для любых AI-систем |
| Контент | Любые форматы: курсы, видео, подкасты, статьи, книги |
| Skill Taxonomy | Кастомизируемая + встроенная база |
| API | REST API, LTI 1.3 |

---

## 6. Docebo + Harmony

**Сайт:** https://www.docebo.com  
**Тип:** Enterprise LMS с AI-агентами  
**Аудитория:** 3 800+ компаний  
**Анонс Harmony:** Docebo Inspire 2025 (апрель 2025)

### Что умеет

- Полноценный Enterprise LMS (курсы, программы, curricula)
- AI Neural Search
- AI Video Presenter (текст → видео с аватаром)
- Agentic L&D marketplace
- Автоматизация instructional design

### AI-движок: Harmony (agentic marketplace)

**Harmony** — маркетплейс AI-агентов для L&D, "соединительная ткань" корпоративного обучения.

**Архитектура:**

```
[L&D Team Interface]     — Docebo Admin UI
         ↓
[Harmony Agents]         — Специализированные агенты:
                           • Content Curator Agent
                           • Assessment Generator Agent
                           • Admin Workflow Agent
                           • Compliance Agent
         ↓
[Neural Search Engine]   — LLM + векторный поиск по неструктурированным знаниям
         ↓
[Integration Layer]      — Сторонние LMS, HRIS, authoring tools, skills systems
         ↓
[Content & Data Layer]   — Курсы, документы, внутренние знания
```

**Ключевые фичи:**
- **Harmony Agents** автоматизируют: instructional design, назначение курсов, compliance checks, создание оценок
- **AI Neural Search** — conversational запросы к любому контенту; извлечение неструктурированных знаний → AI-generated learning paths
- **AI Video Presenter** — из текстового скрипта генерируется видео с аватаром-ведущим (без камер)
- **Deep Search** — умная организация контента, поиск по смыслу, не ключевым словам
- Harmony работает не только с Docebo — интегрируется со **сторонними LMS и HRIS**

**Кейс MidFirst Bank:**
- Сэкономлены тысячи долларов на административных расходах за счёт AI-автоматизации

**Как сотрудник взаимодействует:**
1. Заходит в портал или Microsoft Teams
2. Задаёт Natural Language запрос: "Как настроить двухфакторную аутентификацию для VPN?"
3. Neural Search находит ответ в неструктурированных внутренних документах
4. Возвращает: конкретный ответ + ссылки на курсы + AI-generated путь для углублённого изучения
5. Агент фиксирует взаимодействие в профиле навыков

### Технический стек

| Компонент | Технология |
|---|---|
| AI Framework | Agentic (Harmony) + generative AI |
| Search | AI Neural Search Engine (LLM + векторный поиск) |
| Video | AI Video Presenter (text-to-avatar-video) |
| Интеграция | Сторонние LMS, HRIS, authoring tools, skills systems |
| Контент | SCORM, xAPI, AICC, собственный формат |

---

## 7. Microsoft Viva Suite

**Сайт:** https://www.microsoft.com/en-us/microsoft-viva  
**Тип:** Integrated Employee Experience Platform (EXP), встроен в Microsoft 365 / Teams  
**Уникальная позиция:** Единственная платформа, которая работает **внутри Teams** — сотрудник не переключается  
**Цена:** Viva Suite от ~$12/пользователь/месяц; Copilot требует M365 Copilot ($30/пользователь/месяц)

### Модули Viva (все в Teams)

| Модуль | Функция |
|---|---|
| **Viva Learning** | Агрегация LMS-контента из всех подключённых систем |
| **Viva Skills** | Профиль компетенций на основе активности в Office 365 |
| **Viva Engage** | Корпоративная соцсеть, сообщества практики |
| **Viva Connections** | Корпоративный портал/интранет внутри Teams |
| **Viva Insights** | Аналитика продуктивности и wellbeing |
| **Viva Glint** | Опросы вовлечённости, voice of employee |
| **Viva Amplify** | Управление внутренними коммуникациями |
| **Viva Goals** | OKR-управление |

### AI-движок: Copilot в Viva

**Архитектура:**

```
[Employee in Teams]         — Единая точка входа (не отдельный URL)
         ↓
[Copilot в Viva]            — GPT-4 + M365 контекст пользователя
         ↓
[Microsoft Graph]           — Email, Calendar, Teams, SharePoint, Office docs,
                              Teams-коллаборация → динамический граф активности
         ↓
[Connected LMS Systems]     — SAP SuccessFactors, Cornerstone, LinkedIn Learning,
                              Coursera, Skillsoft, внутренние SharePoint-ресурсы
         ↓
[Azure OpenAI Service]      — GPT-4 Turbo, fine-tuned корпоративные модели
```

**Copilot-фичи по модулям:**
- **Viva Learning + Copilot:** генерирует персонализированные learning paths на основе целей и skill gaps; резюмирует содержимое курсов; отвечает на вопросы по контенту курса
- **Viva Insights + Copilot:** natural language запросы к оргналитике ("Какие команды имеют наибольшую нагрузку встречами этот месяц?")
- **Viva Engage + Copilot:** резюмирует длинные треды, предлагает темы для постов
- **Viva Connections + Copilot:** релевантные новости на основе роли и предыдущих взаимодействий

**Viva Skills — как работает:**
- Анализирует активность в Office 365: какие документы открываешь, что пишешь в Teams, какие темы обсуждаешь
- Формирует **пассивный** профиль навыков (не требует ручного заполнения)
- Менеджер видит карту компетенций команды без опросов

**Как сотрудник взаимодействует:**
1. Работает в Teams как обычно
2. Получает контекстуальные рекомендации обучения прямо во время звонка/работы с документом
3. Viva Learning появляется как вкладка в Teams — все курсы из всех подключённых LMS в одном месте
4. Copilot в чате Teams отвечает на вопросы по обучению, помогает найти эксперта

### Технический стек

| Компонент | Технология |
|---|---|
| Platform | Microsoft 365 / Teams |
| AI | Azure OpenAI (GPT-4), Microsoft Copilot |
| Knowledge | Microsoft Graph (граф активности всей организации) |
| Storage | SharePoint, OneDrive |
| Auth | Azure AD (SSO, MFA, RBAC) |
| Интеграция LMS | SAP SuccessFactors, Cornerstone, LinkedIn Learning, Coursera, Skillsoft + API |
| Compliance | GDPR, ISO 27001, SOC 2 |

---

## 8. Oracle Fusion Cloud HCM + AI Agents

**Сайт:** https://www.oracle.com/human-capital-management/  
**Тип:** Enterprise ERP/HCM с AI-агентами  
**Анонс:** Oracle AI Agent Studio + 50+ агентов в Fusion HCM (2025)  
**Аудитория:** Крупнейшие корпорации, конкурент SAP в enterprise сегменте

### Что умеет

- Полный HR-цикл: hire to retire
- Learning Tutor Agent
- Job Discovery Agent
- Career Coach
- Performance Management + AI
- Succession Planning

### AI-движок: Oracle AI Agent Studio

**Oracle AI Agent Studio** (2025) — платформа для создания кастомных агентов внутри Fusion Applications.

**Архитектура:**

```
[Employee/Manager/HR Interface]  — Fusion HCM UI + Activity Centers
         ↓
[Agent Orchestration Layer]      — AI Agent Studio (prebuilt + custom agents)
         ↓
[Oracle AI Infrastructure]       — Oracle Cloud Infrastructure (OCI)
                                   Собственный AI-стек (не зависит от OpenAI/Azure)
         ↓
[Fusion Data Layer]              — Нативные данные HCM: профили, KPI, история,
                                   skills intelligence
```

**Конкретные агенты (сентябрь 2025):**

| Агент | Функция |
|---|---|
| **Job Discovery Agent** | Матчинг сотрудника с открытыми вакансиями по опыту и интересам + инсайты о соответствии роли |
| **Learning Tutor Agent** | Персонализированное обучение и коучинг |
| **Career Coach** | Анализ кандидата → гиперперсонализированные рекомендации вакансий, 24/7 |
| **Manager Concierge Agent** | Централизованные задачи, данные и действия для менеджеров |
| **Talent Advisor Agent** | Поддержка рекрутёров |
| **Payroll Run Analyst Agent** | Аномалии в начислениях |
| **Employee Concierge** | Routine HR-вопросы сотрудника |
| **Performance Goals Agent** | Постановка и отслеживание целей |

**Ключевые особенности:**
- Агенты нативно встроены в Fusion — работают внутри существующих воркфлоу
- Агенты **наследуют** data protection и identity management от Fusion Apps
- **Flexible LLM choices** — Oracle-оптимизированные модели или сторонние (гибкость)
- Включено в подписку без доп. оплаты
- **Activity Centers** — персонализированные рабочие пространства для HR-специалистов, менеджеров, рекрутёров

**Как сотрудник взаимодействует:**
1. Открывает Fusion HCM → Activity Center (персонализированный под роль)
2. Career Coach: "Хочу расти. Что мне подходит?" — агент анализирует профиль, возвращает top-5 вакансий с обоснованием
3. Learning Tutor: адаптивное обучение с проверкой понимания в диалоге
4. Job Discovery: автоматические уведомления о подходящих внутренних вакансиях

### Технический стек

| Компонент | Технология |
|---|---|
| Platform | Oracle Fusion Cloud Applications |
| AI Infrastructure | Oracle Cloud Infrastructure (OCI) — собственный стек |
| Agent Platform | Oracle AI Agent Studio (included in subscription) |
| LLM | Oracle-оптимизированные + flexible third-party |
| Data | Fusion-нативные данные, 20+ лет HR-данных |
| Безопасность | Наследуется от Fusion Apps (identity, data protection) |
| Интеграция | Fusion ERP, SCM, CX — единая экосистема |

---

## 9. Российский рынок

### Обзор

Российский рынок корпоративного обучения значительно отстаёт от мировых платформ по уровню AI-функциональности. Основные игроки предлагают классические LMS без агентной архитектуры и серьёзного personalisation engine. При этом около **половины российских компаний** планируют увеличить расходы на обучение персонала в ближайший год — рынок растёт.

### Ключевые игроки

| Платформа | Тип | AI | Сайт |
|---|---|---|---|
| **iSpring Learn** | LMS | Базовые рекомендации, аналитика | https://www.ispring.ru |
| **МояКоманда** | HR-платформа (LMS + соцсеть + HR) | Нет / минимально | https://xn--80aalwjbieb2o.xn--p1ai |
| **Digital Q.LMS** | Enterprise LMS | Есть, детали ограничены | — |
| **Skillaz** | AI-рекрутинг + онбординг | AI в рекрутинге | https://skillaz.ru |
| **Skill Cup** | Мобильное корпоративное обучение | Минимально | https://skillcup.ru |
| **TalentTech** | HR suite | Есть элементы AI | https://talenttech.ru |

### iSpring Learn (детально)

**Сайт:** https://www.ispring.ru/ispring-learn  
**Что умеет:**
- Онлайн-курсы, тесты, вебинары
- Мобильное приложение (offline)
- Оценка 360°
- Аналитика прохождений
- Интеграция с iSpring Suite (конструктор курсов)
- Структура: отделы, филиалы, учебные группы

**Ограничения:** нет AI-агентов, нет skills graph, нет карьерных треков. Это инструмент доставки контента, а не экосистема развития.

### МояКоманда (детально)

**Сайт:** https://xn--80aalwjbieb2o.xn--p1ai  
**Что умеет (LMS + HRM):**
- Обучение и онбординг
- Корпоративная соцсеть + чаты
- Канбан-доски, проектные команды
- Конструктор опросов, eNPS
- Корпоративная валюта и геймификация (рейтинги, достижения, игры)
- Маршруты согласования, бронирование переговорных
- Управление идеями

**Сильная сторона:** наиболее близкая к идее "единой корпоративной среды" среди российских решений.  
**Ограничения:** нет AI-агентов, нет skill gap analysis, нет персонализации на уровне мировых платформ.

### Вывод по RU-рынку

Российские платформы закрывают задачу **доставки контента** и **базовой HR-автоматизации**, но не строят **AI-экосистему**. Это создаёт возможность для кейса Газпром Нефти — разработать продукт, который будет уровнем выше всего существующего на российском рынке.

---

## 10. Сравнительная таблица

| Критерий | SAP SuccessFactors | Workday + Sana | Cornerstone Galaxy | Degreed + Maestro | Docebo + Harmony | Microsoft Viva | Oracle HCM |
|---|---|---|---|---|---|---|---|
| **AI-агенты** | ✅ Joule (зрелый) | ✅ Sana Agents | ✅ Galaxy AI | ✅ Maestro | ✅ Harmony | ✅ Copilot | ✅ AI Agent Studio |
| **Skills Graph** | ✅ | ✅ | ✅ (55k навыков) | ✅ (skills-first) | ➖ | ✅ Viva Skills | ✅ |
| **Карьерные треки** | ✅ | ✅ | ✅ | ✅ | ➖ | ✅ | ✅ Career Coach |
| **Коммуникация** | ➖ (через Teams) | ➖ | ➖ | ➖ | ➖ | ✅ Engage | ➖ |
| **Встроен в мессенджер** | ➖ | ➖ | ➖ | ➖ | ➖ | ✅ Teams | ➖ |
| **On-premise / РФ** | ⚠️ SaaS only | ⚠️ SaaS only | ⚠️ SaaS only | ⚠️ SaaS only | ⚠️ SaaS only | ⚠️ SaaS only | ⚠️ SaaS only |
| **Внешние данные рынка** | ➖ | ➖ | ✅ SkyHive 40TB/день | ➖ | ➖ | ➖ | ➖ |
| **Доступность в РФ** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Аналог для кейса** | Основа для архитектуры | AI-агент платформа | Skills Engine | Learning UX | Agentic L&D | Интерфейс | Agent framework |

---

## 11. Архитектурные паттерны

Все ведущие платформы сошлись на одной архитектуре с вариациями:

```
┌─────────────────────────────────────────────────────────────────┐
│                     EMPLOYEE INTERFACE                          │
│         Web Portal  •  Mobile App  •  Messenger Bot             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   AI / AGENT LAYER                              │
│  • Персонализация обучения      • Карьерный коуч               │
│  • Рекомендации контента        • Skill gap analysis           │
│  • Автоназначение курсов        • Natural language interface   │
│  • Генерация контента           • Workflow automation         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   KNOWLEDGE / DATA LAYER                        │
│  • Skills Graph (навыки → роли → треки)                        │
│  • People Graph (реальная активность сотрудника)               │
│  • Corpus знаний (курсы + документы + переписка)               │
│  • HR-данные (KPI, 360°, грейды, история)                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   INTEGRATION LAYER                             │
│  HRIS  •  Jira  •  GitLab  •  Confluence  •  CRM  •  Email    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                  ANALYTICS / MANAGER LAYER                      │
│  • Дашборды HR            • Карта готовности команды           │
│  • Прогресс онбординга    • ROI обучения                       │
│  • Succession planning    • Workforce planning                 │
└─────────────────────────────────────────────────────────────────┘
```

### LLM-паттерны в корпоративных системах

| Паттерн | Кто использует | Суть |
|---|---|---|
| **RAG (Retrieval-Augmented Generation)** | SAP, Workday/Sana, Docebo | LLM + поиск по корпоративному контенту |
| **Skills Inference** | Cornerstone, Viva Skills | Вывод навыков из реальной активности без опросов |
| **Agentic Workflows** | Все топ-6 | Автономные агенты выполняют многоходовые задачи |
| **Personalization Engine** | Все | ML-модели на истории взаимодействий |
| **Context Injection** | SAP Joule, Sana | Обогащение промпта бизнес-контекстом перед отправкой в LLM |

---

## 12. Выводы для кейса

### Что берём из мирового опыта

1. **Skills-first, не courses-first** (Degreed, Cornerstone) — строим вокруг навыков, а не каталога курсов. Все рекомендации привязаны к skill gap vs. целевая роль.

2. **People Graph из реальной активности** (Cornerstone, Viva Skills) — профиль навыков строится автономно из Jira, GitLab, Confluence, почты — не из опросов. Это главная "магия".

3. **AI-агенты, не просто поиск** (Docebo Harmony, SAP Joule, Oracle Agent Studio) — агент не просто рекомендует, он **действует**: назначает курсы, напоминает, обновляет профили, уведомляет менеджеров.

4. **Единая точка входа** (Microsoft Viva) — сотрудник не переходит в "ещё один портал". Обучение встроено в инструменты, которые он уже использует.

5. **RAG поверх корпоративных знаний** (Sana, Docebo Neural Search) — внутренние документы, wiki, регламенты становятся частью AI-ответов.

6. **Дашборд для менеджера, не только для сотрудника** (все платформы) — карта готовности команды, прогресс онбординга, gap analysis на уровне отдела.

### Что критично для Газпром Нефти (отличие от мировых аналогов)

- **On-premise или частное облако** — западные SaaS-решения недоступны. Нужен российский LLM (YandexGPT, GigaChat) или open-source (Llama, Qwen) с self-hosted deployment.
- **Импортозамещение стека** — PostgreSQL вместо проприетарных БД, MinIO вместо S3, Keycloak вместо Azure AD.
- **Безопасность данных** — все чувствительные HR-данные остаются на инфраструктуре Газпром Нефти.
- **Интеграция с 1С:ЗУП** — основная HR-система в российских корпорациях, нужен коннектор.

### Рекомендуемая архитектура для кейса (на базе мирового опыта)

```
Сотрудник
    → Единый портал (веб + Telegram-бот + мобильное приложение)
    → AI-агент (LLM + RAG над корпоративными знаниями)
    → Skills Engine (граф навыков, выводимый из Jira/GitLab/1С)
    → Learning Engine (персонализированные треки)
    → Manager Dashboard (карта готовности команды)
    → HR Analytics (ROI, succession, workforce planning)
```

---

*Последнее обновление: май 2026. Данные актуальны на дату составления. Рынок меняется быстро — стоит перепроверять перед финальной презентацией.*
