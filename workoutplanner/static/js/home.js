document.addEventListener("DOMContentLoaded", function() 
{  
    getWorkout(8);
});


function getWorkout(workoutId){
    document.getElementById("mainMenu").style.display = "flex";
    document.getElementById("workoutMenu").style.display = "none";

    fetch(`/get_workout/${workoutId}`)
    .then(response => response.json())
    .then(data =>{

        const startDate = new Date(data.workout_plan.startDate);
        const currentDate = new Date();

        const startDateString = startDate.toISOString().split('T')[0]; 
        const currentDateString = currentDate.toISOString().split('T')[0];

        startDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        console.log(startDateString);
        console.log(currentDateString);

        if (data.error) {
            console.error("Error fetching workout:", data.error);
            return;
        }

        if (startDateString === currentDateString) {

            data.exercises_for_today.forEach(exercise =>{
                createUi(exercise, "exercisesBox");
            });
    
            document.getElementById("workoutTitle").innerHTML = `${data.workout_plan.name} - Day ${data.workout_plan.current_day}`;

        } else {
            console.log("dupa");
            const daysToWorkout = Math.floor((startDate - currentDate) / (1000 * 60 * 60 * 24));

            if (daysToWorkout == 1){
                exercisesBox.innerHTML = `<div class="day-message"> No workout for today! <br> Come back in ${daysToWorkout} day. </div>`;

            }
            else{
                exercisesBox.innerHTML = `<div class="day-message"> No workout for today! <br> Come back in ${daysToWorkout} days. </div>`;
            }

            document.getElementById("buttonBox").style.display = "none";
            document.getElementById("startButton").disabled = true;
            document.getElementById("postponeButton").disabled = true;
            document.getElementById("skipButton").disabled = true;
        }

        document.getElementById("postopneButton").onclick = function() {
            postponeWorkout(workoutId, startDateString);
            getWorkout(workoutId);
        };

        document.getElementById("startButton").onclick = function() {
            displayWorkout(data);
        };

    })

    function postponeWorkout(workoutId, startDateString){

        let startDate = new Date(startDateString);
        startDate.setDate(startDate.getDate() + 1);
        startDate = startDate.toISOString().split('T')[0];

        let workoutData = {
            startDate: startDate,
        }

        fetch(`/update_workout_time/${workoutId}/`,{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workoutData),
       })
       .then(response => response.json())
       .then(data => {
           console.log(data.message);
       })
       .catch(error => console.error("Error updating workout:", error));
    }

}

function createUi(exercise, parentDivId){
    const mainBox = document.getElementById(parentDivId);

    //exercise div
    const exerciseDiv = document.createElement("div");
    exerciseDiv.classList.add("exercise")
    mainBox.appendChild(exerciseDiv);

    //info div
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("display-info");
    exerciseDiv.appendChild(infoDiv);

    const setsRepsDiv = document.createElement("div");
    setsRepsDiv.classList.add("display-sets-reps");
    infoDiv.appendChild(setsRepsDiv);

    const weightDiv = document.createElement("div");
    weightDiv.classList.add("display-weight");
    infoDiv.appendChild(weightDiv);

    //name div
    const nameDiv = document.createElement("div");
    nameDiv.classList.add("display-name");
    exerciseDiv.appendChild(nameDiv);

    //rest div
    const restDiv = document.createElement("div");
    restDiv.classList.add("display-rest");
    exerciseDiv.appendChild(restDiv);

    setsRepsDiv.innerHTML = `${exercise.sets} sets x ${exercise.reps} reps`;
    weightDiv.innerHTML = `${exercise.weight} KG`;
    nameDiv.innerHTML = `${exercise.exercise_name}`;
    restDiv.innerHTML = `Rest: ${exercise.rest_seconds}s`;
}

function displayWorkout(workout){
    const exerciseButton = document.getElementById("exerciseButton");
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("workoutMenu").style.display = "flex";

    document.getElementById("cancelWorkout").onclick = function() {
        document.getElementById("mainMenu").style.display = "flex";
        document.getElementById("workoutMenu").style.display = "none";
        return
    };

    let currentExerciseNumber = 0
    displayExercise(currentExerciseNumber);

    exerciseButton.value = "Start Workout";
    exerciseButton.onclick = function() {
        startExercise
        // currentExerciseNumber++;

        // if (currentExerciseNumber == workout.exercises_for_today.length){
        //     finishWorkout();
        // }
        // else{
        //     currentExercise = workout.exercises_for_today[currentExerciseNumber];
        //     displaySets(currentExercise);
        // }
    };


    function displayExercise(currentExerciseNumber){
        document.getElementById("setsWindow").innerHTML = "";
        currentExercise = workout.exercises_for_today[currentExerciseNumber];
        displaySets(currentExercise);

        let currentSetNumber = 0;

        if (currentSetNumber == 0){
            exerciseButton.value = "Start Workout";
        }
        else if (currentSetNumber == currentExercise.sets - 1){
            exerciseButton.value
        }

    }




    function displaySets(currentExercise){
        const setsWindow = document.getElementById("setsWindow");
        document.getElementById("exerciseName").innerHTML = `${currentExercise.exercise_name}`;
        document.getElementById("exerciseDescription").innerHTML = `${currentExercise.exercise_description}`;

        for (let i = 0; i < currentExercise.sets; i++){

            const setDiv = document.createElement("div");
            setDiv.classList.add("exercise-set");
            setsWindow.appendChild(setDiv);

            const restDiv = document.createElement("div");
            const weightDiv = document.createElement("div");
            const currentRepDiv = document.createElement("div");
            const repDiv = document.createElement("div");

            restDiv.classList.add("exercise-rest");
            setDiv.appendChild(restDiv);
            weightDiv.classList.add("exercise-weight");
            setDiv.appendChild(weightDiv);
            currentRepDiv.classList.add("exercise-rep");
            setDiv.appendChild(currentRepDiv);
            repDiv.classList.add("exercise-rep");
            setDiv.appendChild(repDiv);

            restDiv.innerHTML = `Rest ${currentExercise.rest_seconds} s`;
            weightDiv.innerHTML = `${currentExercise.weight} KG X ${currentExercise.reps} REPS`;
            currentRepDiv.innerHTML = "<p>Current reps</p>";
            repDiv.innerHTML = `<p>Set reps</p>${currentExercise.reps}`;

            repInput = document.createElement("input");
            repInput.id = `input${i}`;
            repInput.disabled = true;
            repInput.classList.add("input-field");
            currentRepDiv.appendChild(repInput);
        }

    }
    
    function finishWorkout(){
        console.log("workout finished");
    }
}

