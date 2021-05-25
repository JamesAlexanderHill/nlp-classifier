// import brainjs from 'brain.js/src';
// import Papa from 'papaparse';
// import {stemmer} from 'stemmer';
import TextClassifier from './nlp';

let NN = null;
// let dictionary = [];
// let blacklist = [];
// let trainingHistory = [];

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('createModel').addEventListener('click', () => createModel());
    document.getElementById("loadModel").addEventListener("change", loadModel, false);

    document.getElementById("trainModel").addEventListener("change", trainModel, false);

    document.getElementById("classifyCSV").addEventListener("change", classifyCSV, false);
    document.getElementById('classifyStringBtn').addEventListener('click', () => classifyInput());

    document.getElementById('exportModel').addEventListener('click', () => exportModel());
});

const createModel = () => {
    NN = new TextClassifier(null, [], [], []);
}
function loadModel() {
    const fileList = this.files;
    if(fileList.length < 1){
        // toast.push({type: "error", message: "You need to import a JSON file"});
        console.log("ERROR: You need to import a JSON file")
        document.getElementById("loadModel").value = '';
        return;
    }
    var reader = new FileReader();
    reader.onload = (event) => {
        const {NN, dictionary, blacklist, history} = JSON.parse(event.target.result);
        if(!NN || !dictionary || !blacklist || !history){
            // toast.push({type: "error", message: "Your imported model is invalid"});
            console.log("ERROR: Your imported model is invalid")
            document.getElementById("loadModel").value = '';
            return;
        }
        console.log("LOADING NEURAL NETWORK...");
        NN = new TextClassifier(NN, dictionary, blacklist, history);
        // toast.push({type: "alert", message: "File Loaded! Start classifying!"});
        console.log("NEURAL NETWORK LOADED")
    };
}
    
    

function trainModel(){

}
function classifyCSV(){
}
const classifyInput = () => {
}
const exportModel = () => {
}

// Utility Functions
const addToDictionary = (trainingData) => {
    const inputs = trainingData.map(row => row.input.split(' ')).flat(1);
    const stems = inputs.map(input => stemmer(input));
    const uniqueStems = [...new Set(stems)];
    const nondupes = uniqueStems.filter(stem => {
        if(dictionary.includes(stem)){
            return false;
        }
        return true;
    });
    dictionary = dictionary.concat(nondupes);
    console.log("dictionary", dictionary);
}
const encodeInput = (input) => {
    const phraseTokens = input.split(' ')
    const encodedPhrase = dictionary.map(word => phraseTokens.includes(word) ? 1 : 0)

    return encodedPhrase
}
const classifyString = (string) => {
    if(NN == null){
        console.log("ERROR: You need to create or load a Neural Network before you can classify a string")
        return;
    }
    // console.log("CLASSIFYING STRING...");
    const es = encodeInput(string);
    const output = NN.run(es);
    // console.log(`${string} => ${output}`)
    // console.log("output => ", string, es, output);v
    return output;
}