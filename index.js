const axios = require('axios');
const prompt = require('prompt-sync')();
const fs = require('fs');
const { exit } = require("process");


//finds user ID of existing user for updating
async function findUser(name, key) {
	const response = await axios.get(`https://api.pipedrive.com/v1/persons?api_token=${key}`)
	const json = await response.data;
	for (var user of json.data){
		//if multiple users with same name, will return first one found
		if (user.name == name){
			return user.id
		}
	}
	console.log(`user with name '${name}' not found`)
	exit()
}

//Pass ID in, update with the rest of the non-empty data
async function updateUser(ID, name, email, phone, key) {
	body = {}
	if (name!=""){
		body.name = name
	}
	if (email != ""){
		body.email = email
	}
	if (phone !=""){
		body.phone = phone
	}
	var updatePeopleEndpoint = `https://api.pipedrive.com/v1/persons/${await ID}?api_token=${key}`;
	await axios.put(updatePeopleEndpoint, params = body)
		.then(response => {
			if (response.data.success) {
				console.log(`Sucessfully updated user.`)
				exit()
			}
		})
		.catch(error => console.log(error))
}

//create user with given data
async function createUser(name, email, phone, key) {
	body = {	//name can't be null, so we assume this is populated
		name: name
	}
	if (email != ""){
		body.email = email
	}
	if (phone !=""){
		body.phone = phone
	}
	var addPeopleEndpoint = `https://api.pipedrive.com/v1/persons?api_token=${key}`;
	await axios.post(addPeopleEndpoint, params = body)
		.then(response => {
			if (response.data.success) {
				console.log(`Sucessfully added ${name}.`)
				exit()
			}
		})
		.catch(error => console.log(error))
}

//Gets user input, routes user to correct function
async function ReadUserData() {
	var apiKey = fs.readFileSync("key.txt", "utf8").trim();

	var mode = ""
	while (mode != "create" && mode != "update") {
		mode = prompt("Do you want to `Create` or `Update` a person? ").trim().toLowerCase()
		if (mode == "u") {
			mode = "update"
		}
		if (mode == "c") {
			mode = "create"
		}
	}
	var name = "";
	while (name == "") {
		name = prompt("What is the name of this person? ").trim()
		if (name == "") {
			console.log("You must enter a name.")
		}
	}
	if (mode == "update") {
		var ID = findUser(name, apiKey)
		console.log("To leave data the same, leave the field blank")
		name = prompt("What is the new name of this person? ").trim()
	}

	var email = prompt("What is the email address of this person? ").trim()
	var phone = prompt("What is the phone number of this person? ").trim()

	if (mode == "update") {
		updateUser(ID, name, email, phone, apiKey)
	}
	else {
		createUser(name, email, phone, apiKey)
	}
}
ReadUserData()