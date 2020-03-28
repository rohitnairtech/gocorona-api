"use strict";
const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio'), cheerioTableparser = require('cheerio-tableparser');
const cors = require('cors');
const PORT = process.env.PORT || 5000

app.use(express.json({limit: '20mb'}));
app.use(cors({origin: '*'}));



var apiData = {};

const updateData = ()=>{

   let IndianStats, WorldData = {}, WorldStats;

   axios.get("https://www.worldometers.info/coronavirus").then(({data})=>{
      const $ = cheerio.load(data);
      cheerioTableparser($);
      data = $('#main_table_countries_today tbody').parsetable(true,true,true);
      for(let i in data[0]){
         WorldData[data[0][i]] = {infected:data[1][i], new_cases:data[2][i], dead:data[3][i], new_deaths:data[4][i], recovered:data[5][i], active_cases:data[6][i], critical:data[7][i], first_report:data[10][i]};
         if(data[0][i] == 'India'){
            IndianStats = {infected:data[1][i], new_cases:data[2][i], dead:data[3][i], new_deaths:data[4][i], recovered:data[5][i], active_cases:data[6][i], critical:data[7][i], first_report:data[10][i]};
         }
         else if(data[0][i] == 'Total:'){
            WorldStats = {infected:data[1][i], new_cases:data[2][i], dead:data[3][i], new_deaths:data[4][i], recovered:data[5][i], active_cases:data[6][i], critical:data[7][i], first_report:'Nov 17, 2019'};
         }
      }
      console.log(WorldStats);
      console.log(IndianStats);
      apiData = {status:200, success:true, data:{indian_stats:IndianStats, world_stats:WorldStats, world_data:WorldData}};
   
   }).catch(e=>console.log(e));


   setTimeout(()=>{
      updateData();
   },1200000);
}

updateData();


 app.get('/', (req, res)=>{
   res.json(apiData);
});

 app.listen(PORT, () => console.log(`Dashboard server is listening on ${PORT}`));