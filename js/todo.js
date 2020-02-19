
const TASK_LIST_ID = -1;
const TASK_INPUT_EMPTY = "A task cannot be empty";
const FAILURE = "failure";
const LIST_ROOT_KEY = "todos";
const NUMBER_OF_TASKS_KEY = "numberOfTasks";

let model = (function () {
    let numberOfTasks = JSON.parse(localStorage.getItem(NUMBER_OF_TASKS_KEY)) || 0;
    let listRoot = JSON.parse(localStorage.getItem(LIST_ROOT_KEY)) || {
        id: TASK_LIST_ID,
        tasks: {}
    };

    function commit() {
        localStorage.setItem(LIST_ROOT_KEY, JSON.stringify(listRoot));
        localStorage.setItem(NUMBER_OF_TASKS_KEY, JSON.stringify(numberOfTasks));
    }

    function findTaskAndParent(taskId) {
        if(taskId === listRoot.id) {
            return {
                task: listRoot,
                parentTask: null
            };
        }

        let tasks = this.tasks;
        if(tasks && tasks.hasOwnProperty(taskId)) {
            return {
                task: tasks[taskId],
                parentTask: this
            };
        }
        else {
            for(let subTaskId in tasks) {
                let findResult = findTaskAndParent.call(tasks[subTaskId], taskId);
                if(findResult !== FAILURE) return findResult;
            }
            return FAILURE;
        }
    }

    function addTask(parentTask, inputText) {
        let task = {
            id: numberOfTasks++,
            parentId: parentTask.id,
            text: inputText,
            checked: parentTask.checked ? true: false,
            tasks: {}
        };

        parentTask.tasks[task.id] = task;
        commit();
    }

    function toggleSubTasks() {
        let tasks = this.tasks;
        for(let subTaskId in tasks) {
            let task = tasks[subTaskId];
            task.checked = this.checked;
            toggleSubTasks.call(task);
        }
    }

    function toggleParentTasks() {
        let findResult = findTaskAndParent.call(listRoot, this.id);
        let task  = findResult.task;
        let parentTask = findResult.parentTask;

        if(parentTask && parentTask.checked && !task.checked) {
            parentTask.checked = false;
            toggleParentTasks.call(parentTask);
        }
    }

    function addToTask(taskId, inputText) {
        let findResult = findTaskAndParent.call(listRoot, taskId);
        addTask(findResult.task, inputText);
    }

    function toggleTask(taskId) {
        let findResult = findTaskAndParent.call(listRoot, taskId);
        let task = findResult.task;
        task.checked = task.checked ? false : true;

        toggleParentTasks.call(task);
        toggleSubTasks.call(task);
        commit();
    }

    function deleteTask(taskId) {
        let findResult = findTaskAndParent.call(listRoot, taskId);
        let parentTask = findResult.parentTask;
        delete parentTask.tasks[taskId];
        commit();
    }

    function getAllTasks() {
        return listRoot.tasks;
    }

    function printTask(taskId) {
        console.log(findTaskAndParent.call(listRoot, taskId));
    }

    return {
        addToTask,
        toggleTask,
        deleteTask,
        getAllTasks
    }
})();

let view = (function () {

    function createElement(tag, className) {
        const element = document.createElement(tag);
        if(className) element.classList.add(className);
        return element;
    }

    function getElement(selector) {
        const element = document.querySelector(selector);
        return element;
    }

    function clearTaskList() {
        while(taskList.firstChild) {
            taskList.removeChild(taskList.firstChild);
        }
    }

    function createInputElement(parentId) {
        let input = createElement("INPUT");
        input.id = parentId;
        input.type = "text";
        input.placeholder = "Add a task...";
        return input;
    }

    function createTaskElement(task) {
        const li = createElement("LI", "task");
        li.id = task.id;
        if(task.checked) li.classList.add("checked");

        const toggle = createElement("SPAN", "action");
        toggle.classList.add("check");
        toggle.textContent = "\u2713";

        const taskText = createElement("SPAN");
        taskText.textContent = task.text;

        const close = createElement("SPAN", "action");
        close.classList.add("close");
        close.textContent = "\u00D7";

        let subTaskList = createElement("UL", "taskList");
        let subTasks = task.tasks;
        for(let subTaskId in subTasks) {
            subTaskList.appendChild(createTaskElement(subTasks[subTaskId]));
        }
        subTaskList.append(createInputElement(task.id));

        li.append(toggle, taskText, subTaskList, close);
        return li;
    }

    function renderTasks(tasks) {
        clearTaskList();

        for(let taskId in tasks) {
            taskList.append(createTaskElement(tasks[taskId]));
        }
    }

    function bindAddToTask(handler) {
        function inputOnEnter(event) {
            if(event.target.tagName === "INPUT" && event.key === "Enter") {
                if(event.target.value === "") {
                    alert(TASK_INPUT_EMPTY);
                }
                else {
                    handler(event.target.id, event.target.value);
                    event.target.value = "";
                }
            }
        }

        header.addEventListener("keypress", inputOnEnter);
        taskList.addEventListener("keypress", inputOnEnter);
    }

    function bindToggleTask(handler) {
        taskList.addEventListener("click", (event) => {
            if(event.target.classList.contains("check")) {
                let task = event.target.closest("LI");
                handler(task.id);
            }
        });
    }

    function bindDeleteTask(handler) {
        taskList.addEventListener("click", (event) => {
            if(event.target.classList.contains("close")) {
                let task = event.target.closest("LI");
                handler(task.id);
            }
        });
    }

    let header = getElement(".todoHeader");
    let title = createElement("h1");
    title.textContent = "To-do list";
    header.append(title);
    header.append(createInputElement(TASK_LIST_ID));

    let taskView = getElement(".viewTodos");
    let taskList = createElement("UL", "taskList");
    taskView.append(taskList);

    return {
        renderTasks,
        bindAddToTask,
        bindToggleTask,
        bindDeleteTask
    }
})();

let todoController =
    (function (model, view) {

        function getAllTasks() {
            return model.getAllTasks();
        }

        function renderTasks() {
            let tasks = getAllTasks();
            view.renderTasks(tasks);
        }

        function addToTask(taskId, inputText) {
            let taskIdNum = Number(taskId);
            model.addToTask(taskIdNum, inputText);
            renderTasks();
        }

        function toggleTask(taskId) {
            let taskIdNum = Number(taskId);
            model.toggleTask(taskIdNum);
            renderTasks();
        }

        function deleteTask(taskId) {
            let taskIdNum = Number(taskId);
            model.deleteTask(taskIdNum);
            renderTasks();
        }

        renderTasks();
        view.bindAddToTask(addToTask);
        view.bindToggleTask(toggleTask);
        view.bindDeleteTask(deleteTask);
    })(model, view);