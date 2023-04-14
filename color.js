function init() {
    // set year slider to 2020
    document.querySelector('#yearSlider').value = 2020;
}

// update year text to match slider position
document.querySelector('#yearSlider').addEventListener('input', () => {
    document.querySelector('#year').textContent = document.querySelector('#yearSlider').value;
})

init();