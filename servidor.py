from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

NASA_TOKEN = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6Im96ZW1jZyIsImV4cCI6MTc2NDcxOTAwNCwiaWF0IjoxNzU5NTM1MDA0LCJpc3MiOiJodHRwczovL3Vycy5lYXJ0aGRhdGEubmFzYS5nb3YiLCJpZGVudGl0eV9wcm92aWRlciI6ImVkbF9vcHMiLCJhY3IiOiJlZGwiLCJhc3N1cmFuY2VfbGV2ZWwiOjN9.1kcVzXJY38WBpZ7dmtIwXRt-G9c8xLwWl8xLClePl2qWxGq26RUO4IAu0J4wfNXvV8ZzT99gQZLp5wus8nSJQW7H_44df0C4A_EwpxopdcRVF7vxVBsxxMO6Smo0LibSyqJrHpzCyd9CBIBWGG1HXVDsnP8yU-GZEVIytgy2V_UUINOgc0dJmDSpIAUetOjmTmC-eRHurbMpzYS3UkZGpZP_d5uJmaCPc_g6VstYHI3y2eRz4VcRVDOFRpXAasYp_aBrxCUY-s22IjVsg0JoYm1oGKPDLMr5TaqW7jYFdED2AjkkuGmDKw-xF3YIN1i76eBXxBL-q47twU32a3WrEg"

@app.route('/api/get-nasa-data')
def get_nasa_data():
    print("Petición recibida para datos de la NASA.")
    api_url = "https://cmr.earthdata.nasa.gov/search/granules.json"
    params = {
        'short_name': 'TEMPO_NO2_L3',
        'temporal': '2025-10-03T00:00:00Z,2025-10-03T23:59:59Z',
        'bounding_box': '-106.0,25.0,-100.0,27.0'
    }
    headers = {'Authorization': f'Bearer {NASA_TOKEN}'}

    try:
        response = requests.get(api_url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        image_url = None
        entries = data.get('feed', {}).get('entry', [])
        for entry in entries:
            for link in entry.get('links', []):
                if link.get('href', '').endswith('.png'):
                    image_url = link.get('href')
                    break
            if image_url:
                break
        
        if image_url:
            print(f"✅ Éxito: Enlace de imagen encontrado: {image_url}")
            return jsonify({"imageUrl": image_url})
        else:
            print("No se encontró un enlace de imagen en la respuesta.")
            return jsonify({"error": "No browse image found in NASA response"}), 404
            
    except Exception as e:
        print(f"Ocurrió un error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)