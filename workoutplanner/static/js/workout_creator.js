
//divs
const mainBox = document.getElementById("mainWindow");
const workoutDetailsBox = document.getElementById("workoutDetailsBox");
const selectBox = document.getElementById("selectBox");
const titleTextBox = document.getElementById("titleTextBox");
const secondaryBox = document.getElementById("secondaryBox");
const exerciseListBox = document.getElementById("exerciseListBox");

const searchBox = document.getElementById("exercise-search-box");
const categoryFilter = document.getElementById("categoryFilter");
const exerciseCategories = document.querySelectorAll(".exercise-category");
const libraryWindow = document.getElementById("libraryWindow");

//inputs
const workoutName = document.getElementById("workoutName");
const workoutRest = document.getElementById("workoutRestDays");
const workoutDate = document.getElementById("workoutStartDate");

//buttons
const createWorkoutBtn = document.getElementById("createWorkout");
const deleteWorkoutBtn = document.getElementById("deleteWorkout");
const cancelCreationBtn = document.getElementById("cancelCreation");
const saveWorkoutBtn = document.getElementById("saveWorkout");

let isSelectBoxListenerAdded = false;

//main function to run on page load
document.addEventListener("DOMContentLoaded", function() {
    fetchWorkouts();
});

function flushUI(){
    mainBox.innerHTML = ""
    titleTextBox.innerHTML = "";

    elements = Array.from(document.getElementsByClassName("hide"));
        elements.forEach(element => {
            element.style.display = "none"
        });
}

/*========== Workouts ==========*/

// Fetch workouts and populate the dropdown
function fetchWorkouts(workoutId = null) {

    flushUI();

    saveWorkoutBtn.onclick = () => saveWorkout();
    createWorkoutBtn.onclick = () => showWorkoutForm();
    cancelCreationBtn.onclick = () => fetchWorkouts();
    deleteWorkoutBtn.onclick = () => deleteWorkout();
    secondaryBox.style.display = "flex";

    fetch("/get_workouts/")
        .then(response => response.json())
        .then(data => {
            
            if (data.length === 0) {
                titleTextBox.style.display = "block";
                titleTextBox.innerHTML = "No workouts!";
                mainBox.innerHTML = '<button id="createFirstWorkout">Create New Workout +</button>'; //to edit
                document.getElementById("createFirstWorkout").onclick = () => showWorkoutForm();
                return;
            }

            selectBox.innerHTML = "";

            // selectBox.innerHTML = "";
            data.forEach(workout => {
                let option = document.createElement("option");
                option.value = workout.id;
                option.textContent = workout.name;
                selectBox.appendChild(option);
            });

            selectBox.style.display = "block";

            // Add event listener only if it hasn't been added yet
            if (!isSelectBoxListenerAdded) {
                selectBox.addEventListener("change", function () {
                    loadWorkoutDetails(this.value);
                });
                isSelectBoxListenerAdded = true; // Set the flag to true
            }

            if (!workoutId){
                loadWorkoutDetails(data[0].id);
            }else{
                loadWorkoutDetails(workoutId);
            }


        })
        .catch(error => console.error("Error fetching workouts:", error));
}

//Load Workout Details
function loadWorkoutDetails(workoutId) {

    createWorkoutBtn.style.display = "block";
    workoutDetailsBox.style.display = "flex";
    deleteWorkoutBtn.style.display = "block";


    fetch("/get_workouts/")
        .then(response => response.json())
        .then(data => {
            let workout = data.find(w => w.id == workoutId);
            if (!workout) return;

            workoutName.value = workout.name;
            workoutRest.value = workout.restDays;
            workoutDate.value = workout.startDate;

            selectBox.value = workout.id;
            
            saveWorkoutBtn.dataset.mode = "edit";

            fetchWorkoutDays(workoutId);
        })
        .catch(error => console.error("Error loading workout details:", error));
}

//Show form to create new workout
function showWorkoutForm() {

    flushUI();
    secondaryBox.style.display = "flex";
    workoutDetailsBox.style.display = "flex";
    titleTextBox.style.display = "block"
    titleTextBox.innerHTML = "Workout Creator"
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
            console.log(data.message);
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
            console.log(data.message);
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
        console.log(data.message);
        fetchWorkouts();
    })
    .catch(error => console.error("Error deleting workout:", error));
}


/*========== Days ==========*/

