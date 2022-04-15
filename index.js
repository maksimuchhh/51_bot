const TelegramApi = require("node-telegram-bot-api");
const fetch = require("node-fetch");
const sequelize = require("./db");
const UserModel = require("./models");
const AirRaid = require("./airRaid");

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
  await bot.sendMessage(chatId, `@${username}, начнём игру?`);
};

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const isPidorAvailable = (dbDate) => {
  const date1 = new Date();
  const date2 = new Date(dbDate);
  if (date1 - date2 > 24 * 60 * 60 * 1000) {
    return true;
  }
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
      await UserModel.findOrCreate({
        where: { chatId, username },
        defaults: { chatId, username },
      }).catch((err) => console.error("/start ERROR: ", err));

      onStart(chatId, username);
    }

    if (text.includes("/me")) {
      if (!(await checkUser(chatId, username))) return;

      const user = await UserModel.findOne({ where: { chatId, username } });

      await bot.sendMessage(
        chatId,
        `
    Тебя зовут: ${msg.from.first_name} ${
          msg.from.last_name || ""
        }\nТвой никнейм: ${msg.from.username}\nТы был пидором: ${
          user.pidorCount
        } раз
  `
      );
      return;
    }

    if (text.includes("/clear")) {
      bot.sendMessage(chatId, "Ага сука, не тут то было!");
    }

    if (text.includes("/pidor")) {
      if (!(await checkUser(chatId, username))) return;

      const users = await UserModel.findAll({ where: { chatId } });

      if (!users.every((el) => isPidorAvailable(el.updatedAt)))
        return bot.sendMessage(
          chatId,
          `Пидор дня: @${
            users.sort(function (a, b) {
              return a.updatedAt - b.updatedAt;
            })[users.length - 1].username
          }\nНе так быстро голубки, нужно подождать`
        );

      const pidorUsername = users[getRandomInt(users.length)].username;

      users[getRandomInt(users.length)].pidorCount += 1;

      await bot.setChatDescription(chatId, `Пидор: @${pidorUsername}`);
      await bot.sendPhoto(
        chatId,
        "https://lastfm.freetls.fastly.net/i/u/300x300/f939d9be5da0095a78bfb5cf45aecf39"
      );
      await bot.sendMessage(chatId, `@${pidorUsername} пидор!`);

      UserModel.increment("pidorCount", { where: { username: pidorUsername } });
      return;
    }

    if (text.includes("/info")) {
      if (!(await checkUser(chatId, username))) return;

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

      return;
    }
  } catch (err) {
    bot.sendMessage(chatId, `Something went wrong: ${err}`);
  }
});
