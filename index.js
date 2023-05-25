// const express = require('express')
import express from 'express'
const app = express()
const port = process.env.port || 3000

app.use(express.static('./'))
app.get('/', (req, res) => {
  res.sendFile('./index.html')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})