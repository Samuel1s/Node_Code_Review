const express = require("express")
const { v4: uuid } = require("uuid")
const app = express()

app.use(express.json())

const repositories = []

function thisRepositoryExist(request, response, next) {
  const { id } = request.params
  const repositoryExist = repositories.some(repository => repository.id === id)

  if(!repositoryExist) {
    return response.status(404).json({ error: "Repository don't exist." })
  }

  next()
}

function blockTaskWhenSetLike(request, response, next) {
  const { likes } = request.body

  if(likes) {
    return response.status(400).json({ "likes": 0 })
  }

  next()
}

app.get("/repositories", (request, response) => {
  return response.json(repositories)
})

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository)

  return response.status(201).json(repository)
})

app.put("/repositories/:id", thisRepositoryExist, blockTaskWhenSetLike, (request, response) => {
  const { id } = request.params
  const updatedRepository = request.body

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repository not found" })
  }

  const repository = { ...repositories[repositoryIndex], ...updatedRepository }

  repositories[repositoryIndex] = repository

  return response.status(201).json(repository)
})

app.delete("/repositories/:id", thisRepositoryExist, (request, response) => {
  const { id } = request.params

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repository not found" })
  }

  repositories.splice(repositoryIndex, 1)

  return response.status(204).send()
})

app.post("/repositories/:id/like", thisRepositoryExist, (request, response) => {
  const { id } = request.params

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repository not found" })
  }

  const likes = ++repositories[repositoryIndex].likes

  return response.status(201).json({ "likes": likes })
})

module.exports = app
