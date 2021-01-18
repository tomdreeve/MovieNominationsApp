window.onclose = clearInterval();
window.setInterval(function() {
    if (document.getElementsByClassName('item').length)
        showSlides(2);
}, 4000);

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
        if (document.getElementById(`${e["Title"]}---${e["Year"]}`)){
            btn.style.backgroundColor = "grey";
            btn.disabled = true;
        }
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
        btn.id = `${e["Title"]}---${e["Year"]}`;
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
}

document.getElementById('search-field').addEventListener('keyup', searchMovies);

function searchMovies() {
    const movie = encodeURIComponent(document.getElementById('search-field').value);
    var url = `api/${movie}`;
    const results = document.getElementById('results');
    const input = decodeURIComponent(movie).toUpperCase();
    results.innerHTML = `<span>RESULTS FOR "${input}"</span>`
    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.error){
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
      document.getElementById('whitetee').style.display = 'none';
    document.getElementById('nomination-box').style.display = 'flex';
    } else if (event.srcElement.className === 'remove-button') {
        deleteNomination(event.srcElement.id);
    } else if (event.srcElement.className === 'tee-button') {
        document.getElementById('whitetee').style.display = 'block';
        document.getElementById('nomination-box').style.display = 'none';
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
    const user = document.getElementById('user').innerHTML.substr(7);
    console.log(user);
    console.log(btn);
    var array = id.split('--');
    var content = {
        "User": `${user}`,
        "Title": `${array[0]}`,
        "Year": `${array[1]}`,
        "Poster": `${btn.previousSibling.id}`
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
     getPicks();
}

function deleteNomination(id) {
    const btn = document.getElementById(id);
    const user = document.getElementById('user').innerHTML.substr(7);
    var array = id.split('---');
    if (document.getElementById(`${array[0]}--${array[1]}`)){
        document.getElementById(`${array[0]}--${array[1]}`).style.backgroundColor = "black";
        document.getElementById(`${array[0]}--${array[1]}`).disabled = false;
    }
    var content = {
        "User": `${user}`,
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
     getNominations();
     getPicks();
}

function getNominations() {
    const user = document.getElementById('user').innerHTML.substr(7);
    const urlTwo = `api/nominations/all/${user}`;
    fetch(urlTwo)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.status){
        } else { 
            createNominationsOutput(data, 'nominationlist');
            if (data.length === 5) {
                alert("5 nominations are done! May the best flick win!")
                }
        }
    })
}

document.getElementById('register').addEventListener('click', addUser);

function addUser() {
    document.getElementById('user-popup').style.display = "none";
    document.getElementById('blur').style.display = "none";

    const user = document.getElementById('username').value;
    const content = {
        User: user,
    }
    const url = `api/new/user`;
    const sb = document.getElementById('search-bar');
    const userP = document.createElement('p');
    userP.id = "user";
    console.log(content)
    fetch(url, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
     })
     .then((res) => res.json())
     .then(data => {
         console.log(data)
        if(!data.status){
            userP.innerHTML = `Hello, ${user}`;
            sb.appendChild(userP);
            getNominations();
            getPicks();
        } else
            alert("Username exists!")
     })
}

document.getElementById('login').addEventListener('click', getUser);

function getUser() {
    document.getElementById('user-popup').style.display = "none";
    document.getElementById('blur').style.display = "none";
    const user = document.getElementById('username').value;
    const url = `api/login/${user}`;
    const sb = document.getElementById('search-bar');
    const userP = document.createElement('p');
    userP.id = "user";
    fetch(url)
     .then((res) => res.json())
     .then(data => {
        if(!data.status){
            userP.innerHTML = `Hello, ${user}`;
            sb.appendChild(userP);
            getNominations();
            getPicks();
        } else 
            alert("No user found");
     })
}

function getPicks() {
    const url = 'api/posters/all'
    fetch(url)
     .then((res) => res.json())
     .then(data => {
        if(data !== undefined){
            console.log(data);
            setPosters(data);
        } 
     });
    }

function setPosters(posters){
     console.log(posters);
     const slide = document.getElementById('slider');
     while(slide.hasChildNodes()){
         slide.lastChild.remove();
     }

     for (let poster of posters) {
        const item = document.createElement('div');
        item.className = "item";
        const img = document.createElement('img');
        img.src = poster;
        item.appendChild(img);
        slide.appendChild(item);
     }
    showSlides(1);
}
function showSlides(n) {
    let slides = document.getElementsByClassName("item");

    for (let slide of slides) {
        slide.style.display = "none";
    }
    if (n>1){
        var temp;
        for (let i = 0; i < (slides.length-1); i++) {
            temp = slides[i].innerHTML;
            slides[i].innerHTML = slides[i+1].innerHTML;
            slides[i+1].innerHTML = temp;
        }
    } else if (n<1){
        var temp;
        for (let i = slides.length-1; i > 0; i--) {
            temp = slides[i].innerHTML;
            slides[i].innerHTML = slides[i-1].innerHTML;
            slides[i-1].innerHTML = temp;
        }
    }
    if (slides[0])
        slides[0].style.display = "block";
    if (slides[1])
        slides[1].style.display = "block"; 
    if (slides[2])   
        slides[2].style.display = "block";    
}
