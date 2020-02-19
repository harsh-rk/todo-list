
let getNoteHash = function () {
    let hashPrefix = "Note#";
    let numberOfNotes = 0;

    return function () {
        return hashPrefix + (numberOfNotes++);
    };
}();

let getTaskHash = function () {
    let hashPrefix = "Task#";
    let numberOfTasks = 0;

    return function () {
        return hashPrefix + (numberOfTasks++);
    };
}();

function addCloseButton() {
    let span = document.createElement("SPAN");
    span.className = "close";
    span.onclick = () => this.parentNode.removeChild(this);

    let text = document.createTextNode("\u00D7");
    span.appendChild(text);

    this.appendChild(span);
}

function finishTask() {
    let note = this.parentElement.parentElement;
    if (note.classList.contains("checked") && this.classList.contains("checked")) {
        this.classList.remove("checked");
        note.classList.remove("checked");
        return;
    }
    this.classList.toggle("checked");
}

function addTaskCheckButton() {
    let span = document.createElement("SPAN");
    span.className = "check";
    span.onclick = finishTask.bind(this);

    let text = document.createTextNode("\u2713");
    span.appendChild(text);

    this.prepend(span);
}

function finishNote() {
    this.classList.toggle("checked");
    let children = this.childNodes;
    for(let i=0; i<children.length; i++) {
        let child = children[i];
        if(child.classList && child.classList.contains("taskList")) {
            child.querySelectorAll(".task").forEach(task => {
                task.classList.toggle("checked", this.classList.contains("checked"));
            });
        }
    }
}

function addNoteCheckButton() {
    let span = document.createElement("SPAN");
    span.className = "check";
    span.onclick = finishNote.bind(this);

    let text = document.createTextNode("\u2713");
    span.appendChild(text);

    this.prepend(span);
}

function createTask() {
    let inputText = this.value;
    if(inputText === "") {
        alert("A task cannot be empty");
        return;
    }

    let task = document.createElement("LI");
    task.id = getTaskHash();
    task.classList.add("task");
    addCloseButton.apply(task);
    addTaskCheckButton.apply(task);

    let textNode = document.createTextNode(inputText);
    task.appendChild(textNode);

    let parentNote = this.parentElement.parentElement;
    if(parentNote.classList.contains("checked")) {
        task.classList.toggle("checked");
    }

    let taskList = this.parentElement;
    taskList.insertBefore(task, this);

    this.value = "";
}

function createTaskInput() {
    let taskInput = document.createElement("INPUT");
    taskInput.setAttribute("type", "text");
    taskInput.className = "taskInput";
    taskInput.placeholder = "Add a task...";
    taskInput.onkeypress = (event) => {
        if(event.key === "Enter") {
            let taskInput = event.target;
            createTask.call(taskInput);
        }
    };

    this.appendChild(taskInput);
}

function createTaskList() {
    let taskList = document.createElement("UL");
    taskList.className = "taskList";
    createTaskInput.apply(taskList);

    return taskList;
}

function createNote() {
    let inputValue = this.value;
    if (inputValue === "") {
        alert("A note cannot be empty");
        return;
    }

    let note = document.createElement("LI");
    note.id = getNoteHash()
    note.classList.add("note");
    addCloseButton.apply(note);
    addNoteCheckButton.apply(note);

    let textNode = document.createTextNode(inputValue);
    note.appendChild(textNode);

    note.appendChild(createTaskList());
    document.getElementById("noteList").appendChild(note);
    this.value = "";
}

//------------------- Setting up static elements -----------------------

Array.from(document.getElementsByClassName("note")).forEach(item => {
    item.id = getNoteHash();
    addCloseButton.apply(item);
    addNoteCheckButton.apply(item);
});

Array.from(document.getElementsByClassName("task")).forEach(item => {
    item.id = getTaskHash();
    addCloseButton.apply(item);
    addTaskCheckButton.apply(item);
});

Array.from(document.getElementsByClassName("taskInput")).forEach(element => {
    element.addEventListener("keypress", function (event) {
        if(event.key === "Enter") {
            let taskInput = event.target;
            createTask.apply(taskInput);
        }
    });
});

//------------------- Event listeners -----------------------

let noteInput = document.getElementById("noteInput");

noteInput.addEventListener("keypress", (event) => {
    if(event.key === "Enter") {
        let noteInput = event.target;
        createNote.apply(noteInput);
    }
});
