import brainjs from 'brain.js/src';
import Papa from 'papaparse';
import {stemmer} from 'stemmer';


let NN = null;
let dictionary = [];

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
    NN = new brain.NeuralNetwork();
    dictionary = [];
    console.log("NEURAL NETWORK CREATED")
}
function loadModel() {
    const fileList = this.files;
    if(fileList.length < 1){
        console.log("ERROR: You need to import a JSON file")
        document.getElementById("loadModel").value = '';
        return;
    }
    var reader = new FileReader();
    reader.onload = (event) => {
        createModel();
        const json = JSON.parse(event.target.result);

        console.log("LOADING NEURAL NETWORK...")
        dictionary = json.dictionary;
        NN.fromJSON(json.NN);
        console.log("NEURAL NETWORK LOADED")
    };
    reader.readAsText(fileList[0]);
}
function trainModel(){
    if(NN == null){
        console.log("ERROR: You need to create a Neural Network before you can train it")
        document.getElementById("trainModel").value = '';
        return;
    }
    if(dictionary.length > 0){
        console.log("ERROR: You cannot train a loaded model. Re-import your data into a new Neural Network")
        document.getElementById("trainModel").value = '';
        return;
    }
    const fileList = this.files;
    if(fileList.length < 1){
        console.log("ERROR: You need to import a CSV file (inputs, outputs)")
        document.getElementById("trainModel").value = '';
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
                timeout: parseInt(document.getElementById('option_timeout').value) == 0 ? Infinity : parseInt(document.getElementById('option_timeout').value),
            }
            addToDictionary(results.data);

            const trainingData = results.data.map(data => {
                const obj = {};
                obj[data.output] = 1;
                return {input: encodeInput(data.input), output: obj}
            })
            
            console.log(trainingData, options);
            NN.train(trainingData, options);
            console.log("TRAINED MODEL")
            //clear file from input
            document.getElementById("trainModel").value = '';
        }
    });
}
function classifyCSV(){
    if(NN == null){
        console.log("ERROR: You need to create a Neural Network before you can classify a CSV")
        document.getElementById("classifyCSV").value = '';
        return;
    }
    if(dictionary.length <= 0){
        console.log("ERROR: You cannot classify a CSV with an untrained Neural Network. Load or train a Neural Network")
        document.getElementById("classifyCSV").value = '';
        return;
    }
    const fileList = this.files;
    if(fileList.length < 1){
        console.log("ERROR: You need to import a CSV file(inputs)")
        document.getElementById("classifyCSV").value = '';
        return;
    }
    Papa.parse(this.files[0], {
        header: true,
        complete: (results) => {
            console.log("CLASSIFYING CSV...")
            const csv = results.data;
            // console.log(csv);
            const classifiedJSON = csv.map(obj => {
                const output = classifyString(obj.input)
                console.log(obj.input, output);
                for (const [key, value] of Object.entries(output)) {
                    if(obj.output == null){
                        obj.output = key;
                        obj.certainty = value;
                    }else{
                        if(obj.certainty < value){
                            obj.output = key;
                            obj.certainty = value;
                        }
                    }
                }
                obj.certainty = (obj.certainty*100).toFixed(2);
                return obj;
            });
            // console.log("classifiedJSON", classifiedJSON);
            console.log("CLASSIFIED CSV")
            //download as a csv
            console.log("EXPORTING CLASSIFIED FILE...");
            console.log(classifiedJSON);
            const file = Papa.unparse(classifiedJSON, {
                delimiter: ",",
                newline: "\n",
                quoteChar: '"',
                header: true,
                encoding: "UTF-8"
            });
            // console.log(file);
            const date = new Date();
            const name = `classified_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.csv`;
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([file], {type: "text/csv;charset=utf-8;"}));
            a.setAttribute("download", name);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log("EXPORTED CLASSIFIED FILE");
            //clear file from input
            document.getElementById("classifyCSV").value = '';
        }
    });
}
const classifyInput = () => {
    if(dictionary.length <= 0){
        console.log("ERROR: You cannot classify a string with an untrained Neural Network. Load or train a Neural Network")
        return;
    }
    const input = document.getElementById('classifyStringInput').value;
    console.log("CLASSIFYING STRING...");
    const output = classifyString(input);
console.log(input, output)
    console.log("CLASSIFIED STRING");
}
const exportModel = () => {
    if(NN == null){
        console.log("ERROR: You need to create or load a Neural Network before you can export it")
        return;
    }
    console.log("EXPORTING NEURAL NETWORK...");
    const date = new Date();
    const name = `model_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.json`;
    const model = NN.toJSON();
    const json = {
        "NN": model,
        "dictionary": dictionary,
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], {type: "application/json"}));
    a.setAttribute("download", name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log("EXPORTED NEURAL NETWORK")
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