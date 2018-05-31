const db = require('sqlite')
const bodyParser = require('body-parser')

const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080

// DATABASE
db.open('expressapi.db').then(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (pseudo, email, firstname, lastname, createdAt, updatedAt)')
    .then(() => {
      console.log('> Database ready')
    }).catch((err) => { // Si on a eu des erreurs
      console.error('ERR> ', err)
    })
});

// BODY PARSER
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

// LOGGER
app.use((req, res, next) => {
  next()
  console.log('REQUEST: ' + req.method + ' ' + req.url)
})

// DEFAULT ROUTE
app.get('/', (req, res, next) => {
  res.send('Bienvenue sur notre superbe API!')
})

app.set('views', './views') 
app.set('view engine', 'ejs')

// GET ALL USERS
app.get('/users', (req, res, next) => {

  // FONCTIONNEMENT DE BASE
  const limit = `LIMIT ${req.query.limit || 100}`
  const offset = `OFFSET ${ req.query.offset || 0}`
  const query = `SELECT * FROM users ${limit} ${offset}`

  db.all(query)
  .then((users) => {
    res.format({
      html: () => { res.render('users/index', {
        users: users
      }) },
      json: () => { res.send(users) }
    })
  }).catch(next)
.catch(next)
})

//get - méthode post
app.get('/users/create', (req, res, next) =>{
  res.render('post', {
    title: 'méthode post',
    name: 'Tata', 
    content: 'page post nodejs',
    action: '/users/create'
  })
})

//post + db
app.post('/users/create', (req, res, next) =>{
  console.log(req.body)
  db.run("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", req.body.pseudo, req.body.email, req.body.firstname, req.body.lastname, new Date(), null)
  .then(() => {
    res.redirect('/users')
  })
  .catch(next)
})

// DELETE USER
app.delete('/users/:userId', (req, res, next) => {
  db.run('DELETE FROM users WHERE ROWID = ?', req.params.userId)
  .then(() => {
    res.redirect('/users')
  }).catch(next)
})


// UPDATE USER
app.put('/users/:userId', (req, res, next) => {
  db.run("UPDATE users SET pseudo = ?, email = ?, firstname = ?, lastname = ?, updatedAt= ? WHERE rowid = ?",req.body.pseudo, req.body.email, req.body.firstname, req.body.lastname, new Date(), req.params.userId)
  .then((users) => {
    res.format({
      html: () => { res.render('users/index', {
        users: users
      }) },
      json: () => { res.send(users) }
    })
  }).catch(next)
.catch(next)
})

// ERROR
app.use((err, req, res, next) => {
  console.log('ERR: ' + err)
  res.status(500)
  res.send('marche pas gros nul')
})

// 501
app.use((req, res) => {
  res.status(501)
  res.end('marche toujours pas gros nul')
})

app.listen(PORT, () => {
  console.log('Server running on port: ' + PORT)
})

