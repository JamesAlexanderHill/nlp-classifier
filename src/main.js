import Papa from 'papaparse';
import TextClassifier from './nlp';

let nlp = null;

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
    nlp = new TextClassifier(null, [], [], []);
    console.log("NEURAL NETWORK CREATED")
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
        nlp = new TextClassifier(NN, dictionary, blacklist, history);
        // toast.push({type: "alert", message: "File Loaded! Start classifying!"});
        console.log("NEURAL NETWORK LOADED")
    };
    reader.readAsText(fileList[0]);
}
function trainModel(){
    const fileList = this.files;
    if(fileList.length < 1){
        // toast.push({type: "error", message: "You need to import a CSV file with headers [inputs, outputs]"});
        console.log("ERROR: You need to import a CSV file with headers [inputs, outputs]")
        document.getElementById("trainModel").value = '';
        return;
    }
    Papa.parse(this.files[0], {
        header: true,
        complete: (results) => {
            console.log("TRAINING MODEL...")
            nlp.train(results.data, getOptions());
            console.log("TRAINED MODEL")
        }
    });
}
function classifyCSV(){
}
const classifyInput = () => {
}
const exportModel = () => {
    if(nlp == null){
        // toast.push({type: "error", message: "You need to create or load a Neural Network before you can export it"});
        console.log("ERROR: You need to create or load a Neural Network before you can export it")
        return;
    }
    console.log("EXPORTING NEURAL NETWORK...");
    const date = new Date();
    const name = `model_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.json`;
    const json = nlp.export();
    //export as a file
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], {type: "application/json"}));
    a.setAttribute("download", name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log("EXPORTED NEURAL NETWORK")
}

// Utility Functions
const getOptions = () => {
    const obj = {
        iterations: parseInt(document.getElementById('option_itterations').value),
        errorThresh: parseFloat(document.getElementById('option_errorThreshold').value),
        log: document.getElementById('option_log').checked,
        logPeriod: parseInt(document.getElementById('option_logPeriod').value),
        learningRate: parseFloat(document.getElementById('option_learningRate').value),
        momentum: parseFloat(document.getElementById('option_momentum').value),
        timeout: parseInt(document.getElementById('option_timeout').value),
    };
    return obj;
}
const classifyString = (string) => {
    if(NN == null){
        console.log("ERROR: You need to create or load a Neural Network before you can classify a string");
        return;
    }
    // console.log("CLASSIFYING STRING...");
    const es = encodeInput(string);
    const output = NN.run(es);
    // console.log(`${string} => ${output}`)
    // console.log("output => ", string, es, output);v
    return output;
}