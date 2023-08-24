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
            [
              { text: "⭐️ Контакт", request_contact: true },
              { text: "⭐️ Геолокация", request_location: true },
            ],
            ["❌ Закрыть меню"],
          ],
          resize_keyboard: true,
        },
      });
    } else if (msg.text == "/second_menu") {
      await bot.sendMessage(msg.chat.id, `Второе меню`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Стикер", callback_data: "sticker" },
              { text: "Круглое Видео", callback_data: "circleVideo" },
            ],
            [{ text: "Купить Файл", callback_data: "buyFile" }],
            [{ text: "Проверить Подписку", callback_data: "checkSubs" }],
            [{ text: "Закрыть Меню", callback_data: "closeMenu" }],
          ],
        },
        reply_to_message_id: msg.message_id,
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
    } else if (msg.text == "⭐️ Видео") {
      await bot.sendVideo(msg.chat.id, "./video.mp4", {
        caption: "<b>⭐️ Видео</b>",
        parse_mode: "HTML",
      });
    } else if (msg.text == "⭐️ Аудио") {
      await bot.sendAudio(msg.chat.id, "./audio.mp3", {
        caption: "<b>⭐️ Аудио</b>",
        parse_mode: "HTML",
      });
    } else if (msg.text == "⭐️ Голосовое сообщение") {
      await bot.sendVoice(msg.chat.id, "./audio.mp3", {
        caption: "<b>⭐️ Голосовое сообщение</b>",
        parse_mode: "HTML",
      });
    } else if (msg.text == "⭐️ Контакт") {
      //Скидываем контакт
      await bot.sendContact(msg.chat.id, process.env.CONTACT, `Контакт`, {
        reply_to_message_id: msg.message_id,
      });
    } else if (msg.text == "⭐️ Геолокация") {
      const latitudeOfRedSquare = 55.7537;
      const longitudeOfReadSquare = 37.62125;

      await bot.sendLocation(
        msg.chat.id,
        latitudeOfRedSquare,
        longitudeOfReadSquare,
        {
          reply_to_message_id: msg.message_id,
        }
      );
    } else {
      await bot.sendMessage(msg.chat.id, msg.text);
    }
  } catch (error) {
    console.log(error);
  }
});

bot.on("photo", async (img) => {
  //console.log(img);
  try {
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
  } catch (error) {
    console.log(error);
  }
});

bot.on("video", async (video) => {
  try {
    const thumbPath = await bot.downloadFile(
      video.video.thumbnail.file_id,
      "./video"
    );

    await bot.sendMediaGroup(video.chat.id, [
      {
        type: "video",
        media: video.video.file_id,
        caption: `Название файла: ${video.video.file_name}\nВес файла: ${video.video.file_size} байт\nДлительность видео: ${video.video.duration} секунд\nШирина кадра в видео: ${video.video.width}\nВысота кадра в видео: ${video.video.height}`,
      },
      {
        type: "photo",
        media: thumbPath,
      },
    ]);

    fs.unlink(thumbPath, (error) => {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

bot.on("audio", async (audio) => {
  try {
    await bot.sendAudio(audio.chat.id, audio.audio.file_id, {
      caption: `Название файла: ${audio.audio.file_name}\nВес файла: ${audio.audio.file_size} байт\nДлительность аудио: ${audio.audio.duration} секунд`,
    });
  } catch (error) {
    console.log(error);
  }
});

bot.on("voice", async (voice) => {
  try {
    await bot.sendAudio(voice.chat.id, voice.voice.file_id, {
      caption: `Вес файла: ${voice.voice.file_size} байт\nДлительность аудио: ${voice.voice.duration} секунд`,
    });
  } catch (error) {
    console.log(error);
  }
});

bot.on("contact", async (contact) => {
  try {
    await bot.sendMessage(
      contact.chat.id,
      `Номер контакта: ${contact.contact.phone_number}\nИмя контакта: ${contact.contact.first_name}`
    );
  } catch (error) {
    console.log(error);
  }
});

bot.on("location", async (location) => {
  try {
    await bot.sendMessage(
      location.chat.id,
      `Широта: ${location.location.latitude}\nДолгота: ${location.location.longitude}`
    );
  } catch (error) {
    console.log(error);
  }
});

bot.on("document", async (msg) => {
  console.log(msg);
});

bot.on("callback_query", async (ctx) => {
  try {
    switch (ctx.data) {
      case "closeMenu":
        await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
        await bot.deleteMessage(
          ctx.message.reply_to_message.chat.id,
          ctx.message.reply_to_message.message_id
        );
        break;
      case "sticker":
        await bot.sendSticker(ctx.message.chat.id, `./image.jpg`);
        break;
      case "circleVideo":
        await bot.sendVideoNote(ctx.message.chat.id, "./video.mp4", {
          protect_content: true,
        });
        break;
      case "checkSubs":
        const subscribe = await bot.getChatMember(
          process.env.ID_CHAT,
          ctx.from.id
        );

        if (subscribe.status == "left" || subscribe.status == "kicked") {
          await bot.sendMessage(
            ctx.message.chat.id,
            `<b>Вы не являетесь подписчиком!</b>`,
            {
              parse_mode: "HTML",
            }
          );
        } else {
          await bot.sendMessage(
            ctx.message.chat.id,
            "<b>Вы являетесь подписчиком!</b>",
            {
              parse_mode: "HTML",
            }
          );
        }

        break;
      case "buyFile":
        await bot.sendInvoice(
          ctx.message.chat.id,
          "Купить Файл",
          "Покупка файла",
          "file",
          process.env.PROVIDER_TOKEN,
          "RUB",
          [
            {
              label: "Файл",
              amount: 20000,
            },
          ]
        );

        break;
    }
  } catch (error) {
    console.log(error);
  }
});

bot.on("sticker", async (sticker) => {
  try {
    const stickerPath = await bot.downloadFile(
      sticker.sticker.file_id,
      "./images"
    );

    if (sticker.sticker.is_video) {
      await bot.sendVideo(sticker.chat.id, stickerPath);
    } else if (sticker.sticker.is_animated) {
      await bot.sendAnimation(sticker.chat.id, sticker.sticker.file_id);
    } else {
      await bot.sendPhoto(sticker.chat.id, stickerPath);
    }

    fs.unlink(stickerPath, (error) => {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

bot.on("pre_checkout_query", async (ctx) => {
  try {
    await bot.answerPreCheckoutQuery(ctx.id, true);
  } catch (error) {
    console.log(error);
  }
});

bot.on("successful_payment", async (ctx) => {
  try {
    await bot.sendDocument(
      ctx.chat.id,
      `./${ctx.successful_payment.invoice_payload}.txt`,
      {
        caption: `Спасибо за оплату ${ctx.successful_payment.invoice_payload}!`,
      }
    );
  } catch (error) {
    console.log(error);
  }
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
