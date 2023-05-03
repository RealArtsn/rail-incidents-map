const map = new Object()
map.data = {}
function init() {
    console.log('init')
    // this will not work by opening html from local file
    // use npm module http-server instead
    fetch('years_states_named.json') // this is the input json file for the data
    .then(response => response.json())
    .then(data => {
        map.data = data;
        updateColors();
    })
  .catch(error => console.error(error));    
    // set year slider to 2022
    document.querySelector('#yearSlider').value = 2022;
    console.log("Slider set.")
    
}

// update year text to match slider position
document.querySelector('#yearSlider').addEventListener('input', () => {
    document.querySelector('#year').textContent = document.querySelector('#yearSlider').value;
    updateColors()
})

// update all county colors from map.data
function updateColors() {
    const year = document.querySelector('#yearSlider').value;
    const counties = map.data[year];
    const svgDoc = document.querySelector('#map').contentDocument;
    // reset all counties
    for (const county of svgDoc.querySelectorAll('#counties path')) {
        county.style.fill='white';
    }
    // change fill color for states that appear in data
    for (const [stateName, values] of Object.entries(counties)) {
        try {
            for (const state of svgDoc.querySelectorAll(`#${stateName} path`)) {
                state.style.fill('red');
            }
            // svgDoc.querySelector(`#c${county}`).style.fill = 'red';
        }
        catch(TypeError) {
            console.log(`County ${stateName} not found for ${year}.`)
        }
            
    }
}

init();

