document.addEventListener("DOMContentLoaded", function(e){
    const input = document.getElementById("input");
    const button = document.getElementById("button");
    console.log(localStorage.getItem("user"));

    if (localStorage.getItem("user")){
        if (localStorage.getItem("user") !== 'null'){
            input.value = localStorage.getItem("user");
            button.click();

        }        
    }
});