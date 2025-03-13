document.addEventListener("DOMContentLoaded", function() 
{  
    getWorkout(6);
});





function getWorkout(workoutId){
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
                createUi(exercise);
    
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

    })


    function createUi(exercise){
        const mainBox = document.getElementById("exercisesBox");

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
