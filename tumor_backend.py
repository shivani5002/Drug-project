from flask import Flask, request, send_file, jsonify, Blueprint
import cv2
import numpy as np
import tensorflow as tf
import os
import zipfile
from io import BytesIO
from keras.saving import register_keras_serializable
from flask_cors import CORS
import base64

# Flask app setup
app = Flask(__name__)
CORS(app)

# Custom loss and metric functions
@register_keras_serializable()
def dice_loss(y_true, y_pred):
    smooth = 1.0
    y_true_f = tf.keras.backend.flatten(y_true)
    y_pred_f = tf.keras.backend.flatten(y_pred)
    intersection = tf.keras.backend.sum(y_true_f * y_pred_f)
    return 1 - (2.0 * intersection + smooth) / (tf.keras.backend.sum(y_true_f) + tf.keras.backend.sum(y_pred_f) + smooth)

@register_keras_serializable()
def dice_coef(y_true, y_pred):
    smooth = 1.0
    y_true_f = tf.keras.backend.flatten(y_true)
    y_pred_f = tf.keras.backend.flatten(y_pred)
    intersection = tf.keras.backend.sum(y_true_f * y_pred_f)
    return (2.0 * intersection + smooth) / (tf.keras.backend.sum(y_true_f) + tf.keras.backend.sum(y_pred_f) + smooth)

# Load Models
MODELS = {
    "brain_tumor": "brain_model.keras",
    "lung_tumor_image": "lung_model_image.keras",
    "lung_tumor_video": "lung_model_image.keras"
}

loaded_models = {}
for model_key, model_path in MODELS.items():
    try:
        loaded_models[model_key] = tf.keras.models.load_model(
            model_path, custom_objects={'dice_loss': dice_loss, 'dice_coef': dice_coef}
        )
        print(f"{model_key} model loaded successfully.")
    except Exception as e:
        print(f"Error loading {model_key} model: {e}")
        exit(1)

