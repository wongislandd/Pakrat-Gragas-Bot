require('dotenv').config()
const fs = require('fs')
const { token } = require('./config.json');
const { Client, Intents } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const settings = require('./settings.json');

const newClipCommand = new SlashCommandBuilder()
    .setName('newclip')
    .setDescription("Add a new clip to the pool!")
    .addStringOption(option => option
        .setName('title')
        .setDescription('The title of the clip you are adding.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('link')
        .setDescription('The link of the clip you are adding.')
        .setRequired(true)
    )

const deleteClipCommand = new SlashCommandBuilder()
    .setName('deleteclip')
    .setDescription("Delete a clip from the pool!")
    .addStringOption(option => option
        .setName('target')
        .setDescription('Title of the clip you want to delete. Must match exact title.')
        .setRequired(true)
    )

const commands = [
    newClipCommand,
    deleteClipCommand,
    new SlashCommandBuilder().setName('listclips').setDescription('List the clips available in the pool!'),
].map(command => command.toJSON())

const rest = new REST({ version: '9' }).setToken(token)

rest.put(Routes.applicationGuildCommands(settings.clientId, settings.serverId), { body: commands })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error)

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBERS"],
})

const CHRIS_ID = "110128099361849344"
const PAKRAT_ID = "142811309677871104";
const PAKRAT_STRING = "pakrat"
const PAKRAT_GRAGAS_CLIP_TITLE = "Pakrat Gragas (Classic)"
const PAKRAT_GRAGAS_CLIP = "https://streamable.com/2crcyo"
const PAKRAT_GRAGAS_CLIP_LIKELIHOOD = .2
const PREFIX = "-"
const SAVED_CLIPS_FILE = "clips.json"
let CLIPS = {}

client.on("message", (msg) => {
    if(shouldTriggerPakratGragas(msg) && !isBotsOwnMessage(msg)) {
        msg.channel.send(pickAClip())
    }
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, member, channel } = interaction

    switch (commandName) {
        case 'newclip':
            let title = interaction.options.getString('title')
            let link = interaction.options.getString('link')
            if (addNewClipToSelection(title, link)) {
                interaction.reply("Added clip " + quotedText(boldText(title)))
            } else {
                interaction.reply("Invalid link. Please stop being noob.")
            }
            break;
        case 'deleteclip':
            console.log(member.id)
            let deleteTarget = interaction.options.getString('target')
            if(deleteClip(deleteTarget)) {
                interaction.reply("Deleted clip " + quotedText(boldText(deleteTarget)))
            } else {
                interaction.reply("Could not find the target clip. Make sure it's an exact match with the title.")
            }
            break;
        case 'listclips':
            interaction.reply(listedClips())
            break;
        default:
            break;
    }
})

function shouldTriggerPakratGragas(msg) {
    return isPakratASubstring(msg) || isPakratMentioned(msg)
}

function isPakratASubstring(msg) {
    return msg.content.toLowerCase().includes(PAKRAT_STRING)
}

function isPakratMentioned(msg) {
    if (msg.mentions.members.first()) {
        return msg.mentions.members.first().user.id === PAKRAT_ID
    }
    return false
}

function isBotsOwnMessage(msg) {
    return msg.author.id === client.user.id
}

function addNewClipToSelection(title, link) {
    try {
        new URL(link)
        CLIPS[title] = link
        saveClips()
        return true
    } catch(error) {
        return false;
    }
}

function deleteClip(title) {
    if (title === PAKRAT_GRAGAS_CLIP_TITLE) {
        return
    }
    let allTitles = Object.keys(CLIPS);
    if (allTitles.includes(title)) {
        delete CLIPS[title]
        saveClips()
        return true
    } else {
        return false
    }
}

function listedClips() {
    var clipStr = "``"
    for (var key in CLIPS) {
        clipStr += key + " : " + CLIPS[key] + "\n"
    }
    return clipStr + "``"
}

function pickAClip() {
    if (Math.random() < PAKRAT_GRAGAS_CLIP_LIKELIHOOD) {
        return "Pakrat Gragas (Original) : " + PAKRAT_GRAGAS_CLIP
    }
    else {
        var keys = Object.keys(CLIPS);
        var chosenKey = keys[ keys.length * Math.random() << 0]
        return chosenKey + " : " + CLIPS[chosenKey];
    }
}

function saveClips() {
    fs.writeFile(SAVED_CLIPS_FILE, JSON.stringify(CLIPS), 'utf8',  function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    })
}

function loadClips() {
    fs.readFile('./' + SAVED_CLIPS_FILE, 'utf8', (err, jsonString) => {
        if (err) {
          console.log("Clips read failed:", err)
          return 
        }
        CLIPS = JSON.parse(jsonString)
        CLIPS[PAKRAT_GRAGAS_CLIP_TITLE] = PAKRAT_GRAGAS_CLIP
      })
}

function codeText(str) {
    return "```" + str + "```"
}

function boldText(str) {
    return "**" + str + "**"
}

function quotedText(str) {
    return "\"" + str + "\""
}

/**
 * When the bot turns on
 */
client.on("ready", () => {
    console.log("Bot is online!")
    loadClips()
    client.user.setActivity("Looking out for Pakrat.")
})


/**
 * Log into the bot profile.
 */
client.login(token)
