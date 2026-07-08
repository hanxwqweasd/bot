// Zero-dependency Telegram bot using native fetch
// Env vars (set in Railway):
//   BOT_TOKEN       - Telegram bot token
//   GAME_URL        - WebApp URL (e.g. https://t.me/StarDominionBot/StarDominion)
//   API_URL         - Next.js app API URL (e.g. https://star-dominion-web.up.railway.app)
//   ADMIN_ID        - Admin Telegram user ID

const TOKEN = process.env.BOT_TOKEN;
const GAME_URL = process.env.GAME_URL || "https://t.me/StarDominionBot/StarDominion";
const API_URL = (process.env.API_URL || "").replace(/\/+$/, "");
const ADMIN_ID = parseInt(process.env.ADMIN_ID || "0", 10);

if (!TOKEN) {
  console.error("[BOT] BOT_TOKEN not set!");
  process.exit(1);
}

if (!API_URL) {
  console.warn("[BOT] API_URL not set - payment rewards will NOT work!");
  console.warn("[BOT] Set API_URL to your Next.js app URL");
}

const TG_API = "https://api.telegram.org/bot" + TOKEN;

const WELCOME = "<b>STAR DOMINION</b>\n\nДобро пожаловать, Капитан!\nВы назначены командиром заброшенной космической станции в секторе Андромеда-7.\n\nСтройте и развивайте станцию\nИсследуйте технологии\nСоздавайте флот и побеждайте пиратов\nИсследуйте карту сектора\n\nПрисоединяйтесь к тысячам капитанов, которые уже строят свою империю среди звёзд!";

const FULL_INFO = "<b>Полная информация - Star Dominion</b>\n\n<b>Об игре:</b>\nStar Dominion - глубокая космическая стратегия и симулятор колонии.\n\n<b>Строительство:</b>\n- Стройте модули: Генераторы, Майнеры, Лаборатории, Верфи\n- Улучшайте модули для увеличения эффективности\n\n<b>Исследования:</b>\n- 4 ветки технологий: Военная, Инженерная, Биологическая, Психо-Энергетическая\n\n<b>Флот:</b>\n- Стройте корабли разных классов\n- Сражайтесь с пиратами\n\n<b>Карта сектора:</b>\n- Исследуйте узлы сектора Андромеда-7\n- Находите ресурсы и артефакты\n\n<b>Ресурсы:</b>\n- Энергия - питание станции\n- Минералы - строительные материалы\n- Биоматерия - для исследований\n- Кристаллы - премиум валюта\n\n<b>Команды:</b>\n/start - Начать игру\n/help - Справка

var KEYBOARD = {
  inline_keyboard: [
    [
      { text: "Начать Играть", web_app: { url: GAME_URL } },
      { text: "Полная информация", callback_data: "show_info" }
    ]
  ]
};

var ADMIN_KEYBOARD = {
  inline_keyboard: [
    [{ text: "Открыть Админ-панель", web_app: { url: GAME_URL, start_parameter: "admin" } }]
  ]
};

var offset = 0;

