const map = new Object()
map.data = {}
function init() {
    console.log('init')
    // this will not work by opening html from local file
    fetch('years.json')
    .then(response => response.json())
    .then(data => {
        map.data = data;
        updateColors();
    })
  .catch(error => console.error(error));    
    // set year slider to 2020
    document.querySelector('#yearSlider').value = 2020;
    
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
    // change fill color for counties that appear in data
    for (const [county, values] of Object.entries(counties)) {
        try {
            svgDoc.querySelector(`#c${county}`).style.fill = 'red';
        }
        catch(TypeError) {
            console.log(`County ${county} not found for ${year}.`)
        }
            
    }
}

init();

