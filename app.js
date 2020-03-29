"use strict";
const express = require('express');
const app = express();
const {get} = require('axios');
const cheerio = require('cheerio'), cheerioTableparser = require('cheerio-tableparser');
const cors = require('cors');
const PORT = process.env.PORT || 5000

app.use(express.json({limit: '20mb'}));
app.use(cors({origin: '*'}));



var apiData = {}, IndianStats, IndianStateWise = [], WorldData = {}, WorldStats;
const ageGroup = {children:0, working:0, elderly:0}, gender = {male:0, female:0};

const updateData = ()=>{


   get("https://www.worldometers.info/coronavirus").then(({data})=>{
      const $ = cheerio.load(data);
      cheerioTableparser($);
      data = $('#main_table_countries_today tbody').parsetable(true,true,true);
      for(let i=0; i<data[0].length; i++){
         WorldData[data[0][i]] = {infected:data[1][i], new_cases:data[2][i], dead:data[3][i], new_deaths:data[4][i], recovered:data[5][i], active:data[6][i], critical:data[7][i], first_report:data[10][i]};
         if(data[0][i] == 'India'){
            IndianStats = {infected:data[1][i], new_cases:data[2][i], dead:data[3][i], new_deaths:data[4][i], recovered:data[5][i], active:data[6][i], critical:data[7][i], first_report:data[10][i]};
         }
         else if(data[0][i] == 'Total:'){
            WorldStats = {infected:data[1][i], new_cases:data[2][i], dead:data[3][i], new_deaths:data[4][i], recovered:data[5][i], active:data[6][i], critical:data[7][i], first_report:'Nov 17, 2019'};
         }
      }
      console.log(WorldStats);
      console.log(IndianStats);
   
   }).catch(e=>console.log(e));

   get("https://api.rootnet.in/covid19-in/unofficial/covid19india.org/statewise").then(({data})=>{
      data = data.data;
      const total = data.total;
      IndianStats.infected = total.confirmed, IndianStats.recovered = total.recovered, IndianStats.dead = total.deaths, IndianStats.active = total.active;
      for (let i in data.statewise){
         const stateData = data.statewise[i];
         stateData.infected = stateData.confirmed, stateData.dead = stateData.deaths;
         delete stateData.confirmed;
         delete stateData.deaths;
         IndianStateWise.push(stateData);
      }
   });
   console.log(IndianStats);



get("https://api.rootnet.in/covid19-in/unofficial/covid19india.org").then(({data})=>{
   let count = 0;
   data = data.data;
   for(let i in data.rawPatientData){
      const patient_data = data.rawPatientData[i];
      if(patient_data.contractedFrom !== ''){
         count++;
      }
      if(patient.ageEstimate !== ''){
         const age = parseInt(patient.ageEstimate);
         if(age < 15){
            ageGroup.children++;
         }
         else if(age < 65){
            ageGroup.working++;
         }
         else{
            ageGroup.elderly++;
         }
      }
      if(patient.gender !== ''){
         if(patient.gender === 'female'){
            gender.female++;
         }
         else{
            gender.male++;
         }
      }
   }
   console.log(count);
});

apiData = {status:200, success:true, data:{indian_stats:IndianStats, world_stats:WorldStats, world_data:WorldData, indian_data:{stats:IndianStats, statewise:IndianStateWise, demography:{age:ageGroup, gender:gender}}}};

   setTimeout(()=>{
      updateData();
   },1200000);
}

updateData();


 app.get('/all', (req, res)=>{
   res.json(apiData);
});


 app.get('/india', (req, res)=>{
   res.json({status:200, success:true, data:{stats:IndianStats, statewise:IndianStateWise}});
});

app.get('/india/demography', (req, res)=>{
   res.json({status:200, success:true, data:{age:ageGroup, gender:gender}});
});

 app.get('/world', (req, res)=>{
   res.json({status:200, success:true, data:{stats:WorldStats, countrywise:WorldData}});
});

 app.listen(PORT, () => console.log(`Dashboard server is listening on ${PORT}`));