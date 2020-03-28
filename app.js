"use strict";
const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const PORT = process.env.PORT || 5000

app.use(express.json({limit: '20mb'}));
app.use(cors({origin: '*'}));

const headers = {
   "x-rapidapi-host": "covid-193.p.rapidapi.com",
   "x-rapidapi-key": "3bb8346e10msh2476e27ff9f9b31p15b886jsn79d66434a963"
};

var apiData;

const updateData = ()=>{

   let IndianStats, WorldData;
   const WorldStats = {infected:0,dead:0,recovered:0,critical:0};

   axios.get("https://covid-193.p.rapidapi.com/statistics", {headers}).then(({data})=>{
      const {results, response} = data;
      WorldData = response;
      let i;
      for(i = 0; i<results; i++){
         const country = response[i];
         if(country.country === 'India'){
            const cases = country.cases;
            IndianStats = {infected:cases.total, dead:country.deaths.total, recovered:cases.recovered, critical:cases.critical};
         }
         WorldStats.infected += country.cases.total;
         WorldStats.dead += country.deaths.total;
         WorldStats.recovered += country.cases.recovered;
         WorldStats.critical += country.cases.critical;
      }
      console.log(WorldStats);
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