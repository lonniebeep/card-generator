document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.querySelector('form');
    const downloadBtn = document.getElementById('downloadPdf');
    const generatedImage = document.getElementById('generatedImage');
    const imageUrl = generatedImage.src;
// Prevent default form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const formData = new FormData(form);
        const response = await fetch('http://localhost:3000/submit', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        // Redirect to the generated-image.html page with the image URL 
        window.location.href = `/generated-image.html?image=${encodeURIComponent(data.downloadLink)}`;

        // Clear form values
        form.reset();
    });

    downloadBtn.addEventListener('click', () => {
        // Trigger download for the displayed image
        const downloadLinkElem = document.createElement('a');
        
        // Set the image source
        generatedImage.src = imageUrl;

        // Set download link attributes
        downloadLinkElem.href = imageUrl;
        downloadLinkElem.setAttribute('download', 'generated-image.png');

        // Programmatically trigger the download
        downloadLinkElem.click();
    });
});

