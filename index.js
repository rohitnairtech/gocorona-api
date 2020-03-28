const axios = require('axios');

const headers = {
   "x-rapidapi-host": "covid-193.p.rapidapi.com",
   "x-rapidapi-key": "3bb8346e10msh2476e27ff9f9b31p15b886jsn79d66434a963"
};

let IndiaStats, WorldData;
const WorldStats = {infected:0,dead:0,recovered:0,critical:0};
   axios.get("https://covid-193.p.rapidapi.com/statistics", {headers}).then(({data})=>{
      const {results, response} = data;
      WorldData = response;
      let i;
      for(i = 0; i<results; i++){
         const country = response[i];
         if(country.country === 'India'){
            IndiaStats = country;
         }
         WorldStats.infected += country.cases.total;
         WorldStats.dead += country.deaths.total;
         WorldStats.recovered += country.cases.recovered;
         WorldStats.critical += country.cases.critical;
      }
      console.log(WorldStats);
   }).catch(e=>console.log(e));