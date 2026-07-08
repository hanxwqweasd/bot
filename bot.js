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
  "Welcome, Captain!",
  "You have been appointed commander of an abandoned space station in the Andromeda-7 sector.",
  "",
  "Build and develop station",
  "Research technologies",
  "Create fleet and defeat pirates",
  "Explore the sector map"
].join("\n");

var INFO = [
  "<b>Full info - Star Dominion</b>",
  "",
  "<b>About:</b> Star Dominion - deep space strategy and colony simulator.",
  "",
  "<b>Construction:</b>",
  "- Build modules: Generators, Miners, Labs, Shipyards",
  "- Upgrade modules for efficiency",
  "",
  "<b>Research:</b>",
  "- 4 tech branches: Military, Engineering, Biological, Psycho-Energy",
  "",
  "<b>Fleet:</b>",
  "- Build ships of different classes",
  "- Fight pirates",
  "",
  "<b>Sector Map:</b>",
  "- Explore Andromeda-7 nodes",
  "- Find resources and artifacts",
  "",
  "<b>Resources:</b>",
  "- Energy - station power",
  "- Minerals - building materials",
  "- Biomatter - for research",
  "- Crystals - premium currency",
  "",
  "<b>Commands:</b>",
  "/start - Start game",
  "/help - Help"
].join("\n");

var KB = {
  inline_keyboard: [[
    { text: "Start Playing", web_app: { url: GAME_URL } },
    { text: "Full Info", callback_data: "show_info" }
  ]]
};

var ADMIN_KB = {
  inline_keyboard: [[
    { text: "Open Admin Panel", web_app: { url: GAME_URL, start_parameter: "admin" } }
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
  if (!itemId || !tgUser) {
    send(msg.chat.id, "Payment received but package unknown. Contact support.");
    return;
  }
  if (!API_URL) {
    send(msg.chat.id, "Payment received! " + p.total_amount + " Stars. Open the game - reward will be credited.");
    return;
  }
  var url = API_URL + "/api/stars/claim";
  console.log("[BOT] Calling: " + url);
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId: itemId, telegramUserId: tgUser })
  }).then(function(r) { return r.json(); }).then(function(data) {
    console.log("[BOT] Claim result: " + JSON.stringify(data));
    if (data.success) {
      send(msg.chat.id, "Payment successful!\n\n" + data.message + "\n\nOpen mini-app and press Check Payment to see updated resources!");
    } else {
      send(msg.chat.id, "Payment received! " + p.total_amount + " Stars.\nReward delayed. Contact support if resources dont appear.");
    }
  }).catch(function(err) {
    console.error("[BOT] Claim error: " + (err ? err.message : err));
    send(msg.chat.id, "Payment received! " + p.total_amount + " Stars.\nOpen the game - reward will be credited on next login.");
  });
}

async function onUpdate(update) {
  var msg = update.message;
  var cbq = update.callback_query;
  if (msg && msg.text) {
    var cid = msg.chat.id;
    var txt = msg.text;
    if (txt === "/start" || txt === "/start StarDominion") {
      send(cid, WELCOME, KB);
    } else if (txt === "/help") {
      send(cid, INFO, KB);
    } else if (txt === "/admin") {
      var uid = msg.from ? msg.from.id : 0;
      if (ADMIN_ID && uid === ADMIN_ID) {
        send(cid, "Admin panel. Press button below:", ADMIN_KB);
      } else {
        send(cid, "No access.");
      }
    } else {
      send(cid, "To play, press button below:", KB);
    }
  }
  if (cbq && cbq.data === "show_info") {
    var cid = cbq.message ? cbq.message.chat.id : null;
    if (cid) {
      tgApi("answerCallbackQuery", { callback_query_id: cbq.id });
      send(cid, INFO, KB);
    }
  }
  if (update.pre_checkout_query) {
    var q = update.pre_checkout_query;
    console.log("[BOT] Pre-checkout: user=" + q.from.id + " payload=" + q.invoice_payload);
    tgApi("answerPreCheckoutQuery", { pre_checkout_query_id: q.id, ok: true });
  }
  if (msg && msg.successful_payment) {
    handlePayment(msg);
  }
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
      console.error("[BOT] Poll error: " + (err ? err.message : err));
      await new Promise(function(r) { setTimeout(r, 5000); });
    }
  }
}

console.log("[BOT] Starting...");
console.log("[BOT] Token: " + TOKEN.substring(0, 10) + "...");
console.log("[BOT] Game URL: " + GAME_URL);
console.log("[BOT] API URL: " + (API_URL || "(NOT SET)"));
console.log("[BOT] Admin ID: " + (ADMIN_ID || "not set"));
poll().catch(function(err) {
  console.error("[BOT] Fatal: " + err);
  process.exit(1);
});
