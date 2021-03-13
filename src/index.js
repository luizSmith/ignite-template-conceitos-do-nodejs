const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const UsersTodo = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

    const user = UsersTodo.find(
        user => user.username === username
    );

    if (!user) {
        return response.status(404).json({
            error: "User not found"
        });
    }

    request.user = user
    return next();
}

app.post('/users', (request, response) => {
  try {
    const { name, username } = request.body

    if (!name) {
      response.status(400).json({
            error: "user name is required"
        });
    }

    if (!username) {
      response.status(400).json({
            error: "user username is required"
        });
    }

    const checksIfUserExists = UsersTodo.some(
        (user) => user.username === username
    );

    if (checksIfUserExists) {
        return response.status(400).json({
            error: "User already exists!"
        });
    }

    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }

    UsersTodo.push(user)

    return response.status(201).json(user);

  } catch (error) {
    response.status(500).json(error);
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  try {
    const { title, deadline } = request.body;
    const { user } = request;

    if (!title) {
      response.status(400).json({
          error: "title is required"
      });
    }

    if (!deadline) {
      response.status(400).json({
          error: "deadline is required"
      });
    }

    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    user.todos.push(todo);

    return response.status(201).json(todo);
    
} catch (error) {
  response.status(500).json(error);
}
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { user } = request;
    const { title, deadline } = request.body;
    const { id } = request.params;

    const todo = user.todos.find(
      todo => todo.id === id
    );

    if (!todo) {
      response.status(404).json({
        error: "Todo not found"
      });
    }

    if (!title) {
      response.status(400).json({
          error: "title is required"
      });
    }

    if (!deadline) {
      response.status(400).json({
          error: "deadline is required"
      });
    }

    todo.title = title
    todo.deadline = new Date(deadline)

    return response.send(todo);
    
  } catch (error) {
    response.status(500).json(error);
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  try {
    const { user } = request;
    const { id } = request.params;

    const todo = user.todos.find(
      todo => todo.id === id
    );

    if (!todo) {
      response.status(404).json({
        error: "Todo not found"
      });
    }

    todo.done = todo.done == true ? false : true; 

    return response.json(todo);
    
  } catch (error) {
    response.status(500).json(error);
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { user } = request;
    const { id } = request.params;

    const deleteTodo = user.todos.findIndex(
        todo => todo.id === id
    )

    if (deleteTodo === -1) {
      response.status(404).json({
        error: "Todo not found"
      });
    }

    user.todos.splice(deleteTodo, 1);

    return response.status(204).json();
    
  } catch (error) {
    response.status(500).json(error);
  }

});

module.exports = app;