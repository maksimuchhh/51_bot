const TelegramApi = require("node-telegram-bot-api");
const fetch = require("node-fetch");
const sequelize = require("./db");
const UserModel = require("./models");
const AirRaid = require("./airRaid");
const { isPidorAvailable, getRandomInt } = require("./helpers");

const token = "5353416260:AAEoFw5MbXUB8XnFzLioHzfaWiJazIj3kHI";
const pidorChatId = "-1001248737197";

const bot = new TelegramApi(token, { polling: true });

const initDataBase = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};

const checkUser = async (chatId, username) => {
  try {
    const user = await UserModel.findOne({ where: { chatId, username } });

    if (!user) {
      await bot.sendMessage(chatId, "Напиши /start что бы вступить в клуб");
      return false;
    }
    return true;
  } catch (err) {
    await bot.sendMessage(chatId, "Напиши /start что бы вступить в клуб");
    console.log("UserModel.findOne ERROR: ", err);
    return false;
  }
};

const onStart = async (chatId, username) => {
  await UserModel.findOrCreate({
    where: { chatId, username },
    defaults: { chatId, username, isPidor: false },
  }).catch((err) => console.error("/start ERROR: ", err));

  await bot.sendMessage(chatId, `@${username}, начнём игру?`);
};

const onMe = async (first_name, last_name, chatId, username) => {
  const user = await UserModel.findOne({ where: { chatId, username } });

  await bot.sendMessage(
    chatId,
    `
    Тебя зовут: ${first_name} ${
      last_name || ""
    }\nТвой никнейм: ${username}\nТы был пидором: ${user.pidorCount} раз
  `
  );
};

const onInfo = async (chatId) => {
  const users = await UserModel.findAll({ where: { chatId } });

  await bot.sendMessage(
    chatId,
    `Главный пидор группы: @${
      users.reduce(function (prev, current) {
        return prev.pidorCount > current.pidorCount ? prev : current;
      }).username
    }\n\n${users
      .map((el) => `@${el.username} был пидором ${el.pidorCount || 0} раз`)
      .join("\n")}`
  );
};

const onPidor = async (chatId) => {
  const users = await UserModel.findAll({ where: { chatId } });
  const pidorUser = await UserModel.findOne({ where: { isPidor: true } });

  if (!users.every((el) => isPidorAvailable(el.updatedAt)))
    return bot.sendMessage(
      chatId,
      pidorUser
        ? `Пидор дня: @${pidorUser.username}\nНе так быстро голубки, нужно подождать`
        : "Пидор дня ещё не определён\nНо тут какая то хуйня происходит, подождите"
    );
  if (pidorUser) {
    pidorUser.isPidor = false;
    await pidorUser.save();
  }

  const newPidor = users[getRandomInt(users.length)];

  const newPidorUsername = newPidor.username;
  newPidor.pidorCount += 1;
  newPidor.isPidor = true;
  await newPidor.save();

  // await bot.setChatDescription(chatId, `Пидор: @${newPidorUsername}`);
  await bot.sendPhoto(
    chatId,
    "https://lastfm.freetls.fastly.net/i/u/300x300/f939d9be5da0095a78bfb5cf45aecf39"
  );
  await bot.sendMessage(chatId, `@${newPidorUsername} пидор!`);
};

initDataBase();

setInterval(() => {
  fetch("https://emapa.fra1.cdn.digitaloceanspaces.com/statuses.json")
    .then((res) => res.json())
    .then(async (data) => {
      const [previousStatus] = await AirRaid.findOrCreate({
        where: { id: 1 },
        defaults: { id: 1, isAirRaidActive: data.states["м. Київ"].enabled },
      });

      if (data.states["м. Київ"].enabled && !previousStatus.isAirRaidActive) {
        bot.sendPhoto(
          pidorChatId,
          "https://static.ukrinform.com/photos/2022_02/thumb_files/630_360_1645871571-868.jpg"
        );
      } else if (
        !data.states["м. Київ"].enabled &&
        previousStatus.isAirRaidActive
      ) {
        bot.sendPhoto(
          pidorChatId,
          "https://static.novosti-n.org/upload/news/691244.jpg"
        );
      }

      previousStatus.isAirRaidActive = data.states["м. Київ"].enabled;
      await previousStatus.save();
    })
    .catch((err) => console.error("AirRaid ERROR: ", err));
}, 30000);

bot.setMyCommands([
  { command: "/start", description: "Вступить в игру" },
  { command: "/me", description: "Показать информацию обо мне" },
  { command: "/pidor", description: "Запустить игру" },
  { command: "/clear", description: "Очистить постыдную статистику" },
  { command: "/info", description: "Показать статистику" },
]);

bot.on("voice", async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  bot.sendMessage(chatId, `@${username} заебал со своими голосовыми`);
});

bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  const username = msg.from.username;

  try {
    if (!text) return;

    if (text.includes("/start")) {
      onStart(chatId, username);
    }

    if (text.includes("/me")) {
      if (!(await checkUser(chatId, username))) return;

      await onMe(msg.from.first_name, msg.from.last_name, chatId, username);
      return;
    }

    if (text.includes("/clear")) {
      bot.sendMessage(chatId, "Ага сука, не тут то было!");
    }

    if (text.includes("/pidor")) {
      if (!(await checkUser(chatId, username))) return;

      await onPidor(chatId);
      return;
    }

    if (text.includes("/info")) {
      if (!(await checkUser(chatId, username))) return;

      await onInfo(chatId);
      return;
    }
  } catch (err) {
    bot.sendMessage(chatId, `Something went wrong: ${err}`);
  }
});