//Display all days
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
                const createDayButton = document.createElement("button");
                mainBox.appendChild(createDayButton);
                createDayButton.textContent = "Add a day";
                createDayButton.id = "addDayBtn";

                createDayButton.onclick = () => createDay(workoutId);
    
                return;
            }

            data.forEach(day => {
                //create main day div
                const dayDiv = document.createElement("div");
                dayDiv.classList.add("workout-day");
                mainBox.appendChild(dayDiv);

                //create day's content div
                const dayContent = document.createElement("div");
                dayContent.classList.add("day-content");
                dayDiv.appendChild(dayContent);
                
                //create day order div
                const dayNumber = document.createElement("div");
                dayNumber.classList.add("day-number");
                dayContent.appendChild(dayNumber);
                dayNumber.textContent = day.day_order;

                //fetch exercises and create divs
                displayExercises(day.id, dayContent); 

                //create div for edit/delete buttons
                const buttonsDiv = document.createElement("div");
                buttonsDiv.classList.add("day-buttons");
                dayDiv.appendChild(buttonsDiv);

                //create delete button
                const deleteButtonDiv = document.createElement("div");
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.id = `delete-button-${day.id}`;
                deleteButtonDiv.appendChild(deleteButton);

                deleteButton.onclick = () => deleteDay(day.id, workoutId); 
                
                buttonsDiv.appendChild(deleteButtonDiv);

                //create edit button
                const editButtonDiv = document.createElement("div");
                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.id = `edit-button-${day.id}`;
                editButtonDiv.appendChild(editButton);

                editButton.onclick = () => displayDay(day, workoutId); 

                buttonsDiv.appendChild(editButtonDiv);
            });

            const createDayButton = document.createElement("button");
            mainBox.appendChild(createDayButton);
            createDayButton.textContent = "Add a day";
            createDayButton.id = "addDayBtn";

            createDayButton.onclick = () => createDay(workoutId); 

        })
        .catch(error => {
            console.error("Error fetching workout days:", error);
        });
}
//Populate exercises in a specific div
function displayExercises(dayId, exerciseBox) {

    fetch(`/fetch_exercises/${dayId}/`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("Error fetching exercises:", data.error);
            return;
        }

        data.forEach(exercise => {  
            //create div for exercise
            const exerciseDiv = document.createElement("div");
            exerciseDiv.classList.add("workout-exercise");
            exerciseBox.appendChild(exerciseDiv);

            //append with name
            const nameDiv = document.createElement("div");
            nameDiv.classList.add("workout-exercise-name");
            exerciseDiv.appendChild(nameDiv);
            nameDiv.append(exercise.exercise__name);

            //append with reps/sets
            const repsSetsDiv = document.createElement("div");
            repsSetsDiv.classList.add("workout-exercise-reps-sets");
            exerciseDiv.appendChild(repsSetsDiv);
            repsSetsDiv.textContent = `${exercise.sets} X ${exercise.reps}`;

            //create div for weight and rest
            const weightRestDiv = document.createElement("div");
            weightRestDiv.classList.add("workout-exercise-weight-rest");
            exerciseDiv.appendChild(weightRestDiv);

            //append with weight
            const weightDiv = document.createElement("div");
            weightDiv.classList.add("workout-exercise-weight");
            weightRestDiv.appendChild(weightDiv);
            weightDiv.textContent = `${exercise.weight} KG`;

            //append with rest time
            const restDiv = document.createElement("div");
            restDiv.classList.add("workout-exercise-rest");
            weightRestDiv.appendChild(restDiv);
            restDiv.textContent = `${exercise.rest_seconds} s`;
        });
        
    })
    .catch(error => console.error("Fetch error:", error));
}

