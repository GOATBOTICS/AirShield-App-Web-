# servidor.py

from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Tu token de la NASA.
NASA_TOKEN = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6Im96ZW1jZyIsImV4cCI6MTc2NDcxOTAwNCwiaWF0IjoxNzU5NTM1MDA0LCJpc3MiOiJodHRwczovL3Vycy5lYXJ0aGRhdGEubmFzYS5nb3YiLCJpZGVudGl0eV9wcm92aWRlciI6ImVkbF9vcHMiLCJhY3IiOiJlZGwiLCJhc3N1cmFuY2VfbGV2ZWwiOjN9.1kcVzXJY38WBpZ7dmtIwXRt-G9c8xLwWl8xLClePl2qWxGq26RUO4IAu0J4wfNXvV8ZzT99gQZLp5wus8nSJQW7H_44df0C4A_EwpxopdcRVF7vxVBsxxMO6Smo0LibSyqJrHpzCyd9CBIBWGG1HXVDsnP8yU-GZEVIytgy2V_UUINOgc0dJmDSpIAUetOjmTmC-eRHurbMpzYS3UkZGpZP_d5uJmaCPc_g6VstYHI3y2eRz4VcRVDOFRpXAasYp_aBrxCUY-s22IjVsg0JoYm1oGKPDLMr5TaqW7jYFdED2AjkkuGmDKw-xF3YIN1i76eBXxBL-q47twU32a3WrEg"

PRODUCT_MAP = {
    "NO2": "TEMPO_NO2_L3", 
    "CLD04": "TEMPO_CLDO4_L3",
    "HCHO": "TEMPO_HCHO_L3"
}

@app.route('/api/get-nasa-map/<product_name>')
def get_nasa_map(product_name):
    print(f"\n[INFO] Petición para la URL del mapa más reciente de: {product_name}")

    short_name = PRODUCT_MAP.get(product_name)
    if not short_name:
        return jsonify({"error": "Nombre de producto inválido"}), 400

    params = {
        'short_name': short_name,
        'bounding_box': '-110,20,-90,32',
        'sort_key[]': '-start_date', 
        'page_size': 1 
    }
    
    headers = {'Authorization': f'Bearer {NASA_TOKEN}'}
    api_url = "https://cmr.earthdata.nasa.gov/search/granules.json"

    try:
        print(f"[INFO] Pidiendo a NASA la URL más reciente para '{short_name}'...")
        cmr_response = requests.get(api_url, params=params, headers=headers, timeout=30)
        cmr_response.raise_for_status()
        data = cmr_response.json()
        
        image_url = None
        entries = data.get('feed', {}).get('entry', [])
        if entries:
            for link in entries[0].get('links', []):
                if link.get('href', '').endswith(('.png', '.jpg', '.jpeg')):
                    image_url = link.get('href')
                    break
        
        if image_url:
            print(f"[SUCCESS] URL de imagen encontrada: {image_url}")
            return jsonify({"imageUrl": image_url})
        else:
            print(f"[FAIL] La NASA no devolvió una imagen para {product_name}.")
            return jsonify({"error": f"No se encontró una imagen reciente para {product_name}"}), 404
            
    except requests.exceptions.RequestException as e:
        print(f"[CRITICAL] Error de conexión con la NASA: {e}")
        return jsonify({"error": f"Error al comunicarse con la NASA: {e}"}), 502
    except Exception as e:
        print(f"[CRITICAL] Error inesperado en el servidor: {e}")
        return jsonify({"error": "Ocurrió un error inesperado en el servidor"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)