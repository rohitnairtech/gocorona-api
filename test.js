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
		const patient_data = rawPatientData[i];
		if('city' in patient_data && patient_data.city !== ''){
			//check if city found in city - state list
			const city = cityInStateList(patient_data.city, patient_data.district);
			if(city){
				if(!(city in patientCityWise)){
					patientCityWise[city] = {infected:0, dead:0, recovered:0};
				}
				patientCityWise[city].infected++;
				switch(patient_data.status){
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
});