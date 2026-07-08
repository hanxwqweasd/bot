var TOKEN = process.env.BOT_TOKEN;
var GAME_URL = process.env.GAME_URL || "https://t.me/StarDominionBot/StarDominion";
var API_URL = (process.env.API_URL || "").replace(/\/+$/, "");
var ADMIN_ID = parseInt(process.env.ADMIN_ID || "0", 10);
if (!TOKEN) { console.error("[BOT] BOT_TOKEN not set!"); process.exit(1); }
if (!API_URL) { console.warn("[BOT] API_URL not set - payments wont work!"); }
var TG = "https://api.telegram.org/bot" + TOKEN;
var WELCOME = [
  "<b>STAR DOMINION</b>",
  "",
  "\u0414\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c, \u041a\u0430\u043f\u0438\u0442\u0430\u043d!",
  "\u0412\u044b \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u044b \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u043c \u0437\u0430\u0431\u0440\u043e\u0448\u0435\u043d\u043d\u043e\u0439 \u043a\u043e\u0441\u043c\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u0441\u0442\u0430\u043d\u0446\u0438\u0438 \u0432 \u0441\u0435\u043a\u0442\u043e\u0440\u0435 \u0410\u043d\u0434\u0440\u043e\u043c\u0435\u0434\u0430-7.",
  "",
  "\u0421\u0442\u0440\u043e\u0439\u0442\u0435 \u0438 \u0440\u0430\u0437\u0432\u0438\u0432\u0430\u0439\u0442\u0435 \u0441\u0442\u0430\u043d\u0446\u0438\u044e",
  "\u0418\u0441\u0441\u043b\u0435\u0434\u0443\u0439\u0442\u0435 \u0442\u0435\u0445\u043d\u043e\u043b\u043e\u0433\u0438\u0438",
  "\u0421\u043e\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u0444\u043b\u043e\u0442 \u0438 \u043f\u043e\u0431\u0435\u0436\u0434\u0430\u0439\u0442\u0435 \u043f\u0438\u0440\u0430\u0442\u043e\u0432",
  "\u0418\u0441\u0441\u043b\u0435\u0434\u0443\u0439\u0442\u0435 \u043a\u0430\u0440\u0442\u0443 \u0441\u0435\u043a\u0442\u043e\u0440\u0430"
].join("\n");
var INFO = [
  "<b>\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f - Star Dominion</b>",
  "",
  "<b>\u041e\u0431 \u0438\u0433\u0440\u0435:</b> Star Dominion - \u043a\u043e\u0441\u043c\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u044f \u0438 \u0441\u0438\u043c\u0443\u043b\u044f\u0442\u043e\u0440 \u043a\u043e\u043b\u043e\u043d\u0438\u0438.",
  "",
  "<b>\u0421\u0442\u0440\u043e\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e:</b>",
  "- \u0421\u0442\u0440\u043e\u0439\u0442\u0435 \u043c\u043e\u0434\u0443\u043b\u0438: \u0413\u0435\u043d\u0435\u0440\u0430\u0442\u043e\u0440\u044b, \u041c\u0430\u0439\u043d\u0435\u0440\u044b, \u041b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u0438\u0438, \u0412\u0435\u0440\u0444\u0438",
  "- \u0423\u043b\u0443\u0447\u0448\u0430\u0439\u0442\u0435 \u043c\u043e\u0434\u0443\u043b\u0438 \u0434\u043b\u044f \u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438",
  "",
  "<b>\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f:</b>",
  "- 4 \u0432\u0435\u0442\u043a\u0438: \u0412\u043e\u0435\u043d\u043d\u0430\u044f, \u0418\u043d\u0436\u0435\u043d\u0435\u0440\u043d\u0430\u044f, \u0411\u0438\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u0430\u044f, \u041f\u0441\u0438\u0445\u043e-\u042d\u043d\u0435\u0440\u0433\u0435\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f",
  "",
  "<b>\u0424\u043b\u043e\u0442:</b>",
  "- \u0421\u0442\u0440\u043e\u0439\u0442\u0435 \u043a\u043e\u0440\u0430\u0431\u043b\u0438 \u0440\u0430\u0437\u043d\u044b\u0445 \u043a\u043b\u0430\u0441\u0441\u043e\u0432",
  "- \u0421\u0440\u0430\u0436\u0430\u0439\u0442\u0435\u0441\u044c \u0441 \u043f\u0438\u0440\u0430\u0442\u0430\u043c\u0438",
  "",
  "<b>\u041a\u0430\u0440\u0442\u0430 \u0441\u0435\u043a\u0442\u043e\u0440\u0430:</b>",
  "- \u0418\u0441\u0441\u043b\u0435\u0434\u0443\u0439\u0442\u0435 \u0443\u0437\u043b\u044b \u0410\u043d\u0434\u0440\u043e\u043c\u0435\u0434\u0430-7",
  "- \u041d\u0430\u0445\u043e\u0434\u0438\u0442\u0435 \u0440\u0435\u0441\u0443\u0440\u0441\u044b \u0438 \u0430\u0440\u0442\u0435\u0444\u0430\u043a\u0442\u044b",
  "",
  "<b>\u0420\u0435\u0441\u0443\u0440\u0441\u044b:</b>",
  "- \u042d\u043d\u0435\u0440\u0433\u0438\u044f - \u043f\u0438\u0442\u0430\u043d\u0438\u0435 \u0441\u0442\u0430\u043d\u0446\u0438\u0438",
  "- \u041c\u0438\u043d\u0435\u0440\u0430\u043b\u044b - \u0441\u0442\u0440\u043e\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0435 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b",
  "- \u0411\u0438\u043e\u043c\u0430\u0442\u0435\u0440\u0438\u044f - \u0434\u043b\u044f \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0439",
  "- \u041a\u0440\u0438\u0441\u0442\u0430\u043b\u043b\u044b - \u043f\u0440\u0435\u043c\u0438\u0443\u043c \u0432\u0430\u043b\u044e\u0442\u0430",
  "",
  "<b>\u041a\u043e\u043c\u0430\u043d\u0434\u044b:</b>",
  "/start - \u041d\u0430\u0447\u0430\u0442\u044c \u0438\u0433\u0440\u0443",
  "/help - \u0421\u043f\u0440\u0430\u0432\u043a\u0430"
].join("\n");
var KB = {
  inline_keyboard: [[
    { text: "\u041d\u0430\u0447\u0430\u0442\u044c \u0418\u0433\u0440\u0430\u0442\u044c", web_app: { url: GAME_URL } },
    { text: "\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f", callback_data: "show_info" }
  ]]
};
var ADMIN_KB = {
  inline_keyboard: [[
    { text: "\u0410\u0434\u043c\u0438\u043d-\u043f\u0430\u043d\u0435\u043b\u044c", web_app: { url: GAME_URL, start_parameter: "admin" } }
  ]]
};
var offset = 0;
function tgApi(method, body) {
  return fetch(TG + "/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  }).then(function(r) { return r.json(); });
}
function send(chatId, text, kb) {
  return tgApi("sendMessage", {
    chat_id: chatId, text: text, parse_mode: "HTML", reply_markup: kb
  }).then(function(res) {
    if (!res.ok) {
      var plain = text.replace(/<[^>]+>/g, "");
      return tgApi("sendMessage", { chat_id: chatId, text: plain, reply_markup: kb });
    }
  });
}
function handlePayment(msg) {
  var p = msg.successful_payment;
  var userId = msg.from.id;
  var payload = p.invoice_payload || "";
  console.log("[BOT] Payment: user=" + userId + " payload=" + payload + " amount=" + p.total_amount);
  var parts = payload.split(":");
  var itemId = parts[0];
  var tgUser = parts[1] || String(userId);
  if (!itemId || !tgUser) { send(msg.chat.id, "\u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0430, \u043d\u043e \u043f\u0430\u043a\u0435\u0442 \u043d\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d."); return; }
  if (!API_URL) { send(msg.chat.id, "\u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0430! " + p.total_amount + " Stars."); return; }
  var url = API_URL + "/api/stars/claim";
  fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId: itemId, telegramUserId: tgUser })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.success) {
      send(msg.chat.id, "\u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u0440\u043e\u0448\u043b\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e!\n\n" + data.message);
    } else {
      send(msg.chat.id, "\u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0430! " + p.total_amount + " Stars.\n\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443.");
    }
  }).catch(function(err) {
    send(msg.chat.id, "\u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0430! \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u0438\u0433\u0440\u0443.");
  });
}
async function onUpdate(update) {
  var msg = update.message;
  var cbq = update.callback_query;
  if (msg && msg.text) {
    var cid = msg.chat.id, txt = msg.text;
    if (txt === "/start" || txt === "/start StarDominion") { send(cid, WELCOME, KB); }
    else if (txt === "/help") { send(cid, INFO, KB); }
    else if (txt === "/admin") {
      var uid = msg.from ? msg.from.id : 0;
      if (ADMIN_ID && uid === ADMIN_ID) { send(cid, "\u0410\u0434\u043c\u0438\u043d-\u043f\u0430\u043d\u0435\u043b\u044c:", ADMIN_KB); }
      else { send(cid, "\u0423 \u0432\u0430\u0441 \u043d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u0430."); }
    } else { send(cid, "\u0427\u0442\u043e\u0431\u044b \u0438\u0433\u0440\u0430\u0442\u044c, \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u043a\u043d\u043e\u043f\u043a\u0443:", KB); }
  }
  if (cbq && cbq.data === "show_info") {
    var cid = cbq.message ? cbq.message.chat.id : null;
    if (cid) { tgApi("answerCallbackQuery", { callback_query_id: cbq.id }); send(cid, INFO, KB); }
  }
  if (update.pre_checkout_query) {
    var q = update.pre_checkout_query;
    tgApi("answerPreCheckoutQuery", { pre_checkout_query_id: q.id, ok: true });
  }
  if (msg && msg.successful_payment) { handlePayment(msg); }
}
async function poll() {
  while (true) {
    try {
      var res = await tgApi("getUpdates", { offset: offset, timeout: 30 });
      if (res.ok && res.result && res.result.length > 0) {
        for (var i = 0; i < res.result.length; i++) {
          await onUpdate(res.result[i]);
          offset = res.result[i].update_id + 1;
        }
      }
    } catch (err) {
      console.error("[BOT] Poll error");
      await new Promise(function(r) { setTimeout(r, 5000); });
    }
  }
}
console.log("[BOT] Starting...");
console.log("[BOT] Token: " + TOKEN.substring(0, 10) + "...");
console.log("[BOT] Game URL: " + GAME_URL);
console.log("[BOT] API URL: " + (API_URL || "(NOT SET)"));
console.log("[BOT] Admin ID: " + (ADMIN_ID || "not set"));
poll().catch(function(err) { console.error("[BOT] Fatal: " + err); process.exit(1); });
