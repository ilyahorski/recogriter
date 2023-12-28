const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.REACT_APP_GOOGLE_VISION_API}`;

function generateBody(image) {
  const body = {
    requests: [
      {
        image: {
          content: image,
        },
        features: [
          {
            type: 'TEXT_DETECTION', 
          },
        ],
      },
    ],
  };
  return body;
}

async function callGoogleVisionAsync(image) {
    const body = generateBody(image); 
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const result = await response.json();

    const detectedText = result.responses[0].fullTextAnnotation;
    return detectedText
      ? detectedText
      : { text: "This image doesn't contain any text!" };

}
export default callGoogleVisionAsync;