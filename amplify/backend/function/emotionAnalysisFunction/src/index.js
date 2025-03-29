

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
// emotion-analysis.js
const AWS = require('aws-sdk');

// Initialize the AWS Rekognition service
const rekognition = new AWS.Rekognition();

exports.handler = async (event) => {
    try {
        // Parse the incoming request body
        const body = JSON.parse(event.body);
        const { image } = body;
        
        // Decode the base64 image and prepare for Rekognition
        const imageBytes = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        
        // Detect faces and emotions using Amazon Rekognition directly from image bytes
        const params = {
            Image: {
                Bytes: imageBytes
            },
            Attributes: ['ALL']
        };
        
        const rekognitionResponse = await rekognition.detectFaces(params).promise();
        
        // Extract emotions from the response
        let emotions = [];
        if (rekognitionResponse.FaceDetails && rekognitionResponse.FaceDetails.length > 0) {
            const faceDetails = rekognitionResponse.FaceDetails[0];
            
            // Get the emotions and sort by confidence (highest first)
            emotions = faceDetails.Emotions
                .sort((a, b) => b.Confidence - a.Confidence)
                .map(emotion => ({
                    type: emotion.Type,
                    confidence: emotion.Confidence
                }));
        }
        
        // Return the response
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: emotions.length > 0 ? 'Emotions detected' : 'No emotions detected',
                emotions: emotions
            })
        };
    } catch (error) {
        console.error('Error processing image:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Error processing image',
                error: error.message
            })
        };
    }
};