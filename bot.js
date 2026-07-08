// Zero-dependency Telegram bot using native fetch
// Token, Game URL, Admin ID — через Variables в Railway

const TOKEN = process.env.BOT_TOKEN;
const GAME_URL = process.env.GAME_URL || "https://t.me/StarDominionBot/StarDominion";
const ADMIN_ID = parseInt(process.env.ADMIN_ID || "0", 10);

if (!TOKEN) {
  console.error("[BOT] BOT_TOKEN not set!");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

const WELCOME = `<b>🚀 STAR DOMINION</b>

Добро пожаловать, Капитан!
Вы назначены командиром заброшенной космической станции в секторе Андромеда-7.

🏰 Стройте и развивайте станцию
⚗️ Исследуйте технологии
🚀 Создавайте флот и побеждайте пиратов
🗺️ Исследуйте карту сектора`;

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
• 🧪 Данные — для исследований
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
    [{ text: "⚙️ Открыть Админ-панель", web_app: { url: GAME_URL, start_parameter: "admin" } }],
  ],
};

let offset = 0;

async function api(method, body = {}) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendMessage(chatId, text, keyboard) {
  const result = await api("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: keyboard,
  });

  if (!result.ok) {
    console.error("[BOT] sendMessage failed:", result.description);
    const plain = text.replace(/<[^>]+>/g, "");
    await api("sendMessage", { chat_id: chatId, text: plain, reply_markup: keyboard });
  }
}

async function answerCallback(callbackQueryId) {
  await api("answerCallbackQuery", { callback_query_id: callbackQueryId });
}

function handleUpdate(update) {
  const msg = update.message;
  const cbq = update.callback_query;

  if (msg && msg.text) {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start" || text === "/start StarDominion") {
      sendMessage(chatId, WELCOME, KEYBOARD);
    } else if (text === "/help") {
      sendMessage(chatId, FULL_INFO, KEYBOARD);
    } else if (text === "/admin") {
      const userId = msg.from?.id;
      if (ADMIN_ID && userId === ADMIN_ID) {
        sendMessage(chatId, "<b>⚙️ Админ-панель</b>\nНажмите кнопку ниже, чтобы открыть панель управления https://https://f1prd5jqe321-d.space-z.ai/?admin=true:", ADMIN_KEYBOARD);
      } else {
        console.log(`[BOT] /admin denied for user ${userId}`);
        sendMessage(chatId, "🚫 У вас нет доступа к этой команде.");
      }
    } else {
      sendMessage(chatId, "🎮 Чтобы начать играть, нажмите кнопку ниже:", KEYBOARD);
    }
  }

  if (cbq && cbq.data === "show_info") {
    const chatId = cbq.message?.chat?.id;
    if (chatId) {
      answerCallback(cbq.id);
      sendMessage(chatId, FULL_INFO, KEYBOARD);
    }
  }

  // Handle pre_checkout_query
  if (update.pre_checkout_query) {
    const q = update.pre_checkout_query;
    console.log(`[BOT] Pre-checkout: user=${q.from.id} payload=${q.invoice_payload} amount=${q.total_amount}`);
    api("answerPreCheckoutQuery", { pre_checkout_query_id: q.id, ok: true });
  }

  // Handle successful_payment
  if (msg?.successful_payment) {
    const p = msg.successful_payment;
    console.log(`[BOT] Payment: user=${msg.from.id} payload=${p.invoice_payload} amount=${p.total_amount}`);
    sendMessage(msg.chat.id,
      `<b>✅ Оплата прошла успешно!</b>\n\nСпасибо за покупку, Капитан!\n\nStar Dominion продолжает развиваться благодаря вашей поддержке. Скоро увидимся в секторе Андромеда-7! ⭐`
    );
  }
}

async function poll() {
  while (true) {
    try {
      const result = await api("getUpdates", { offset, timeout: 30 });
      if (result.ok && result.result?.length > 0) {
        for (const update of result.result) {
          handleUpdate(update);
          offset = update.update_id + 1;
        }
      }
    } catch (err) {
      console.error("[BOT] Poll error:", err?.message || err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

console.log("[BOT] Star Dominion Bot starting...");
console.log(`[BOT] Token: ${TOKEN.substring(0, 10)}...`);
console.log(`[BOT] Game URL: ${GAME_URL}`);
console.log(`[BOT] Admin ID: ${ADMIN_ID || "not set"}`);
poll().catch((err) => {
  console.error("[BOT] Fatal poll error:", err);
  process.exit(1);
});
