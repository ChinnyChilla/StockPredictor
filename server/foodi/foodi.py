# from fastapi import APIRouter, HTTPException, Request
# from fastapi.concurrency import run_in_threadpool
# from pydantic import BaseModel
# import json
# from typing import Optional, Dict, Any
# import os
# import requests

# from dotenv import load_dotenv
# load_dotenv()

# import numpy as np

# from .utils import base64_to_pil_img, prepare_image

# router = APIRouter()

# class ImagePayload(BaseModel):
# 	image: str

# class_names = [
# 	'apple_pie', 'baby_back_ribs', 'baklava', 'beef_carpaccio', 'beef_tartare', 
# 	'beet_salad', 'beignets', 'bibimbap', 'bread_pudding', 'breakfast_burrito', 
# 	'bruschetta', 'caesar_salad', 'cannoli', 'caprese_salad', 'carrot_cake', 
# 	'ceviche', 'cheesecake', 'cheese_plate', 'chicken_curry', 'chicken_quesadilla', 
# 	'chicken_wings', 'chocolate_cake', 'chocolate_mousse', 'churros', 'clam_chowder', 
# 	'club_sandwich', 'crab_cakes', 'creme_brulee', 'croque_madame', 'cup_cakes', 
# 	'deviled_eggs', 'donuts', 'dumplings', 'edamame', 'eggs_benedict', 
# 	'escargots', 'falafel', 'filet_mignon', 'fish_and_chips', 'foie_gras', 
# 	'french_fries', 'french_onion_soup', 'french_toast', 'fried_calamari', 'fried_rice', 
# 	'frozen_yogurt', 'garlic_bread', 'gnocchi', 'greek_salad', 'grilled_cheese_sandwich', 
# 	'grilled_salmon', 'guacamole', 'gyoza', 'hamburger', 'hot_and_sour_soup', 
# 	'hot_dog', 'huevos_rancheros', 'hummus', 'ice_cream', 'lasagna', 
# 	'lobster_bisque', 'lobster_roll_sandwich', 'macaroni_and_cheese', 'macarons', 'miso_soup', 
# 	'mussels', 'nachos', 'omelette', 'onion_rings', 'oysters', 
# 	'pad_thai', 'paella', 'pancakes', 'panna_cotta', 'peking_duck', 
# 	'pho', 'pizza', 'pork_chop', 'poutine', 'prime_rib', 
# 	'pulled_pork_sandwich', 'ramen', 'ravioli', 'red_velvet_cake', 'risotto', 
# 	'samosa', 'sashimi', 'scallops', 'seaweed_salad', 'shrimp_and_grits', 
# 	'spaghetti_bolognese', 'spaghetti_carbonara', 'spring_rolls', 'steak', 'strawberry_shortcake', 
# 	'sushi', 'tacos', 'takoyaki', 'tiramisu', 'tuna_tartare', 
# 	'waffles'
# ]

# def get_nutrient_info(prediction: str) -> Optional[Dict[str, Any]]:
# 	filename = f"{prediction.replace(' ', '_')}.json"
# 	file_path = os.path.join("data", "foodi", "nutrients", filename)

# 	if not os.path.exists(file_path):
# 		API_KEY = os.getenv("FOODI_API_KEY")
# 		APP_ID = os.getenv("FOODI_APP_ID")
		
# 		headers = {
# 			"x-app-id": APP_ID,
# 			"x-app-key": API_KEY,
# 			"Content-Type": "application/json"
# 		}
# 		body = {
# 			"query": prediction,
# 		}
# 		try:
# 			response = requests.post("https://trackapi.nutritionix.com/v2/natural/nutrients", headers=headers, json=body)
# 			response.raise_for_status()
# 		except Exception as e:
# 			print("Error getting API response:", e)
# 			return None
		
# 		data = response.json()
		
# 		os.makedirs(os.path.dirname(file_path), exist_ok=True)
# 		with open(file_path, 'w') as f:
# 			json.dump(data, f, indent=4)

# 	try:
# 		with open(file_path, 'r') as f:
# 			data = json.load(f)

# 		food_details = data['foods'][0]

# 		key_map = {
# 			"food_name": "food_name",
# 			"serving_qty": "serving_qty",
# 			"serving_unit": "serving_unit",
# 			"calories": "nf_calories",
# 			"total_fat": "nf_total_fat",
# 			"cholesterol": "nf_cholesterol",
# 			"protein": "nf_protein",
# 			"sodium": "nf_sodium",
# 			"total_carbohydrate": "nf_total_carbohydrate",
# 			"sugars": "nf_sugars",
# 		}

# 		nutrient_info = {}
# 		for friendly_name, source_name in key_map.items():
# 			if source_name in food_details and food_details[source_name] is not None:
# 				nutrient_info[friendly_name] = food_details[source_name]
		
# 		return nutrient_info

# 	except (json.JSONDecodeError, KeyError, IndexError) as e:
# 		print(f"An error occurred while processing {file_path}: {e}")
# 		return None

	

# def interpret_prediction(prediction):
# 	predicted_class_idx = np.argmax(prediction, axis=-1)[0]
# 	return class_names[predicted_class_idx]

# @router.post("/foodi/getNutrients")
# async def get_nutrients(payload: ImagePayload, request: Request):

# 	image = base64_to_pil_img(payload.image)
	
# 	if image is None:
# 		raise HTTPException(status_code=400, detail="Invalid image data provided.")

# 	preprocessed_img = prepare_image(image, target_size=(224, 224))
# 	model = request.app.state.model
# 	prediction = await run_in_threadpool(model.predict, preprocessed_img)
	
# 	predicted_class = interpret_prediction(prediction)
	
# 	return get_nutrient_info(predicted_class)	