# Games Warehouse | Inventory Application

A backend focused Game store app that allows users to add new developers, add new games to the database, and to add new games genres. Genres, developers, and games will all be able to be created, read, updated, or deleted from the database.<br />
Also app has authentication features. Users can create new accounts and log in with them.<br />
It was very challenging to put it all together. Also one of the problem was implementing add image feature. But with help of google and stackoverflow project was complete.

> - [Live Demo](https://radiant-coast-44842.herokuapp.com/)

## Built With

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- Javascript
- [MongoDB](https://www.mongodb.com)
- [Mongoose](https://mongoosejs.com/)
- [EJS view engine](https://ejs.co/)
- [Multer](https://www.npmjs.com/package/multer)
- [Async](caolan.github.io/async/)
- [Heroku](https://www.heroku.com/) - Hosting

### Admin Password:

An administrator password has been added to act as an extremely basic security feature. Resources cannot be deleted from the database unless the admin password, `secretadminpassword`, is entered into the input field.

### Installing and running

```bash
git clone https://github.com/RustamYuburov/inventory-application
cd inventory-application
npm install
npm run serverstart
```

## Showcase

### Homepage

![homepage](https://user-images.githubusercontent.com/66270461/144750617-282280e8-85e9-41a2-894c-9b7d68b00c87.png)

### List of games (is same for developers and genres)

![list-of-items](https://user-images.githubusercontent.com/66270461/144750620-72253e42-1897-476b-a50b-f227c1ae9d7c.png)

### Add new game (is same for developers and genres)

![add-new-item](https://user-images.githubusercontent.com/66270461/144750621-92f407e6-9547-4c9d-87e1-aa100a7f6272.png)