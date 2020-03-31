const {get} = require('axios');
const stateList = require('./stateList.json');

const patientCityWise = {}


const cityInStateList = (city, district)=>{
	city = city.toLowerCase();
	district = district.toLowerCase();
	for(let i in stateList){
		const {name} = stateList[i];
		if(name.toLowerCase() == city){
			return city;
		}
		else if(name.toLowerCase() == district){
			return district;
		}
	}
	return false;

}

get("https://api.rootnet.in/covid19-in/unofficial/covid19india.org").then(({data})=>{
	const {rawPatientData} = data.data;
	for (let i in rawPatientData){
		const patient = rawPatientData[i];
		if('city' in patient && patient.city !== ''){
			//check if city found in city - state list
			const city = cityInStateList(patient.city, patient.district);
			if(city){
				if(!(city in patientCityWise)){
					patientCityWise[city] = {infected:0, dead:0, recovered:0};
				}
				patientCityWise[city].infected++;
				switch(patient.status){
					case 'Recovered':
						patientCityWise[city].recovered++;
						break;
					case 'Deceased':
						patientCityWise[city].dead++;
						break;
				}
			}
		}

	}
console.log(patientCityWise);
console.log(count);
});

/*
get("https://api.rootnet.in/covid19-in/unofficial/covid19india.org").then(({data})=>{
	let count = 0;
	data = data.data;
	for(let i in data.rawPatientData){
		const patient = data.rawPatientData[i];
		if(patient.contractedFrom !== ''){
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
});*/