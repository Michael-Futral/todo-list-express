const express = require('express') //making it possible to use express in this file
const app = express() //setting a variable and assigning it to the instance of express
const MongoClient = require('mongodb').MongoClient //makes it possible to use methods associated with MongoClient and talk to our DB
const PORT = 2121 //creates a variable to determine the location where our server will be listening.
require('dotenv').config() //allos us to look for variable inside of the .env file


let db, //declaring a variable db as a global variable
    dbConnectionStr = process.env.DB_STRING, //setting a variable dbconnectionStr to equal the DB_STRING in the .env file
    dbName = 'todo'//declaring a variable and assigning the name of the database to the one being used

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })//Creating a connecion to MongoDB, and passing in our connection string. Also passing in an additonal property
    .then(client => { //waiting for the connection and proceeding if successful, and passing in all the client information
        console.log(`Connected to ${dbName} Database`) //log to the console a template literal "connected to todo Database"
        db = client.db(dbName) //assigning a value to previously declared db variable that contains dbName
    }) //closing our .then

//middleware
app.set('view engine', 'ejs') //sets ejs as the default render method
app.use(express.static('public')) //set the location for the static location
app.use(express.urlencoded({ extended: true })) //Tells express to decode and encode URLs where the header matches the content. Supports arrays and objects
app.use(express.json()) //Parse JSON content from incoming requests


app.get('/', async (request, response) => { //Starts a GET method when the root route is passed in , sets up req and res parameters
    const todoItems = await db.collection('todos').find().toArray() //sets a variable and awaits ALL items from the todos collection
    const itemsLeft = await db.collection('todos').countDocuments({ completed: false }) //sets a variable and awaits
    response.render('index.ejs', { items: todoItems, left: itemsLeft }) //rendering the EJS file and passing through the db items and the count remaining inside of an object
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
}) //close of get function

app.post('/addTodo', (request, response) => { //starts a POST method when the add route is passed in
    db.collection('todos').insertOne({ thing: request.body.todoItem, completed: false }) //inserts a new item into todos collection, igive is a completed value of false by default
        .then(result => { //if insert is successful, do something
            console.log('Todo Added') //console log action
            response.redirect('/') //gets rid of the /addTodo route, and redirects back to the homepage
        }) //closing the .then
        .catch(error => console.error(error)) //catching errors
}) //ending the POST

app.put('/markComplete', (request, response) => { //starts a PUT method when the markComplete route is passed in
    db.collection('todos').updateOne({ thing: request.body.itemFromJS }, { //look in the db for one item matching the name of the item pass in from the main.js file that was clicked on
        $set: { //
            completed: true //set completed status to true
        } //
    }, { //
        sort: { _id: -1 }, //moves item to the bottom of list
        upsert: false //prevents insertion if item does not alread exist
    }) //
        .then(result => { //starts a then if update was successfull
            console.log('Marked Complete') //loggin successful completion
            response.json('Marked Complete') //sending a response back to the sender
        }) //closing .then
        .catch(error => console.error(error)) //catching errors

}) //ending PUT

app.put('/markUnComplete', (request, response) => { //starts a PUT method when the markUnComplete route is passed in
    db.collection('todos').updateOne({ thing: request.body.itemFromJS }, { //look in the db for one item matching the name of the item pass in from the main.js file that was clicked on
        $set: { //
            completed: false //set completed status to false
        } //
    }, { //
        sort: { _id: -1 }, //moves item to the bottom of the list
        upsert: false //prevents insertion if item does not already exist
    }) //
        .then(result => { //starts a then if update was successful
            console.log('Marked Complete') //loggin successful completion
            response.json('Marked Complete') //sending a response back to the sender
        }) //clsing .then
        .catch(error => console.error(error)) //catching errors

}) //ending PUT

app.delete('/deleteItem', (request, response) => { //starts a delete method when the delete route is passed
    db.collection('todos').deleteOne({ thing: request.body.itemFromJS }) //look inside the todos collection for the ONE item that has a matching name from our JS file
        .then(result => { //starts a then if delete was successful
            console.log('Todo Deleted') //logging successful completion
            response.json('Todo Deleted') //sending a response back to the sender
        }) //closing .then
        .catch(error => console.error(error)) // catching errors

}) //ending delete

app.listen(process.env.PORT || PORT, () => { //setting up which port we will be listening on - either the port from the .env file or the port variable we set
    console.log(`Server running on port ${PORT}`) //console log the running port
}) //end the listener