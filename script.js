// Get the root element where content will be displayed
const root = document.getElementById('root');

// Get all header buttons
const headerButtons = document.querySelectorAll('header nav button');

// Get template elements
const mainTpl = document.querySelector('#mainTpl');

// Help with data fetching: Search state parameters
let searchState = { 
    searching: "Characters", // ✅ Fixed: removed || operator
    charUrl: "https://swapi.dev/api/people",
    planetsUrl: "https://swapi.dev/api/planets",
    starshipsUrl: "https://swapi.dev/api/starships",
    results: [], 
    page: 1, 
    currentUrl: "",
    prevPageUrl: "", 
    nextPageUrl: "" 
};

// Add click event listeners to each button
headerButtons.forEach((button, index) => {
  button.addEventListener('click', async () => {
    // Remove active class from all buttons
    headerButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Load appropriate content based on button index
    switch(index) {
      case 0: // Characters
        try {
          searchState.searching = "Characters";
          await fetchData(searchState.charUrl); 
        } catch (error) {
          console.error('Error loading characters:', error);
        }
        break;
      case 1: // Planets
        try {
          searchState.searching = "Planets";
          await fetchData(searchState.planetsUrl); 
        } catch (error) {
          console.error('Error loading planets:', error);
        }
        break;
      case 2: // Starships
        try {
          searchState.searching = "Starships";
          await fetchData(searchState.starshipsUrl); 
        } catch (error) {
          console.error('Error loading Starships:', error);
        }
        break;
    }
  });
});


// ====== FETCHING DATA =======

// Function to fetch data
async function fetchData(url) { 
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Det gick inte så bra :( : ${res.status} ${res.statusText}`);
    }
    const data = await res.json();

    // Update search state
    searchState.results = data.results;
    searchState.currentUrl = url;
    searchState.prevPageUrl = data.previous || "";
    searchState.nextPageUrl = data.next || "";

    updatePage();
}

// Function for updating and rendering page
function updatePage(){
  // Clear the main page 
  root.innerHTML = "";

  // Create main variables
  const clone = mainTpl.content.cloneNode(true);
  const header = clone.querySelector("h1");
  const ul = clone.querySelector("ul");
  const prevBtn = clone.querySelector(".navbuttons button:first-child");
  const nextBtn = clone.querySelector(".navbuttons button:last-child");

  // Fill up the main page 
  header.innerHTML = searchState.searching;
  searchState.results.forEach((object) => {
    const previewCard = createPreviewCard(object);
    ul.appendChild(previewCard);
  })

  if(searchState.prevPageUrl === "") prevBtn.disabled = true;
  if(searchState.nextPageUrl === "") nextBtn.disabled = true;

  root.appendChild(clone);
  
  prevBtn.addEventListener("click", () => fetchData(searchState.prevPageUrl));
  nextBtn.addEventListener("click", () => fetchData(searchState.nextPageUrl))

}
// Function for updating URL's in search state
function updateSearchState(currentUrl){

}

// ===== WORKING WITH SPECIFIC OBJECTS =====

// Function for creating <li> previews
function createPreviewCard(object){
  // Get templates, get their parts
  const clone = document.getElementById("previewCard").content.cloneNode(true);
  const header = clone.querySelector("h2");
  const descEl = clone.querySelector("span");
  // Create a special description for appropriate object
  let query = ``;
  if(searchState.searching === "Characters") { 
    query = `<p>Height: ${object.height}<br/>
    Mass: ${object.mass}<br/>
    Gender: ${object.gender}<br/>
    Year of birth: ${object.birth_year}
    </p>`
  } else if(searchState.searching === "Planets") {
    query = `<p>Rotation period: ${object.rotation_period}<br/>
    Orbital period: ${object.orbital_period}<br/>
    Gravity: ${object.gravity}<br/>
    Population: ${object.population}
    </p>`
  } else if(searchState.searching === "Starships"){
    query = `<p>Model: ${object.model}<br/>
    Manufacturer: ${object.manufacturer}<br/>
    Length: ${object.length}<br/>
    Cost (in credits): ${object.cost_in_credits}
    </p>` 
  }
  // Fill the template with corresponding info
  header.innerHTML = object.name;
  descEl.innerHTML = query;

  // Attach event listener to open detailed info on click
  clone.addEventListener("click", (e) => {
    // TODO
  })

  return clone;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Load characters by default
  if (headerButtons.length > 0) {
    headerButtons[0].classList.add('active');
    fetchData(searchState.charUrl);
  }
});