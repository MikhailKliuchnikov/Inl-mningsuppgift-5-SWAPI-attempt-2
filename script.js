// Get the root element where content will be displayed
const root = document.getElementById('root');

// Get all header buttons
const headerButtons = document.querySelectorAll('header nav button');

// Get template elements
const mainTpl = document.querySelector('#mainTpl');

// Help with data fetching: Search state parameters
let searchState = { 
    searching: "Characters",
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
    searchState.page = extractPageNumber(url);

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

  const pageNumEl = clone.querySelector(".navbuttons p");
  pageNumEl.innerHTML = searchState.page;

  if(searchState.prevPageUrl === "") prevBtn.disabled = true;
  if(searchState.nextPageUrl === "") nextBtn.disabled = true;

  root.appendChild(clone);
  
  prevBtn.addEventListener("click", () => fetchData(searchState.prevPageUrl));
  nextBtn.addEventListener("click", () => fetchData(searchState.nextPageUrl))

}
// Extract page number from SWAPI URL
function extractPageNumber(url) {
  const urlObj = new URL(url);
  const pageParam = urlObj.searchParams.get('page');
  return pageParam ? parseInt(pageParam) : 1;
}

// ===== WORKING WITH SPECIFIC OBJECTS =====

// Function for creating <li> previews
function createPreviewCard(object){
  // Get templates, get their parts
  const clone = document.getElementById("previewCard").content.cloneNode(true);
  const cardContainer = clone.querySelector(".card-container");
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

  // Attach event listener to the card container element
  cardContainer.addEventListener("click", (e) => {
    openModal(object);
  });

  return clone;
}

// ===== MODAL: DETAILED INFO ===== 

function openModal(object) {
  // Grab important elements
  const modal = document.getElementById("modal");
  const modalContent = modal.querySelector(".modal-content");

  // Clear the modal content
  modalContent.innerHTML = "";

  // Create appropriate detailed query based on object type
  let detailedContent = "";
  
  if(searchState.searching === "Characters"){
    detailedContent = `
      <div class="modal-header">
        <h1>${object.name}</h1>
      </div>
      <div class="modal-body">
        <div class="character-details">
          <div class="detail-section">
            <h3>Physical Characteristics</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Height:</strong> ${object.height === "unknown" ? "Unknown" : object.height + " cm"}
              </div>
              <div class="detail-item">
                <strong>Mass:</strong> ${object.mass === "unknown" ? "Unknown" : object.mass + " kg"}
              </div>
              <div class="detail-item">
                <strong>Hair Color:</strong> ${object.hair_color || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>Skin Color:</strong> ${object.skin_color || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>Eye Color:</strong> ${object.eye_color || "Unknown"}
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Birth Year:</strong> ${object.birth_year || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>Gender:</strong> ${object.gender || "Unknown"}
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Star Wars Universe</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Films Appeared:</strong> ${object.films?.length || 0} film(s)
              </div>
              <div class="detail-item">
                <strong>Vehicles:</strong> ${object.vehicles?.length || 0} vehicle(s)
              </div>
              <div class="detail-item">
                <strong>Starships:</strong> ${object.starships?.length || 0} starship(s)
              </div>
              <div class="detail-item">
                <strong>Species:</strong> ${object.species?.length || 0} species
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if(searchState.searching === "Planets"){
    detailedContent = `
      <div class="modal-header">
        <h1>${object.name}</h1>
      </div>
      <div class="modal-body">
        <div class="planet-details">
          <div class="detail-section">
            <h3>Planetary Data</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Rotation Period:</strong> ${object.rotation_period === "unknown" ? "Unknown" : object.rotation_period + " hours"}
              </div>
              <div class="detail-item">
                <strong>Orbital Period:</strong> ${object.orbital_period === "unknown" ? "Unknown" : object.orbital_period + " days"}
              </div>
              <div class="detail-item">
                <strong>Diameter:</strong> ${object.diameter === "unknown" ? "Unknown" : object.diameter + " km"}
              </div>
              <div class="detail-item">
                <strong>Gravity:</strong> ${object.gravity || "Unknown"}
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Environment</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Climate:</strong> ${object.climate || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>Terrain:</strong> ${object.terrain || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>Surface Water:</strong> ${object.surface_water === "unknown" ? "Unknown" : object.surface_water + "%"}
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Population & Culture</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Population:</strong> ${object.population === "unknown" ? "Unknown" : object.population}
              </div>
              <div class="detail-item">
                <strong>Films Featured:</strong> ${object.films?.length || 0} film(s)
              </div>
              <div class="detail-item">
                <strong>Residents:</strong> ${object.residents?.length || 0} known character(s)
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if(searchState.searching === "Starships"){
    detailedContent = `
      <div class="modal-header">
        <h1>${object.name}</h1>
      </div>
      <div class="modal-body">
        <div class="starship-details">
          <div class="detail-section">
            <h3>Ship Specifications</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Model:</strong> ${object.model || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>Manufacturer:</strong> ${object.manufacturer || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>Length:</strong> ${object.length === "unknown" ? "Unknown" : object.length + " meters"}
              </div>
              <div class="detail-item">
                <strong>Class:</strong> ${object.starship_class || "Unknown"}
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Economics & Crew</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Cost:</strong> ${object.cost_in_credits === "unknown" ? "Unknown" : object.cost_in_credits + " credits"}
              </div>
              <div class="detail-item">
                <strong>Crew:</strong> ${object.crew || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>Passengers:</strong> ${object.passengers || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>Cargo Capacity:</strong> ${object.cargo_capacity === "unknown" ? "Unknown" : object.cargo_capacity + " kg"}
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Performance</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Max Speed:</strong> ${object.max_atmosphering_speed === "unknown" ? "Unknown" : object.max_atmosphering_speed + " km/h"}
              </div>
              <div class="detail-item">
                <strong>Hyperdrive Rating:</strong> ${object.hyperdrive_rating || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>MGLT:</strong> ${object.MGLT || "Unknown"}
              </div>
              <div class="detail-item">
                <strong>Consumables:</strong> ${object.consumables || "Unknown"}
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Star Wars Universe</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Films Featured:</strong> ${object.films?.length || 0} film(s)
              </div>
              <div class="detail-item">
                <strong>Pilots:</strong> ${object.pilots?.length || 0} known pilot(s)
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Fill the modal with content
  modalContent.innerHTML = detailedContent;

  // Show modal
  modal.hidden = false;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}

// Function to close modal
function closeModal() {
  const modal = document.getElementById("modal");
  modal.hidden = true;
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// Close modal when clicking outside of it
document.addEventListener('click', function(event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
});



// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Load characters by default
    headerButtons[0].classList.add('active');
    fetchData(searchState.charUrl);
});