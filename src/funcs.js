import brainjs from 'brain.js/src';

let NN = null;

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('createModel').addEventListener('click', () => createModel());
    document.getElementById("loadModel").addEventListener("change", loadModel, false);
    // document.getElementById('loadModel').addEventListener('click', () => loadModel());
    document.getElementById('exportModel').addEventListener('click', () => exportModel());
    
    document.getElementById('trainModel').addEventListener('click', () => trainModel());
    document.getElementById('classifyString').addEventListener('click', () => classifyString());
});

const createModel = () => {
    console.log("CREATING NEURAL NETWORK...")
    NN = new brain.recurrent.LSTM();
    console.log("NEURAL NETWORK CREATED")
}

// const loadModel = () => {
//     console.log(this.file);

//     // if(!this.files){
//     //     console.log("ERROR: You need to import a JSON file")
//     //     return;
//     // }
//     // console.log("LOADING NEURAL NETWORK...")
//     // NN.fromJSON(json);
//     // console.log("NEURAL NETWORK LOADED")
// }
function loadModel() {
    const fileList = this.files;
    if(fileList.length < 1){
        console.log("ERROR: You need to import a JSON file")
        return;
    }
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(fileList[0]);

}
function onReaderLoad(event){
    createModel();
    const json = JSON.parse(event.target.result);
    console.log("LOADING NEURAL NETWORK...")
    NN.fromJSON(json);
    console.log("NEURAL NETWORK LOADED")
}

const exportModel = () => {
    if(NN == null){
        console.log("ERROR: You need to create or load a Neural Network before you can export it")
        return;
    }
    console.log("EXPORTING NEURAL NETWORK...")
    const json = NN.toJSON();
    console.log("EXPORTED NETWORK LOADED")
    console.log(json);
}

const trainModel = (data, options) => {
    if(NN == null){
        console.log("ERROR: You need to create or load a Neural Network before you can train it")
        return;
    }
    console.log("CLASSIFYING STRING...")
    NN.train(data, options);
    console.log("CLASSIFIED STRING")
}

const classifyString = (string) => {
    if(NN == null){
        console.log("ERROR: You need to create or load a Neural Network before you can classify a string")
        return;
    }
    console.log("CLASSIFYING STRING...")
    NN.run(string);
    console.log("CLASSIFIED STRING")
}