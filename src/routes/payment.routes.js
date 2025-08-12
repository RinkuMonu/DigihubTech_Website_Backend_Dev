import axios from 'axios';
import crypto from 'crypto';

export const phonePeController = async (req, res) => {
    try {
        const phonepePayUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

        const payload = {
            "merchantId": "SWIFTVITAUAT",
            "merchantTransactionId": "SWIFTVITAUAT98738",
            "merchantUserId": "SWIFTVITAUAT8788",
            "amount": 10000,
            "redirectUrl": "https://webhook.site/redirect-url",
            "redirectMode": "REDIRECT", 
            "callbackUrl": "https://webhook.site/callback-url",
            "mobileNumber": "9997798999",
            "paymentInstrument": {
                "type": "PAY_PAGE" 
            }
        };

        const base64EncodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
        console.log('Base64 Encoded Payload:', base64EncodedPayload);

        const saltKey = "N2Q3NGEzYjQtOWNlNC00ODExLThmZjAtOWQwMzE1MTEzZTRl";
        const saltIndex = "1"; 
        const apiEndpoint = "/pg/v1/pay"; 
        const stringToHash = base64EncodedPayload + apiEndpoint + saltKey;

        const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const xVerifyHeader = hash + "###" + saltIndex;
        console.log('X-VERIFY Header:', xVerifyHeader);

        const headers = {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyHeader,
        };

        const requestData = {
            request: base64EncodedPayload,
        };

        const response = await axios.post(phonepePayUrl, requestData, { headers });
        console.log('Response:', response.data);

        res.status(200).json({
            message: 'Payment created successfully.',
            data: response,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to create payment.',
            error: error.response ? error.response.data : error.message,
        });
    }
};
