const baseUrl = "https://collectionapi.metmuseum.org/public/collection/v1/";

export default class SwapiHelper {
    
    constructor(outputId, filmId, loadingId) {
        this.outputId = outputId;
        this.filmId = filmId;
        this.loadingId = loadingId;

        this.outputElement = document.getElementById(outputId);
        this.filmElement = document.getElementById(filmId);
        this.loadingElement = document.getElementById(loadingId);

        this.films = [];
        this.deptoId = '';
        this.init();
    }

    async init() {
        // This api is really slow... lets give the user something to look at while they wait
        this.outputElement.style.display = "none";
        this.loadingElement.style.display = "block";

        this.films = await this.makeRequest(baseUrl + "departments");
        this.films = this.films.departments;
        console.log(this.films);
        // this.films.forEach(() => {
        //     this.deptoId = this.films.departmentId;
        //     console.log(this.deptoId);
        // });
        // [0].departmentId

        this.outputElement.style.display = "initial";
        this.loadingElement.style.display = "none";

        this.clickableList(this.films, this.filmId, this.filmsSelected.bind(this));


    }

    async makeRequest(url){
        try {
            const response = await fetch(url);
            if (response.ok) {
                return await response.json();
            }
            else{
                const error = await response.text();
                throw new Error(error);
            }
        }
        catch (err){
            console.log(err);
        }
    }

    clickableList(list, elementId, callback){
        const element = document.getElementById(elementId);
        let select = document.querySelector(".selector");
        element.innerHTML = `<option value="" disabled selected>Please select a department</option>`;
        element.innerHTML = list.map((film) => `<option value="${film.departmentId}">${film.displayName}</option>`).join("");
        select.addEventListener("change", (e)=>{
            this.deptoId = e.target.value;
            console.log(this.deptoId);
            callback(e.target.innerText);
            // console.log(e.target.innerText);
        })

        return this.deptoId;
    }

    async getArt(departmentNum){
        departmentNum = this.deptoId;
        this.arts = await this.makeRequest(baseUrl + "search?departmentId=" + departmentNum + "&q=*");
        let i = 0;
        while (i < 4) {
            // this.arts.objectIDs.map(async(i)=>{
            //     this.objeto = await this.makeRequest(baseUrl + "objects/" + i);
            //     this.objeto = this.objeto.primaryImageSmall;
            // });
            this.objeto = await this.makeRequest(baseUrl + "objects/" + this.arts.objectIDs[1]);
            this.objeto = this.objeto.primaryImageSmall;
            console.log(this.objeto);
            i++;
        }
        console.log(this.arts.objectIDs);
    }

    async filmsSelected(filmTitle, departmentNum){
        try {
            const film = this.films.find((item)=>item.displayName);
            // if(!film){
            //     throw new Error("Film not found");
            // }
            this.outputElement.innerHTML = this.pageTemplate();
            this.outputElement.querySelector(".film-name").innerHTML = film.displayName;
            // this.outputElement.querySelector(".crawl").innerHTML = film.opening_crawl;

            const planets = await this.getArt(departmentNum);
            // this.renderList(planets, this.planetTemplate, ".film-planets");

            // const ships = await this.getListDetails(film.starships);
            // this.renderList(ships, this.shipTemplate, ".film-starships");
        }
        catch (err) {
            console.log(err);
        }
    }

    pageTemplate(){
        return `<h2 class='film-name'></h2>
        `;
    }

    // planetTemplate(planet){
    //     return `
    //     <li>
    //         <h4 class='planet-name'>${planet.name}</h4>
    //         <p>Climate: ${planet.climate}</p>
    //         <p>Terrain: ${planet.terrain}</p>
    //         <p>Year: ${planet.orbital_period}</p>
    //         <p>Day: ${planet.rotation_period}</p>
    //         <p>Population: ${planet.population}</p>
    //     </li>
    //     `;
    // }

    // shipTemplate(ship){
    //     return `
    //     <li>
    //         <h4 class='ship-name'>${ship.name}</h4>
    //         <p>Model: ${ship.model}</p>
    //         <p>Manufacturer: ${ship.manufacturer}</p>
    //         <p>Cost in Credits: ${ship.cost_in_credits}</p>
    //         <p>Crew: ${ship.crew}</p>
    //         <p>Hyperdrive Rating: ${ship.hyperdrive_rating}</p>
    //         <p>Class: ${ship.starship_class}</p>
    //     </li>
    //     `;
    // }

    async getListDetails(list){
        // Promise.all(listOfPromises)
        const details = await Promise.all(list.map((url) => this.makeRequest(url)));
        console.log(details);
        return details;
    }

    renderList(list, template, outputId){
        const element = document.querySelector(outputId);

        element.innerHTML = "";
        const htmlString = list.map((item)=> template(item));
        element.innerHTML = htmlString.join("");
    }

}