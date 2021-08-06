require('dotenv').config()
const Discord = require("discord.js");
const { strict } = require("assert");
const client = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
})

const PAKRAT_ID = "142811309677871104";
const PAKRAT_STRING = "pakrat"
const PAKRAT_GRAGAS_CLIP = "https://medal.tv/clips/3aXiSkx_Dh5r8/s1ZdDDsPwW0m"

client.on("message", (msg) => {
    if((shouldTriggerPakratGragas(msg) || isPakratMentioned(msg)) && !isBotsOwnMessage(msg)) {
        msg.channel.send(PAKRAT_GRAGAS_CLIP)
    }
})

function shouldTriggerPakratGragas(msg) {
    return msg.content.toLowerCase().includes(PAKRAT_STRING)
}

function isPakratMentioned(msg) {
    if (msg.mentions.members.first()) {
        return msg.mentions.members.first().user.id == PAKRAT_ID
    }
    return false
}

function isBotsOwnMessage(msg) {
    return msg.author.id == client.user.id
}

/**
 * When the bot turns on
 */
client.on("ready", () => {
    console.log("Bot is online!")
    client.user.setActivity("Looking out for Pakrat.")
})


/**
 * Log into the bot profile.
 */
client.login(process.env.LIVE_BOT_TOKEN)