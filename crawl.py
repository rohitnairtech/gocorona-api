import spacy
import requests, json

nlp = spacy.load("en_core_web_md")

sample = ["From Mumbai To Goa", "To Wuhan", "To China"]

city_country_data = requests.get('https://raw.githubusercontent.com/russ666/all-countries-and-cities-json/6ee538beca8914133259b401ba47a550313e8984/countries.min.json').json()
country_code = requests.get('https://pkgstore.datahub.io/core/country-list/data_json/data/8c458f2d15d9f2119654b29ede6e45b8/data_json.json').json()
indian_cities_states = requests.get('https://raw.githubusercontent.com/nshntarora/Indian-Cities-JSON/master/cities.json').json()
covid_data = requests.get('https://api.rootnet.in/covid19-in/unofficial/covid19india.org/').json()['data']['rawPatientData']

city_country_data['Qatar'] = ['Doha', 'Abu az Zuluf', 'Abu Thaylah']
city_country_data['Guyana'] = ['Georgetown', 'Linden', 'New Amsterdam', 'Anna Regina']

for country in country_code:
	if country['Code'] == 'IR':
		country['Name'] = 'Iran'
	elif country['Code'] == 'RU':
		country['Name'] = 'Russia' 


synonyms = {'United Kingdom':['UK'],'United States':['US','USA','America'], 'United Arab Emirates':['UAE', 'Emirates', 'Abhudhabi'], 'Trinidad and Tobago':['Trinidad', 'Tobago', 'West Indies', 'Indies']}

def synonymMapping(GPE):
	GPE_name = GPE.lower()
	for country in synonyms:
		for abbr in synonyms[country]:
			if GPE_name == abbr.lower():
				return country
	return GPE

def isInIndia(GPE_name):
	GPE_name = GPE_name.lower()
	return next((True for item in indian_cities_states if item["name"].lower() == GPE_name or item["state"].lower() == GPE_name), False)

def countryCodeMap(country):
	return next((item["Code"] for item in country_code if item["Name"].lower() == country), False)


def countryCode(GPE_name):
	GPE_name = synonymMapping(GPE_name)
	GPES = GPE_name.split(' ')
	GPE_name = ''
	if(len(GPES) > 1):
		for i, GPE in enumerate(GPES):
			if i > 0:
				GPE_name += ' ' + GPE.capitalize()
			else:
				GPE_name += GPE.capitalize()
	else:
		GPE_name = GPES[0].capitalize()

	#check if not from 
	if not isInIndia(GPE_name):
		if GPE_name in city_country_data:
			return countryCodeMap(GPE_name.lower())
		else:
			for country in city_country_data:
				if GPE_name in city_country_data[country]:
					return countryCodeMap(country.lower())
	else:
		return 'IN'
	return False

fromCountry = {}
errorLog = []

for patient in covid_data:
	if "notes" in patient and patient["notes"] != '':
		doc = nlp(patient["notes"])
		for ent in doc.ents:
			if(ent.label_ == 'GPE'):
				print(ent.text, ent.start_char, ent.end_char, ent.label_)
				fromCountryCode = countryCode(ent.text)
				if fromCountryCode and fromCountryCode != 'IN':
					print(fromCountryCode)
					if patient["patientId"] in fromCountry:
						fromCountry[patient["patientId"]].append(fromCountryCode)
					else:
						fromCountry[patient["patientId"]] = [fromCountryCode]
				else:
					print("fromCountryCode failed")
					print(fromCountryCode)
					if not fromCountryCode:
						errorLog.append(ent.text)
					print(ent.text)

print("FROM COUNTRY DATA")


print()
print(fromCountry)
with open('data.json', 'w') as outfile:
    json.dump(fromCountry, outfile)
print(len(fromCountry))
print()
print("Error log")
print()
print(errorLog)