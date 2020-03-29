const {get} = require('axios')

const ageGroup = {children:0, working:0, elderly:0}, gender = {male:0, female:0};

get("https://api.rootnet.in/covid19-in/unofficial/covid19india.org").then(({data})=>{
	let count = 0;
	data = data.data;
	for(let i in data.rawPatientData){
		const patient = data.rawPatientData[i];
		if('place_attributes' in patient){
			console.log(patient);
		}
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
});