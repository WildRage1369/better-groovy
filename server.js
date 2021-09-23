const { Client, Intents, MessageEmbed} = require('discord.js');
const { time } = require('@discordjs/builders');
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_VOICE_STATES"] });
const ytdl = require('ytdl-core');
// var search = require('youtube-search');
// const scrapper = require("youtube-scrapper")
const { createWriteStream } = require("fs")
const {
	AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
    AudioPlayerIdleState
} = require('@discordjs/voice');
var queue = [];
var queueInfo = [];
var connection;
var player;
var prefix = "-"
const commands = ["join", "play", "pause", "leave", "queue"]
var playing = false;
const deleted = new Map();
const usetube = require('usetube')


client.on("messageCreate", message => {
    if (message.author.bot) {return;}//if bot, return
    let content = message.content.toLowerCase();//santitize content and make shorthand
    if(!content.startsWith(prefix)){return;}//check for prefix
    content = content.substring(prefix.length)//remove prefix
    if(content.indexOf(" ") !== -1){//check for spaces aka input
        var command = content.substring(0, content.indexOf(" "));//get only command
    } else {
        var command = content;//command = content}
    }   
    switch(command) {
        case "p":
        case "play":
            search(message, command);
        case "j":
        case "join":
            connect(message);//start the connection
            break;
        case "l":
        case "link":
            play(message, command);//play video
            break;
        case "pause":
            break;
        case "l":
        case "leave":
            leave(message);//end the connection
            break;
        case "q":
        case "queue":
            console.log("queue thing")
            //g
            // if(queue!== []) {message.channel.send(queue)}
            // queueFunc(message);
            break;
        case "snipe":
            var snipeEmbed = new MessageEmbed()
            .setColor('#2a62bb')
            .setAuthor(deleted.get(message.guildId).author.tag, deleted.get(message.guildId).author.displayAvatarURL())
            .setDescription(deleted.get(message.guildId).content)
            .setTimestamp(deleted.get(message.guildId).createdAt)
            message.channel.send({ embeds: [snipeEmbed] });
        default:
            break;
    }
});

client.on("messageDelete", message => {
    if (message.author.bot) {return;}
    deleted.set(message.guildId, message);
})
// ****************************************************************************!functions

function play (message, command, vid){
    const chan = message.member.voice.channel;
    if (!chan) {message.channel.send("not in voice channel, join"); return;}
    connect(message);//start the connection
    var link;
    if(command == ""){
        link = vid;
    } else {
        link = message.content.substring(command.length+2);
    }
    // console.log(link)
    if(!link.startsWith('https://www.youtube.com/')) {message.channel.send("That is not a valid youtube link or is the shortened version"); return;}
    
    if(playing){
        queue.push(link);
        message.channel.send("added " + link + "to the queue")
    } else if (!playing){
        playVideo(link);
        player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
            console.log('Audio player is in the Playing state!');
        });
        playing = true;
        // player.state();
    }


    player.on(AudioPlayerStatus.Idle, () => {
        if (queue.length === 0) {playing = false}
        else {playVideo(queue[0]); queue.shift();}
    });
}

function connect (message){
    const chan = message.member.voice.channel;
    if (!chan) {message.channel.send("not in voice channel, join"); return;}
    connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });
    player = createAudioPlayer();
}

function leave (message){
    const chan = message.member.voice.channel;
    if(!chan) {message.channel.send("connection is null, no voice channel joined"); return;} //if there is no connection. return
    connection.destroy();//destroy connection
    queue = [];
    playing = false;
}

function playVideo (link) {
    const stream = ytdl(link, { filter: 'audioonly' });
    const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
    
    player.play(resource);
    connection.subscribe(player);
}

async function search (message, command) {
    var vid =  await usetube.searchVideo(message.content.substring(command.length+2))
    vid = "https://www.youtube.com/watch?v=" + vid.videos[0].id;
    play(message, "", vid)
}

// ****************************************************************************!play song

client.once('ready', () => {console.log('Ready!');});
client.login("ODg3MTc5MDA5NzIzNjAwOTM3.YUAX1g.a94ahH63-FuATQnrmuWubQnxE_E");