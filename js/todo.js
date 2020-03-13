
const constants = {
    LIST_ROOT_KEY: "todos",
    NUMBER_OF_TODOS_KEY: "numberOfTodos",

    TODO_LIST_ID: -1,
    TODO_INPUT_EMPTY: "A to-do cannot be empty",

    TICK_TODO_APP_ID: "tick",
    CLOSE_TODO_APP_ID: "close"
};

function closest(element, value) {
    if(element.tagName === value || element.todoAppID === value) return element;
    return element.parentElement ? closest(element.parentElement, value) : null;
}

function find(element, value) {

    const queue = [];
    for(let i=0; i<element.childNodes.length; i++) {
        queue.push(element.childNodes[i]);
    }

    while(queue.length>0) {
        const node = queue.shift();
        if(node.tagName === value || node.todoAppID === value) return node;
        for(let i=0; i<node.childNodes.length; i++) {
            queue.push(node.childNodes[i]);
        }
    }
    return null;
}

function TodoInputView() {
    this.initialize = function(todoAppID, inputOnEnter) {
        const inputField = document.createElement("INPUT");
        inputField.classList.add("todoInput");
        inputField.todoAppID = todoAppID;
        inputField.type = "text";
        inputField.placeholder = "Add a to-do...";
        inputField.onkeypress = event => {
            if(event.code === "Enter") {
                if(!event.target.value) {
                    alert(constants.TODO_INPUT_EMPTY);
                }
                else {
                    inputOnEnter(event.target.value);
                    event.target.value = "";
                }
            }
        };

        this.inputField = inputField;
    };

    this.render = function () {
      return this.inputField;
    };
}

function TodoHeaderView() {
    this.initialize = function(inputOnEnterHandler) {
        const header = document.createElement("DIV");
        header.classList.add("todoHeader");
        header.todoAppID = "todoHeader";
        this.header = header;

        const title = document.createElement("h1");
        title.todoAppID = "todoTitle";
        title.textContent = "To-do list";
        this.title = title;

        const todoInputView = new TodoInputView();
        todoInputView.initialize("todoInput", inputOnEnterHandler);
        this.todoInputView = todoInputView;
    };

    this.render = function () {
        this.header.append(this.title, this.todoInputView.render());
        return this.header;
    };
}

function TodoActionView() {
    this.initialize = function (todoActionOnClick) {
        const action = document.createElement("SPAN");
        action.classList.add("todoAction");
        action.onclick = event => {
            const todo = closest(event.target, "LI");
            todoActionOnClick(todo.todoAppID);
        };
        this.action = action;
    };

    this.render = function () {
      return this.action;
    };

    this.setClass = function(className) {
        this.action.classList.add(className);
    };

    this.setTodoAppID = function(todoAppID) {
        this.action.todoAppID = todoAppID;
    };

    this.setText = function(text) {
        this.action.textContent = text;
    };
}

function TodoItemView() {
    this.initialize = function(todoAppID, inputText, isTicked, todoTickOnClickHandler, todoCloseOnClickHandler) {
        const todo = document.createElement("LI");
        todo.classList.add("todo");
        todo.todoAppID = todoAppID;
        if(isTicked) todo.classList.add("ticked");

        const tickActionView = new TodoActionView();
        tickActionView.initialize(todoTickOnClickHandler);
        tickActionView.setClass("tick");
        tickActionView.setTodoAppID(constants.TICK_TODO_APP_ID);
        tickActionView.setText("\u2713");
        this.tickActionView = tickActionView;

        const todoText = document.createElement("SPAN");
        todoText.textContent = inputText;
        this.text = todoText;

        const closeActionView = new TodoActionView();
        closeActionView.initialize(todoCloseOnClickHandler);
        closeActionView.setClass("close");
        closeActionView.setTodoAppID(constants.CLOSE_TODO_APP_ID);
        closeActionView.setText("\u00D7");
        this.closeActionView = closeActionView;

        this.todo = todo;
    };

    this.render = function () {
        this.todo.append(this.tickActionView.render(), this.text, this.closeActionView.render());
        return this.todo;
    };

    this.tickTodo = function() {
        this.todo.classList.toggle("ticked");
    };
}

