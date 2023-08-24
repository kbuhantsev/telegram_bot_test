const fs = require("node:fs/promises");
const express = require("express");

require("dotenv").config();

const app = express();

app.get("/", (req, res) => {
  res.send("Hello debug_Yourself");
});

app.listen(process.env.PORT, () =>
  console.log(`My server is running on port ${process.env.PORT}`)
);

const commands = require("./commands");

const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
  },
});
bot.setMyCommands(commands);

bot.on("polling_error", (err) => console.log(err.data.error.message));

bot.on("text", async (msg) => {
  try {
    if (msg.text.startsWith("/start")) {
      await bot.sendMessage(msg.chat.id, `Вы запустили бота! 👋🏻`);

      if (msg.text.length > 6) {
        const refID = msg.text.slice(7);

        await bot.sendMessage(
          msg.chat.id,
          `Вы зашли по ссылке пользователя с ID ${refID}`
        );
      }
    } else if (msg.text == "/ref") {
      await bot.sendMessage(
        msg.chat.id,
        `${process.env.URL_TO_BOT}?start=${msg.from.id}`
      );
    } else if (msg.text == "/help") {
      await bot.sendMessage(msg.chat.id, `Раздел помощи`);
      await bot.sendMessage(
        msg.chat.id,
        `Раздел помощи HTML\n\n<b>Жирный Текст</b>\n<i>Текст Курсивом</i>\n<code>Текст с Копированием</code>\n<s>Перечеркнутый текст</s>\n<u>Подчеркнутый текст</u>\n<pre language='c++'>код на c++</pre>\n<a href='t.me'>Гиперссылка</a>`,
        {
          parse_mode: "HTML",
        }
      );

      await bot.sendMessage(
        msg.chat.id,
        "Раздел помощи Markdown\n\n*Жирный Текст*\n_Текст Курсивом_\n`Текст с Копированием`\n~Перечеркнутый текст~\n``` код ```\n||скрытый текст||\n[Гиперссылка](t.me)",
        {
          parse_mode: "MarkdownV2",
        }
      );
    } else if (msg.text == "/link") {
      await bot.sendMessage(msg.chat.id, `https://habr.com/`, {
        disable_web_page_preview: true,
        //disable_notification: true,
      });
    } else if (msg.text == "/menu") {
      await bot.sendMessage(msg.chat.id, `Меню бота`, {
        reply_markup: {
          keyboard: [
            ["⭐️ Картинка", "⭐️ Видео"],
            ["⭐️ Аудио", "⭐️ Голосовое сообщение"],
            ["❌ Закрыть меню"],
          ],
          resize_keyboard: true,
        },
      });
    } else if (msg.text == "❌ Закрыть меню") {
      await bot.sendMessage(msg.chat.id, "Меню закрыто", {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    } else if (msg.text == "⭐️ Картинка") {
      await bot.sendPhoto(msg.chat.id, "./image.jpg", {
        caption: "<b>⭐️ Картинка</b>",
        parse_mode: "HTML",
      });
      //Скидываем изображение с помощью Readable Stream
      //const imageStream = fs.createReadStream("./image.jpg");
      //await bot.sendPhoto(msg.chat.id, imageStream);
      //Скидываем изображение с помощью буфера
      //const imageBuffer = fs.readFileSync("./image.jpg");
      //await bot.sendPhoto(msg.chat.id, imageBuffer);
    } else {
      await bot.sendMessage(msg.chat.id, msg.text);
    }
  } catch (error) {
    console.log(error);
  }
});

bot.on("photo", async (img) => {
  //console.log(img);
  const photoGroup = [];

  for (let index = 0; index < img.photo.length; index++) {
    const photoPath = await bot.downloadFile(
      img.photo[index].file_id,
      "./images"
    );

    photoGroup.push({
      type: "photo",
      media: photoPath,
      caption: `Размер файла: ${img.photo[index].file_size} байт\nШирина: ${img.photo[index].width}\nВысота: ${img.photo[index].height}`,
    });
  }

  await bot.sendMediaGroup(img.chat.id, photoGroup);

  for (let index = 0; index < photoGroup.length; index++) {
    await fs.unlink(photoGroup[index].media, (error) => {
      if (error) {
        console.log(error);
      }
    });
  }
});

bot.on("document", async (msg) => {
  console.log(msg);
});

// bot.on("text", async (msg) => {
//   console.log(msg);
//   bot.sendMessage(msg.chat.id, "ответ: " + msg.text);
// });

// bot.on("text", async (msg) => {
//   const msgWait = await bot.sendMessage(msg.chat.id, `Бот генерирует ответ...`);

//   setTimeout(async () => {
//     await bot.deleteMessage(msgWait.chat.id, msgWait.message_id);
//     await bot.sendMessage(msg.chat.id, msg.text);
//   }, 5000);
// });

// bot.on("text", async (msg) => {
//   const msgWait = await bot.sendMessage(msg.chat.id, `Бот генерирует ответ...`);

//   setTimeout(async () => {
//     try {
//       await bot.editMessageText(msg.text, {
//         chat_id: msgWait.chat.id,
//         message_id: msgWait.message_id,
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   }, 3000);
// });
