
//divs
const mainBox = document.getElementById("main-window");
const detailsBox = document.getElementById("workout-details-box");
const selectBox = document.getElementById("workout-select");
const workoutListTitle = document.getElementById("workout-list-title");

//inputs
const workoutName = document.getElementById("workout-name");
const workoutRest = document.getElementById("workout-rest-days");
const workoutDate = document.getElementById("workout-start-date");

//buttons
const createWorkoutBtn = document.getElementById("create-workout");
const deleteWorkoutBtn = document.getElementById("delete-workout");
const cancelCreationBtn = document.getElementById("cancel-creation");
const saveWorkoutBtn = document.getElementById("save-workout");

function flushUI(){
    mainBox.innerHTML = ""
    selectBox.innerHTML = "";
    workoutListTitle.innerHTML = "";
    
    elements = Array.from(document.getElementsByClassName("hide"));
        elements.forEach(element => {
            element.style.display = "none"
        });
}

//main function to run on page load
document.addEventListener("DOMContentLoaded", function() {

    saveWorkoutBtn.addEventListener("click", saveWorkout);
    createWorkoutBtn.addEventListener("click", showWorkoutForm);
    cancelCreationBtn.addEventListener("click", fetchWorkouts);
    deleteWorkoutBtn.addEventListener("click", deleteWorkout);

    fetchWorkouts();
});


// Fetch workouts and populate the dropdown
function fetchWorkouts() {

    flushUI();

    fetch("/get_workouts/")
        .then(response => response.json())
        .then(data => {
            
            if (data.length === 0) {
                workoutListTitle.style.display = "block";
                workoutListTitle.innerHTML = "No workouts!";
                mainBox.innerHTML = '<button id="create-first-workout">Create New Workout</button>'; //to edit
                document.getElementById("create-first-workout").addEventListener("click", showWorkoutForm);
                return;
            }

            data.forEach(workout => {
                let option = document.createElement("option");
                option.value = workout.id;
                option.textContent = workout.name;
                selectBox.appendChild(option);
            });

            selectBox.style.display = "block";

            selectBox.addEventListener("change", function () {
                loadWorkoutDetails(this.value);
            });

            loadWorkoutDetails(data[0].id);
        })
        .catch(error => console.error("Error fetching workouts:", error));
}

//Load Workout Details
function loadWorkoutDetails(workoutId) {

    createWorkoutBtn.style.display = "block";
    detailsBox.style.display = "block";
    deleteWorkoutBtn.style.display = "block";

    fetch("/get_workouts/")
        .then(response => response.json())
        .then(data => {
            let workout = data.find(w => w.id == workoutId);
            if (!workout) return;

            workoutName.value = workout.name;
            workoutRest.value = workout.restDays;
            workoutDate.value = workout.startDate;

            saveWorkoutBtn.dataset.mode = "edit";

            fetchWorkoutDays(workoutId);
        })
        .catch(error => console.error("Error loading workout details:", error));
}

function showWorkoutForm() {

    flushUI();
    detailsBox.style.display = "block";
    workoutListTitle.style.display = "block"
    workoutListTitle.innerHTML = "Workout Creator"
    cancelCreationBtn.style.display = "block"

    workoutName.value = "";
    workoutRest.value = "";
    workoutDate.value = "";
    
    saveWorkoutBtn.dataset.mode = "create"; 
}

//Update / Create workout
function saveWorkout() {
    let mode = saveWorkoutBtn.dataset.mode;
    let workoutId = selectBox.value;

    let workoutData = {
        name: workoutName.value,
        restDays: workoutRest.value,
        startDate: workoutDate.value,
    };

    if (mode === "edit") {
        fetch(`/update_workout/${workoutId}/`,{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workoutData),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchWorkouts();
        })
        .catch(error => console.error("Error updating workout:", error));
    } else {
        fetch(`/create_workout/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workoutData),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchWorkouts();
        })
        .catch(error => console.error("Error updating workout:", error));
    }
}

// Delete workout
function deleteWorkout() {
    let workoutId = selectBox.value;

    if (!confirm("Are you sure you want to delete this workout?")) return;

    fetch(`/delete_workout/${workoutId}/`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchWorkouts();
    })
    .catch(error => console.error("Error deleting workout:", error));
}

function fetchWorkoutDays(workoutId) {
    fetch(`/fetch_days/${workoutId}/`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error fetching workout days:", data.error);
                return;
            }

            mainBox.innerHTML = '';

            if (data.length === 0) {
                mainBox.innerHTML = "<p>No workout days available.</p>";
                return;
            }

            data.forEach(day => {
                const dayDiv = document.createElement("div");
                dayDiv.classList.add("day-div");
                mainBox.appendChild(dayDiv);

                const dayContent = document.createElement("div");
                dayContent.classList.add("day-content");
                dayDiv.appendChild(dayContent);
                
                const dayNumber = document.createElement("div");
                dayNumber.classList.add("day-number");
                dayContent.appendChild(dayNumber);
                dayNumber.textContent = day.day_order;

                fetchDayExercises(day.id, dayContent);

                const buttonsDiv = document.createElement("div");
                buttonsDiv.classList.add("day-buttons");

                const deleteButtonDiv = document.createElement("div");
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.id = `delete-button-${day.id}`;
                deleteButtonDiv.appendChild(deleteButton);
                dayContent.appendChild(deleteButtonDiv);
                deleteButton.addEventListener("click", () => {
                    deleteDay(day.id, workoutId); 
                });



                const editButtonDiv = document.createElement("div");
                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.id = `edit-button-${day.id}`;
                editButtonDiv.appendChild(editButton);
                dayContent.appendChild(editButtonDiv);

            });

            const dayDiv = document.createElement("div");
            dayDiv.classList.add("new-day-div");
            dayDiv.innerHTML = '<button id="add-day-btn">Add a day</button>'
            mainBox.appendChild(dayDiv);

        })
        .catch(error => {
            console.error("Error fetching workout days:", error);
        });
}

function deleteDay(dayId, workoutId) {
    if (!confirm("Are you sure you want to delete this day?")) return;

    fetch(`/delete_day/${dayId}/`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchWorkoutDays(workoutId);
    })
    .catch(error => console.error("Error deleting workout:", error));
}








function fetchDayExercises(dayId, exercisesBox) {
    fetch(`/fetch_exercises/${dayId}/`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("Error fetching exercises:", data.error);
            return;
        }

        data.forEach(exercise => {  
            const exerciseDiv = document.createElement("div");
            exerciseDiv.classList.add("day-exercise");

            exercisesBox.appendChild(exerciseDiv);

            const nameDiv = document.createElement("div");
            nameDiv.classList.add("workout-exercise-name");
            exerciseDiv.appendChild(nameDiv);
            nameDiv.append(exercise.exercise__name);

            const repsSetsDiv = document.createElement("div");
            repsSetsDiv.classList.add("workout-exercise-reps-sets");
            exerciseDiv.appendChild(repsSetsDiv);
            repsSetsDiv.textContent = `${exercise.sets} X ${exercise.reps}`;

            const weightDiv = document.createElement("div");
            weightDiv.classList.add("workout-exercise-weight");
            exerciseDiv.appendChild(weightDiv);
            weightDiv.textContent = `${exercise.weight} KG`;

            const restDiv = document.createElement("div");
            restDiv.classList.add("workout-exercise-rest");
            exerciseDiv.appendChild(restDiv);
            restDiv.textContent = `${exercise.rest_seconds} s`;
        });
        
    })
    .catch(error => console.error("Fetch error:", error));
}