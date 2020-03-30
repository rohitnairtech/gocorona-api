from spacy import load as sp_load
import requests, json

nlp = sp_load("en_core_web_md")

city_country_data = requests.get('https://raw.githubusercontent.com/russ666/all-countries-and-cities-json/6ee538beca8914133259b401ba47a550313e8984/countries.min.json').json()
country_code = requests.get('https://pkgstore.datahub.io/core/country-list/data_json/data/8c458f2d15d9f2119654b29ede6e45b8/data_json.json').json()
indian_cities_states = requests.get('https://raw.githubusercontent.com/nshntarora/Indian-Cities-JSON/master/cities.json').json()
covid_data = requests.get('https://api.rootnet.in/covid19-in/unofficial/covid19india.org/').json()['data']['rawPatientData']
#Adding missing countries and their major cities
city_country_data['Qatar'] = ['Doha', 'Abu az Zuluf', 'Abu Thaylah']
city_country_data['Guyana'] = ['Georgetown', 'Linden', 'New Amsterdam', 'Anna Regina']

#Fixing names of certain countries like, Iran, Islamic Republic to Iran
countryFix = {'IR':'Iran', 'RU': 'Russia'}

for country in country_code:
	loopCount+=1
	if country['Code'] in countryFix:
		country['Name'] = countryFix[country['Code']]
		del countryFix[country['Code']]
	if not countryFix:
		break

#Synonyms mapping to fix issues of abbrevations
synonyms = {'United Kingdom':['UK'],'United States':['US','USA','America'], 'United Arab Emirates':['UAE', 'Emirates', 'Abhudhabi'], 'Trinidad and Tobago':['Trinidad', 'Tobago', 'West Indies', 'Indies']}

def synonymMapping(GPE):
	GPE_name = GPE.lower()
	for country in synonyms:
		for abbr in synonyms[country]:
			if GPE_name == abbr.lower():
				return country
	return GPE

#To check if a place is inIndia or not
def isInIndia(GPE_name):
	return next((True for item in indian_cities_states if item["name"].lower() == GPE_name or item["state"].lower() == GPE_name), False)

def countryCodeMap(country):
	return next((item["Code"] for item in country_code if item["Name"].lower() == country), False)


def countryCode(GPE_name):
	#Normalize data
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

	#check if not from India
	GPE_lower = GPE_name.lower()
	if not isInIndia(GPE_lower):
		if GPE_name in city_country_data:
			return countryCodeMap(GPE_lower)
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
giojs = []

print()
print(fromCountry)


def addGioData(e, i='IN'):
	gioDataLen = len(giojs)
	if gioDataLen:
		for x,gio in enumerate(giojs):
			if gio["e"] == e and gio["i"] == i:
				gio["v"] += 1
				break
			if gioDataLen == (x+1):
				giojs.append({'e':e, 'i':i, 'v':1})
	else:
		print('EEEEE')
		print(e)
		print(i)
		giojs.append({'e':e, 'i':i, 'v':1})	





for country in fromCountry:
	country = fromCountry[country]
	GPE_count = len(country)
	print(GPE_count)
	if GPE_count > 1:
		for x,code in enumerate(country):
			if x == (GPE_count-1):
				addGioData(code, 'IN')
			else:
				print(x)
				print(GPE_count-1)
				print(x == (GPE_count-1))
				addGioData(code, country[x+1])				
	else:
		addGioData(country[0])


with open('patient_id_internation_travel.json', 'w') as outfile:
    json.dump(fromCountry, outfile)

with open('gio.json', 'w') as outfile:
    json.dump(giojs, outfile)
print(len(fromCountry))
print()
print("Error log")
print()
print(errorLog)