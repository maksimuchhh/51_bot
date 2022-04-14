const TelegramApi = require("node-telegram-bot-api");

const token = "5353416260:AAEoFw5MbXUB8XnFzLioHzfaWiJazIj3kHI";

const bot = new TelegramApi(token, { polling: true });

bot.setMyCommands([
  { command: "/start", description: "Запусти меня!" },
  { command: "/me", description: "Показать информацию обо мне" },
  { command: "/info", description: "Обзор бота" },
]);

bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  if (text === "/start") {
    await bot.sendMessage(chatId, "Ну что ж, начнём игру?");
  }

  if (text === "/me") {
    await bot.sendMessage(
      chatId,
      `
    Тебя зовут: ${msg.from.first_name} ${msg.from.last_name}\nТвой никнейм: ${msg.from.username}
  `
    );
  }

  return await bot.sendMessage(chatId, "Чё тебе надо, а?");
});