//createDay
function createDay(workoutId){
    fetch(`/create_day/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workout_plan_id: workoutId })  
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        fetchWorkoutDays(workoutId);
    })
    .catch(error => console.error("Error adding day:", error));
}

//deleteDay
function deleteDay(dayId, workoutId) {
    if (!confirm("Are you sure you want to delete this day?")) return;

    fetch(`/delete_day/${dayId}/`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        fetchWorkoutDays(workoutId);
    })
    .catch(error => console.error("Error deleting day:", error));
}


/*========== Exercises ==========*/

//array of exercises
let pendingExercises = [];


//open day mnenu
function displayDay(day, workoutId){

    flushUI();

    titleTextBox.style.display = "block";
    titleTextBox.textContent=`Day: ${day.day_order}`;

    let saveDayButton = document.getElementById("saveDay");
    saveDayButton.onclick = () => saveChanges(day.id, workoutId);

    let cancelDayCreation = document.getElementById("cancelDayCreation");
    cancelDayCreation.onclick = () => fetchWorkouts(workoutId);

    loadExerciseList();

    loadExercises(day.id);

}

//fetch exercises and map them to an array
function loadExercises(dayId) {
    fetch(`/fetch_exercises/${dayId}/`)
        .then(response => response.json())
        .then(data => {
            pendingExercises = data.map(exercise => ({
                id: exercise.id,
                exercise_id: exercise.exercise__id,
                name: exercise.exercise__name,
                weight: exercise.weight,
                sets: exercise.sets,
                reps: exercise.reps,
                rest_seconds: exercise.rest_seconds,
                exercise_order: exercise.exercise_order,
                action: "unchanged" // Track changes
            }));
            
            renderExercises();
        });
}

//display exercises from the array
function renderExercises() {
    mainBox.innerHTML = "";
    let order = 1;
    pendingExercises.forEach((exercise, index) => {
        if (exercise.action === "deleted") return; 

        const exerciseDiv = document.createElement("div");
        exerciseDiv.classList.add("day-exercise-box");
        mainBox.appendChild(exerciseDiv);

        const exerciseDetails = document.createElement("div");
        exerciseDetails.classList.add("exercise-details-box");
        exerciseDiv.appendChild(exerciseDetails);

        const removeBtnDiv = document.createElement("div");
        exerciseDiv.appendChild(removeBtnDiv);

        let removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtnDiv.appendChild(removeBtn);

        removeBtn.onclick = () => removeExercise(index);

        const orderDiv = document.createElement("div");
        orderDiv.textContent = order;

        const nameDiv = document.createElement("div");
        nameDiv.textContent = exercise.name;

        const weightInput = document.createElement("input");
        weightInput.value = exercise.weight;
        weightInput.addEventListener("input", () => updateExercise(index, "weight", weightInput.value));

        const setsInput = document.createElement("input");
        setsInput.value = exercise.sets;
        setsInput.addEventListener("input", () => updateExercise(index, "sets", setsInput.value));

        const repsInput = document.createElement("input");
        repsInput.value = exercise.reps;
        repsInput.addEventListener("input", () => updateExercise(index, "reps", repsInput.value));

        const restInput = document.createElement("input");
        restInput.value = exercise.rest_seconds;
        restInput.addEventListener("input", () => updateExercise(index, "rest_seconds", restInput.value));

        exerciseDetails.appendChild(orderDiv);
        exerciseDetails.appendChild(nameDiv);
        exerciseDetails.appendChild(weightInput);
        exerciseDetails.appendChild(setsInput);
        exerciseDetails.appendChild(repsInput);
        exerciseDetails.appendChild(restInput);

        order++;
    });
}

//add exercise to the array
function addExercise(exerciseId, name) {
    pendingExercises.push({
        id: null,
        exercise_id: exerciseId,
        name: name,
        weight: 0,
        sets: 0,
        reps: 0,
        rest_seconds: 0,
        exercise_order: pendingExercises.length + 1,
        action: "added"
    });

    renderExercises();
}

//remove exercise from the array
function removeExercise(index) {
    if (pendingExercises[index].id) {
        pendingExercises[index].action = "deleted";
    } else {
        pendingExercises.splice(index, 1);
    }
    renderExercises();
}

//update exercise in the array
function updateExercise(index, field, value) {
    pendingExercises[index][field] = value;
    if (pendingExercises[index].action !== "added") {
        pendingExercises[index].action = "updated";
    }
}

//save exercise changes to the database
function saveChanges(dayId, workoutId) {
    fetch(`/update_exercises/${dayId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingExercises),
    })
    .then(response => response.json())
    .then(data => {
        titleTextBox.style.display = "none";
        exerciseListBox.style.display = "none";
        libraryWindow.style.display = "none";

        selectBox.style.display = "block";
        workoutDetailsBox.style.display = "flex";

        fetchWorkoutDays(workoutId);
    })
    .catch(error => console.error("Error:", error));
}


//load list of exercises
function loadExerciseList(){

    filterExercises();

    secondaryBox.style.display = "flex";
    exerciseListBox.style.display = "flex";
    libraryWindow.style.display = "flex";
    const exerciseLinks = document.querySelectorAll('.exercise-link');

    exerciseLinks.forEach(link => {
        link.onclick = function(e) {
            e.preventDefault(); 
    
            const exerciseId = this.getAttribute('data-exercise-id');
    
            fetch(`/exercise/${exerciseId}/details/`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error(data.error);
                        return;
                    }

                    addExercise(exerciseId, data.name);

                })
                .catch(error => console.error('Error:', error));
        };
    });

}

//turn on filtering for the exercise list
function filterExercises() {
    searchBox.addEventListener("input", filterExercises);
    const searchText = searchBox.value.toLowerCase();


    exerciseCategories.forEach((category) => {
        let hasVisibleExercise = false;
        const exercises = category.querySelectorAll(".exercise-item");

        exercises.forEach((exercise) => {
            const exerciseName = exercise.textContent.toLowerCase();

            if (exerciseName.includes(searchText)) {
                exercise.style.display = "block";
                hasVisibleExercise = true;
            } else {
                exercise.style.display = "none";
            }
        });

        if (hasVisibleExercise) {
            category.style.display = "block";
        } else {
            category.style.display = "none";
        }
    });

    categoryFilter.addEventListener("change", function () {
        const selectedCategory = categoryFilter.value; 

        exerciseCategories.forEach((item) => {
            const exerciseCategory = item.getAttribute("data-category-id");

            if (selectedCategory === "all" || exerciseCategory === selectedCategory) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    });
}

