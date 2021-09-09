require('dotenv').config()
const fs = require('fs')
const Discord = require("discord.js");
const { strict } = require("assert");
const client = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
})

const CHRIS_ID = "110128099361849344"
const PAKRAT_ID = "142811309677871104";
const PAKRAT_STRING = "pakrat"
const PAKRAT_GRAGAS_CLIP_TITLE = "Pakrat Gragas (Classic)"
const PAKRAT_GRAGAS_CLIP = "https://streamable.com/2crcyo"
const PAKRAT_GRAGAS_CLIP_LIKELIHOOD = .5
const PREFIX = "-"
const SAVED_CLIPS_FILE = "clips.json"
let CLIPS = {}

client.on("message", (msg) => {
    if(shouldTriggerPakratGragas(msg) && !isBotsOwnMessage(msg)) {
        msg.channel.send(pickAClip())
    }
    else if ((msg.author.id == PAKRAT_ID || msg.author.id == CHRIS_ID) && msg.content.startsWith(PREFIX)) {
        let args = msg.content.substring(PREFIX.length).split(" ");
        switch(args[0]) {
            case "newClip":
                if (args.length == 3) {
                    addNewClipToSelection(args[1], args[2])
                    msg.reply("Clip added.")
                }
                else {
                    msg.reply("Use !newClip [title] [link]")
                }
                break;
            case "deleteClip":
                deleteClip(args[1])
                msg.reply("Clip removed.")
                break;
            case "listClips":
                msg.channel.send(listedClips())
                break;
            default:
                return msg.channel.send(helpMsg())
        }
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
        return msg.mentions.members.first().user.id == PAKRAT_ID
    }
    return false
}

function isBotsOwnMessage(msg) {
    return msg.author.id == client.user.id
}

function addNewClipToSelection(title, link) {
    CLIPS[title] = link
    saveClips()
}

function deleteClip(title) {
    if (title == PAKRAT_GRAGAS_CLIP_TITLE) {
        return
    }
    delete CLIPS[title]
    saveClips()
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

function helpMsg() {
    var helpStr = "`Commands`\n"
    helpStr += "``-newClip [title] [link]`` : Add a new clip to the selection\n"
    helpStr += "``-deleteClip [title]`` : Remove a clip from the selection\n"
    helpStr += "``-listClips`` : List all available clips\n"
    return helpStr
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
client.login(process.env.LIVE_BOT_TOKEN)