function TodoListView() {
    this.initialize = function(todoTickOnClickHandler, todoCloseOnClickHandler) {
        const todoList = document.createElement("UL");
        todoList.classList.add("todoList");
        todoList.todoAppID = constants.TODO_LIST_ID;

        this.todoList = todoList;
        this.createTodoItemViewList();
        this.todoTickOnClickHandler = todoTickOnClickHandler;
        this.todoCloseOnClickHandler = todoCloseOnClickHandler;
    };

    this.render = function () {
      return this.todoList;
    };

    this.createTodoItemViewList = function() {
        this.todoItemViews = {};
    };

    this.addTodo = function(todoAppID, inputText, isTicked) {
        const todoView = new TodoItemView();
        this.todoItemViews[todoAppID] = todoView;
        todoView.initialize(todoAppID, inputText, isTicked, this.todoTickOnClickHandler, this.todoCloseOnClickHandler);
        this.todoList.prepend(todoView.render());
    };

    this.tickTodo = function(todoAppID) {
        const todoView = this.todoItemViews[todoAppID];
        todoView.tickTodo();
    };

    this.deleteTodo = function(todoAppID) {
        const todo = find(this.todoList, todoAppID);
        this.todoList.removeChild(todo);
        delete this.todoItemViews[todoAppID];
    };
}

function TodoAppView() {

    this.initialize = function (inputOnEnterHandler, todoTickOnClickHandler, todoCloseOnClickHandler) {
        const todoHeaderView = new TodoHeaderView();
        todoHeaderView.initialize(inputOnEnterHandler);
        this.todoHeaderView = todoHeaderView;

        const todoListView = new TodoListView();
        todoListView.initialize(todoTickOnClickHandler, todoCloseOnClickHandler);
        this.todoListView = todoListView;
    };

    this.render = function (todos) {
        document.body.append(this.todoHeaderView.render(), this.todoListView.render());
        this.renderAllTodos(todos)
    };

    this.renderAllTodos = function (todos) {
        for(let todoId in todos) {
            const todo = todos[todoId];
            this.todoListView.addTodo(todo.id, todo.text, todo.isTicked);
        }
    };

    this.addTodo = function (todoAppID, inputText, isTicked) {
        this.todoListView.addTodo(todoAppID, inputText, isTicked);
    };

    this.tickTodo = function (todoAppID) {
        this.todoListView.tickTodo(todoAppID);
    };

    this.deleteTodo = function (todoAppID) {
        this.todoListView.deleteTodo(todoAppID);
    };
}

function TodoListModel() {
    this.initialize = function () {
        const numberOfTodos = JSON.parse(localStorage.getItem(constants.NUMBER_OF_TODOS_KEY)) || 0;
        this.numberOfTodos = numberOfTodos;

        const listRoot = JSON.parse(localStorage.getItem(constants.LIST_ROOT_KEY)) || {
            id: constants.TODO_LIST_ID,
            todos: {}
        };
        this.listRoot = listRoot;
    };

    this.commit = function () {
        localStorage.setItem(constants.LIST_ROOT_KEY, JSON.stringify(this.listRoot));
        localStorage.setItem(constants.NUMBER_OF_TODOS_KEY, JSON.stringify(this.numberOfTodos));
    };

    this.createTodo = function (todoText) {
        const todo = {
            id: this.numberOfTodos++,
            text: todoText,
            isTicked: false
        };
        return todo;
    };

    this.addTodo = function (todoText) {
        const todo = this.createTodo(todoText);
        this.listRoot.todos[todo.id] = todo;
        this.commit();
        return todo.id;
    };

    this.tickTodo = function (todoId) {
        const todo = this.listRoot.todos[todoId];
        todo.isTicked = todo.isTicked ? false : true;
        this.commit();
    };

    this.deleteTodo = function (todoId) {
        delete this.listRoot.todos[todoId];
        this.commit();
    };

    this.getAllTodos = function () {
        return {...this.listRoot.todos};
    };
}

function TodoController() {

    this.initialize = function () {
        const todoListModel = new TodoListModel();
        todoListModel.initialize();
        this.todoListModel = todoListModel;

        const todoAppView = new TodoAppView();
        todoAppView.initialize(this.addTodo, this.tickTodo, this.deleteTodo);
        this.todoAppView = todoAppView;

        const todos = this.todoListModel.getAllTodos();
        this.todoAppView.render(todos);
    };

    this.addTodo = (function (inputText) {
        const todoId = this.todoListModel.addTodo(inputText);
        this.todoAppView.addTodo(todoId, inputText, false);
    }).bind(this);

    this.tickTodo = (function (todoId) {
        this.todoListModel.tickTodo(todoId);
        this.todoAppView.tickTodo(todoId);
    }).bind(this);

    this.deleteTodo = (function (todoId) {
        this.todoListModel.deleteTodo(todoId);
        this.todoAppView.deleteTodo(todoId);
    }).bind(this);
}

const todoController = new TodoController();
todoController.initialize();