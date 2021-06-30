const { Telegraf } = require('telegraf')
const timetable = require('./assets/timetable.json')

require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Keep training and get stronger. I’ll always be one step ahead of you, though!'))
bot.help((ctx) => ctx.reply('Atmanirbhar Bano'))

function findClasses(timetable,timestamp){
    if(!timetable.length) return;
    
    let classes = [];
    let date = new Date(timestamp);
    let currentHrs = date.getHours();
    let currentMins = date.getMinutes();

    if(date.getDay() == 0){
      return classes;
    }
    let days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];
    let currentDay = days[date.getDay() - 1];

    let tt = timetable.filter((val) => val.day == currentDay).sort((a, b) => a.time - b.time);
    
    for (let i = 0; i < tt.length; i++) {
      if (tt[i].time <= currentHrs) {
        let duration = 0;
        while(duration < tt[i].duration){
          if((tt[i].time + duration) == currentHrs && currentMins<=50){
            classes[0] = tt[i];
          }
          duration++;
        }
      } else {
        if(!classes[1]) classes[1] = tt[i];
      }
    }

    let formatTime = str => {
      let time = parseInt(str)
      if(time<12) return time +'am';
      else if(time==12) return time + 'pm';
      else return (time-12)+'pm';
  }

    let msg = ''
    if(classes[0]) msg+= `Current Class(${formatTime(classes[0].time)}): ${classes[0].subject.acronym} - ${classes[0].type.substring(0,3).toUpperCase()}`
    if(classes[0] && classes[1]) msg+= '\n'
    if(classes[1]) msg+= `Next Class(${formatTime(classes[1].time)}): ${classes[1].subject.acronym} - ${classes[1].type.substring(0,3).toUpperCase()}`
    if(!classes[0] && !classes[1]) msg+= `Class nhi hai abhi, Enjoy krle ${ctx.from.first_name} yr!`
    
    return msg
}

function findClassesToday(timetable,timestamp){
    if(!timetable.length) return;
    
    let classes = `No Classes Today`;
    let date = new Date(timestamp);
    let currentHrs = date.getHours();
    let currentMins = date.getMinutes();

    if(date.getDay() == 0){
      return classes;
    }
    let days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];
    let currentDay = days[date.getDay() - 1];

    let tt = timetable.filter((val) => val.day == currentDay).sort((a, b) => a.time - b.time);
    
    for (let i = 0; i < tt.length; i++) {
      if (tt[i].time <= currentHrs) {
        let duration = 0;
        while(duration < tt[i].duration){
          if((tt[i].time + duration) == currentHrs && currentMins<=50){
            classes[0] = tt[i];
          }
          duration++;
        }
      } else {
        if(!classes[1]) classes[1] = tt[i];
      }
    }

    let formatTime = str => {
        let time = parseInt(str)
        if(time<12) return time +'am';
        else if(time==12) return time + 'pm';
        else return (time-12)+'pm';
    }

    classes = tt.map(x => `${formatTime(x.time)} - ${x.subject.acronym} - ${x.type.substring(0,3).toUpperCase()}`).join('\n')
    return classes 
}

bot.command(["class","classnow"],(ctx)=>{
    let classes = findClasses(timetable,ctx.message.date*1000)
    ctx.reply(classes)
})

bot.command("classtoday",(ctx)=>{
    let classes = findClassesToday(timetable,ctx.message.date*1000)
    ctx.reply(classes)
})

if (process.env.NODE_ENV === 'production') {
  bot.launch({
      webhook: {
          domain: process.env.HEROKU_URL,
          port: parseInt(process.env.PORT || '3000')
      }
  })
} else {
  bot.launch()
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))