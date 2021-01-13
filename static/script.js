
window.onload = getNominations();

function createMoviesOutput(data, ol){
    const l = document.getElementById(ol);
    while(l.hasChildNodes()){
        l.removeChild(l.firstChild);
    }
    for (const e of data) {
        const item = document.createElement('li');
        const d = document.createElement('div');
        d.className = "movie-result";
        const btnholder = document.createElement('div');
        btnholder.className = "buttonbox";
        const btn = document.createElement('input');
        btn.className = "nominate-button"
        btn.type = "button";
        btn.id = `${e["Title"]}--${e["Year"]}`;
        if (document.getElementById(`${e["Title"]}-${e["Year"]}`)){
            btn.style.backgroundColor = "grey";
            btn.disabled = true;
        }
       // btn.addEventListener('click', addNomination(btn.id));
        const nom = "Nominate";
        btn.value = `${nom}`;
        const btnTwo = document.createElement('input');
        btnTwo.className = "tee-button";
        btnTwo.type = "button";
        btnTwo.id = `${e["Poster"]}`;
        btnTwo.value = "T-Shirt";
        item.innerHTML = `${e["Title"]} (${e["Year"]})`;
        d.appendChild(item);
        btnholder.appendChild(btnTwo);
        btnholder.appendChild(btn);
        d.appendChild(btnholder);
        l.appendChild(d);
    };
}

function createNominationsOutput(data, ol){
    const l = document.getElementById(ol);
    while(l.hasChildNodes()){
        l.removeChild(l.firstChild);
    }
    for (const e of data){
        const item = document.createElement('li');
        const d = document.createElement('div');
        d.className = "nomination-result"
        const btn = document.createElement('input');
        btn.className = "remove-button"
        btn.type = "button";
        btn.id = `${e["Title"]}-${e["Year"]}`;
        if (document.getElementById(`${e["Title"]}--${e["Year"]}`)){
            document.getElementById(`${e["Title"]}--${e["Year"]}`).style.backgroundColor = "grey";
            document.getElementById(`${e["Title"]}--${e["Year"]}`).disabled = true;
        }
        const rm = "Remove";
        btn.value = `${rm}`;
        item.innerHTML = `${e["Title"]} (${e["Year"]})`;
        d.appendChild(item);
        d.appendChild(btn);
        l.appendChild(d);
    }
    if (data.length === 5) {
        alert("5 nominations are done! May the best flick win!")
        }
}

document.getElementById('search-field').addEventListener('keyup', searchMovies);

function searchMovies() {
    const movie = encodeURIComponent(document.getElementById('search-field').value);
    var url = `api/${movie}`;
    const results = document.getElementById('results');
    results.innerHTML = `Results for "${decodeURIComponent(movie)}"`
    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.error){
            //alert(data.error);
        } else createMoviesOutput(data, 'movielist');
    })
    .catch(function(error) {
        console.log(error);
    });
}

document.body.addEventListener( 'click', function ( event ) {
    console.log(event.srcElement);
    console.log(event.srcElement.className);
    if (event.srcElement.className === 'nominate-button' ) {
      addNomination(event.srcElement.id);
    } else if (event.srcElement.className === 'remove-button') {
        deleteNomination(event.srcElement.id);
    } else if (event.srcElement.className === 'tee-button') {
        addImage(event.srcElement.id);
    }
  });

function addImage(id) {
    const div = document.getElementById('whitetee');
    const logo = document.getElementsByClassName('logo');
    for (let i = 0; i < logo.length; i++) {
        logo[i].remove();
    }
    if (id === 'N/A'){
        alert("No poster for this movie!");
    } else {
        const img = document.createElement('img');
        img.src = id;
        img.className = 'logo';
        div.appendChild(img);
    }
}

function addNomination(id) {
    const btn = document.getElementById(id);
    console.log(btn);
    var array = id.split('--');
    var content = {
        "Title": `${array[0]}`,
        "Year": `${array[1]}`
    }
    const url = `api/nominate`;
    console.log(content)
    fetch(url, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
     })
     .then((res) => res.json());
     getNominations();
}

function deleteNomination(id) {
    const btn = document.getElementById(id);
    var array = id.split('-');
    if (document.getElementById(`${array[0]}--${array[1]}`)){
        document.getElementById(`${array[0]}--${array[1]}`).style.backgroundColor = "black";
        document.getElementById(`${array[0]}--${array[1]}`).disabled = false;
    }
    var content = {
        "Title": `${array[0]}`,
        "Year": `${array[1]}`
    }
    const url = `api/nominate`;
    console.log(content)
    fetch(url, {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
     })
     .then((res) => res.json());
     const urlTwo = 'api/nominations/all'
     fetch(urlTwo)
     .then(response => response.json())
     .then(data => {
         console.log(data);
         if(data.error){
             //alert(data.error);
         } else createNominationsOutput(data, 'nominationlist');
     })
}

function getNominations() {
    const urlTwo = 'api/nominations/all'
    fetch(urlTwo)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.status){
            //alert(data.error);
        } else { 
            createNominationsOutput(data, 'nominationlist');
        }
    })
}