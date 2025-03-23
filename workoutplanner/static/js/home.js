document.addEventListener("DOMContentLoaded", function() 
{  
    getDefaultWorkout();
});


function getDefaultWorkout(){
    document.getElementById("mainMenu").style.display = "flex";
    document.getElementById("workoutMenu").style.display = "none";

    fetch(`/get_default_workout/`)
    .then(response => response.json())
    .then(data =>{

        if (data.message) {
            document.getElementById("exercisesBox").innerHTML = `<p>${data.message}</p>`;
            document.getElementById("buttonBox").style.display = "none";
            return;
        }

        const startDate = new Date(data.workout_plan.startDate);
        const currentDate = new Date();

        const startDateString = startDate.toISOString().split('T')[0]; 
        const currentDateString = currentDate.toISOString().split('T')[0];

        startDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        console.log(startDateString);
        console.log(currentDateString);

        document.getElementById("workoutTitle").innerHTML = `${data.workout_plan.name} - Day ${data.workout_plan.current_day}`;

        if (data.error) {
            console.error("Error fetching workout:", data.error);
            return;
        }

        if (startDateString === currentDateString) {

            console.log(data.exercises_for_today.length);

            if (data.exercises_for_today.length === 0){
                document.getElementById("exercisesBox").innerHTML = "<p>No exercises! </br> Please add exercises in the creator.</p>";
                return
            }

            data.exercises_for_today.forEach(exercise =>{
                createUi(exercise, "exercisesBox");
            });
    
        } else {
            console.log("dupa");
            const daysToWorkout = Math.floor((startDate - currentDate) / (1000 * 60 * 60 * 24)) - 1;

            if (daysToWorkout == 1){
                exercisesBox.innerHTML = `<div class="day-message"> No workout for today! <br> Come back in ${daysToWorkout} day. </div>`;

            }
            else if (daysToWorkout == 0){
                exercisesBox.innerHTML = `<div class="day-message"> No workout for today! <br> Come back tomorrow!</div>`;
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
            getDefaultWorkout();
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
    //button prep
    const exerciseButton = document.getElementById("exerciseButton");
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("workoutMenu").style.display = "flex";
    document.getElementById("cancelWorkout").onclick = function() {
        document.getElementById("mainMenu").style.display = "flex";
        document.getElementById("workoutMenu").style.display = "none";
        return
    };
    
    //exercise counter
    let currentExerciseNumber = 0

    //display 1st exercise
    displayExercise(currentExerciseNumber);




    function displayExercise(currentExerciseNumber){
        document.getElementById("setsWindow").innerHTML = "";

        console.log("ex leng" + workout.exercises_for_today.length);
        console.log("ex" + currentExerciseNumber);

        if (currentExerciseNumber == workout.exercises_for_today.length){
            finishWorkout(workout);
            return
        }
        else if (currentExerciseNumber == 0){
            exerciseButton.innerHTML = "Start Workout";
        }
        else{
            exerciseButton.innerHTML = "Start Exercise";
        }

        let setsWeightArray = [];

        currentExercise = workout.exercises_for_today[currentExerciseNumber];
        displaySets(currentExercise);
        let currentSetNumber = 0;
        
        exerciseButton.onclick = function() {
            doExercise(currentSetNumber, setsWeightArray, currentExercise);
        };
    }

    function doExercise(currentSetNumber, setsWeightArray, currentExercise){
        setWeight = document.getElementById(`input${currentSetNumber}`)
        setWeight.disabled = false;
        
        if (currentSetNumber == currentExercise.sets - 1){
            if (currentExerciseNumber == workout.exercises_for_today.length){
                exerciseButton.innerHTML = "End Workout";
                finishWorkout(workout);
            }
            else{
                exerciseButton.innerHTML = "Next Exercise";
                exerciseButton.onclick = function() {
                    currentExerciseNumber++;
                    setsWeightArray.push(setWeight.value);
                    adjustWeight(setsWeightArray, currentExercise);
                    displayExercise(currentExerciseNumber);
                };
            }
        }
        else{
            exerciseButton.innerHTML = "Next Set";
            exerciseButton.onclick = function() {
                currentSetNumber++;
                setsWeightArray.push(setWeight.value);
                doExercise(currentSetNumber, setsWeightArray, currentExercise);
            };
        }
    }

    function adjustWeight(setsWeightArray, currentExercise){
        sum = 0;
        setsWeightArray.forEach((weight) => {
            // weigh = typeof weigh !== "undefined" ? weigh : 0;
            sum += parseInt(weight);
          });

        mean = sum / setsWeightArray.length;

        if (mean >= currentExercise.reps){
            newWeight = currentExercise.weight + 1;
            updateWorkoutExerciseWeight(currentExercise.exercise_id, newWeight);
        }
        else if (mean <  currentExercise.reps / 2){
            newWeight = currentExercise.weight - 1;
            updateWorkoutExerciseWeight(currentExercise.exercise_id, newWeight);
        }

    }

    function updateWorkoutExerciseWeight(exerciseId, newWeight) {
        fetch('/update_weight/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exercise_id: exerciseId,
                new_weight: newWeight
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Weight updated successfully:', data.new_weight);
            } else {
                console.error('Error updating weight:', data.error);
            }
        })
        .catch(error => console.error('Request failed:', error));
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

            restDiv.innerHTML = `Rest </br> ${currentExercise.rest_seconds} s`;
            weightDiv.innerHTML = `${currentExercise.weight} KG X ${currentExercise.reps} REPS`;
            currentRepDiv.innerHTML = "<p>Current reps</p>";
            repDiv.innerHTML = `<p>Set reps</p><p>${currentExercise.reps}</p>`;

            repInput = document.createElement("input");
            repInput.id = `input${i}`;
            repInput.disabled = true;
            repInput.type = "number"
            currentRepDiv.appendChild(repInput);
        }

    }
    
    function finishWorkout(workout) {
        let startDate = new Date(workout.workout_plan.startDate);
        startDate.setDate((startDate.getDate() + workout.workout_plan.rest_days) + 1);
        startDate = startDate.toISOString().split('T')[0];
    
        let workoutData = {
            startDate: startDate
        };

        fetch(`/update_workout_time/${workout.workout_plan.id}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workoutData),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            
      
            fetch(`/move_to_next_day/${workout.workout_plan.id}/`, {  
                method: "POST",
                headers: { "Content-Type": "application/json" }
            })
            .then(response => response.json())
            .then(data => {
                console.log("Workout day updated:", data.message);
                getDefaultWorkout();  
            })
            .catch(error => console.error("Error updating workout day:", error));
        })
        .catch(error => console.error("Error updating workout:", error));
    }
    
}

