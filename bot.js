// Zero-dependency Telegram bot using native fetch
// Env vars (set in Railway):
//   BOT_TOKEN       — Telegram bot token
//   GAME_URL        — WebApp URL (e.g. https://t.me/StarDominionBot/StarDominion)
//   API_URL         — Next.js app API URL (e.g. https://star-dominion-web.up.railway.app)
//   ADMIN_ID        — Admin Telegram user ID

const TOKEN = process.env.BOT_TOKEN;
const GAME_URL = process.env.GAME_URL || "https://t.me/StarDominionBot/StarDominion";
const API_URL = (process.env.API_URL || "").replace(/\/+$/, "");  // REQUIRED for payment processing
const ADMIN_ID = parseInt(process.env.ADMIN_ID || "0", 10);

if (!TOKEN) {
  console.error("[BOT] BOT_TOKEN not set!");
  process.exit(1);
}

if (!API_URL) {
  console.warn("[BOT] API_URL not set — payment reward granting will NOT work!");
  console.warn("[BOT] Set API_URL to your Next.js app URL (e.g. https://your-app.up.railway.app)");
}

const TG_API = `https://api.telegram.org/bot${TOKEN}`;

const WELCOME = `<b>🚀 STAR DOMINION</b>

Добро пожаловать, Капитан!
Вы назначены командиром заброшенной космической станции в секторе Андромеда-7.

🏰 Стройте и развивайте станцию
⚗️ Исследуйте технологии
🚀 Создавайте флот и побеждайте пиратов
🗺️ Исследуйте карту сектора

Присоединяйтесь к тысячам капитанов, которые уже строят свою империю среди звёзд!`;

const FULL_INFO = `<b>📖 Полная информация — Star Dominion</b>

<b>🎮 Об игре:</b>
Star Dominion — это глубокая космическая стратегия и симулятор колонии. Управляйте космической станцией в загадочном секторе Андромеда-7.

<b>🏗️ Строительство:</b>
• Стройте модули: Генераторы, Майнеры, Лаборатории, Верфи и другие
• Улучшайте модули для увеличения эффективности
• Управляйте комнатами станции

<b>🔬 Исследования:</b>
• 4 ветки технологий: Военная, Инженерная, Биологическая, Психо-Энергетическая
• Открывайте новые модули и возможности

<b>🚀 Флот:</b>
• Стройте корабли разных классов
• Создавайте эскадры
• Сражайтесь с пиратами и другими игроками

<b>🗺️ Карта сектора:</b>
• Исследуйте узлы сектора Андромеда-7
• Находите ресурсы и артефакты

<b>💰 Ресурсы:</b>
• ⚡ Энергия — питание станции
• 🪨 Минералы — строительные материалы
• 🧪 Биоматерия — для исследований
• 💎 Кристаллы — премиум валюта

<b>🏆 Профиль и Рейтинг:</b>
• Отслеживайте свои достижения
• Соревнуйтесь с другими капитанами

<b>👥 Реферальная система:</b>
• Приглашайте друзей и получайте бонусы

<b>❓ Команды:</b>
/start — Начать игру
/help — Справка

Играйте прямо в Telegram!`;

const KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🚀 Начать Играть", web_app: { url: GAME_URL } },
      { text: "📖 Полная информация", callback_data: "show_info" },
    ],
  ],
};

const ADMIN_KEYBOARD = {
  inline_keyboard: [
    [{ text: "⚙️ Открыть Админ-панель", web_app: { url:
