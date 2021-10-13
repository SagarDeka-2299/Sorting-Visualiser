"use strict";
const sortButton = document.querySelector('#start');
const howmanyInput = document.querySelector('#Howmany');
const canvas = document.querySelector('canvas');
const algoSelector = document.querySelector('#algorithm');
const pauseButton = document.querySelector('#pause');
const showArray = document.querySelector('#showArray');
const arrayTextBox = document.querySelector("#arrayText");
const arrayDisplay = document.querySelector("#array");
arrayDisplay.style.display = "none";
let showingArray = false;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const ctx = canvas.getContext('2d');
let globalArray = [];
let barCount = 100;
let barWidth = Math.floor((canvas.width - 20) / 100);
for (let i = 0; i < 100; i++) {
    let h = Math.floor(Math.random() * (canvas.height - 20));
    globalArray.push(h);
}
function* selection(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        let minindex = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minindex]) {
                minindex = j;
            }
        }
        let temp = globalArray[minindex];
        globalArray[minindex] = globalArray[i];
        globalArray[i] = temp;
        yield [i, arr.length];
    }
}
function* merge(arr, start, mid, end) {
    let a = arr.slice(start, mid);
    let b = arr.slice(mid, end);
    let i = 0, j = 0, k = start;
    while (i < a.length && j < b.length) {
        if (a[i] < b[j]) {
            arr[k] = a[i];
            i++;
        }
        else {
            arr[k] = b[j];
            j++;
        }
        k++;
        yield [k, end];
    }
    while (i < a.length) {
        arr[k] = a[i];
        k++;
        i++;
        yield [k, end];
    }
    while (j < b.length) {
        arr[k] = b[j];
        k++;
        j++;
        yield [k, end];
    }
}
function* mergeSort(arr, start = 0, end = arr.length) {
    if (start < end - 1) {
        let mid = start + Math.floor((end - start) / 2);
        yield* mergeSort(arr, start, mid);
        yield* mergeSort(arr, mid, end);
        //now merge
        yield* merge(arr, start, mid, end);
    }
}
function* bubbleSort(arr) {
    //Outer pass
    for (let i = 0; i < arr.length; i++) {
        //Inner pass
        for (let j = 0; j < arr.length - i - 1; j++) {
            //Value comparison using ascending order
            if (arr[j + 1] < arr[j]) {
                //Swapping
                let temp = arr[j + 1];
                arr[j + 1] = arr[j];
                arr[j] = temp;
                //[arr[j + 1],arr[j]] = [arr[j],arr[j + 1]]
            }
            yield [i, arr.length - i];
        }
    }
    ;
    return arr;
}
;
function* insertionSort(arr) {
    //Start from the second element.
    for (let i = 1; i < arr.length; i++) {
        //Go through the elements behind it.
        for (let j = i - 1; j > -1; j--) {
            //value comparison using ascending order.
            if (arr[j + 1] < arr[j]) {
                //swap
                let temp = arr[j + 1];
                arr[j + 1] = arr[j];
                arr[j] = temp;
            }
            yield [i, j];
        }
    }
    ;
}
let sorters = {
    "Selection": selection,
    "Merge": mergeSort,
    "Bubble": bubbleSort,
    "Insertion": insertionSort
}; //selection(0,globalArray.length);
let sorter;
let currentSorterAlgo = "Selection";
let shouldSort = undefined;
let start = undefined, end = undefined; //to know the area we are operation on
const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (start != undefined && end != undefined) {
        ctx.fillStyle = 'orange';
        ctx.fillRect(10 + start * barWidth, 0, (end - start) * barWidth, canvas.height);
    }
    if (shouldSort != undefined && shouldSort) { //call sort generator only if not paused
        let { value, done } = sorter.next();
        if (done == true) {
            shouldSort = undefined;
        }
        if (value != undefined) {
            start = value[0];
            end = value[1];
        }
        if (!shouldSort) {
            sortButton.disabled = false;
            algoSelector.disabled = false;
            howmanyInput.disabled = false;
            start = undefined;
            end = undefined;
        }
    }
    //draw each bar
    globalArray.forEach((n, i) => {
        ctx.fillStyle = `rgb(${Math.floor(n * 255.99 / canvas.height)},50,${255 - Math.floor(n * 255.99 / canvas.height)})`;
        ctx.fillRect(i * barWidth + 10, 10, barWidth, n);
    });
    if (showArray && shouldSort) { //if array showing and sorting at same time the update array text box at real time
        setTextBoxArray();
    }
    requestAnimationFrame(render);
};
requestAnimationFrame(render);
sortButton.addEventListener('click', () => {
    sorter = sorters[currentSorterAlgo](globalArray);
    shouldSort = true;
    sortButton.disabled = true;
    howmanyInput.disabled = true;
    algoSelector.disabled = true;
});
howmanyInput.addEventListener('change', () => {
    let val = parseInt(howmanyInput.value);
    let w = Math.floor((canvas.width - 20) / val);
    if (w == 0) {
        alert("Too many numbers, unable to draw");
        return;
    }
    barCount = val;
    barWidth = w;
    globalArray.splice(0, globalArray.length);
    for (let i = 0; i < val; i++) {
        globalArray.push(Math.random() * (canvas.height - 20));
    }
});
algoSelector.addEventListener('change', () => {
    currentSorterAlgo = algoSelector.value;
});
pauseButton.addEventListener('click', () => {
    if (shouldSort != undefined) {
        shouldSort = !shouldSort;
        if (!shouldSort) {
            pauseButton.innerHTML = "RESUME";
        }
        else {
            pauseButton.innerHTML = "PAUSE";
        }
    }
});
window.addEventListener('resize', () => {
    console.log(canvas.width, ",", canvas.clientWidth);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    barWidth = Math.floor((canvas.width - 20) / barCount);
});
showArray.addEventListener('click', () => {
    setTextBoxArray();
    arrayDisplay.style.display = (showingArray) ? "none" : "block";
    showingArray = !showingArray;
    showArray.innerHTML = (showingArray) ? "HIDE ARRAY" : "SHOW ARRAY";
});
function setTextBoxArray() {
    let str = "";
    globalArray.forEach(e => {
        if (str != "") {
            str += ",";
        }
        str += (e.toString());
    });
    arrayTextBox.value = str;
}
