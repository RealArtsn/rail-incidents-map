const map = new Object()
function init() {

    console.log(map.svg);
    // this will not work by opening html from local file
    // use npm module http-server instead
    fetch('years_states_named.json') // this is the input json file for the data
    .then(response => response.json())
    .then(data => {
        // retrieve svg for color editing
        map.svg = document.querySelector('#map').contentDocument;
        map.data = data;
        // calculate incidents per 1m miles and save in data set
        recordRatios();
        // compute maximum values occurring in data set
        map.max = {};
        ['incidents', 'miles', 'ratio'].forEach(dataKey => {
            map.max[dataKey] = getMax(dataKey);
        })
        console.log('data initialized')
        // set year slider to 2022
        document.querySelector('#yearSlider').value = 2022;
        console.log("Slider set.")
        // set default mode
        map.mode = 'incidents';
        updateColors();
    })
    .catch(error => console.error(error));            
}

['incidents','miles','ratio'].forEach(id => {
    document.querySelector(`#${id}`).addEventListener('click', handleButton);
})

function handleButton() {
    map.mode = this.id;
    updateColors();
}

// update year text to match slider position
document.querySelector('#yearSlider').addEventListener('input', () => {
    document.querySelector('#year').textContent = document.querySelector('#yearSlider').value;
    updateColors()
})

// update all county colors from map.data
function updateColors() {
    const year = document.querySelector('#yearSlider').value;
    // reset all counties
    for (const county of map.svg.querySelectorAll('#counties path')) {
        county.style.fill='gray';
        county.style.stroke='none';
    }
    // change fill color for states that appear in data
    for (const [stateName, values] of Object.entries(map.data[year])) {
        let color;
        // code block
        let count = +map.data[year][stateName][map.mode];
        if (!count) {
            colorState(stateName, 'gray');
            continue;
        }
        let hue = (count / map.max[map.mode]) * 255;
        // apply hue to color depending on data type
        switch(map.mode) {
            case 'incidents':
                color = `rgb(255, ${255 - hue}, ${255 - hue})`;
                break;
            case 'miles':
                color = `rgb(${255 - hue}, 255, ${255 - hue})`;
                break;
            case 'ratio':
                color = `rgb(${255 - hue}, ${255 - hue}, 255)`;
                break;
        }
        colorState(stateName, color);
    }
}

function colorState(stateName, color) {
    try {
        for (const county of map.svg.querySelectorAll(`#${stateName.trim()} path`)) {
            county.style.fill = color;
        }
    }
    catch(TypeError) {
        console.log('Could not color region ' + stateName);
    }
}

function calcIncidentsPer1mMiles(incidents, miles) {
    return (incidents / miles) * 1000000;
}

// TODO: consolidate loops to fix redundancies 

// Get maximum occurring count of incidents/miles
function getMax(key) {
    let max = 0;
    for (const [year, yearValues] of Object.entries(map.data)) {
        for (const [stateCounty, stateCountyValues] of Object.entries(yearValues)) {
            let count = +map.data[+year][stateCounty][key];
            if (isNaN(count) || !isFinite(count)) {
                continue;
            }
            if (count > max) {
                max = count;
            }
        }
    }
    return max;
}


//
function recordRatios() {
    for (const [year, yearValues] of Object.entries(map.data)) {
        for (const [state, stateValues] of Object.entries(yearValues)) {
            map.data[year][state]['ratio'] = calcIncidentsPer1mMiles(+map.data[year][state]['incidents'], +map.data[year][state]['miles']);
        }
    }
}

init();