# Helper Functions
def preprocess_image(image):
    """
    Converts an image into patches of size 16x16 and reshapes into (256, 768).
    """
    patch_size = 16
    img_resized = cv2.resize(image, (256, 256))  # Resize to model input size
    img_patches = np.reshape(img_resized, (256 // patch_size, patch_size, 256 // patch_size, patch_size, 3))
    img_patches = img_patches.transpose(0, 2, 1, 3, 4).reshape(-1, patch_size * patch_size * 3)
    return img_patches

def overlay_tumor(image, mask):
    """
    Overlays a red mask on the original image to highlight tumor regions.
    """
    try:
        # Ensure the mask is binary (0 or 1)
        mask = (mask > 0.5).astype(np.uint8)  # Re-binarize the mask to ensure correctness
        print("Overlay mask unique values:", np.unique(mask))  # Debug: Check mask values

        # Create a red mask
        red_mask = np.zeros_like(image)
        red_mask[mask == 1] = [0, 0, 255]  # Red overlay for tumor regions

        # Blend the red mask with the original image
        overlayed_image = cv2.addWeighted(image, 0.7, red_mask, 0.3, 0)

        return overlayed_image
    except Exception as e:
        print(f"Error in overlay_tumor: {e}")
        raise e
    
def segment_image(model, image):
    """
    Segments an image using the provided model.
    """
    try:
        processed_image = preprocess_image(image)
        prediction = model.predict(np.expand_dims(processed_image, axis=0), verbose=0)[0]

        # Ensure the mask is binary (0 or 1)
        mask = (prediction > 0.5).astype(np.uint8)  # Binarize the mask
        print("Mask unique values:", np.unique(mask))  # Debug: Check mask values

        # Resize the mask to match the original image dimensions
        resized_prediction = cv2.resize(mask, (image.shape[1], image.shape[0]))  # Resize to original dimensions

        return resized_prediction
    except Exception as e:
        print(f"Error in segment_image: {e}")
        raise e

def create_video(frames, output_path, fps=5):
    """
    Creates a video from a list of frames.
    """
    try:
        if not frames:
            print("Error: No frames to create video.")
            return

        height, width, _ = frames[0].shape
        fourcc = cv2.VideoWriter_fourcc(*'avc1')  # Use H.264 codec for MP4
        video_writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        for frame in frames:
            video_writer.write(frame)

        video_writer.release()
        print(f"Video created successfully at: {output_path}")
    except Exception as e:
        print(f"Error in create_video: {e}")
        raise e

def process_video(video_path, model):
    """
    Processes a video by slicing it into frames, segmenting each frame, and returning processed frames.
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print("Error: Could not open video file.")
            return [], []

        original_frames = []
        segmented_frames = []

        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Convert to RGB

            # Normalize the frame to [0, 1]
            frame_normalized = frame / 255.0

            mask = segment_image(model, frame_normalized)  # Segment the frame
            print(f"Frame {frame_count} mask unique values:", np.unique(mask))  # Debug: Check mask values

            segmented_frame = overlay_tumor(frame, mask)  # Overlay tumor mask
            print(f"Frame {frame_count} overlay mask unique values:", np.unique(mask))  # Debug: Check mask values

            original_frames.append(frame)
            segmented_frames.append(segmented_frame)

            frame_count += 1

        cap.release()
        return original_frames, segmented_frames
    except Exception as e:
        print(f"Error in process_video: {e}")
        raise e
    
# API Endpoint
tumor_bp = Blueprint('tumor', __name__)
#@app.route('/api/segment', methods=['POST'])
@tumor_bp.route('/segment', methods=['POST'])
def segment():
    try:
        model_type = request.form.get("model_type")
        if model_type not in MODELS:
            return jsonify({"error": "Invalid model type"}), 400

        model = loaded_models[model_type]

        if model_type == "brain_tumor":
            if 'image' not in request.files:
                return jsonify({"error": "No file uploaded"}), 400
            file = request.files['image']
            print("File received:", file.filename)
            file_data = file.read()
            print("File data length:", len(file_data))
            image = cv2.imdecode(np.frombuffer(file_data, np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                print("Failed to decode image")
                return jsonify({"error": "Failed to decode image"}), 400
            print("Image shape:", image.shape)
            image = image / 255.0

            mask = segment_image(model, image)
            image = image * 255
            output_image = overlay_tumor(image, mask)

            _, img_encoded = cv2.imencode('.png', output_image)
            if img_encoded is None:
                print("Failed to encode image to PNG")
                return jsonify({"error": "Failed to encode image"}), 500
            print("Image encoded successfully")
            return send_file(BytesIO(img_encoded.tobytes()), mimetype='image/png')

        elif model_type == "lung_tumor_image":
            if 'file' not in request.files:
                return jsonify({"error": "No .npy file uploaded"}), 400
            
            file = request.files['file']
            try:
                print("Loading .npy file...")
                npy_data = np.load(file)
                print(".npy file loaded successfully.")
                print(".npy data shape:", npy_data.shape)
                print(".npy data min/max:", np.min(npy_data), np.max(npy_data))

                # Ensure correct shape (convert grayscale to 3-channel)
                if len(npy_data.shape) == 2:
                    print("Expanding grayscale image to 3D...")
                    npy_data = np.expand_dims(npy_data, axis=-1)
                if npy_data.shape[-1] == 1:
                    print("Converting grayscale to 3-channel...")
                    npy_data = np.repeat(npy_data, 3, axis=-1)

                print("Converted .npy data shape:", npy_data.shape)
                print("Converted .npy data min/max:", np.min(npy_data), np.max(npy_data))

                # Scale the original image to [0, 255] and convert to BGR
                original_image = (npy_data * 255).astype(np.uint8)
                original_image = cv2.cvtColor(original_image, cv2.COLOR_RGB2BGR)
                print("Original image shape:", original_image.shape)
                print("Original image min/max:", np.min(original_image), np.max(original_image))

                # Normalize the image for the model
                image = npy_data  # Already normalized
                print("Normalized image min/max:", np.min(image), np.max(image))

                # Run segmentation
                print("Running segmentation...")
                mask = segment_image(model, image)
                print("Segmentation mask shape:", mask.shape)
                print("Segmentation mask unique values:", np.unique(mask))

                # Overlay the mask on the original image
                print("Overlaying tumor mask...")
                segmented_image = overlay_tumor(original_image, mask)
                print("Overlayed image shape:", segmented_image.shape)

                # Convert both images to bytes and return as response
                print("Encoding images to PNG...")
                _, original_img_encoded = cv2.imencode('.png', original_image)
                _, segmented_img_encoded = cv2.imencode('.png', segmented_image)

                if original_img_encoded is None or segmented_img_encoded is None:
                    print("Failed to encode images to PNG")
                    return jsonify({"error": "Failed to encode images"}), 500
                print("Images encoded successfully")

                # Create a response with both images
                response = {
                    "original_image": base64.b64encode(original_img_encoded.tobytes()).decode('utf-8'),
                    "segmented_image": base64.b64encode(segmented_img_encoded.tobytes()).decode('utf-8')
                }
                return jsonify(response)
            
            except Exception as e:
                print(f"Error processing .npy file: {e}")
                return jsonify({"error": f"Error processing .npy file: {str(e)}"}), 500

        elif model_type == "lung_tumor_video":
            if 'file' not in request.files:
                return jsonify({"error": "No .mp4 file uploaded"}), 400
            
            file = request.files['file']
            if not file.filename.endswith('.mp4'):
                return jsonify({"error": "Invalid file format. Only .mp4 videos are allowed."}), 400

            # Save the uploaded video temporarily
            video_path = "uploaded_video.mp4"
            file.save(video_path)

            # Process the video
            original_frames, segmented_frames = process_video(video_path, model)

            # Create videos from frames
            original_video_path = "original_video.mp4"
            segmented_video_path = "segmented_video.mp4"
            create_video(original_frames, original_video_path)
            create_video(segmented_frames, segmented_video_path)

            # Zip the two videos together
            if not os.path.exists(original_video_path) or not os.path.exists(segmented_video_path):
                print("Error: Video files do not exist.")
                return jsonify({"error": "Video files not found."}), 500

            zip_path = "videos.zip"
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                zipf.write(original_video_path, os.path.basename(original_video_path))
                zipf.write(segmented_video_path, os.path.basename(segmented_video_path))

            print("Zip file created successfully at:", zip_path)

            # Send the zip file as a response
            if not os.path.exists(zip_path):
                print("Error: Zip file not found.")
                return jsonify({"error": "Zip file not found."}), 500

            try:
                response = send_file(zip_path, as_attachment=True, mimetype="application/zip")
                print("Zip file sent successfully.")
                return response
            except Exception as e:
                print(f"Error sending zip file: {e}")
                return jsonify({"error": str(e)}), 500

        else:
            return jsonify({"error": "Invalid model type"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
