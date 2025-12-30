# Hijaiyah Gesture Recognition Web App

This is the frontend application for the Hijaiyah Gesture Classification system.

## Setup Instructions

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Place the Model:**
    *   First, train your model using the Python script in `../model-training/`.
    *   The training script will generate a TFJS model in `../model-training/output_model/tfjs_model/`.
    *   Copy **all files** (`model.json` and `.bin` files) from that folder into:
        `public/model/`
    
    The structure should look like:
    ```
    web-app/
    ├── public/
    │   └── model/
    │       ├── model.json
    │       └── group1-shard1of1.bin
    ```

3.  **Run the App:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting
- **Model not loading?** Check the browser console (F12). If you see 404 for `model.json`, ensure you copied the files correctly to `public/model/`.
- **Camera error?** Ensure your browser has permission to access the webcam and you are on a secure context (localhost or HTTPS).