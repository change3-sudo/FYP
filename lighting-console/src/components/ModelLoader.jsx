import React from "react";
function ModelLoader({ onModelSelect }) {
    function handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            onModelSelect(file);
        }
    }

    return (
        <div className="relative">
            <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors absolute top-0 right-0 z-40"
                onClick={() => document.getElementById('fileInput').click()}>
                Import
            </button>
            <input 
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                accept=".gltf"
                className="hidden"
            />
        </div>
    );
}

export default ModelLoader;