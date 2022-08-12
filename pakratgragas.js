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
const PAKRAT_GRAGAS_CLIP_LIKELIHOOD = .2
const PREFIX = "-"
const SAVED_CLIPS_FILE = "clips.json"
let CLIPS = {}

client.on("message", (msg) => {
    if(shouldTriggerPakratGragas(msg) && !isBotsOwnMessage(msg)) {
        msg.channel.send(pickAClip())
    }
    else if ((msg.author.id === PAKRAT_ID || msg.author.id === CHRIS_ID) && msg.content.startsWith(PREFIX)) {
        let args = msg.content.substring(PREFIX.length).split(" ");
        switch(args[0]) {
            case "newClip":
                if (args.length >= 3) {
                    let linkAndTitle = extractLinkAndTitle(args)
                    if (linkAndTitle[0] != null) {
                        addNewClipToSelection(linkAndTitle[1], linkAndTitle[0])
                        msg.reply("Added clip " + linkAndTitle[1])
                    } else {
                        msg.reply("Invalid link. Please stop being noob.")
                    }
                    break;
                }
                msg.reply("Use -newClip [title] [link] (Brackets required in [title])")
                break;
            case "deleteClip":
                let success = deleteClip(args.slice(1, args.length).join(" "))
                if (success) {
                    msg.reply("Clip removed.")
                } else {
                    msg.reply("Title not found in clip bank")
                }
                break;
            case "listClips":
                msg.channel.send(listedClips())
                break;
            default:
                return msg.channel.send(helpMsg())
        }
    }
})

function extractLinkAndTitle(args) {
    try {
        let link = args[args.length-1]
        let title = args.slice(1, args.length-1).join(" ")
        new URL(link)
        let ret = [link, title]
        return ret
    } catch (error) {
        console.log(error)
        return [null, null]
    }    
}

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
    CLIPS[title] = link
    saveClips()
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

function helpMsg() {
    var helpStr = "`Commands`\n"
    helpStr += "``-newClip [title] [link]`` : Add a new clip to the selection (Brackets required in [title])\n"
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