async function tgApi(method, body) {
  if (!body) body = {};
  var res = await fetch(TG_API + "/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function sendMessage(chatId, text, keyboard) {
  var result = await tgApi("sendMessage", {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    reply_markup: keyboard
  });
  if (!result.ok) {
    console.error("[BOT] sendMessage failed:", result.description);
    var plain = text.replace(/<[^>]+>/g, "");
    await tgApi("sendMessage", { chat_id: chatId, text: plain, reply_markup: keyboard });
  }
}

async function answerCallback(callbackQueryId) {
  await tgApi("answerCallbackQuery", { callback_query_id: callbackQueryId });
}

async function handlePayment(msg) {
  var p = msg.successful_payment;
  var userId = msg.from.id;
  var payload = p.invoice_payload || "";
  console.log("[BOT] Payment SUCCESS: user=" + userId + " payload=" + payload + " amount=" + p.total_amount);

  var parts = payload.split(":");
  var itemId = parts[0];
  var tgUserId = parts[1] || String(userId);

  if (!itemId || !tgUserId) {
    sendMessage(msg.chat.id, "Оплата получена, но не удалось определить пакет. Напишите в поддержку.");
    return;
  }

  if (!API_URL) {
    sendMessage(msg.chat.id, "Оплата получена! Сумма: " + p.total_amount + " Stars. Пакет: " + itemId + ". Откройте игру - награда будет начислена автоматически.");
    return;
  }

  try {
    var claimUrl = API_URL + "/api/stars/claim";
    console.log("[BOT] Calling claim API: " + claimUrl);
    var claimRes = await fetch(claimUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: itemId, telegramUserId: tgUserId })
    });
    var claimData = await claimRes.json();
    console.log("[BOT] Claim result:", JSON.stringify(claimData));

    if (claimData.success) {
      sendMessage(msg.chat.id, "Оплата прошла успешно!\n\n" + claimData.message + "\n\nОткройте мини-апп и нажмите Проверить оплату, чтобы увидеть обновлённые ресурсы!");
    } else {
      console.error("[BOT] Claim failed:", claimData.error);
      sendMessage(msg.chat.id, "Оплата получена! Сумма: " + p.total_amount + " Stars.\n\nНачисление награды временно задерживается. Напишите в поддержку, если ресурсы не появятся.");
    }
  } catch (claimErr) {
    console.error("[BOT] Claim error:", claimErr ? claimErr.message : claimErr);
    sendMessage(msg.chat.id, "Оплата получена! Сумма: " + p.total_amount + " Stars.\n\nОткройте игру - награда будет начислена при следующем входе.");
  }
}

async function handleUpdate(update) {
  var msg = update.message;
  var cbq = update.callback_query;

  if (msg && msg.text) {
    var chatId = msg.chat.id;
    var text = msg.text;

    if (text === "/start" || text === "/start StarDominion") {
      sendMessage(chatId, WELCOME, KEYBOARD);
    } else if (text === "/help") {
      sendMessage(chatId, FULL_INFO, KEYBOARD);
    } else if (text === "/admin") {
      var userId = msg.from ? msg.from.id : 0;
      if (ADMIN_ID && userId === ADMIN_ID) {
        sendMessage(chatId, "Админ-панель\nНажмите кнопку ниже:", ADMIN_KEYBOARD);
      } else {
        console.log("[BOT] /admin denied for user " + userId);
        sendMessage(chatId, "У вас нет доступа к этой команде.");
      }
    } else {
      sendMessage(chatId, "Чтобы начать играть, нажмите кнопку ниже:", KEYBOARD);
    }
  }

  if (cbq && cbq.data === "show_info") {
    var chatId = cbq.message ? cbq.message.chat.id : null;
    if (chatId) {
      answerCallback(cbq.id);
      sendMessage(chatId, FULL_INFO, KEYBOARD);
    }
  }

  if (update.pre_checkout_query) {
    var q = update.pre_checkout_query;
    console.log("[BOT] Pre-checkout: user=" + q.from.id + " payload=" + q.invoice_payload + " amount=" + q.total_amount);
    tgApi("answerPreCheckoutQuery", { pre_checkout_query_id: q.id, ok: true });
  }

  if (msg && msg.successful_payment) {
    await handlePayment(msg);
  }
}

async function poll() {
  while (true) {
    try {
      var result = await tgApi("getUpdates", { offset: offset, timeout: 30 });
      if (result.ok && result.result && result.result.length > 0) {
        for (var i = 0; i < result.result.length; i++) {
          await handleUpdate(result.result[i]);
          offset = result.result[i].update_id + 1;
        }
      }
    } catch (err) {
      console.error("[BOT] Poll error:", err ? err.message : err);
      await new Promise(function(r) { setTimeout(r, 5000); });
    }
  }
}

console.log("[BOT] Star Dominion Bot starting...");
console.log("[BOT] Token: " + TOKEN.substring(0, 10) + "...");
console.log("[BOT] Game URL: " + GAME_URL);
console.log("[BOT] API URL: " + (API_URL || "(NOT SET)"));
console.log("[BOT] Admin ID: " + (ADMIN_ID || "not set"));

poll().catch(function(err) {
  console.error("[BOT] Fatal poll error:", err);
  process.exit(1);
});
