from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Allow CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your .h5 model
MODEL_PATH = "waste_classifier_model.h5"  # Path to your .h5 file
model = load_model(MODEL_PATH)

# Define your class names in the order your model predicts
CLASS_NAMES = [
    "battery", "biological", "cardboard", "clothes", "glass",
    "metal", "paper", "plastic", "shoes", "trash"
]

# Mapping from model class to display name
DISPLAY_NAMES = {
    "battery": "E-waste",
    "biological": "Biological",
    "cardboard": "Cardboard",
    "clothes": "Clothes",
    "glass": "Glass",
    "metal": "Metal",
    "paper": "Paper",
    "plastic": "Plastic",
    "shoes": "Shoes",
    "trash": "Trash"
}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((224, 224))  # Use your model's input size
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0  # Normalize if your model expects it

    preds = model.predict(img_array)
    pred_class = CLASS_NAMES[np.argmax(preds[0])]
    display_name = DISPLAY_NAMES.get(pred_class, pred_class)
    return {"category": display_name, "confidence": float(np.max(preds[0]))}
