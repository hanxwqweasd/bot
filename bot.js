const TOKEN = "TOKEN";
const GAME_URL = "https://t.me/StarDominionBot/StarDominion";
const API = `https://api.telegram.org/bot${TOKEN}`;

const WELCOME = `🚀 *STAR DOMINION*

Добро пожаловать, Капитан\\!
Вы назначены командиром заброшенной космической станции в секторе Андромеда\\-7\\.

🏰 Стройте и развивайте станцию
⚗️ Исследуйте технологии
🚀 Создавайте флот и побеждайте пиратов
🗺️ Исследуйте карту сектора`;

const FULL_INFO = `📖 *Полная информация — Star Dominion*

🎮 *Об игре:*
Star Dominion — это глубокая космическая стратегия и симулятор колонии\\. Управляйте космической станцией в загадочном секторе Андромеда\\-7\\.

🏗️ *Строительство:*
• Стройте модули: Генераторы, Майнеры, Лаборатории, Верфи
• Улучшайте модули для увеличения эффективности
• Управляйте комнатами станции

🔬 *Исследования:*
• 4 ветки технологий: Военная, Инженерная, Биологическая, Психо\\-Энергетическая
• Открывайте новые модули и возможности

🚀 *Флот:*
• Стройте корабли разных классов
• Создавайте эскадры
• Сражайтесь с пиратами и другими игроками

🗺️ *Карта сектора:*
• Исследуйте узлы сектора Андромеда\\-7
• Находите ресурсы и артефакты

💰 *Ресурсы:*
• ⚡ Энергия — питание станции
• 🪨 Минералы — строительные материалы
• 🧪 Биоматерия — для исследований
• 💎 Кристаллы — премиум валюта

🏆 *Профиль и Рейтинг:*
• Отслеживайте свои достижения
• Соревнуйтесь с другими капитанами

👥 *Реферальная система:*
• Приглашайте друзей и получайте бонусы

❓ *Команды:*
/start — Начать игру
/help — Справка

Играйте прямо в Telegram\\!`;

const KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🚀 Начать Играть", web_app: { url: GAME_URL } },
      { text: "📖 Полная информация", callback_data: "show_info" },
    ],
  ],
};

let offset = 0;

async function tgApi(method, body = {}) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendMd(chatId, text, kb) {
  try {
    await tgApi("sendMessage", { chat_id: chatId, text, parse_mode: "MarkdownV2", reply_markup: kb });
  } catch {
    const plain = text.replace(/[*_~`\\()!#\[\]{}|+.]/g, "");
    await tgApi("sendMessage", { chat_id: chatId, text: plain, reply_markup: kb });
  }
}

function handleUpdate(u) {
  const msg = u.message;
  const cbq = u.callback_query;

  if (msg?.text) {
    const cid = msg.chat.id;
    if (msg.text === "/start" || msg.text.startsWith("/start ")) {
      sendMd(cid, WELCOME, KEYBOARD);
    } else if (msg.text === "/help") {
      sendMd(cid, FULL_INFO, KEYBOARD);
    } else {
      sendMd(cid, "🎮 Чтобы начать играть, нажмите кнопку ниже:", KEYBOARD);
    }
  }

  if (cbq?.data === "show_info" && cbq.message?.chat?.id) {
    tgApi("answerCallbackQuery", { callback_query_id: cbq.id });
    sendMd(cbq.message.chat.id, FULL_INFO, KEYBOARD);
  }

  if (u.pre_checkout_query) {
    tgApi("answerPreCheckoutQuery", { pre_checkout_query_id: u.pre_checkout_query.id, ok: true });
  }

  if (msg?.successful_payment) {
    sendMd(msg.chat.id, "✅ *Оплата прошла успешно\\!\n\nСпасибо, Капитан\\! Увидимся в секторе Андромеда\\-7\\! ⭐");
  }
}

async function poll() {
  while (true) {
    try {
      const r = await tgApi("getUpdates", { offset, timeout: 30 });
      if (r.ok && r.result?.length) {
        for (const u of r.result) { handleUpdate(u); offset = u.update_id + 1; }
      }
    } catch (e) {
      console.error("[POLL ERR]", e?.message || e);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

console.log("[BOT] Star Dominion Bot starting...");
poll().catch(e => { console.error("[FATAL]", e); process.exit(1); });
