const {get} = require('axios');

let children = 0, working = 0, elderly = 0, men = 0, female = 0;

get("https://api.rootnet.in/covid19-in/unofficial/covid19india.org").then(({data})=>{
	let count = 0;
	data = data.data;
	for(let i in data.rawPatientData){
		const patient_data = data.rawPatientData[i];
		if(patient_data.contractedFrom !== ''){
			count++;
			console.log(patient_data);
		}
		if(patient.ageEstimate !== ''){
			switch(Number(patient.ageEstimate)){
				case 
			}
		}
	}
	console.log(count);
});