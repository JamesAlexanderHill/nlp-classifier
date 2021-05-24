import brainjs from 'brain.js/src';
import Papa from 'papaparse';
// const Papa = require('papaparse');


let NN = null;

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('createModel').addEventListener('click', () => createModel());
    document.getElementById("loadModel").addEventListener("change", loadModel, false);

    document.getElementById("trainModel").addEventListener("change", trainModel, false);

    document.getElementById("classifyCSV").addEventListener("change", classifyCSV, false);
    document.getElementById('classifyStringBtn').addEventListener('click', () => classifyInput());

    document.getElementById('exportModel').addEventListener('click', () => exportModel());
});

const createModel = () => {
    console.log("CREATING NEURAL NETWORK...")
    NN = new brain.recurrent.LSTM();
    console.log("NEURAL NETWORK CREATED")
}
function loadModel() {
    const fileList = this.files;
    if(fileList.length < 1){
        console.log("ERROR: You need to import a JSON file")
        return;
    }
    var reader = new FileReader();
    reader.onload = (event) => {
        createModel();
        const json = JSON.parse(event.target.result);
        console.log("LOADING NEURAL NETWORK...")
        NN.fromJSON(json);
        console.log("NEURAL NETWORK LOADED")
    };
    reader.readAsText(fileList[0]);
}
function trainModel(){
    if(NN == null){
        console.log("ERROR: You need to create or load a Neural Network before you can train it")
        return;
    }
    const fileList = this.files;
    if(fileList.length < 1){
        console.log("ERROR: You need to import a CSV file (inputs, outputs)")
        return;
    }
    Papa.parse(this.files[0], {
        header: true,
        complete: (results) => {
            console.log("TRAINING MODEL...")
            const options = {
                iterations: parseInt(document.getElementById('option_itterations').value),
                errorThresh: parseFloat(document.getElementById('option_errorThreshold').value),
                log: document.getElementById('option_log').checked,
                logPeriod: parseInt(document.getElementById('option_logPeriod').value),
                learningRate: parseFloat(document.getElementById('option_learningRate').value),
                momentum: parseFloat(document.getElementById('option_momentum').value),
                callback: null,
                callbackPeriod: 10,
                timeout: parseInt(document.getElementById('option_timeout').value) == 0 ? 'Infinity' : parseInt(document.getElementById('option_timeout').value),
            }
            console.log(results.data, options);
            NN.train(results.data, options);
            console.log("TRAINED MODEL")
        }
    });
}
const classifyInput = () => {
    const input = document.getElementById('classifyStringInput').value;
    classifyString(input);
}
const exportModel = () => {
    if(NN == null){
        console.log("ERROR: You need to create or load a Neural Network before you can export it")
        return;
    }
    console.log("EXPORTING NEURAL NETWORK...");
    const date = new Date();
    const name = `model_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.json`;
    const json = NN.toJSON();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], {type: "application/json"}));
    a.setAttribute("download", name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log("EXPORTED NEURAL NETWORK")
}

// Utility Funcs
const classifyString = (string) => {
    if(NN == null){
        console.log("ERROR: You need to create or load a Neural Network before you can classify a string")
        return;
    }
    console.log("CLASSIFYING STRING...");
    const output = NN.run(string);
    console.log(`OUTPUT: ${output}`);
    console.log("CLASSIFIED STRING");
    return output;
}