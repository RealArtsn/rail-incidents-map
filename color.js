const map = new Object()
map.data = 0;
function init() {
    console.log('init');
    // this will not work by opening html from local file
    // use npm module http-server instead
    fetch('years_states_named.json') // this is the input json file for the data
    .then(response => response.json())
    .then(data => {
        map.data = data;
        updateColors();
        map.maxIncidents = getMax('incidents');
        map.maxMiles = getMax('miles');
    })
    .catch(error => console.error(error));    
    // compute maximum values occurring in data set
    console.log(map.data);
    
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
            let red = (parseInt(map.data[year][stateName]['incidents']) / map.maxIncidents) * 255;
            for (const county of svgDoc.querySelectorAll(`#${stateName.trim()} path`)) {
                county.style.fill = `rgb(255, ${255 - red}, ${255 - red})`;
            }
            // svgDoc.querySelector(`#c${county}`).style.fill = 'red';
        }
        catch(TypeError) {
            console.log(`Region ${stateName} not found for ${year}.`)
        }
            
    }
}

// Get maximum occurring count of incidents/miles
function getMax(key) {
    let max = 0;
    for (const [year, yearValues] of Object.entries(map.data)) {
        for (const [stateCounty, stateCountyValues] of Object.entries(yearValues)) {
            let count = +map.data[+year][stateCounty][key];
            if (count > max) {
                max = count;
            }
        }
    }
    return max;
}

init();

