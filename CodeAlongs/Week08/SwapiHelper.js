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
        })

        return this.deptoId;
    }

    async getArt(departmentNum){
        departmentNum = this.deptoId;
        this.arts = await this.makeRequest(baseUrl + "search?departmentId=" + departmentNum + "&q=*");
        let i = 0;
        while (i < 20) {
            this.objeto = await this.makeRequest(baseUrl + "objects/" + this.arts.objectIDs[i]);
            this.objeto.primaryImageSmall = this.objeto.primaryImageSmall;
            this.objeto.title = this.objeto.title;
            console.log(this.objeto.primaryImageSmall);
            console.log(this.objeto.title);
            // if(this.objeto.primaryImageSmall === ""){
            //     console.log(this.objeto.title);
            //     i = i;
            // }else{
                const imgs = document.querySelector(".resultado");
                imgs.innerHTML += `<div><img src="${this.objeto.primaryImageSmall}"><p>${this.objeto.title}<p></div>`;
                i++;
            // }
        }
    }

    async filmsSelected(filmTitle, departmentNum){
        try {
            const film = this.films.find((item)=>item.displayName);
            // if(!film){
            //     throw new Error("Film not found");
            // }
            this.outputElement.innerHTML = this.pageTemplate();
            this.outputElement.querySelector(".film-name").innerHTML = film.displayName;

            const planets = await this.getArt(departmentNum);
        }
        catch (err) {
            console.log(err);
        }
    }

    pageTemplate(){
        return `<h2 class='film-name'></h2>
        `;
    }

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