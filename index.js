const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection } = require('@discordjs/voice');
const path = require('path');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
    console.log('Skode® Studio');
  console.log('discord.gg/YhkyGV4Qd7');

  // الانضمام إلى القناة الصوتية عند بدء البوت
  const guild = client.guilds.cache.get(config.guildId);
  const voiceChannel = guild.channels.cache.get(config.voiceChannelId);

  if (voiceChannel) {
    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });
  }
});

// حدث عند تغير حالة الصوت لأي عضو
client.on('voiceStateUpdate', async (oldState, newState) => {
  const botChannel = newState.guild.members.me.voice.channel;
  const newUserChannel = newState.channel;

  // تأكد أن العضو انضم إلى القناة التي يتواجد فيها البوت
  if (newUserChannel && botChannel && newUserChannel.id === botChannel.id && !oldState.channel) {
    const member = newState.member;

    // تجاهل البوتات
    if (member.user.bot) {
      return;
    }

    // تأخير تشغيل الصوت لمدة 5 ثوانٍ
    setTimeout(async () => {
      // التحقق من وجود اتصال صوتي بعد 5 ثوانٍ
      const connection = getVoiceConnection(newState.guild.id);

      if (connection) {
        const player = createAudioPlayer();
        const audioPath = path.join(__dirname, config.audioFile);
        const resource = createAudioResource(audioPath);

        connection.subscribe(player);
        player.play(resource);

        // إرسال رسالة إلى قناة الإدارة
        const adminChannel = client.channels.cache.get(config.adminChannelId);
        if (adminChannel) {
          const adminRole = `<@&${config.adminRoleId}>`;
          const memberMention = `<@${member.id}>`;
          
          adminChannel.send(`🚨 **عضو جديد انضم إلى القناة الصوتية** 🚨\n${memberMention} ${adminRole}`);
        }
      }
    }, 5000); // تأخير لمدة 5000 مللي ثانية (5 ثوانٍ)
  }
});

client.login(config.token); // استخدام التوكن من config.json
